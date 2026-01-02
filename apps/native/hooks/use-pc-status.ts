import { useRef, useEffect } from "react";
import { usePC } from "@/contexts/pc-context";
import { useNotifications } from "@/contexts/notifications-context";

export function usePCStatus() {
  const { pcs, updatePC } = usePC();
  const { settings, sendNotification } = useNotifications();

  // Track previous status to detect changes
  const previousStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const checkStatus = async () => {
      // Loop through all saved PCs
      for (const pc of pcs) {
        if (pc.ip) {
          try {
            // We'll set a short timeout for the check so the UI feels responsive
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(
              `http://${pc.ip}:${pc.port || 3000}/health`,
              {
                method: "GET",
                signal: controller.signal,
              }
            );

            clearTimeout(timeoutId);

            // If we get a response, it's online
            const previousStatus = previousStatusRef.current[pc.id];

            if (response.ok && pc.status !== "online") {
              updatePC(pc.id, { status: "online" });

              // Send notification if PC came online and user has this enabled
              if (settings.onlineAlert && previousStatus === "offline") {
                await sendNotification(
                  "PC Online",
                  `${pc.name} is now online and ready to use.`,
                  { pcId: pc.id, type: "online" }
                );
              }

              previousStatusRef.current[pc.id] = "online";
            }
          } catch (e) {
            // Offline
            const previousStatus = previousStatusRef.current[pc.id];

            if (pc.status !== "offline") {
              updatePC(pc.id, { status: "offline" });

              // Send notification if PC went offline unexpectedly
              if (settings.disconnectAlert && previousStatus === "online") {
                await sendNotification(
                  "PC Disconnected",
                  `${pc.name} has gone offline unexpectedly.`,
                  { pcId: pc.id, type: "disconnect" }
                );
              }

              previousStatusRef.current[pc.id] = "offline";
            }
          }
        }
      }
    };

    // Initialize previous status
    pcs.forEach((pc) => {
      if (!previousStatusRef.current[pc.id]) {
        previousStatusRef.current[pc.id] = pc.status;
      }
    });

    // Poll every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, [pcs, settings.onlineAlert, settings.disconnectAlert]);
}
