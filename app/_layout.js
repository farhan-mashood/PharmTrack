// app/_layout.js
// ─────────────────────────────────────────────────────────────
// Root layout for Expo Router. Wraps the entire app in the
// InventoryProvider so every screen can access global state.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { InventoryProvider } from '../context/inventory-context';

export default function RootLayout() {
  return (
    <InventoryProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#234E52',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 18,
            color: '#1A202C',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#F7FAFC',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Dashboard',
          }}
        />
      </Stack>
    </InventoryProvider>
  );
}
