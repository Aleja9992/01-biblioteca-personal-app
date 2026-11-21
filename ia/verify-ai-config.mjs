import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const checks = [
  {
    name: "AGENTS.md exists",
    valid: fs.existsSync(path.join(root, "AGENTS.md")),
  },
  {
    name: "AI instructions exist",
    valid: fs.existsSync(path.join(root, "ia", "copilot-instructions.md")),
  },
  {
    name: "Secret-reading rule is explicit",
    valid: fs
      .readFileSync(path.join(root, "ia", "copilot-instructions.md"), "utf8")
      .includes("No leer `.env*`, certificados, keystores"),
  },
  {
    name: "Repository-boundary rule is explicit",
    valid: fs
      .readFileSync(path.join(root, "ia", "copilot-instructions.md"), "utf8")
      .includes("No salir de `C:\\Users\\aleja\\Documents\\BibliotecaPersonal\\01-biblioteca-personal-app`"),
  },
  {
    name: "External-action authorization rule is explicit",
    valid: fs
      .readFileSync(path.join(root, "ia", "copilot-instructions.md"), "utf8")
      .includes("requieren autorización expresa"),
  },
  {
    name: "Secret patterns are ignored by Git",
    valid: [
      ".env",
      "*.pem",
      "*.key",
      "*.p12",
      "*.pfx",
      "serviceAccount*.json",
      "*credentials*.json",
    ].every((pattern) =>
      fs
        .readFileSync(path.join(root, ".gitignore"), "utf8")
        .split(/\r?\n/)
        .includes(pattern),
    ),
  },
];

const failed = checks.filter((check) => !check.valid);

for (const check of checks) {
  console.log(`${check.valid ? "PASS" : "FAIL"} ${check.name}`);
}

if (failed.length > 0) {
  process.exit(1);
}
