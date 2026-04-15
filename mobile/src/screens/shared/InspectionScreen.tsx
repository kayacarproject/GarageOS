import React, { useState } from 'react';
import { Alert } from 'react-native';
import { TrialChecklistTable } from '../../components/job/TrialChecklistTable';
import { jobCardService } from '../../services/jobCardService';
import { useJobCardStore } from '../../stores/jobCardStore';
import { canTransition } from '../../constants/jobCardLifecycle';
import type { CreateInspectionPayload, Inspection } from '../../types';

export const InspectionScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { jobCardId, type = 'pre', preInspection } = route.params ?? {};
  const [loading, setLoading] = useState(false);

  const { selected, fetchById, updateStatus } = useJobCardStore();

  const handleSubmit = async (payload: CreateInspectionPayload) => {
    setLoading(true);
    try {
      // Persist the inspection to the job card record
      await jobCardService.createInspection(jobCardId, payload);

      // Advance job status based on inspection type
      if (payload.type === 'pre') {
        // Pre-trial done → advance to inspection_done (if allowed)
        const currentStatus = (selected?.id === jobCardId ? selected?.status : null) ?? null;
        if (currentStatus && canTransition(currentStatus, 'inspection_done')) {
          await updateStatus(jobCardId, 'inspection_done');
        }
        // Refresh to pick up new inspections array
        await fetchById(jobCardId);

        Alert.alert(
          'Pre-Trial Saved',
          'Pre-trial inspection recorded. Job is ready for estimate.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        // Post-trial (QC) — check for failures
        const poorItems = (['engine', 'brakes', 'clutch', 'ac', 'battery', 'tyres', 'lights', 'steering'] as const)
          .filter(k => payload[k] === 'poor');

        // Advance job status
        const currentStatus = (selected?.id === jobCardId ? selected?.status : null) ?? null;

        if (poorItems.length > 0) {
          // QC has issues → qc_failed
          if (currentStatus && canTransition(currentStatus, 'qc_failed')) {
            await updateStatus(jobCardId, 'qc_failed');
          }
          await fetchById(jobCardId);
          Alert.alert(
            'QC Failed',
            `${poorItems.length} item(s) rated Poor: ${poorItems.join(', ')}.\n\nJob sent back for rework.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        } else {
          // All good → qc_passed
          if (currentStatus && canTransition(currentStatus, 'qc_passed')) {
            await updateStatus(jobCardId, 'qc_passed');
          }
          await fetchById(jobCardId);
          Alert.alert(
            'QC Passed ✓',
            'Post-trial inspection passed. Job is ready for invoicing.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrialChecklistTable
      jobCardId={jobCardId}
      mode={type === 'post' ? 'post-form' : 'pre-view'}
      preInspection={preInspection as Inspection | null ?? null}
      onSubmit={handleSubmit}
      submitLoading={loading}
    />
  );
};
