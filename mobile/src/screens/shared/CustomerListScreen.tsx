import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCustomerStore } from '../../stores/customerStore';
import { SearchBar }        from '../../components/common/SearchBar';
import { Avatar }           from '../../components/common/Avatar';
import { EmptyState }       from '../../components/common/EmptyState';
import { LoadingSpinner }   from '../../components/common/LoadingSpinner';
import { Ionicons }         from '@expo/vector-icons';
import { showToast }        from '../../utils/toast';
import { Customer }         from '../../types';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

export const CustomerListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { customers, fetchAll, isLoading } = useCustomerStore();
  const [search, setSearch]       = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Load fresh data every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, []);

  // Filter by name, mobile, email, and city
  const filtered = customers.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.mobile ?? '').includes(q) ||
      (c.phone  ?? '').includes(q) ||
      (c.email  ?? '').toLowerCase().includes(q) ||
      (c.city   ?? '').toLowerCase().includes(q)
    );
  });

  const handleDeletePress = (_item: Customer) => {
    showToast('Delete feature coming soon', 'info');
  };

  const isSearching = search.trim().length > 0;

  return (
    <View style={s.container}>
      {/* ── Search bar + Add button ── */}
      <View style={s.topBar}>
        {/* flex: 1 forces the SearchBar to expand and fill available width */}
        <View style={s.searchWrapper}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, phone or city..."
          />
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('AddCustomer')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Result count strip (visible only while searching) ── */}
      {isSearching && !isLoading && (
        <View style={s.resultStrip}>
          <Ionicons name="search-outline" size={13} color={COLORS.textMuted} />
          <Text style={s.resultText}>
            {filtered.length === 0
              ? `No results for "${search}"`
              : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`}
          </Text>
        </View>
      )}

      {isLoading && customers.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          extraData={search}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={isSearching ? 'No results' : 'No customers'}
              message={
                isSearching
                  ? `No customers match "${search}"`
                  : 'Tap + to add your first customer'
              }
              icon="people-outline"
            />
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              {/* ── Tappable area → Customer Detail ── */}
              <TouchableOpacity
                style={s.cardMain}
                onPress={() => navigation.navigate('CustomerDetail', { id: item.id })}
                activeOpacity={0.8}
              >
                <Avatar name={item.name} size={44} />
                <View style={s.info}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.phone}>{item.mobile ?? item.phone}</Text>
                  {!!item.email && <Text style={s.email}>{item.email}</Text>}
                  {!!item.city  && (
                    <View style={s.cityRow}>
                      <Ionicons name="location-outline" size={11} color={COLORS.textMuted} />
                      <Text style={s.city}>{item.city}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* ── Edit ── */}
              <TouchableOpacity
                style={s.iconBtn}
                onPress={() => navigation.navigate('CustomerForm', { id: item.id })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="create-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              {/* ── Delete (coming soon) ── */}
              <TouchableOpacity
                style={s.iconBtn}
                onPress={() => handleDeletePress(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar:       { flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm, alignItems: 'center' },
  searchWrapper: { flex: 1 },          // makes SearchBar fill remaining width
  addBtn:        { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  resultStrip:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  resultText:    { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  list:        { padding: SPACING.md, paddingTop: 0, paddingBottom: 80 },

  card:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 1, borderColor: COLORS.border },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  info:     { flex: 1 },
  name:     { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },
  phone:    { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 1 },
  email:    { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  cityRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  city:     { fontSize: FONT.sizes.xs, color: COLORS.textMuted },

  iconBtn:  { padding: SPACING.xs, marginLeft: 4 },
});
