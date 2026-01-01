import { useRef, useEffect } from "react";
import { usePC } from "@/contexts/pc-context";

export function usePCStatus() {
  const { pcs, updatePC } = usePC();
  // We use a ref to prevent infinite loops if dependencies change during polling
  // though for this hook, simpler is better.

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
            // We update the context if status changed
            if (response.ok && pc.status !== "online") {
              updatePC(pc.id, { status: "online" });
            }
          } catch (e) {
            // Offline
            if (pc.status !== "offline") {
              updatePC(pc.id, { status: "offline" });
            }
          }
        }
      }
    };

    // Poll every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, [pcs]);
}
