/**
 * Hard Rule #13 guard for the macOS tray autostart: `launchctl load/unload`
 * must receive the plist path as an argv element (execFileSync), never spliced
 * into a shell string. `JSON.stringify(path)` only adds double quotes, which
 * leave `$(...)` and backticks live in /bin/sh. The path comes from homedir(),
 * so this is defense in depth, but a shell string here is the exact pattern
 * the rule forbids.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = readFileSync(
  fileURLToPath(new URL("../../bin/cli/tray/autostart.mjs", import.meta.url)),
  "utf8"
);

test("launchctl is never invoked through a shell string", () => {
  assert.doesNotMatch(source, /execSync\(\s*["'`]launchctl/);
});

test("launchctl load/unload pass the plist path as an argv element", () => {
  assert.match(source, /execFileSync\("launchctl", \["load", "-w", plistPath\]/);
  assert.match(source, /execFileSync\("launchctl", \["unload", "-w", plistPath\]/);
});
