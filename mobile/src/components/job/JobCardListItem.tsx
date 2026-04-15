import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { JobCard, Priority } from "../../types";
import { JobStatusBadge } from "./JobStatusBadge";
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from "../../config/theme";

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_BAR: Record<Priority, string> = {
  LOW: COLORS.textMuted,
  NORMAL: COLORS.border,
  HIGH: COLORS.warning,
  URGENT: COLORS.danger,
};

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  jobCard: JobCard;
  onPress: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const JobCardListItem: React.FC<Props> = ({ jobCard, onPress }) => {
  const priority = jobCard.priority ?? "NORMAL";
  const accentColor = PRIORITY_BAR[priority];
  const vehicle = jobCard.vehicle;
  const brand = (vehicle as any)?.brand ?? (vehicle as any)?.make ?? "";
  const plate =
    vehicle?.registration_number ?? (vehicle as any)?.licensePlate ?? "";
  const customer = vehicle?.customer?.name ?? "—";
  const mechanic = jobCard.mechanic?.name;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header: vehicle + job number */}
      <View style={styles.header}>
        <View style={styles.vehicleBlock}>
          <Text style={styles.vehicle} numberOfLines={1}>
            {brand} {vehicle?.model}
          </Text>
          <Text style={styles.plate}>{plate}</Text>
        </View>
        <View style={styles.jobNumChip}>
          <Text style={styles.jobNum}>{jobCard.job_number}</Text>
        </View>
      </View>

      {/* Customer row */}
      <View style={styles.row}>
        <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
        <Text style={styles.customer} numberOfLines={1}>
          {customer}
        </Text>
        {jobCard.current_kms > 0 && (
          <>
            <View style={styles.dot} />
            <Ionicons
              name="speedometer-outline"
              size={12}
              color={COLORS.textMuted}
            />
            <Text style={styles.kms}>
              {jobCard.current_kms.toLocaleString("en-IN")} km
            </Text>
          </>
        )}
      </View>

      {/* Description */}
      {!!jobCard.description && (
        <Text style={styles.description} numberOfLines={1}>
          {jobCard.description}
        </Text>
      )}

      {/* Footer: status + mechanic + priority */}
      <View style={styles.footer}>
        <JobStatusBadge status={jobCard.status} />
        <View style={styles.footerRight}>
          {mechanic && (
            <View style={styles.row}>
              <Ionicons
                name="construct-outline"
                size={11}
                color={COLORS.textMuted}
              />
              <Text style={styles.mechanic} numberOfLines={1}>
                {mechanic}
              </Text>
            </View>
          )}
          {priority !== "NORMAL" && (
            <View
              style={[
                styles.priorityPill,
                { backgroundColor: accentColor + "20" },
              ]}
            >
              <Text style={[styles.priorityText, { color: accentColor }]}>
                {PRIORITY_LABEL[priority]}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    ...SHADOW.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  vehicleBlock: { flex: 1, marginRight: SPACING.sm },
  vehicle: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.semibold,
    color: COLORS.text,
  },
  plate: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  jobNumChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  jobNum: {
    fontSize: FONT.sizes.xs,
    fontWeight: FONT.weights.bold,
    color: COLORS.primary,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: COLORS.border },
  customer: { fontSize: FONT.sizes.sm, color: COLORS.textSecondary, flex: 1 },
  kms: { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  description: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  footerRight: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  mechanic: { fontSize: FONT.sizes.xs, color: COLORS.textMuted, maxWidth: 100 },
  priorityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  priorityText: { fontSize: 10, fontWeight: FONT.weights.bold },
});
