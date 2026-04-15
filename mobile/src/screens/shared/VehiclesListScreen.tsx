import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { SearchBar } from "../../components/common/SearchBar";
import { EmptyState } from "../../components/common/EmptyState";
import { dummyVehicles } from "../../dummy/vehicles";
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from "../../config/theme";
import type { Vehicle } from "../../types";

const FUEL_FILTERS = ["All", "Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

const FUEL_COLOR: Record<string, string> = {
  petrol: "#3B82F6",
  diesel: "#F59E0B",
  cng: "#10B981",
  electric: "#8B5CF6",
  hybrid: "#EC4899",
};

export const VehiclesListScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [fuelFilter, setFuelFilter] = useState("All");

  useFocusEffect(
    useCallback(() => {
      setVehicles([...dummyVehicles]);
    }, []),
  );

  const filtered = vehicles.filter((v) => {
    const matchFuel =
      fuelFilter === "All" ||
      v.fuel_type?.toLowerCase() === fuelFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      v.registration_number?.toLowerCase().includes(q) ||
      v.brand?.toLowerCase().includes(q) ||
      v.model?.toLowerCase().includes(q) ||
      v.customer?.name?.toLowerCase().includes(q);
    return matchFuel && matchSearch;
  });

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by plate, brand, customer..."
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
            <Text style={[s.chipText, fuelFilter === f && s.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(v) => v.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <EmptyState
            title="No vehicles found"
            message="Try adjusting your search"
            icon="car-outline"
          />
        }
        renderItem={({ item: v }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("CustomerDetail", {
                id: v.customer_id ?? v.customerId,
              })
            }
          >
            <View style={s.iconBox}>
              <Ionicons name="car" size={22} color={COLORS.primary} />
            </View>
            <View style={s.info}>
              <View style={s.row}>
                <Text style={s.name}>
                  {v.brand} {v.model}
                </Text>
                <View
                  style={[
                    s.fuelBadge,
                    { backgroundColor: FUEL_COLOR[v.fuel_type ?? ""] + "20" },
                  ]}
                >
                  <Text
                    style={[
                      s.fuelText,
                      {
                        color:
                          FUEL_COLOR[v.fuel_type ?? ""] ?? COLORS.textMuted,
                      },
                    ]}
                  >
                    {v.fuel_type?.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={s.plate}>{v.registration_number}</Text>
              <View style={s.row}>
                <Text style={s.meta}>
                  {v.year ?? "—"} · {v.color ?? "—"}
                </Text>
                <Text style={s.meta}>
                  {v.current_kms?.toLocaleString("en-IN")} km
                </Text>
              </View>
              {v.customer?.name && (
                <View style={s.customerRow}>
                  <Ionicons
                    name="person-outline"
                    size={11}
                    color={COLORS.textMuted}
                  />
                  <Text style={s.customerName}>{v.customer.name}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate("AddVehicle", {})}
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
  filters: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  chip: {
    // paddingHorizontal: SPACING.sm,
    // paddingVertical: 6,
    height: 32,
    width: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: {
    fontSize: FONT.sizes.xs,
    fontWeight: "600",
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  chipTextActive: { color: "#fff" },
  list: { padding: SPACING.md, paddingBottom: 100 },
  card: {
    flexDirection: "row",
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
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: FONT.sizes.md, fontWeight: "700", color: COLORS.text },
  plate: {
    fontSize: FONT.sizes.sm,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 2,
  },
  meta: { fontSize: FONT.sizes.xs, color: COLORS.textSecondary, marginTop: 3 },
  fuelBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  fuelText: { fontSize: 10, fontWeight: "700" },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  customerName: { fontSize: FONT.sizes.xs, color: COLORS.textMuted },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.lg,
  },
});
