import express from "express";
import cors from "cors";
import { exec } from "child_process";
import os from "os";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const TEST_MODE = process.env.TEST_MODE === "true";

app.use(cors());
app.use(express.json());

const executeCommand = (command: string) => {
  return new Promise((resolve, reject) => {
    if (TEST_MODE) {
      console.log(`🧪 TEST MODE: Would execute command: ${command}`);
      resolve(`[TEST MODE] Command simulated: ${command}`);
      return;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
};

const getShutdownCommand = () => {
  const platform = os.platform();
  if (platform === "win32") {
    return "shutdown /s /t 0";
  } else if (platform === "linux") {
    return "shutdown -h now"; // May require sudo permissions
  } else if (platform === "darwin") {
    return "sudo shutdown -h now"; // Requires sudo
  }
  throw new Error("Unsupported platform");
};

const getRestartCommand = () => {
  const platform = os.platform();
  if (platform === "win32") {
    return "shutdown /r /t 0";
  } else if (platform === "linux") {
    return "shutdown -r now"; // May require sudo permissions
  } else if (platform === "darwin") {
    return "sudo shutdown -r now"; // Requires sudo
  }
  throw new Error("Unsupported platform");
};

const getSleepCommand = () => {
  const platform = os.platform();
  if (platform === "win32") {
    // Note: This might hibernate if hibernation is enabled.
    // To some users 'shutdown /h' is hibernate.
    // 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0' is the standard for sleep/hibernate.
    return "rundll32.exe powrprof.dll,SetSuspendState 0,1,0";
  } else if (platform === "linux") {
    return "systemctl suspend"; // Requires systemd and permissions
  } else if (platform === "darwin") {
    return "pmset sleepnow";
  }
  throw new Error("Unsupported platform");
};

app.post("/shutdown", async (req, res) => {
  console.log("Received shutdown request");
  try {
    const cmd = getShutdownCommand();
    await executeCommand(cmd);
    res.json({ message: "Shutting down..." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/restart", async (req, res) => {
  console.log("Received restart request");
  try {
    const cmd = getRestartCommand();
    await executeCommand(cmd);
    res.json({ message: "Restarting..." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/sleep", async (req, res) => {
  console.log("Received sleep request");
  try {
    const cmd = getSleepCommand();
    await executeCommand(cmd);
    res.json({ message: "Sleeping..." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "online", platform: os.platform() });
});

app.listen(PORT, "0.0.0.0", () => {
  const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        // Skip internal (non-remote) and non-IPv4 addresses
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
    return "localhost";
  };

  const localIP = getLocalIP();

  console.log(`Remote Control Server running on port ${PORT}`);
  console.log(`Local IP Address: ${localIP}`);
  console.log(
    `Mode: ${
      TEST_MODE
        ? "🧪 TEST MODE (commands will be simulated)"
        : "⚡ PRODUCTION MODE (commands will execute)"
    }`
  );
  console.log("Endpoints available: /shutdown, /restart, /sleep, /health");
  console.log("Make sure this device is accessible from your network.");
});
