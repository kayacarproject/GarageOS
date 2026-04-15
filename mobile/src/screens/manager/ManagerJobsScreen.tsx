import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useJobCardStore } from "../../stores/jobCardStore";
import { JobCardListItem } from "../../components/job/JobCardListItem";
import { SearchBar } from "../../components/common/SearchBar";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import type { JobCardStatus } from "../../types";
import { COLORS, SPACING, FONT, RADIUS } from "../../config/theme";

const FILTERS: { label: string; value: JobCardStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Created", value: "created" },
  { label: "In Progress", value: "in_progress" },
  { label: "Waiting Parts", value: "waiting_parts" },
  { label: "QC", value: "qc_pending" },
  { label: "Delivered", value: "delivered" },
];

export const ManagerJobsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { jobCards, fetchAll, isLoading } = useJobCardStore();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<JobCardStatus | "ALL">(
    "ALL",
  );

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = jobCards.filter((j) => {
    const matchFilter = activeFilter === "ALL" || j.status === activeFilter;
    const matchSearch =
      !search ||
      j.vehicle?.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (j.vehicle as any)?.registration_number
        ?.toLowerCase()
        .includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by customer or plate..."
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterChip,
              activeFilter === f.value && styles.filterActive,
            ]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <JobCardListItem
              jobCard={item}
              onPress={() =>
                navigation.navigate("JobCardDetail", { id: item.id })
              }
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="No jobs found"
              message="Try adjusting your filters"
              icon="construct-outline"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { padding: SPACING.md, paddingBottom: 0 },
  filters: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  filterChip: {
    // paddingHorizontal: SPACING.sm,
    // paddingVertical: 6,
    height:32,
    width: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT.sizes.xs,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterTextActive: { color: "#fff" },
  list: { padding: SPACING.md },
});
