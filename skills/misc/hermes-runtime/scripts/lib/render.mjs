export function renderSetup(result) {
  const lines = [];
  lines.push("# Hermes Gateway Status\n");

  const modeLabel = result.mode === "local" ? "Local" : result.mode === "ssh" ? "SSH" : result.mode;
  lines.push(`**Mode:** ${modeLabel}`);

  if (result.healthy) {
    lines.push(`**URL:** ${result.baseUrl}`);
    lines.push(`**Status:** Connected\n`);

    if (result.tunnel) {
      lines.push(`**Tunnel PID:** ${result.tunnel.pid}`);
      lines.push(`**Tunnel reused:** ${result.tunnel.reused ? "Yes" : "No"}`);
    }
  } else {
    lines.push(`**Status:** Not connected`);
    if (result.baseUrl) {
      lines.push(`**URL:** ${result.baseUrl}`);
    }
    if (result.error) {
      lines.push(`**Error:** ${result.error}`);
    }
    if (result.tunnel) {
      lines.push(`**Tunnel:** opened (PID ${result.tunnel.pid}) but Hermes not responding`);
    }
    lines.push("\n## Troubleshooting\n");
    if (result.mode === "ssh" || result.mode === "none") {
      lines.push("1. Verify SSH works: `ssh arch`");
      lines.push("2. Check remote Hermes: `ssh arch \"curl -s http://127.0.0.1:8642/health\"`");
      lines.push("3. Start remote Hermes: `ssh arch \"hermes gateway start\"`");
    }
    if (result.mode === "local" || result.mode === "none") {
      lines.push("1. Check if Hermes is running: `hermes gateway status`");
      lines.push("2. Start Hermes: `hermes gateway start`");
    }
    lines.push(`\nConfig: \`~/.claude/hermes/config.json\``);
  }

  return lines.join("\n");
}

export function renderChat(result) {
  return result.content || "(empty response)";
}

export function renderRunStarted(runInfo) {
  const lines = [];
  lines.push(`**Run started:** ${runInfo.run_id || runInfo.id}`);
  lines.push(`**Status:** ${runInfo.status}`);
  lines.push(`\nCheck status with \`/hermes:status latest\``);
  return lines.join("\n");
}

export function renderRunEvent(event) {
  switch (event.event) {
    case "message.delta":
      return event.delta || "";
    case "tool.started":
      return `\n[Tool: ${event.tool || "unknown"} started]\n`;
    case "tool.completed":
      return `\n[Tool: ${event.tool || "unknown"} completed (${event.duration_ms || 0}ms)]\n`;
    case "reasoning.available":
      return `\n<thinking>${event.content || ""}</thinking>\n`;
    case "run.completed":
      return `\n---\n**Run completed.** Output: ${event.output || "(none)"}\n`;
    case "run.failed":
      return `\n---\n**Run failed.** Error: ${event.error || "unknown"}\n`;
    default:
      return "";
  }
}

export function renderStatus(statusInfo) {
  const lines = [];
  lines.push("# Hermes Status\n");

  if (statusInfo.connection) {
    lines.push(`**Connection:** ${statusInfo.connection.mode} (${statusInfo.connection.healthy ? "healthy" : "unhealthy"})`);
  }

  if (statusInfo.tunnel) {
    lines.push(`**Tunnel:** ${statusInfo.tunnel.active ? "active" : "inactive"} (PID: ${statusInfo.tunnel.pid || "none"})`);
  }

  if (statusInfo.jobs && statusInfo.jobs.length > 0) {
    lines.push("\n## Recent Jobs\n");
    lines.push("| ID | Status | Created |");
    lines.push("|---|---|---|");
    for (const job of statusInfo.jobs.slice(-10)) {
      lines.push(`| ${job.id} | ${job.status} | ${job.createdAt} |`);
    }
  }

  return lines.join("\n");
}

export function renderJobs(jobs) {
  if (!jobs || jobs.length === 0) {
    return "No cron jobs found.";
  }

  const lines = ["# Hermes Cron Jobs\n"];
  lines.push("| ID | Name | Schedule | Status |");
  lines.push("|---|---|---|---|");
  for (const job of jobs) {
    const sched = job.schedule_display
      || (typeof job.schedule === "object" ? (job.schedule?.display || job.schedule?.expr || JSON.stringify(job.schedule)) : job.schedule)
      || job.cron
      || "N/A";
    lines.push(`| ${job.id || job.job_id} | ${job.name || "-"} | ${sched} | ${job.status || job.state || "active"} |`);
  }
  return lines.join("\n");
}
