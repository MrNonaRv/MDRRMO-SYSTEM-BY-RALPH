import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import net from "net";
import fs from "fs";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, "0.0.0.0", () => {
      server.once("close", () => resolve(startPort));
      server.close();
    });
    server.on("error", () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

function openAsDesktopApp(url: string) {
  if (process.platform === "win32") {
    // Try Chrome first, then Edge — both support --app mode
    const chromePaths = [
      `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`,
      `"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"`,
      `"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"`,
      `"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"`,
    ];

    const appFlags = `--app=${url} --window-size=1400,900 --window-position=60,40 --no-first-run --disable-extensions`;

    // Try each path until one works
    const tryNext = (index: number) => {
      if (index >= chromePaths.length) {
        // Fallback: open in regular browser
        exec(`start ${url}`);
        return;
      }
      const cmd = `${chromePaths[index]} ${appFlags}`;
      exec(cmd, (err) => {
        if (err) tryNext(index + 1);
      });
    };
    tryNext(0);
  } else if (process.platform === "darwin") {
    // macOS: use Chrome app mode
    exec(`open -a "Google Chrome" --args --app=${url} --window-size=1400,900`);
  } else {
    // Linux fallback
    exec(`xdg-open ${url}`);
  }
}

async function startServer() {
  const app = express();
  const basePort = 3000;
  const PORT = await findAvailablePort(basePort);

  // Middleware for parsing JSON
  app.use(express.json());

  // --- Heartbeat / Auto-Shutdown ---
  let lastPing = Date.now();
  const PING_TIMEOUT_MS = 15000; // shut down if no ping for 15s

  // Browser pings this every 5s to keep the server alive
  app.post("/api/ping", (_req, res) => {
    lastPing = Date.now();
    res.json({ ok: true });
  });

  // Browser sends this on window beforeunload
  app.post("/api/shutdown", (_req, res) => {
    res.json({ ok: true });
    console.log("\n[Server] Browser closed – shutting down...");
    setTimeout(() => process.exit(0), 500);
  });

  // Watchdog: if the browser disappears without sending /api/shutdown
  setInterval(() => {
    if (Date.now() - lastPing > PING_TIMEOUT_MS) {
      console.log("\n[Server] No heartbeat – browser appears closed. Shutting down...");
      process.exit(0);
    }
  }, 10000);

  // --- Health & API routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/records", (req, res) => {
    res.json({ message: "API is ready for backend record management" });
  });

  // --- Update Management ---
  const REMOTE_VERSION_URL = "https://raw.githubusercontent.com/Ralph23-debug/MDRRMO-SYSTEM-BY-RALPH-main/main/package.json";

  app.get("/api/update/check", async (req, res) => {
    try {
      // Get local version
      const pkgPath = path.join(process.cwd(), "package.json");
      const localPkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const localVersion = localPkg.version || "0.0.0";

      // Get remote version
      https.get(REMOTE_VERSION_URL, (response) => {
        let data = "";
        response.on("data", (chunk) => { data += chunk; });
        response.on("end", () => {
          try {
            const remotePkg = JSON.parse(data);
            const remoteVersion = remotePkg.version || "0.0.0";
            
            res.json({
              currentVersion: localVersion,
              latestVersion: remoteVersion,
              updateAvailable: remoteVersion !== localVersion,
              repoUrl: "https://github.com/Ralph23-debug/MDRRMO-SYSTEM-BY-RALPH-main"
            });
          } catch (e) {
            res.status(500).json({ error: "Failed to parse remote version" });
          }
        });
      }).on("error", (err) => {
        res.status(500).json({ error: "Failed to fetch remote version" });
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check for updates" });
    }
  });

  // --- Vite / Static ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n------------------------------------------------`);
    console.log(`  MAMBUSAO MDRRMO PCR SYSTEM`);
    console.log(`  Server running on ${url}`);
    console.log(`  Close the browser tab to shut down.`);
    console.log(`------------------------------------------------\n`);

    openAsDesktopApp(url);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

