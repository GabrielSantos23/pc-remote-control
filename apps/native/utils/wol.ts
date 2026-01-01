import dgram from "react-native-udp";
import { Buffer } from "buffer";

export const wakeOnLan = (macAddress: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Check if dgram module is available (native module)
      if (!dgram || typeof dgram.createSocket !== "function") {
        return reject(
          new Error(
            "WOL module not available. Please run the app with 'expo run:android' or 'expo run:ios' instead of Expo Go."
          )
        );
      }

      // Clean MAC address
      const mac = macAddress.replace(/[:.-]/g, "");
      if (mac.length !== 12) {
        return reject(new Error("Invalid MAC address length"));
      }

      // Create Magic Packet
      // 6 bytes of 0xFF
      const magicPacket = Buffer.alloc(102);
      for (let i = 0; i < 6; i++) {
        magicPacket[i] = 0xff;
      }

      // 16 repetitions of MAC address
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 6; j++) {
          magicPacket[6 + i * 6 + j] = parseInt(
            mac.substring(j * 2, j * 2 + 2),
            16
          );
        }
      }

      const socket = dgram.createSocket({ type: "udp4" });

      // Bind to random port to avoid conflicts
      socket.bind(0);
      socket.once("listening", () => {
        socket.setBroadcast(true);
        socket.send(
          magicPacket,
          0,
          magicPacket.length,
          9,
          "255.255.255.255",
          (err) => {
            socket.close();
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });

      socket.on("error", (err) => {
        socket.close();
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};
