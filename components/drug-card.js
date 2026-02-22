// components/drug-card.js
// ─────────────────────────────────────────────────────────────
// The core UI component. Acts as the "Decision Support System"
// by visually flagging expiry status and low stock levels.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { differenceInDays, format } from 'date-fns';
import { Pill, Trash2, MinusCircle, AlertTriangle, Clock } from 'lucide-react-native';
import { useInventory } from '../context/inventory-context';

// ── Status Theming ─────────────────────────────────────────────
const STATUS_THEME = {
  critical: {
    background: '#FFE5E5',
    border: '#E53E3E',
    icon: '#E53E3E',
    label: 'EXPIRED',
    labelBg: '#E53E3E',
  },
  warning: {
    background: '#FFF4E5',
    border: '#DD6B20',
    icon: '#DD6B20',
    label: 'EXPIRING SOON',
    labelBg: '#DD6B20',
  },
  safe: {
    background: '#FFFFFF',
    border: '#C6F6D5',
    icon: '#38A169',
    label: null,
    labelBg: null,
  },
};

// ── Helper: Determine status based on days until expiry ────────
const getExpiryStatus = (daysUntilExpiry) => {
  if (daysUntilExpiry < 0) return 'critical';
  if (daysUntilExpiry <= 30) return 'warning';
  return 'safe';
};

// ── Helper: Human-readable expiry text ─────────────────────────
const getExpiryLabel = (daysUntilExpiry, expiryDate) => {
  const formattedDate = format(new Date(expiryDate), 'dd MMM yyyy');
  if (daysUntilExpiry < 0) {
    return `Expired ${Math.abs(daysUntilExpiry)}d ago · ${formattedDate}`;
  }
  if (daysUntilExpiry === 0) return `Expires TODAY · ${formattedDate}`;
  return `Expires in ${daysUntilExpiry}d · ${formattedDate}`;
};

// ── DrugCard Component ──────────────────────────────────────────
const DrugCard = ({ drug }) => {
  const { dispenseDrug, deleteDrug } = useInventory();

  const daysUntilExpiry = differenceInDays(new Date(drug.expiryDate), new Date());
  const status = getExpiryStatus(daysUntilExpiry);
  const theme = STATUS_THEME[status];

  const isLowStock = drug.quantity < 5;
  const isOutOfStock = drug.quantity === 0;

  // ── Dispense Handler ─────────────────────────────────────────
  const handleDispense = () => {
    if (isOutOfStock) return;

    if (status === 'critical') {
      Alert.alert(
        '⚠️ Expired Drug',
        `${drug.name} has expired. Are you sure you want to dispense it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Dispense Anyway',
            style: 'destructive',
            onPress: () => dispenseDrug(drug.id),
          },
        ]
      );
      return;
    }
    dispenseDrug(drug.id);
  };

  // ── Delete Handler ───────────────────────────────────────────
  const handleDelete = () => {
    Alert.alert(
      'Remove Drug',
      `Remove "${drug.name}" from inventory permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteDrug(drug.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      {/* ── Top Row: Icon, Name, Status Badge ── */}
      <View style={styles.headerRow}>
        <View style={styles.iconWrapper}>
          <Pill size={20} color={theme.icon} />
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.drugName} numberOfLines={1}>
            {drug.name}
          </Text>
          {theme.label && (
            <View style={[styles.statusBadge, { backgroundColor: theme.labelBg }]}>
              <AlertTriangle size={10} color="#FFF" />
              <Text style={styles.statusBadgeText}>{theme.label}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
          <Trash2 size={16} color="#A0AEC0" />
        </TouchableOpacity>
      </View>

      {/* ── Middle Row: Quantity & Expiry Info ── */}
      <View style={styles.infoRow}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>QUANTITY</Text>
          <View style={styles.quantityRow}>
            <Text style={[styles.quantityValue, isLowStock && styles.lowStockText]}>
              {drug.quantity}
            </Text>
            {isLowStock && (
              <View style={styles.lowStockBadge}>
                <Text style={styles.lowStockBadgeText}>Low Stock</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>EXPIRY</Text>
          <View style={styles.expiryRow}>
            <Clock size={12} color={theme.icon} style={{ marginRight: 4 }} />
            <Text style={[styles.expiryValue, { color: theme.icon }]}>
              {getExpiryLabel(daysUntilExpiry, drug.expiryDate)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Bottom Row: Dispense Button ── */}
      <TouchableOpacity
        style={[styles.dispenseBtn, isOutOfStock && styles.dispenseBtnDisabled]}
        onPress={handleDispense}
        disabled={isOutOfStock}
        activeOpacity={0.7}
      >
        <MinusCircle size={16} color={isOutOfStock ? '#A0AEC0' : '#FFFFFF'} />
        <Text style={[styles.dispenseBtnText, isOutOfStock && styles.dispenseBtnTextDisabled]}>
          {isOutOfStock ? 'Out of Stock' : 'Dispense Unit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  drugName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: 0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  deleteBtn: {
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  infoBlock: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A0AEC0',
    letterSpacing: 1,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
    lineHeight: 34,
  },
  lowStockText: {
    color: '#E53E3E',
    fontWeight: '900',
  },
  lowStockBadge: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FC8181',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E53E3E',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryValue: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  dispenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#319795',
    borderRadius: 10,
    paddingVertical: 11,
    gap: 8,
  },
  dispenseBtnDisabled: {
    backgroundColor: '#EDF2F7',
  },
  dispenseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  dispenseBtnTextDisabled: {
    color: '#A0AEC0',
  },
});

export default DrugCard;
