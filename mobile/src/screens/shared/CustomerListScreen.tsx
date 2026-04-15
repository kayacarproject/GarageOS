import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCustomerStore } from '../../stores/customerStore';
import { SearchBar } from '../../components/common/SearchBar';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Ionicons } from '@expo/vector-icons';
import { Customer } from '../../types';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

export const CustomerListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { customers, fetchAll, remove, isLoading } = useCustomerStore();
  const [search, setSearch]           = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  useEffect(() => { fetchAll(); }, []);

  // Refresh when returning from Add/Edit screens
  useFocusEffect(useCallback(() => { fetchAll(); }, []));

  // ── Fixed search: filters name, mobile, phone, email ──
  const filtered = customers.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.mobile ?? '').includes(q) ||
      (c.phone ?? '').includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <View style={s.container}>
      {/* Search + Add */}
      <View style={s.topBar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, phone or email..."
        />
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('AddCustomer')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          extraData={search}   // forces re-render when search changes
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <EmptyState
              title={search ? 'No results' : 'No customers'}
              message={search ? `No customers match "${search}"` : 'Add your first customer'}
              icon="people-outline"
            />
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <TouchableOpacity
                style={s.cardMain}
                onPress={() => navigation.navigate('CustomerDetail', { id: item.id })}
                activeOpacity={0.8}
              >
                <Avatar name={item.name} size={44} />
                <View style={s.info}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.phone}>{item.mobile ?? item.phone}</Text>
                  {item.email ? <Text style={s.email}>{item.email}</Text> : null}
                  {item.city ? <Text style={s.city}>{item.city}</Text> : null}
                </View>
              </TouchableOpacity>

              {/* ── Edit button — passes id correctly ── */}
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => navigation.navigate('CustomerForm', { id: item.id })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="create-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={s.deleteBtn}
                onPress={() => setDeleteTarget(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Customer"
        message={`Delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { remove(deleteTarget!.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar:    { flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm, alignItems: 'center' },
  addBtn:    { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  list:      { padding: SPACING.md, paddingTop: 0, paddingBottom: 80 },

  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 1, borderColor: COLORS.border },
  cardMain:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  info:      { flex: 1 },
  name:      { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },
  phone:     { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 1 },
  email:     { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  city:      { fontSize: FONT.sizes.xs, color: COLORS.textMuted },

  editBtn:   { padding: SPACING.xs, marginRight: 4 },
  deleteBtn: { padding: SPACING.xs },
});
