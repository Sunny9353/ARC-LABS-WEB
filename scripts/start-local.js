const { spawn } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

function run(label, command, args, env = {}) {
  const nextEnv = { ...process.env };
  Object.entries(env).forEach(([key, value]) => {
    const existingKey = Object.keys(nextEnv).find((item) => item.toLowerCase() === key.toLowerCase());
    if (existingKey && existingKey !== key) {
      delete nextEnv[existingKey];
    }
    nextEnv[key] = value;
  });

  const child = spawn(command, args, {
    cwd: root,
    env: nextEnv,
    shell: isWindows,
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[${label}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${label}] ${chunk}`));
  child.on("exit", (code) => {
    if (code) {
      console.error(`[${label}] exited with code ${code}`);
    }
  });

  return child;
}

const api = run("api", "node", ["scripts/local-api-server.js"]);
const react = run("web", "npx", ["react-scripts", "start"], {
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
});

function shutdown() {
  api.kill();
  react.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
