import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import SharedGroupPreferences from "react-native-shared-group-preferences";

export interface PC {
  id: string;
  name: string;
  ip: string;
  mac: string;
  port: string;
  status: "online" | "offline" | "unknown";
}

interface PCContextType {
  pcs: PC[];
  selectedPCId: string | null;
  addPC: (pc: Omit<PC, "id">) => Promise<void>;
  updatePC: (id: string, updates: Partial<PC>) => Promise<void>;
  removePC: (id: string) => Promise<void>;
  selectPC: (id: string | null) => void;
  selectedPC: PC | undefined;
  clearAllPCs: () => Promise<void>;
}

const PCContext = createContext<PCContextType | undefined>(undefined);

const STORAGE_KEY = "pc_remote_pcs";
const SELECTED_PC_KEY = "pc_remote_selected_id";
const APP_GROUP = "group.gabs.pcremotecontrol";
const WIDGET_DATA_KEY = "pc_remote_selected_pc";

export function PCProvider({ children }: { children: React.ReactNode }) {
  const [pcs, setPcs] = useState<PC[]>([]);
  const [selectedPCId, setSelectedPCId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedPCs = await SecureStore.getItemAsync(STORAGE_KEY);
      if (storedPCs) {
        setPcs(JSON.parse(storedPCs));
      }
      const storedSelectedId = await SecureStore.getItemAsync(SELECTED_PC_KEY);
      if (storedSelectedId) {
        setSelectedPCId(storedSelectedId);
      }
    } catch (error) {
      console.error("Failed to load PCs", error);
    }
  };

  const saveData = async (newPcs: PC[]) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(newPcs));
      setPcs(newPcs);
    } catch (error) {
      console.error("Failed to save PCs", error);
    }
  };

  const updateSharedStorage = async (pc: PC | null) => {
    try {
      if (pc) {
        await SharedGroupPreferences.setItem(
          WIDGET_DATA_KEY,
          {
            id: pc.id,
            name: pc.name,
            ip: pc.ip,
            port: pc.port,
            mac: pc.mac,
          },
          APP_GROUP
        );
      } else {
        // Optionally clear or handle null
      }
    } catch (e) {
      console.warn("SharedGroupPreferences error (native only):", e);
    }
  };

  const addPC = async (pcData: Omit<PC, "id">) => {
    const newPC: PC = { ...pcData, id: Date.now().toString() };
    const newPcs = [...pcs, newPC];
    await saveData(newPcs);
    if (!selectedPCId) {
      selectPC(newPC.id);
    }
  };

  const updatePC = async (id: string, updates: Partial<PC>) => {
    const newPcs = pcs.map((pc) => (pc.id === id ? { ...pc, ...updates } : pc));
    // Optimization: only save if changed
    const oldPC = pcs.find((p) => p.id === id);
    if (
      JSON.stringify(oldPC) !== JSON.stringify(newPcs.find((p) => p.id === id))
    ) {
      await saveData(newPcs);

      if (id === selectedPCId) {
        const updatedPC = newPcs.find((p) => p.id === id);
        updateSharedStorage(updatedPC || null);
      }
    }
  };

  const removePC = async (id: string) => {
    const newPcs = pcs.filter((pc) => pc.id !== id);
    await saveData(newPcs);
    if (selectedPCId === id) {
      selectPC(newPcs.length > 0 ? newPcs[0].id : null);
    }
  };

  const clearAllPCs = async () => {
    await saveData([]);
    await selectPC(null);
  };

  const selectPC = async (id: string | null) => {
    setSelectedPCId(id);
    if (id) {
      await SecureStore.setItemAsync(SELECTED_PC_KEY, id);
      const pc = pcs.find((p) => p.id === id);
      updateSharedStorage(pc || null);
    } else {
      await SecureStore.deleteItemAsync(SELECTED_PC_KEY);
      // Maybe clear shared storage?
    }
  };

  // Also update when initially loading if we have a selected PC
  useEffect(() => {
    if (selectedPCId && pcs.length > 0) {
      const pc = pcs.find((p) => p.id === selectedPCId);
      updateSharedStorage(pc || null);
    }
  }, [selectedPCId, pcs]);

  const selectedPC = pcs.find((pc) => pc.id === selectedPCId);

  return (
    <PCContext.Provider
      value={{
        pcs,
        selectedPCId,
        addPC,
        updatePC,
        removePC,
        selectPC,
        selectedPC,
        clearAllPCs,
      }}
    >
      {children}
    </PCContext.Provider>
  );
}

export const usePC = () => {
  const context = useContext(PCContext);
  if (!context) {
    throw new Error("usePC must be used within a PCProvider");
  }
  return context;
};
