import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useBookingStore } from '../../stores/bookingStore';
import { Badge }          from '../../components/common/Badge';
import { Button }         from '../../components/common/Button';
import { EmptyState }     from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Booking }        from '../../types';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';
import { format } from 'date-fns';

// Status → Badge variant
const STATUS_VARIANT: Record<string, any> = {
  pending:   'warning',
  confirmed: 'info',
  CONFIRMED: 'info',
  arrived:   'success',
  completed: 'success',
  COMPLETED: 'success',
  cancelled: 'error',
  CANCELLED: 'error',
  no_show:   'gray',
};

// Build a JS Date from the booking's date + time fields
const getBookingDate = (booking: Booking): Date => {
  if (booking.scheduled_date) {
    return new Date(`${booking.scheduled_date}T${booking.scheduled_time ?? '00:00'}`);
  }
  return new Date(booking.scheduledAt ?? Date.now());
};

export const BookingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { bookings, fetchAll, isLoading } = useBookingStore();
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every time this screen gets focus
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Button
          title="+ New"
          onPress={() => navigation.navigate('NewBooking')}
          size="sm"
        />
      </View>

      {isLoading && bookings.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
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
              title="No bookings"
              message="Schedule your first appointment"
              icon="calendar-outline"
            />
          }
          renderItem={({ item }) => {
            const date       = getBookingDate(item);
            const vehicleText = item.vehicle
              ? `${item.vehicle.model} · ${item.vehicle.registration_number}`
              : '';

            return (
              <View style={styles.card}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateDay}>{format(date, 'dd')}</Text>
                  <Text style={styles.dateMonth}>{format(date, 'MMM')}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.customerName}>{item.customer?.name ?? '—'}</Text>
                  {!!vehicleText && <Text style={styles.vehicleText}>{vehicleText}</Text>}
                  <Text style={styles.serviceType}>{item.service_type_hint ?? item.serviceType}</Text>
                  <Text style={styles.time}>{format(date, 'hh:mm a')}</Text>
                </View>
                <Badge
                  label={item.status}
                  variant={STATUS_VARIANT[item.status] ?? 'gray'}
                />
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md },
  title:        { fontSize: FONT.sizes.xl, fontWeight: '700', color: COLORS.text },
  list:         { padding: SPACING.md, paddingTop: 0, paddingBottom: 80 },
  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  dateBox:      { width: 48, height: 52, borderRadius: RADIUS.sm, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  dateDay:      { fontSize: FONT.sizes.xl, fontWeight: '800', color: COLORS.primary, lineHeight: 24 },
  dateMonth:    { fontSize: FONT.sizes.xs, color: COLORS.primary, fontWeight: '600' },
  info:         { flex: 1 },
  customerName: { fontSize: FONT.sizes.md, fontWeight: '600', color: COLORS.text },
  vehicleText:  { fontSize: FONT.sizes.xs, color: COLORS.textSecondary },
  serviceType:  { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  time:         { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
});
