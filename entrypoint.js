import { spawn } from "child_process";

// Clean surrounding quotes from all env variables
// (Docker's --env-file includes literal quotes in the values, which breaks Prisma and other SDKs)
for (const key in process.env) {
  const value = process.env[key];
  if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
    process.env[key] = value.slice(1, -1);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  process.exit(0);
}

const child = spawn(args[0], args.slice(1), {
  stdio: "inherit",
  env: process.env
});

child.on("close", (code) => {
  process.exit(code || 0);
});

child.on("error", (err) => {
  console.error("Failed to start child process:", err);
  process.exit(1);
});
