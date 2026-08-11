#!/usr/bin/env node

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseEnv(filePath) {
  const result = {};
  try {
    for (const line of readFileSync(filePath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;
      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  } catch {
    // Local environment files are optional.
  }
  return result;
}

for (const fileName of [".env", ".env.local"]) {
  for (const [key, value] of Object.entries(
    parseEnv(resolve(projectRoot, fileName)),
  )) {
    if (!process.env[key]) process.env[key] = value;
  }
}

const vaultAddress = process.env.VAULT_ADDR;
const vaultToken = process.env.VAULT_TOKEN;
const vaultSecretPath = process.env.VAULT_SECRET_PATH;

if (vaultAddress && vaultToken) {
  if (!vaultSecretPath?.includes("/")) {
    console.error("[vault] VAULT_SECRET_PATH must include mount and path");
    process.exit(1);
  }

  const [mount, ...pathParts] = vaultSecretPath.split("/");
  const url = `${vaultAddress.replace(/\/$/, "")}/v1/${mount}/data/${pathParts.join("/")}`;
  const response = await fetch(url, {
    headers: { "X-Vault-Token": vaultToken },
  }).catch((error) => {
    console.error(`[vault] Unable to reach Vault: ${error.message}`);
    process.exit(1);
  });

  if (!response.ok) {
    console.error(`[vault] Request failed with status ${response.status}`);
    process.exit(1);
  }

  const secrets = (await response.json())?.data?.data;
  if (!secrets || typeof secrets !== "object") {
    console.error("[vault] Response does not contain KV v2 secret data");
    process.exit(1);
  }

  let loadedCount = 0;
  for (const [key, value] of Object.entries(secrets)) {
    if (typeof value === "string" && !key.startsWith("VAULT_")) {
      process.env[key] = value;
      loadedCount++;
    }
  }
  console.log(`[vault] Loaded ${loadedCount} secrets from ${vaultSecretPath}`);
} else {
  console.log(
    "[vault] VAULT_ADDR or VAULT_TOKEN not set — using local fallbacks",
  );
}

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/vault-dev.mjs <command> [args...]");
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: "inherit",
  env: process.env,
  cwd: projectRoot,
  shell: false,
});

child.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
