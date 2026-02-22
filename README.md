# 💊 PharmaTrack

A local-first inventory management app for clinics. Built with React Native (Expo).

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)

### 1. Install Dependencies

Open a terminal in this project folder and run:

```bash
npm install
```

### 2. Start the Development Server

```bash
npx expo start
```

### 3. Open on Your Device

- **Physical phone**: Scan the QR code with the Expo Go app
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal

---

## 📁 Project Structure

```
PharmaTrack/
├── app/
│   ├── _layout.js          # Root layout — wraps app in InventoryProvider
│   └── index.js            # Main dashboard screen (FlatList + FAB + Modal)
├── components/
│   └── drug-card.js        # Smart drug card with DSS expiry/stock logic
├── context/
│   └── inventory-context.js # Global state + AsyncStorage persistence
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration
└── package.json            # Dependencies
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Add Drugs** | Tap the teal `+` FAB → fill in Name, Quantity, Expiry Date |
| **Dispense** | Tap "Dispense Unit" to decrement stock by 1 |
| **Delete** | Tap the trash icon to permanently remove a drug |
| **Expiry Alerts** | 🔴 Red card = expired · 🟠 Orange = expires within 30 days |
| **Low Stock Badge** | Quantity < 5 shows bold red text + "Low Stock" badge |
| **Offline First** | All data saved locally via AsyncStorage — no internet needed |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Primary | `#319795` | Buttons, FAB, accents |
| Deep Teal | `#234E52` | App title |
| Critical BG | `#FFE5E5` | Expired drug cards |
| Warning BG | `#FFF4E5` | Near-expiry cards |
| Safe BG | `#FFFFFF` | Healthy stock cards |
| Alert Red | `#E53E3E` | Expired borders, low stock text |
| Alert Orange | `#DD6B20` | Warning borders |

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `@react-native-async-storage/async-storage` | Offline data persistence |
| `date-fns` | Accurate expiry day calculations |
| `lucide-react-native` | Modern icon set |
| `react-native-svg` | Required by lucide-react-native |
# PharmTrack
