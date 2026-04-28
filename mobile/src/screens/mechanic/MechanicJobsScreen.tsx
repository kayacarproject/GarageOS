import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, TextInput,
} from 'react-native';
import { Ionicons }       from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore }   from '../../stores/authStore';
import { jobcardApi, HanaJobCard } from '../../api/jobcardApi';
import { EmptyState }     from '../../components/common/EmptyState';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

// ─── Status display ───────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  open:                 { label: 'Assigned',         color: COLORS.info,    bg: COLORS.infoLight    },
  assigned:             { label: 'Assigned',         color: COLORS.info,    bg: COLORS.infoLight    },
  in_progress:          { label: 'In Progress',      color: COLORS.primary, bg: COLORS.primaryLight },
  awaiting_approval:    { label: 'Awaiting Approval',color: COLORS.warning, bg: COLORS.warningLight },
  approved_for_invoice: { label: 'Approved',         color: COLORS.success, bg: COLORS.successLight },
  revision_requested:   { label: 'Revision Needed',  color: COLORS.danger,  bg: COLORS.dangerLight  },
  completed:            { label: 'Completed',        color: COLORS.success, bg: COLORS.successLight },
  cancelled:            { label: 'Cancelled',        color: COLORS.danger,  bg: COLORS.dangerLight  },
};

// ─── Filters ──────────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'assigned' | 'in_progress' | 'awaiting_approval' | 'revision_requested' | 'completed';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',                label: 'All'      },
  { key: 'assigned',           label: 'Assigned' },
  { key: 'in_progress',        label: 'Active'   },
  { key: 'awaiting_approval',  label: 'Pending'  },
  { key: 'revision_requested', label: 'Revision' },
  { key: 'completed',          label: 'Done'     },
];

function matchFilter(j: HanaJobCard, f: FilterKey): boolean {
  if (f === 'all')      return true;
  if (f === 'assigned') return j.status === 'assigned' || j.status === 'open';
  return j.status === f;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const MechanicJobsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  const [jobs,       setJobs]       = useState<HanaJobCard[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState<FilterKey>('all');

  const load = useCallback(async () => {
    try {
      const data = await jobcardApi.getByMechanic(user?.id ?? '');
      setJobs(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, [load]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const filtered = jobs.filter(j => {
    if (!matchFilter(j, filter)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      j.registrationNumber?.toLowerCase().includes(q) ||
      j._id.toLowerCase().includes(q) ||
      j.workType?.toLowerCase().includes(q) ||
      j.brand?.toLowerCase().includes(q) ||
      j.model?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={s.container}>
      {/* ── Search ── */}
      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by plate, work type…"
          placeholderTextColor={COLORS.textMuted}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
      >
        {FILTERS.map(f => (
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

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={j => j._id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={loading ? 'Loading…' : 'No jobs found'}
            message={loading ? '' : 'Try a different filter or search term'}
            icon="construct-outline"
          />
        }
        renderItem={({ item: j }) => {
          const cfg        = STATUS_CFG[j.status] ?? STATUS_CFG.open;
          const isRevision = j.status === 'revision_requested';
          const isPending  = j.status === 'awaiting_approval';

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
                <View style={[s.pill, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.pillText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              <Text style={s.workType}>{j.workType ?? '—'}</Text>

              {isRevision && (
                <View style={s.warningRow}>
                  <Ionicons name="alert-circle-outline" size={12} color={COLORS.danger} />
                  <Text style={s.warningText}>Revision needed — update estimate and resubmit</Text>
                </View>
              )}
              {isPending && (
                <View style={s.pendingRow}>
                  <Ionicons name="time-outline" size={12} color={COLORS.warning} />
                  <Text style={s.pendingText}>Submitted — waiting for owner review</Text>
                </View>
              )}

              <View style={s.cardFooter}>
                <Text style={s.idText}>#{j._id.slice(-8).toUpperCase()}</Text>
                {j.createdAt && (
                  <Text style={s.dateText}>
                    {new Date(j.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Text>
                )}
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

  searchBox:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, margin: SPACING.md, marginBottom: 0, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.sm, paddingVertical: 10, ...SHADOW.sm },
  searchInput: { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.text },

  chips:         { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.xs },
  chip:          { paddingHorizontal: SPACING.md, height: 32, justifyContent: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  chipActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText:      { fontSize: FONT.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive:{ color: '#fff' },

  list: { padding: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderLeftWidth: 3 },

  cardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardLeft: { flex: 1, marginRight: SPACING.sm },
  plate:    { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  vehicle:  { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  pill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  pillText: { fontSize: FONT.sizes.xs, fontWeight: '700' },

  workType: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginBottom: 4 },

  warningRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.dangerLight,  borderRadius: RADIUS.sm, padding: 5, marginBottom: 4 },
  warningText: { flex: 1, fontSize: FONT.sizes.xs, color: COLORS.danger,  fontWeight: '600' },
  pendingRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.warningLight, borderRadius: RADIUS.sm, padding: 5, marginBottom: 4 },
  pendingText: { flex: 1, fontSize: FONT.sizes.xs, color: COLORS.warning, fontWeight: '600' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 2 },
  idText:     { flex: 1, fontSize: FONT.sizes.xs, color: COLORS.textMuted, fontWeight: '600' },
  dateText:   { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
});
