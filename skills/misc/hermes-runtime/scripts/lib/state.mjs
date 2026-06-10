import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const HERMES_DIR = path.join(os.homedir(), ".claude", "hermes");
const JOBS_DIR = path.join(HERMES_DIR, "jobs");
const LOGS_DIR = path.join(HERMES_DIR, "logs");
const MANIFEST_FILE = path.join(JOBS_DIR, "manifest.json");
const MAX_JOBS = 50;

function ensureDirs() {
  fs.mkdirSync(JOBS_DIR, { recursive: true });
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

export function generateJobId() {
  return `hermes-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf8"));
  } catch {
    return { jobs: [] };
  }
}

function saveManifest(manifest) {
  ensureDirs();
  // prune old jobs
  if (manifest.jobs.length > MAX_JOBS) {
    manifest.jobs = manifest.jobs.slice(-MAX_JOBS);
  }
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

export function createJobRecord(input, mode) {
  ensureDirs();
  const id = generateJobId();
  const record = {
    id,
    input,
    mode,
    status: "running",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    output: null,
    error: null,
  };

  fs.writeFileSync(path.join(JOBS_DIR, `${id}.json`), JSON.stringify(record, null, 2));

  const manifest = loadManifest();
  manifest.jobs.push({ id, status: "running", createdAt: record.createdAt });
  saveManifest(manifest);

  return record;
}

export function updateJobRecord(id, updates) {
  const jobFile = path.join(JOBS_DIR, `${id}.json`);
  try {
    const record = JSON.parse(fs.readFileSync(jobFile, "utf8"));
    Object.assign(record, updates, { updatedAt: nowIso() });
    fs.writeFileSync(jobFile, JSON.stringify(record, null, 2));

    const manifest = loadManifest();
    const entry = manifest.jobs.find((j) => j.id === id);
    if (entry && updates.status) {
      entry.status = updates.status;
    }
    saveManifest(manifest);

    return record;
  } catch {
    return null;
  }
}

export function readJobRecord(id) {
  try {
    return JSON.parse(fs.readFileSync(path.join(JOBS_DIR, `${id}.json`), "utf8"));
  } catch {
    return null;
  }
}

export function listJobRecords() {
  const manifest = loadManifest();
  return manifest.jobs;
}

export function getLatestJobRecord() {
  const manifest = loadManifest();
  if (manifest.jobs.length === 0) return null;
  const latest = manifest.jobs[manifest.jobs.length - 1];
  return readJobRecord(latest.id);
}

export function appendLog(id, line) {
  ensureDirs();
  fs.appendFileSync(path.join(LOGS_DIR, `${id}.log`), line + "\n");
}

export function readLog(id) {
  try {
    return fs.readFileSync(path.join(LOGS_DIR, `${id}.log`), "utf8");
  } catch {
    return "";
  }
}
