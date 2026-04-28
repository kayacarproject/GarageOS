import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { jobcardApi, HanaJobCard } from '../../api/jobcardApi';
import { showToast } from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'open' | 'active' | 'completed' | 'cancelled';

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All'         },
  { key: 'open',      label: 'Open'        },
  { key: 'active',    label: 'In Progress' },
  { key: 'completed', label: 'Completed'   },
  { key: 'cancelled', label: 'Cancelled'   },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: COLORS.warning, bg: COLORS.warningLight },
  in_progress: { label: 'In Progress', color: COLORS.info,    bg: COLORS.infoLight    },
  completed:   { label: 'Completed',   color: COLORS.success, bg: COLORS.successLight },
  cancelled:   { label: 'Cancelled',   color: COLORS.danger,  bg: COLORS.dangerLight  },
};

function matchFilter(j: HanaJobCard, f: FilterKey): boolean {
  if (f === 'all')       return true;
  if (f === 'active')    return j.status === 'in_progress';
  if (f === 'open')      return j.status === 'open';
  if (f === 'completed') return j.status === 'completed';
  if (f === 'cancelled') return j.status === 'cancelled';
  return true;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const HanaJobCardListScreen: React.FC<{ route: any; navigation: any }> = ({
  route, navigation,
}) => {
  const initialFilter: FilterKey = route.params?.filter ?? 'all';

  const [jobCards,   setJobCards]   = useState<HanaJobCard[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState<FilterKey>(initialFilter);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobcardApi.getAll();
      setJobCards(data);
    } catch (e: any) {
      showToast(e.message ?? 'Failed to load job cards', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = jobCards.filter(j => {
    if (!matchFilter(j, filter)) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      j.registrationNumber?.toLowerCase().includes(q) ||
      j._id.toLowerCase().includes(q) ||
      j.workType?.toLowerCase().includes(q) ||
      j.brand?.toLowerCase().includes(q) ||
      j.model?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.topBar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by plate, ID, work type…"
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
      >
        {FILTER_CHIPS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.chip, filter === f.key && s.chipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[s.chipText, filter === f.key && s.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={j => j._id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          <EmptyState
            title={loading ? 'Loading…' : 'No job cards found'}
            message={loading ? '' : 'Try a different filter or search term'}
            icon="document-text-outline"
          />
        }
        renderItem={({ item: j }) => {
          const cfg = STATUS_CONFIG[j.status] ?? STATUS_CONFIG.open;
          return (
            <TouchableOpacity
              style={[s.card, { borderLeftColor: cfg.color }]}
              onPress={() => navigation.navigate('HanaJobCardDetail', { id: j._id })}
              activeOpacity={0.8}
            >
              <View style={s.cardTop}>
                <View style={s.cardLeft}>
                  <Text style={s.plate}>{j.registrationNumber ?? '—'}</Text>
                  <Text style={s.vehicle}>
                    {[j.brand, j.model].filter(Boolean).join(' ') || '—'}
                  </Text>
                </View>
                <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <View style={s.cardMeta}>
                <View style={s.metaItem}>
                  <Ionicons name="construct-outline" size={12} color={COLORS.textMuted} />
                  <Text style={s.metaText}>{j.workType ?? '—'}</Text>
                </View>
                {j.currentKM ? (
                  <View style={s.metaItem}>
                    <Ionicons name="speedometer-outline" size={12} color={COLORS.textMuted} />
                    <Text style={s.metaText}>
                      {parseInt(j.currentKM).toLocaleString('en-IN')} km
                    </Text>
                  </View>
                ) : null}
                {j.createdAt ? (
                  <View style={s.metaItem}>
                    <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                    <Text style={s.metaText}>
                      {new Date(j.createdAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                ) : null}
              </View>

              {j.description ? (
                <Text style={s.desc} numberOfLines={1}>{j.description}</Text>
              ) : null}

              <View style={s.cardFooter}>
                <Text style={s.idText}>#{j._id.slice(-8).toUpperCase()}</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar:    { padding: SPACING.md, paddingBottom: 0 },
  chips:     { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.xs },
  chip:      { paddingHorizontal: SPACING.md, height: 32, justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  chipActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:      { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive:{ color: '#fff' },
  list:  { padding: SPACING.md, paddingBottom: 100 },
  card:  { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderLeftWidth: 3 },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardLeft:   { flex: 1, marginRight: SPACING.sm },
  plate:      { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  vehicle:    { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT.sizes.xs, fontWeight: '700' },
  cardMeta:   { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: 4 },
  metaItem:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:   { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  desc:       { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginBottom: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.border },
  idText:     { fontSize: FONT.sizes.xs, color: COLORS.textMuted, fontWeight: '600' },
});
