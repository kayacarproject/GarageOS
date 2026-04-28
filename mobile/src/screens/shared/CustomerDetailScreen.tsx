import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons }       from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Avatar }         from '../../components/common/Avatar';
import { PhoneMasked }    from '../../components/common/PhoneMasked';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { customerApi }    from '../../api/customerApi';
import { vehicleApi, HanaVehicle } from '../../api/vehicleApi';
import { jobcardApi, HanaJobCard } from '../../api/jobcardApi';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import type { Customer } from '../../types';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: COLORS.warning, bg: COLORS.warningLight },
  in_progress: { label: 'In Progress', color: COLORS.info,    bg: COLORS.infoLight    },
  completed:   { label: 'Completed',   color: COLORS.success, bg: COLORS.successLight },
  cancelled:   { label: 'Cancelled',   color: COLORS.danger,  bg: COLORS.dangerLight  },
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.open;
  return (
    <View style={[chip.pill, { backgroundColor: cfg.bg }]}>
      <Text style={[chip.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};
const chip = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  text: { fontSize: FONT.sizes.xs, fontWeight: '700' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export const CustomerDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { id } = route.params ?? {};

  const [customer,   setCustomer]   = useState<Customer | null>(null);
  const [vehicles,   setVehicles]   = useState<HanaVehicle[]>([]);
  const [jobs,       setJobs]       = useState<HanaJobCard[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) { setLoading(false); setError('No customer ID provided.'); return; }
    setError(null);

    try {
      // 1. Customer profile + vehicles in parallel
      const [customerData, vehicleData] = await Promise.all([
        customerApi.getById(id),
        vehicleApi.getVehicles({ customerId: id }),
      ]);

      setCustomer(customerData);
      setVehicles(vehicleData);

      // 2. Job cards for every vehicle the customer owns
      if (vehicleData.length > 0) {
        const jobLists = await Promise.all(
          vehicleData.map(v => jobcardApi.getAll({ vehicleId: v._id })),
        );
        const allJobs = ([] as HanaJobCard[])
          .concat(...jobLists)
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime(),
          );
        setJobs(allJobs);
      } else {
        setJobs([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not load customer details.');
    }
  }, [id]);

  // Reload every time screen focuses
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);
      loadData().finally(() => { if (mounted) setLoading(false); });
      return () => { mounted = false; };
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ── Loading ──
  if (loading) return <LoadingSpinner fullScreen />;

  // ── Error / not found ──
  if (error || !customer) {
    return (
      <View style={s.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
        <Text style={s.errorTitle}>Customer Not Found</Text>
        <Text style={s.errorMsg}>{error ?? 'This customer record could not be loaded.'}</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeJobCount = jobs.filter(
    j => j.status === 'open' || j.status === 'in_progress',
  ).length;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* ── Profile card ── */}
      <View style={s.profileCard}>
        <Avatar name={customer.name} size={64} />
        <View style={s.profileInfo}>
          <Text style={s.name}>{customer.name}</Text>
          <PhoneMasked phone={customer.mobile ?? customer.phone ?? ''} style={s.phone} />
          {!!customer.email && <Text style={s.email}>{customer.email}</Text>}
          {!!customer.city  && (
            <View style={s.cityRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
              <Text style={s.city}>{customer.city}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => navigation.navigate('CustomerForm', { id: customer.id })}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Stats ── */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>{jobs.length}</Text>
          <Text style={s.statLabel}>Total Services</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statValue}>{vehicles.length}</Text>
          <Text style={s.statLabel}>Vehicles</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, activeJobCount > 0 && { color: COLORS.warning }]}>
            {activeJobCount}
          </Text>
          <Text style={s.statLabel}>Active Jobs</Text>
        </View>
      </View>

      {/* ── Vehicles ── */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Vehicles</Text>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('AddVehicle', { customerId: id })}
        >
          <Ionicons name="add" size={16} color={COLORS.primary} />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {vehicles.length === 0 ? (
        <Text style={s.emptyNote}>No vehicles registered</Text>
      ) : (
        vehicles.map(v => (
          <View key={v._id} style={s.vehicleCard}>
            <View style={s.vehicleIcon}>
              <Ionicons name="car" size={18} color={COLORS.primary} />
            </View>
            <View style={s.vehicleInfo}>
              <Text style={s.vehicleName}>
                {[v.brand, v.model, v.year ? `(${v.year})` : ''].filter(Boolean).join(' ')}
              </Text>
              <Text style={s.vehiclePlate}>{v.registrationNumber}</Text>
              {(v.fuleType || v.currentKM) && (
                <Text style={s.vehicleMeta}>
                  {[v.fuleType, v.currentKM ? `${parseInt(v.currentKM).toLocaleString('en-IN')} km` : '']
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              )}
            </View>
          </View>
        ))
      )}

      {/* ── Service history ── */}
      <Text style={[s.sectionTitle, { marginTop: SPACING.md, marginBottom: SPACING.sm }]}>
        Service History
      </Text>

      {jobs.length === 0 ? (
        <Text style={s.emptyNote}>No service history</Text>
      ) : (
        jobs.map(j => (
          <TouchableOpacity
            key={j._id}
            style={s.jobCard}
            onPress={() => navigation.navigate('HanaJobCardDetail', { id: j._id })}
            activeOpacity={0.8}
          >
            <View style={s.jobLeft}>
              <Text style={s.jobTitle}>
                {[j.brand, j.model].filter(Boolean).join(' ') || j.registrationNumber || '—'}
              </Text>
              <Text style={s.jobSub} numberOfLines={1}>
                {j.workType ?? j.description ?? '—'}
              </Text>
              {!!j.createdAt && (
                <Text style={s.jobDate}>
                  {new Date(j.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </Text>
              )}
            </View>
            <StatusChip status={j.status} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: SPACING.md, paddingBottom: 100 },

  // Error state
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.sm },
  errorTitle:   { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  errorMsg:     { fontSize: FONT.sizes.sm, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.sm },
  backBtn:      { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.primary },
  backBtnText:  { fontSize: FONT.sizes.sm, fontWeight: '700', color: '#fff' },

  // Profile
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, gap: SPACING.sm },
  profileInfo: { flex: 1 },
  name:        { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text },
  phone:       { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  email:       { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  cityRow:     { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  city:        { fontSize: FONT.sizes.xs, color: COLORS.textMuted },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statBox:  { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOW.sm },
  statValue: { fontSize: FONT.sizes.xl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },

  // Section header
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle:   { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  addBtn:         { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.primary },
  addBtnText:     { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.primary },

  // Vehicles
  vehicleCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, gap: SPACING.sm },
  vehicleIcon:  { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vehicleInfo:  { flex: 1 },
  vehicleName:  { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  vehiclePlate: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  vehicleMeta:  { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  // Job cards
  jobCard:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  jobLeft:  { flex: 1, marginRight: SPACING.sm },
  jobTitle: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  jobSub:   { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  jobDate:  { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },

  emptyNote: { fontSize: FONT.sizes.sm, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.md },
});
