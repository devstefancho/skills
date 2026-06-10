#!/usr/bin/env node

import process from "node:process";
import { resolve, loadConfig, saveConfig, killTunnel, getTunnelStatus } from "./lib/connection.mjs";
import * as api from "./lib/hermes-api.mjs";
import * as state from "./lib/state.mjs";
import * as render from "./lib/render.mjs";

function printUsage() {
  console.log(
    [
      "Usage:",
      "  hermes-companion.mjs setup [--json]",
      "  hermes-companion.mjs chat <message> [--stream] [--system <prompt>] [--json]",
      "  hermes-companion.mjs run <task> [--background] [--json]",
      "  hermes-companion.mjs status [run-id] [--json]",
      "  hermes-companion.mjs jobs [list|create|delete] [--json]",
      "  hermes-companion.mjs tunnel [start|stop|status]",
    ].join("\n")
  );
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];
  const flags = {};
  const positional = [];

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--json") {
      flags.json = true;
    } else if (arg === "--stream") {
      flags.stream = true;
    } else if (arg === "--background") {
      flags.background = true;
    } else if (arg === "--system" && i + 1 < args.length) {
      flags.system = args[++i];
    } else if (arg === "--mode" && i + 1 < args.length) {
      flags.mode = args[++i];
    } else if (arg === "--host" && i + 1 < args.length) {
      flags.host = args[++i];
    } else if (arg === "--port" && i + 1 < args.length) {
      flags.port = parseInt(args[++i], 10);
    } else if (arg === "--remote-host" && i + 1 < args.length) {
      flags.remoteHost = args[++i];
    } else if (arg === "--remote-port" && i + 1 < args.length) {
      flags.remotePort = parseInt(args[++i], 10);
    } else if (arg === "--local-port" && i + 1 < args.length) {
      flags.localPort = parseInt(args[++i], 10);
    } else if (arg === "--api-key" && i + 1 < args.length) {
      flags.apiKey = args[++i];
    } else {
      positional.push(arg);
    }
  }

  return { command, flags, positional, text: positional.join(" ") };
}

function output(value, asJson) {
  if (asJson) {
    console.log(JSON.stringify(value, null, 2));
  } else if (typeof value === "string") {
    process.stdout.write(value);
  } else {
    console.log(JSON.stringify(value, null, 2));
  }
}

async function cmdSetup(flags) {
  // If any config flags provided, update config first
  const hasConfigChange = flags.mode || flags.host || flags.port || flags.remoteHost || flags.remotePort || flags.localPort || flags.apiKey !== undefined;

  if (hasConfigChange) {
    const config = loadConfig();
    if (flags.mode) config.mode = flags.mode;
    if (flags.host) config.local.host = flags.host;
    if (flags.port) config.local.port = flags.port;
    if (flags.remoteHost) config.ssh.remoteHost = flags.remoteHost;
    if (flags.remotePort) config.ssh.remotePort = flags.remotePort;
    if (flags.localPort) config.ssh.localPort = flags.localPort;
    if (flags.apiKey !== undefined) config.apiKey = flags.apiKey || null;
    saveConfig(config);
    console.log(`Config updated: ${JSON.stringify(config, null, 2)}\n`);
  }

  const result = await resolve();
  if (flags.json) {
    output(result, true);
  } else {
    output(render.renderSetup(result), false);
  }
  process.exit(result.healthy ? 0 : 1);
}

async function cmdChat(flags, text) {
  if (!text) {
    console.error("Error: message is required. Usage: hermes-companion.mjs chat <message>");
    process.exit(1);
  }

  const conn = await resolve();
  if (!conn.healthy) {
    console.error("Error: Cannot connect to Hermes. Run 'hermes-companion.mjs setup' first.");
    process.exit(1);
  }

  const opts = { apiKey: conn.config.apiKey, system: flags.system };

  if (flags.stream) {
    const stream = await api.streamChat(conn.baseUrl, text, opts);
    for await (const chunk of stream) {
      if (chunk.type === "delta") {
        process.stdout.write(chunk.content);
      }
    }
    process.stdout.write("\n");
  } else {
    const result = await api.chat(conn.baseUrl, text, opts);
    if (flags.json) {
      output(result, true);
    } else {
      output(render.renderChat(result) + "\n", false);
    }
  }
}

async function cmdRun(flags, text) {
  if (!text) {
    console.error("Error: task is required. Usage: hermes-companion.mjs run <task>");
    process.exit(1);
  }

  const conn = await resolve();
  if (!conn.healthy) {
    console.error("Error: Cannot connect to Hermes. Run 'hermes-companion.mjs setup' first.");
    process.exit(1);
  }

  const opts = { apiKey: conn.config.apiKey };
  const runInfo = await api.createRun(conn.baseUrl, text, opts);
  const runId = runInfo.run_id || runInfo.id;
  const jobRecord = state.createJobRecord(text, conn.mode);

  if (flags.background) {
    state.updateJobRecord(jobRecord.id, { runId, status: "background" });
    if (flags.json) {
      output({ jobId: jobRecord.id, runId, status: "started" }, true);
    } else {
      output(render.renderRunStarted(runInfo) + `\nJob ID: ${jobRecord.id}\n`, false);
    }
    return;
  }

  // Foreground: stream events
  let fullOutput = "";
  try {
    for await (const event of api.streamRunEvents(conn.baseUrl, runId, opts)) {
      const text = render.renderRunEvent(event);
      if (text) {
        process.stdout.write(text);
        fullOutput += text;
      }
      state.appendLog(jobRecord.id, JSON.stringify(event));

      if (event.event === "run.completed" || event.event === "run.failed") {
        break;
      }
    }
  } catch (err) {
    console.error(`\nStream error: ${err.message}`);
  }

  state.updateJobRecord(jobRecord.id, { status: "completed", output: fullOutput });
}

async function cmdStatus(flags, text) {
  const conn = await resolve();
  const config = loadConfig();
  const tunnel = getTunnelStatus(config);
  const jobs = state.listJobRecords();

  if (text) {
    // "latest" shortcut resolves to the most recent job
    const job = text === "latest"
      ? state.getLatestJobRecord()
      : state.readJobRecord(text);
    if (job) {
      output(flags.json ? job : JSON.stringify(job, null, 2), flags.json);
    } else {
      console.error(`Job not found: ${text}`);
      process.exit(1);
    }
    return;
  }

  const statusInfo = {
    connection: { mode: conn.mode, healthy: conn.healthy, baseUrl: conn.baseUrl },
    tunnel,
    jobs,
  };

  if (flags.json) {
    output(statusInfo, true);
  } else {
    output(render.renderStatus(statusInfo) + "\n", false);
  }
}

async function cmdJobs(flags, subcommand, text) {
  const conn = await resolve();
  if (!conn.healthy) {
    console.error("Error: Cannot connect to Hermes. Run 'hermes-companion.mjs setup' first.");
    process.exit(1);
  }

  const opts = { apiKey: conn.config.apiKey };
  const sub = subcommand || "list";

  if (sub === "list") {
    const jobs = await api.listJobs(conn.baseUrl, opts);
    if (flags.json) {
      output(jobs, true);
    } else {
      output(render.renderJobs(Array.isArray(jobs) ? jobs : jobs.jobs || []) + "\n", false);
    }
  } else if (sub === "delete" && text) {
    const result = await api.deleteJob(conn.baseUrl, text, opts);
    output(flags.json ? result : `Job ${text} deleted.\n`, flags.json);
  } else {
    console.error("Usage: hermes-companion.mjs jobs [list|delete <id>]");
    process.exit(1);
  }
}

async function cmdTunnel(subcommand) {
  const config = loadConfig();

  if (subcommand === "stop") {
    killTunnel();
    console.log("Tunnel stopped.");
  } else if (subcommand === "status") {
    const status = getTunnelStatus(config);
    console.log(JSON.stringify(status, null, 2));
  } else {
    // start
    const { startTunnel } = await import("./lib/connection.mjs");
    try {
      const info = await startTunnel(config);
      console.log(`Tunnel started. PID: ${info.pid}, URL: ${info.baseUrl}`);
    } catch (err) {
      console.error(`Failed: ${err.message}`);
      process.exit(1);
    }
  }
}

async function main() {
  const { command, flags, positional, text } = parseArgs(process.argv);

  try {
    switch (command) {
      case "setup":
        await cmdSetup(flags);
        break;
      case "chat":
        await cmdChat(flags, text);
        break;
      case "run":
        await cmdRun(flags, text);
        break;
      case "status":
        await cmdStatus(flags, text);
        break;
      case "jobs":
        await cmdJobs(flags, positional[0], positional.slice(1).join(" "));
        break;
      case "tunnel":
        await cmdTunnel(positional[0]);
        break;
      default:
        printUsage();
        process.exit(command ? 1 : 0);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
