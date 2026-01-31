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

  // Add known problematic native packages and package.json requires to external
  const externals = deps.concat([
    "@babel/preset-typescript/package.json",
    "lightningcss",
    "lightningcss-android-arm64",
    "lightningcss-darwin-arm64",
    "lightningcss-darwin-x64",
    "lightningcss-freebsd-x64",
    "lightningcss-linux-arm-gnueabihf",
    "lightningcss-linux-arm64-gnu",
    "lightningcss-linux-arm64-musl",
    "lightningcss-linux-x64-gnu",
    "lightningcss-linux-x64-musl",
    "lightningcss-win32-arm64-msvc",
    "lightningcss-win32-x64-msvc",
  ]);

  await esbuild({
    entryPoints: [path.join(root, "server", "index.ts")],
    bundle: true,
    platform: "node",
    target: ["node18"],
    format: "cjs",
    outfile: path.join(root, "dist", "index.cjs"),
    external: externals,
    sourcemap: false,
    logLevel: "info",
  });

  // Ensure migrations are copied into the dist folder so runtime can find them
  const migrationsSrc = path.join(root, 'migrations');
  const migrationsDest = path.join(root, 'dist', 'migrations');
  if (fs.existsSync(migrationsSrc)) {
    console.log(`📦 Copying migrations -> ${migrationsDest}`);
    fs.rmSync(migrationsDest, { recursive: true, force: true });
    fs.cpSync(migrationsSrc, migrationsDest, { recursive: true });
  } else {
    console.warn('⚠️ migrations folder not found in project root; skipping copy.');
  }

  console.log("✅ Build complete. Output in ./dist (server) and ./dist/public (client).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
