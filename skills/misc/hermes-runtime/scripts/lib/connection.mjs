import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execSync } from "node:child_process";

const HERMES_DIR = path.join(os.homedir(), ".claude", "hermes");
const CONFIG_FILE = path.join(HERMES_DIR, "config.json");
const TUNNEL_PID_FILE = path.join(HERMES_DIR, "tunnel.pid");

const DEFAULT_CONFIG = {
  mode: "auto",
  local: { host: "127.0.0.1", port: 8642 },
  ssh: { remoteHost: "arch", remotePort: 8642, localPort: 18642 },
  apiKey: null,
};

export function ensureHermesDir() {
  fs.mkdirSync(path.join(HERMES_DIR, "jobs"), { recursive: true });
  fs.mkdirSync(path.join(HERMES_DIR, "logs"), { recursive: true });
}

export function loadConfig() {
  ensureHermesDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    return { ...DEFAULT_CONFIG, ...raw };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config) {
  ensureHermesDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function checkHealth(baseUrl, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

function readTunnelPid() {
  try {
    const pid = parseInt(fs.readFileSync(TUNNEL_PID_FILE, "utf8").trim(), 10);
    if (isNaN(pid)) return null;
    try {
      process.kill(pid, 0);
      return pid;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

function writeTunnelPid(pid) {
  fs.writeFileSync(TUNNEL_PID_FILE, String(pid));
}

function clearTunnelPid() {
  try {
    fs.unlinkSync(TUNNEL_PID_FILE);
  } catch {}
}

export async function startTunnel(config) {
  const { ssh } = config;
  const localUrl = `http://127.0.0.1:${ssh.localPort}`;

  // Check if something is already listening on the local port
  try {
    const lsof = execSync(`lsof -ti :${ssh.localPort} -sTCP:LISTEN`, { encoding: "utf8" }).trim();
    const existingPid = parseInt(lsof.split("\n")[0], 10);
    if (!isNaN(existingPid)) {
      // Something is listening - check if it's healthy
      if (await checkHealth(localUrl)) {
        writeTunnelPid(existingPid);
        return { pid: existingPid, baseUrl: localUrl, reused: true };
      }
      // Listening but unhealthy - kill it
      try { process.kill(existingPid, "SIGTERM"); } catch {}
      clearTunnelPid();
      await new Promise((r) => setTimeout(r, 300));
    }
  } catch {
    // Nothing listening - proceed to create tunnel
  }

  const tunnelSpec = `${ssh.localPort}:127.0.0.1:${ssh.remotePort}`;
  const TUNNEL_TIMEOUT_MS = 10000;

  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`SSH tunnel timed out after ${TUNNEL_TIMEOUT_MS / 1000}s. Check: ssh ${ssh.remoteHost} works?`));
      }
    }, TUNNEL_TIMEOUT_MS);

    const proc = spawn(
      "ssh",
      ["-fN", "-L", tunnelSpec, "-o", "StrictHostKeyChecking=accept-new", "-o", "ExitOnForwardFailure=yes", "-o", "ConnectTimeout=5", ssh.remoteHost],
      { stdio: ["ignore", "ignore", "pipe"], detached: true }
    );

    let stderr = "";
    proc.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

    proc.on("error", (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`SSH tunnel failed: ${err.message}`));
      }
    });

    proc.on("exit", async (code) => {
      if (settled) return;

      if (code !== 0) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`SSH tunnel exited with code ${code}${stderr ? `: ${stderr.trim()}` : ""}`));
        return;
      }

      // ssh -f backgrounds itself; find the tunnel process
      await new Promise((r) => setTimeout(r, 800));
      try {
        const lsof = execSync(`lsof -ti :${ssh.localPort} -sTCP:LISTEN`, { encoding: "utf8" }).trim();
        const pid = parseInt(lsof.split("\n")[0], 10);
        if (!isNaN(pid)) {
          settled = true;
          clearTimeout(timer);
          writeTunnelPid(pid);
          resolve({ pid, baseUrl: localUrl, reused: false });
        } else {
          settled = true;
          clearTimeout(timer);
          reject(new Error("SSH tunnel started but no process listening on port " + ssh.localPort));
        }
      } catch (e) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`SSH tunnel started but could not verify: ${e.message}`));
      }
    });

    proc.unref();
  });
}

export function killTunnel() {
  const pid = readTunnelPid();
  if (pid) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {}
  }
  clearTunnelPid();
}

export function getTunnelStatus(config) {
  const pid = readTunnelPid();
  return {
    active: pid !== null,
    pid,
    localPort: config.ssh.localPort,
    remoteHost: config.ssh.remoteHost,
    remotePort: config.ssh.remotePort,
  };
}

export async function resolve(configOverride) {
  const config = configOverride || loadConfig();
  const mode = config.mode || "auto";

  if (mode === "local") {
    const baseUrl = `http://${config.local.host}:${config.local.port}`;
    const healthy = await checkHealth(baseUrl);
    return { baseUrl, mode: "local", healthy, config };
  }

  if (mode === "ssh") {
    let tunnelInfo;
    try {
      tunnelInfo = await startTunnel(config);
    } catch (err) {
      return { baseUrl: null, mode: "ssh", healthy: false, error: err.message, config };
    }
    const healthy = await checkHealth(tunnelInfo.baseUrl);
    return { baseUrl: tunnelInfo.baseUrl, mode: "ssh", healthy, tunnel: tunnelInfo, config };
  }

  // auto mode: try local first, then ssh
  const localUrl = `http://${config.local.host}:${config.local.port}`;
  if (await checkHealth(localUrl)) {
    return { baseUrl: localUrl, mode: "local", healthy: true, config };
  }

  try {
    const tunnelInfo = await startTunnel(config);
    const healthy = await checkHealth(tunnelInfo.baseUrl);
    if (healthy) {
      return { baseUrl: tunnelInfo.baseUrl, mode: "ssh", healthy: true, tunnel: tunnelInfo, config };
    }
    return { baseUrl: tunnelInfo.baseUrl, mode: "ssh", healthy: false, error: "Tunnel opened but Hermes health check failed", config };
  } catch (err) {
    return { baseUrl: null, mode: "none", healthy: false, error: `Local unavailable, SSH failed: ${err.message}`, config };
  }
}
