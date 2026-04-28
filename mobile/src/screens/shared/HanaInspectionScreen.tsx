import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TrialChecklistTable } from '../../components/job/TrialChecklistTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { jobcardApi, HanaJobCard, HanaInspectionData } from '../../api/jobcardApi';
import { useAuthStore } from '../../stores/authStore';
import { showToast } from '../../utils/toast';
import type { CreateInspectionPayload, Inspection, InspectionRating } from '../../types';

// ─── Helper: shape HanaInspectionData → Inspection for TrialChecklistTable ───

function toInspectionShape(data: HanaInspectionData): Inspection {
  return {
    id:             'pre',
    job_card_id:    '',
    type:           'pre',
    engine:         (data.engine  as InspectionRating) ?? 'good',
    brakes:         (data.brakes  as InspectionRating) ?? 'good',
    clutch:         (data.clutch  as InspectionRating) ?? 'good',
    ac:             (data.ac      as InspectionRating) ?? 'good',
    battery:        (data.battery as InspectionRating) ?? 'good',
    tyres:          (data.tyres   as InspectionRating) ?? 'good',
    lights:         (data.lights  as InspectionRating) ?? 'good',
    steering:       (data.steering as InspectionRating) ?? 'good',
    notes:          data.notes,
    road_test_done: data.road_test_done ?? false,
    inspected_by:   data.checkedBy ?? '',
    created_at:     data.checkedAt ?? new Date().toISOString(),
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const HanaInspectionScreen: React.FC<{ route: any; navigation: any }> = ({
  route, navigation,
}) => {
  const { jobCardId, type = 'pre' } = route.params ?? {};
  const { user } = useAuthStore();

  const [jobCard,    setJobCard]   = useState<HanaJobCard | null>(null);
  const [loading,    setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const card = await jobcardApi.getById(jobCardId);
      setJobCard(card);
    } catch (e: any) {
      showToast(e.message ?? 'Failed to load job card', 'error');
    } finally {
      setLoading(false);
    }
  }, [jobCardId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // ── Submit handler — maps TrialChecklistTable payload → HanaInspectionData ──
  const handleSubmit = async (payload: CreateInspectionPayload) => {
    setSubmitting(true);
    try {
      const inspectionData: HanaInspectionData = {
        completed:      true,
        checkedAt:      new Date().toISOString(),
        checkedBy:      (user as any)?._id ?? user?.id ?? '',
        notes:          payload.notes,
        engine:         payload.engine,
        brakes:         payload.brakes,
        clutch:         payload.clutch,
        ac:             payload.ac,
        battery:        payload.battery,
        tyres:          payload.tyres,
        lights:         payload.lights,
        steering:       payload.steering,
        road_test_done: payload.road_test_done,
      };

      const inspType = type === 'post' ? 'postTrial' : 'preTrial';
      await jobcardApi.updateInspection(jobCardId, inspType, inspectionData);

      if (type === 'pre') {
        Alert.alert(
          'Pre-Trial Saved',
          'Vehicle condition recorded before work begins.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        const poorItems = (
          ['engine', 'brakes', 'clutch', 'ac', 'battery', 'tyres', 'lights', 'steering'] as const
        ).filter(k => payload[k] === 'poor');

        if (poorItems.length > 0) {
          Alert.alert(
            'QC Failed',
            `${poorItems.length} item(s) rated Poor: ${poorItems.join(', ')}.\n\nJob flagged for rework.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        } else {
          Alert.alert(
            'QC Passed ✓',
            'Post-trial inspection passed. Job is ready for invoicing.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        }
      }
    } catch (e: any) {
      showToast(e.message ?? 'Failed to save inspection', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  // Shape pre-trial data for the table (needed in post-form mode to show pre column)
  const preTrialShape = jobCard?.inspections?.preTrial
    ? toInspectionShape(jobCard.inspections.preTrial)
    : null;

  return (
    <TrialChecklistTable
      jobCardId={jobCardId}
      mode={type === 'post' ? 'post-form' : 'pre-view'}
      preInspection={preTrialShape}
      onSubmit={handleSubmit}
      submitLoading={submitting}
    />
  );
};
