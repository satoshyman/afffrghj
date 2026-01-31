import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { build as esbuild } from "esbuild";

async function main() {
  const root = process.cwd();

  console.log("🔧 Building client (Vite)...");
  execSync("npx vite build", { stdio: "inherit" });

  console.log("🔧 Building server (esbuild)...");
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const deps = Object.keys(pkg.dependencies || {});

  await esbuild({
    entryPoints: [path.join(root, "server", "index.ts")],
    bundle: true,
    platform: "node",
    target: ["node18"],
    format: "cjs",
    outfile: path.join(root, "dist", "index.cjs"),
    external: deps,
    sourcemap: false,
    logLevel: "info",
  });

  console.log("✅ Build complete. Output in ./dist (server) and ./dist/public (client).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
