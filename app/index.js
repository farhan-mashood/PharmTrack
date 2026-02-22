// app/index.js
// ─────────────────────────────────────────────────────────────
// The main dashboard screen. Renders the inventory list and
// hosts the FAB + Modal for adding new drugs.
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Plus, PackageSearch, ShieldAlert, X, CheckCircle } from 'lucide-react-native';
import { useInventory } from '../context/inventory-context';
import DrugCard from '../components/drug-card';

// ── Empty State Component ───────────────────────────────────────
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <PackageSearch size={64} color="#CBD5E0" strokeWidth={1.5} />
    <Text style={styles.emptyTitle}>No Drugs in Inventory</Text>
    <Text style={styles.emptySubtitle}>
      Tap the <Text style={{ fontWeight: '700' }}>+</Text> button below to add your first drug.
    </Text>
  </View>
);

// ── Add Drug Modal ──────────────────────────────────────────────
const AddDrugModal = ({ visible, onClose }) => {
  const { addDrug } = useInventory();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Drug name is required.';
    const qty = parseInt(quantity, 10);
    if (!quantity || isNaN(qty) || qty < 0) {
      newErrors.quantity = 'Enter a valid quantity (0 or more).';
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!expiryDate || !dateRegex.test(expiryDate)) {
      newErrors.expiryDate = 'Use format: YYYY-MM-DD (e.g. 2026-12-31)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addDrug({ name, quantity, expiryDate });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setQuantity('');
    setExpiryDate('');
    setErrors({});
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Drug</Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn}>
              <X size={22} color="#718096" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>DRUG / PRODUCT NAME</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g., Amoxicillin 500mg"
                placeholderTextColor="#A0AEC0"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>QUANTITY (UNITS)</Text>
              <TextInput
                style={[styles.input, errors.quantity && styles.inputError]}
                placeholder="e.g., 100"
                placeholderTextColor="#A0AEC0"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>EXPIRY DATE</Text>
              <TextInput
                style={[styles.input, errors.expiryDate && styles.inputError]}
                placeholder="YYYY-MM-DD (e.g., 2026-12-31)"
                placeholderTextColor="#A0AEC0"
                value={expiryDate}
                onChangeText={setExpiryDate}
                keyboardType="numeric"
                maxLength={10}
              />
              {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
              <CheckCircle size={18} color="#FFF" />
              <Text style={styles.submitBtnText}>Add to Inventory</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Main Dashboard Screen ───────────────────────────────────────
export default function DashboardScreen() {
  const { inventory, isLoading, criticalCount } = useInventory();
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const keyExtractor = useCallback((item) => item.id, []);
  const renderItem = useCallback(({ item }) => <DrugCard drug={item} />, []);
  const filteredInventory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return inventory;
    return inventory.filter((d) => (d.name || '').toLowerCase().includes(q));
  }, [inventory, searchQuery]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#319795" />
        <Text style={styles.loadingText}>Loading Inventory...</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ── App Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>PharmaTrack</Text>
            <Text style={styles.appSubtitle}>
              {inventory.length} drug{inventory.length !== 1 ? 's' : ''} tracked
            </Text>
          </View>

          {criticalCount > 0 && (
            <View style={styles.criticalBadge}>
              <ShieldAlert size={14} color="#E53E3E" />
              <Text style={styles.criticalBadgeText}>
                {criticalCount} Critical
              </Text>
            </View>
          )}
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search drugs..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
              <X size={18} color="#718096" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Inventory FlatList ── */}
        <FlatList
          data={filteredInventory}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={[
            styles.listContent,
            inventory.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        />

        {/* ── Floating Action Button ── */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* ── Add Drug Modal ── */}
        <AddDrugModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    gap: 12,
  },
  loadingText: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#234E52',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
    fontWeight: '500',
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FC8181',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  criticalBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E53E3E',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A202C',
    backgroundColor: '#F7FAFC',
  },
  searchClear: {
    padding: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A5568',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#319795',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#319795',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A202C',
  },
  modalCloseBtn: {
    padding: 4,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0AEC0',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1A202C',
    backgroundColor: '#F7FAFC',
  },
  inputError: {
    borderColor: '#FC8181',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 12,
    color: '#E53E3E',
    marginTop: 5,
    fontWeight: '500',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#319795',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 8,
    gap: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
