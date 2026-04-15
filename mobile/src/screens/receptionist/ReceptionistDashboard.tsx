import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { useBookingStore } from "../../stores/bookingStore";
import { useDrawer } from "../../components/CustomDrawer";
import { StatCard } from "../../components/common/StatCard";
import { EmptyState } from "../../components/common/EmptyState";
import { maskMobile } from "../../utils/phone";
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from "../../config/theme";
import type { Booking } from "../../types";

// ─── Booking status config ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  arrived: { label: "Arrived", color: COLORS.success, bg: COLORS.successLight },
  confirmed: {
    label: "Confirmed",
    color: COLORS.warning,
    bg: COLORS.warningLight,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: COLORS.warning,
    bg: COLORS.warningLight,
  },
  PENDING: { label: "Pending", color: COLORS.textMuted, bg: "#F3F4F6" },
  cancelled: {
    label: "Cancelled",
    color: COLORS.danger,
    bg: COLORS.dangerLight,
  },
  CANCELLED: {
    label: "Cancelled",
    color: COLORS.danger,
    bg: COLORS.dangerLight,
  },
  no_show: { label: "No Show", color: COLORS.danger, bg: COLORS.dangerLight },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const QuickAction: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}> = ({ icon, label, color, bg, onPress }) => (
  <TouchableOpacity
    style={[s.quickAction, { backgroundColor: bg }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[s.quickIcon, { backgroundColor: color + "25" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={[s.quickLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const BookingCard: React.FC<{ booking: Booking; onPress: () => void }> = ({
  booking,
  onPress,
}) => {
  const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
  const hasVehicle = !!booking.vehicle_id || !!booking.vehicleId;
  const mobile = booking.customer?.mobile ?? "";

  return (
    <TouchableOpacity
      style={s.bookingCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Time column */}
      <View style={[s.timeBox, { backgroundColor: statusCfg.bg }]}>
        <Text style={[s.timeText, { color: statusCfg.color }]}>
          {booking.scheduled_time ?? "—"}
        </Text>
      </View>

      {/* Info column */}
      <View style={s.bookingInfo}>
        <View style={s.bookingTopRow}>
          <Text style={s.customerName} numberOfLines={1}>
            {booking.customer?.name ?? "—"}
          </Text>
          {!hasVehicle && (
            <View style={s.vehicleWarning}>
              <Ionicons
                name="warning-outline"
                size={11}
                color={COLORS.warning}
              />
              <Text style={s.vehicleWarningText}>No vehicle</Text>
            </View>
          )}
        </View>
        <Text style={s.mobileText}>
          {mobile ? maskMobile(mobile, false) : "—"}
        </Text>
        {booking.vehicle && (
          <Text style={s.vehicleText} numberOfLines={1}>
            {booking.vehicle.brand} {booking.vehicle.model} ·{" "}
            {booking.vehicle.registration_number}
          </Text>
        )}
        <Text style={s.serviceText}>
          {booking.service_type_hint ?? booking.serviceType}
        </Text>
      </View>

      {/* Status pill */}
      <View style={[s.statusPill, { backgroundColor: statusCfg.bg }]}>
        <Text style={[s.statusText, { color: statusCfg.color }]}>
          {statusCfg.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const ReceptionistDashboard: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { user } = useAuthStore();
  const { bookings, fetchAll, isLoading } = useBookingStore();
  const { toggleDrawer } = useDrawer();

  useEffect(() => {
    fetchAll();
  }, []);

  // ─── Derived (memoized) ────────────────────────────────────────────────────

  const arrived = useMemo(
    () => bookings.filter((b) => b.status === "arrived"),
    [bookings],
  );
  const pending = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.status === "confirmed" ||
          b.status === "CONFIRMED" ||
          b.status === "PENDING",
      ),
    [bookings],
  );

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchAll} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.menuBtn}
            onPress={toggleDrawer}
            activeOpacity={0.8}
          >
            <Ionicons name="menu-outline" size={26} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 ,marginStart:20}}>
            <Text style={s.greeting}>Front Desk 🗓</Text>
            <Text style={s.name}>{user?.name}</Text>
            <Text style={s.date}>{dateStr}</Text>
          </View>
          <View style={s.dateBadge}>
            <Text style={s.dateBadgeDay}>{new Date().getDate()}</Text>
            <Text style={s.dateBadgeMonth}>
              {new Date().toLocaleDateString("en-IN", { month: "short" })}
            </Text>
          </View>
        </View>

        {/* ── KPI Cards ── */}
        <View style={s.statsRow}>
          <StatCard
            label="Today's Bookings"
            value={String(bookings.length)}
            icon="calendar-outline"
            iconColor={COLORS.primary}
            iconBg={COLORS.primaryLight}
            style={s.stat}
          />
          <StatCard
            label="Arrived"
            value={String(arrived.length)}
            icon="checkmark-circle-outline"
            iconColor={COLORS.success}
            iconBg={COLORS.successLight}
            style={s.stat}
          />
        </View>
        <View style={s.statsRow}>
          <StatCard
            label="Pending"
            value={String(pending.length)}
            icon="time-outline"
            iconColor={COLORS.warning}
            iconBg={COLORS.warningLight}
            style={s.stat}
          />
          <StatCard
            label="No Vehicle"
            value={String(
              bookings.filter((b) => !b.vehicle_id && !b.vehicleId).length,
            )}
            icon="warning-outline"
            iconColor={COLORS.danger}
            iconBg={COLORS.dangerLight}
            style={s.stat}
          />
        </View>

        {/* ── Quick Actions ── */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.quickGrid}>
          <QuickAction
            icon="add-circle-outline"
            label="New Booking"
            color={COLORS.primary}
            bg={COLORS.primaryLight}
            onPress={() => navigation.navigate("NewBooking")}
          />
          <QuickAction
            icon="car-outline"
            label="New Service"
            color={COLORS.success}
            bg={COLORS.successLight}
            onPress={() => navigation.navigate("NewService")}
          />
          <QuickAction
            icon="search-outline"
            label="Find Customer"
            color={COLORS.warning}
            bg={COLORS.warningLight}
            onPress={() => navigation.navigate("Customers")}
          />
        </View>

        {/* ── Today's Schedule ── */}
        <View style={s.scheduleHeader}>
          <Text style={s.sectionTitle}>Today's Schedule</Text>
          {bookings.length > 0 && (
            <View style={s.scheduleCount}>
              <Text style={s.scheduleCountText}>
                {bookings.length} bookings
              </Text>
            </View>
          )}
        </View>

        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings today"
            message="Schedule a new appointment using the button above"
            icon="calendar-outline"
          />
        ) : (
          bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPress={() =>
                navigation.navigate("NewBooking", { bookingId: b.id })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 100 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  greeting: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary },
  name: {
    fontSize: FONT.sizes.xl,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  date: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.sm,
  },
  dateBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 48,
  },
  dateBadgeDay: { fontSize: FONT.sizes.xl, fontWeight: "800", color: "#fff" },
  dateBadgeMonth: {
    fontSize: FONT.sizes.xs,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },

  // Stats
  statsRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.sm },
  stat: { flex: 1 },

  // Section
  sectionTitle: {
    fontSize: FONT.sizes.md,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scheduleCount: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  scheduleCountText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Quick actions
  quickGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  quickAction: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    gap: SPACING.xs,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: FONT.sizes.xs,
    fontWeight: "700",
    textAlign: "center",
  },

  // Booking card
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
    gap: SPACING.sm,
  },
  timeBox: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: { fontSize: FONT.sizes.sm, fontWeight: "800", textAlign: "center" },
  bookingInfo: { flex: 1 },
  bookingTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: 2,
  },
  customerName: {
    fontSize: FONT.sizes.sm,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  mobileText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  vehicleText: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary },
  serviceText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: "capitalize",
  },
  vehicleWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  vehicleWarningText: { fontSize: 9, color: COLORS.warning, fontWeight: "700" },
  statusPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: { fontSize: FONT.sizes.xs, fontWeight: "700" },
});
