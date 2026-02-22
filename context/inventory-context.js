// context/inventory-context.js
// ─────────────────────────────────────────────────────────────
// Global state manager for PharmaTrack.
// Handles all CRUD operations and persists data to AsyncStorage.
// ─────────────────────────────────────────────────────────────

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The key used to store our inventory array in AsyncStorage
const STORAGE_KEY = '@pharmatrack_inventory';

// Create the context object. Components will consume this.
export const InventoryContext = createContext(null);

// ─── Provider Component ───────────────────────────────────────
export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── LOAD: Hydrate state from AsyncStorage on app mount ──────
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData !== null) {
          setInventory(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('[InventoryContext] Failed to load inventory:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInventory();
  }, []);

  // ── SAVE: Persist state to AsyncStorage on every inventory change ──
  useEffect(() => {
    if (isLoading) return;

    const saveInventory = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
      } catch (error) {
        console.error('[InventoryContext] Failed to save inventory:', error);
      }
    };
    saveInventory();
  }, [inventory, isLoading]);

  // ── ADD: Creates a new drug entry with a unique ID ──────────
  const addDrug = useCallback(({ name, quantity, expiryDate }) => {
    const newDrug = {
      id: `drug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      quantity: parseInt(quantity, 10),
      expiryDate: new Date(expiryDate).toISOString(),
      addedAt: new Date().toISOString(),
    };
    setInventory((prev) => [newDrug, ...prev]);
  }, []);

  // ── DISPENSE: Decrements quantity by 1, prevents going below 0 ──
  const dispenseDrug = useCallback((id) => {
    setInventory((prev) =>
      prev.map((drug) =>
        drug.id === id
          ? { ...drug, quantity: Math.max(0, drug.quantity - 1) }
          : drug
      )
    );
  }, []);

  // ── DELETE: Removes a drug entry entirely by its ID ─────────
  const deleteDrug = useCallback((id) => {
    setInventory((prev) => prev.filter((drug) => drug.id !== id));
  }, []);

  // ── Derived data: count of critical (expired) items ─────────
  const criticalCount = inventory.filter((drug) => {
    const now = new Date();
    const expiry = new Date(drug.expiryDate);
    return expiry < now;
  }).length;

  const contextValue = {
    inventory,
    isLoading,
    criticalCount,
    addDrug,
    dispenseDrug,
    deleteDrug,
  };

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

// ── Custom hook for clean consumption ──────────────────────────
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('[useInventory] must be used within an <InventoryProvider>');
  }
  return context;
};
