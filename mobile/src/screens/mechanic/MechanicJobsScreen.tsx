import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { useJobCardStore } from "../../stores/jobCardStore";
import { JobCardListItem } from "../../components/job/JobCardListItem";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { COLORS, SPACING, FONT } from "../../config/theme";

export const MechanicJobsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { user } = useAuthStore();
  const { jobCards, fetchByMechanic, isLoading } = useJobCardStore();

  useEffect(() => {
    fetchByMechanic(user?.id ?? "u3");
  }, []);

  const myJobs = jobCards;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{myJobs.length} active</Text>
        </View>
      </View>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={myJobs}
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
              title="No jobs assigned"
              message="You have no active jobs right now"
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  title: { fontSize: FONT.sizes.xl, fontWeight: "700", color: COLORS.text },
  countBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  countText: {
    fontSize: FONT.sizes.xs,
    color: COLORS.primary,
    fontWeight: "600",
  },
  list: { padding: SPACING.md, paddingTop: 0 },
});
