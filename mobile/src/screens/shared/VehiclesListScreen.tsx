import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { vehicleApi, HanaVehicle } from '../../api/vehicleApi';
import { showToast } from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

const FUEL_FILTERS = ['All', 'Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

const FUEL_COLOR: Record<string, string> = {
  petrol: '#3B82F6',
  diesel: '#F59E0B',
  cng: '#10B981',
  electric: '#8B5CF6',
  hybrid: '#EC4899',
};

export const VehiclesListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<HanaVehicle[]>([]);
  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehicleApi.getVehicles();
      setVehicles(data);
    } catch (e: any) {
      showToast(e.message ?? 'Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadVehicles(); }, [loadVehicles]));

  const filtered = vehicles.filter((v) => {
    const matchFuel =
      fuelFilter === 'All' ||
      v.fuleType?.toLowerCase() === fuelFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      v.registrationNumber?.toLowerCase().includes(q) ||
      v.brand?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q);
    return matchFuel && matchSearch;
  });

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by plate, brand, model..."
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filters}
      >
        {FUEL_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.chip, fuelFilter === f && s.chipActive]}
            onPress={() => setFuelFilter(f)}
          >
            <Text style={[s.chipText, fuelFilter === f && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(v) => v._id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadVehicles} />}
        ListEmptyComponent={
          <EmptyState
            title={loading ? 'Loading vehicles…' : 'No vehicles found'}
            message={loading ? '' : 'Try adjusting your search or add a new vehicle'}
            icon="car-outline"
          />
        }
        renderItem={({ item: v }) => {
          const fuelKey = v.fuleType?.toLowerCase() ?? '';
          const fuelColor = FUEL_COLOR[fuelKey] ?? COLORS.textMuted;
          return (
            <View style={s.card}>
              <View style={s.iconBox}>
                <Ionicons name="car" size={22} color={COLORS.primary} />
              </View>
              <View style={s.info}>
                <View style={s.row}>
                  <Text style={s.name} numberOfLines={1}>
                    {v.brand} {v.model}
                  </Text>
                  {v.fuleType ? (
                    <View style={[s.fuelBadge, { backgroundColor: fuelColor + '20' }]}>
                      <Text style={[s.fuelText, { color: fuelColor }]}>
                        {v.fuleType.toUpperCase()}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={s.plate}>{v.registrationNumber}</Text>
                <View style={s.row}>
                  <Text style={s.meta}>
                    {v.year ?? '—'} · {v.color ?? '—'}
                  </Text>
                  {v.currentKM ? (
                    <Text style={s.meta}>
                      {parseInt(v.currentKM, 10).toLocaleString('en-IN')} km
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('AddVehicle', {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { padding: SPACING.md, paddingBottom: 0 },
  filters: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.xs },
  chip: {
    height: 32,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONT.sizes.xs, fontWeight: '600', textAlign: 'center', color: COLORS.textSecondary },
  chipTextActive: { color: '#fff' },
  list: { padding: SPACING.md, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: SPACING.xs },
  plate: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.primary, marginTop: 2 },
  meta: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 3 },
  fuelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.full },
  fuelText: { fontSize: 10, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
  },
});
