import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Avatar } from '../../components/common/Avatar';
import { PhoneMasked } from '../../components/common/PhoneMasked';
import { JobStatusBadge } from '../../components/job/JobStatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { customerService } from '../../services/customerService';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import type { Customer, Vehicle, JobCard } from '../../types';

export const CustomerDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { id } = route.params ?? {};
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [jobs, setJobs]         = useState<JobCard[]>([]);
  const [loading, setLoading]   = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([
        customerService.getById(id),
        customerService.getVehicles(id),
        customerService.getJobCards(id),
      ]).then(([c, v, j]) => {
        if (!active) return;
        setCustomer(c);
        setVehicles(v);
        setJobs(j);
      }).catch(() => {}).finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [id]),
  );

  if (loading) return <LoadingSpinner fullScreen />;
  if (!customer) return <LoadingSpinner fullScreen />;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Profile */}
      <View style={s.profileCard}>
        <Avatar name={customer.name} size={64} />
        <View style={s.profileInfo}>
          <Text style={s.name}>{customer.name}</Text>
          <PhoneMasked phone={customer.mobile ?? customer.phone ?? ''} style={s.phone} />
          {customer.email && <Text style={s.email}>{customer.email}</Text>}
          {customer.city && <Text style={s.city}>{customer.city}</Text>}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('CustomerForm', { id: customer.id })}>
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
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
          <Text style={[s.statValue, jobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED').length > 0 && { color: COLORS.warning }]}>
            {jobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED').length}
          </Text>
          <Text style={s.statLabel}>Active Jobs</Text>
        </View>
      </View>

      {/* Vehicles */}
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
      {vehicles.map(v => (
        <View key={v.id} style={s.vehicleCard}>
          <View style={s.vehicleIcon}>
            <Ionicons name="car" size={18} color={COLORS.primary} />
          </View>
          <View style={s.vehicleInfo}>
            <Text style={s.vehicleName}>{v.brand ?? v.make} {v.model} {v.year ? `(${v.year})` : ''}</Text>
            <Text style={s.vehiclePlate}>{v.registration_number ?? v.licensePlate}</Text>
            <Text style={s.vehicleFuel}>{v.fuel_type} · {v.current_kms?.toLocaleString('en-IN')} km</Text>
          </View>
        </View>
      ))}
      {vehicles.length === 0 && <Text style={s.emptyNote}>No vehicles registered</Text>}

      {/* Service History */}
      <Text style={[s.sectionTitle, { marginBottom: SPACING.sm, marginTop: SPACING.xs }]}>Service History</Text>
      {jobs.map(j => (
        <TouchableOpacity
          key={j.id}
          style={s.jobCard}
          onPress={() => navigation.navigate('JobCardDetail', { id: j.id })}
          activeOpacity={0.8}
        >
          <View style={s.jobLeft}>
            <Text style={s.jobNum}>{j.job_number ?? j.id}</Text>
            <Text style={s.jobDesc} numberOfLines={1}>{j.description ?? '—'}</Text>
            <Text style={s.jobDate}>{j.created_at ? new Date(j.created_at).toLocaleDateString('en-IN') : ''}</Text>
          </View>
          <JobStatusBadge status={j.status} />
        </TouchableOpacity>
      ))}
      {jobs.length === 0 && <Text style={s.emptyNote}>No service history</Text>}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, gap: SPACING.sm },
  profileInfo: { flex: 1 },
  name: { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text },
  phone: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  email: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  city: { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOW.sm },
  statValue: { fontSize: FONT.sizes.xl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm, marginTop: SPACING.xs },
  sectionTitle: { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.primary },
  addBtnText: { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.primary },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, gap: SPACING.sm },
  vehicleIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  vehiclePlate: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  vehicleFuel: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  jobCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  jobLeft: { flex: 1 },
  jobNum: { fontSize: FONT.sizes.sm, fontWeight: '700', color: COLORS.text },
  jobDesc: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  jobDate: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  emptyNote: { fontSize: FONT.sizes.sm, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.md },
});
