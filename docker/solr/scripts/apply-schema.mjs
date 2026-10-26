#!/usr/bin/env node
// Applies docker/solr/schema.json to Solr idempotently: diffs it against Solr's
// current schema (via the same v2 Schema API endpoint the old curl command posted
// to) and only sends add-field-type/replace-field-type/add-field/replace-field/
// add-copy-field commands for what's actually missing or different. Safe to run
// repeatedly -- re-running against an already-applied schema sends nothing.
//
// Usage: node docker/solr/scripts/apply-schema.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_JSON_PATH = join(__dirname, "../schema.json");

// Matches the previous raw-curl "solr:schema" script and solr:import's "-c cities" --
// same default host as SOLR_URL in .env/src/libs/Env.ts, same hardcoded core name.
const SOLR_URL = process.env.SOLR_URL || "http://localhost:8983";
const SOLR_CORE = "cities";
const SCHEMA_ENDPOINT = `${SOLR_URL}/api/cores/${SOLR_CORE}/schema`;

function loadLocalSchema() {
  const raw = readFileSync(SCHEMA_JSON_PATH, "utf-8");
  return JSON.parse(raw);
}

function isConnectionRefused(error) {
  const codes = [];
  const collect = (err) => {
    if (!err) return;
    if (err.code) codes.push(err.code);
    if (err.cause) collect(err.cause);
    if (Array.isArray(err.errors)) err.errors.forEach(collect);
  };
  collect(error);
  return codes.includes("ECONNREFUSED");
}

async function fetchRemoteSchema() {
  let response;
  try {
    response = await fetch(SCHEMA_ENDPOINT);
  } catch (error) {
    if (isConnectionRefused(error)) {
      throw new Error(
        `Could not reach Solr at ${SOLR_URL} -- connection refused. Is Solr running? (check "npm run docker:up" / your SOLR_URL)`,
      );
    }
    throw new Error(`Failed to reach Solr at ${SCHEMA_ENDPOINT}: ${error.message}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Solr returned HTTP ${response.status} for GET ${SCHEMA_ENDPOINT}: ${body}`);
  }

  const data = await response.json();
  return data.schema ?? data;
}

// Every key present on `local` must deep-match the same key on `remote`; extra keys
// Solr echoes back that we never specified (defaults it filled in) are ignored, so
// those don't trigger a spurious replace.
function isSubsetMatch(local, remote) {
  if (local === remote) return true;

  if (Array.isArray(local)) {
    return (
      Array.isArray(remote) &&
      local.length === remote.length &&
      local.every((item, i) => isSubsetMatch(item, remote[i]))
    );
  }

  if (local !== null && typeof local === "object") {
    return (
      remote !== null &&
      typeof remote === "object" &&
      Object.keys(local).every((key) => isSubsetMatch(local[key], remote[key]))
    );
  }

  return local === remote;
}

function diffByName(localEntries) {
  return (remoteEntries) => {
    const remoteByName = new Map(remoteEntries.map((entry) => [entry.name, entry]));
    const toAdd = [];
    const toReplace = [];
    let unchanged = 0;

    for (const local of localEntries) {
      const remote = remoteByName.get(local.name);
      if (!remote) {
        toAdd.push(local);
      } else if (!isSubsetMatch(local, remote)) {
        toReplace.push(local);
      } else {
        unchanged++;
      }
    }

    return { toAdd, toReplace, unchanged };
  };
}

// Solr has no "replace-copy-field" -- an already-existing (source, dest) pair is
// just skipped, never resent (resending a duplicate pair is what previously caused
// "Multiple values encountered for non multiValued copy field" errors).
function diffCopyFields(localCopyFields, remoteCopyFields) {
  const existingPairs = new Set(
    remoteCopyFields.flatMap((cf) => {
      const dests = Array.isArray(cf.dest) ? cf.dest : [cf.dest];
      return dests.map((dest) => `${cf.source}->${dest}`);
    }),
  );

  const toAdd = [];
  let unchanged = 0;

  for (const local of localCopyFields) {
    const key = `${local.source}->${local.dest}`;
    if (existingPairs.has(key)) {
      unchanged++;
    } else {
      toAdd.push(local);
    }
  }

  return { toAdd, unchanged };
}

function printDiffLine(label, toAdd, toReplace, unchanged) {
  console.log(`  ${label}: ${toAdd} to add, ${toReplace} to replace, ${unchanged} unchanged`);
}

async function main() {
  const local = loadLocalSchema();
  const remote = await fetchRemoteSchema();

  const fieldTypeDiff = diffByName(local["add-field-type"] ?? [])(remote.fieldTypes ?? []);
  const fieldDiff = diffByName(local["add-field"] ?? [])(remote.fields ?? []);
  const copyFieldDiff = diffCopyFields(local["add-copy-field"] ?? [], remote.copyFields ?? []);

  console.log(`Diffing ${SCHEMA_JSON_PATH}`);
  console.log(`  against ${SCHEMA_ENDPOINT}`);
  printDiffLine(
    "Field types",
    fieldTypeDiff.toAdd.length,
    fieldTypeDiff.toReplace.length,
    fieldTypeDiff.unchanged,
  );
  printDiffLine("Fields", fieldDiff.toAdd.length, fieldDiff.toReplace.length, fieldDiff.unchanged);
  console.log(
    `  Copy-fields: ${copyFieldDiff.toAdd.length} to add, ${copyFieldDiff.unchanged} unchanged (no replace concept)`,
  );

  const payload = {};
  if (fieldTypeDiff.toAdd.length) payload["add-field-type"] = fieldTypeDiff.toAdd;
  if (fieldTypeDiff.toReplace.length) payload["replace-field-type"] = fieldTypeDiff.toReplace;
  if (fieldDiff.toAdd.length) payload["add-field"] = fieldDiff.toAdd;
  if (fieldDiff.toReplace.length) payload["replace-field"] = fieldDiff.toReplace;
  if (copyFieldDiff.toAdd.length) payload["add-copy-field"] = copyFieldDiff.toAdd;

  if (Object.keys(payload).length === 0) {
    console.log("\nSchema is already up to date -- nothing to send.");
    return;
  }

  console.log(`\nPosting ${Object.keys(payload).length} command group(s) to Solr...`);

  let response;
  try {
    response = await fetch(SCHEMA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (isConnectionRefused(error)) {
      throw new Error(
        `Could not reach Solr at ${SOLR_URL} -- connection refused. Is Solr running?`,
      );
    }
    throw new Error(`Failed to POST schema update to ${SCHEMA_ENDPOINT}: ${error.message}`);
  }

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Solr rejected the schema update (HTTP ${response.status}): ${responseBody}`);
  }

  console.log("Schema update applied successfully:");
  printDiffLine(
    "Field types",
    fieldTypeDiff.toAdd.length,
    fieldTypeDiff.toReplace.length,
    fieldTypeDiff.unchanged,
  );
  printDiffLine("Fields", fieldDiff.toAdd.length, fieldDiff.toReplace.length, fieldDiff.unchanged);
  console.log(
    `  Copy-fields: ${copyFieldDiff.toAdd.length} added, ${copyFieldDiff.unchanged} unchanged`,
  );
}

main().catch((error) => {
  console.error(`\n[apply-schema] ${error.message}`);
  process.exit(1);
});
