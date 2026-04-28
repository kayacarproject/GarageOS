import React from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  StyleSheet, Pressable, Image, ScrollView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { showToast } from '../../utils/toast';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

export interface PickedImage {
  uri: string;
  fileName?: string;
  type?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  images: PickedImage[];
  onImagesChange: (images: PickedImage[]) => void;
  maxImages?: number;
  title?: string;
}

// ─── Permission helpers ───────────────────────────────────────────────────────

async function ensureGalleryPermission(): Promise<boolean> {
  const { status, canAskAgain } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === 'granted') return true;
  if (!canAskAgain) {
    showToast('Gallery access is permanently denied. Enable it in Settings.', 'error');
    Linking.openSettings();
  } else {
    showToast('Gallery permission is required to pick photos.', 'error');
  }
  return false;
}

async function ensureCameraPermission(): Promise<boolean> {
  const { status, canAskAgain } =
    await ImagePicker.requestCameraPermissionsAsync();
  if (status === 'granted') return true;
  if (!canAskAgain) {
    showToast('Camera access is permanently denied. Enable it in Settings.', 'error');
    Linking.openSettings();
  } else {
    showToast('Camera permission is required to take photos.', 'error');
  }
  return false;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ImagePickerModal: React.FC<Props> = ({
  visible,
  onClose,
  images,
  onImagesChange,
  maxImages = 10,
  title = 'Add Photos',
}) => {
  const remaining = maxImages - images.length;

  const pickFromGallery = async () => {
    try {
      const ok = await ensureGalleryPermission();
      if (!ok) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: remaining,
        exif: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const picked: PickedImage[] = result.assets.map(a => ({
        uri: a.uri,
        fileName: a.fileName ?? undefined,
        type: a.mimeType ?? 'image/jpeg',
      }));
      onImagesChange([...images, ...picked].slice(0, maxImages));
    } catch {
      showToast('Failed to open gallery. Please try again.', 'error');
    }
  };

  const pickFromCamera = async () => {
    try {
      const ok = await ensureCameraPermission();
      if (!ok) return;

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
        exif: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      onImagesChange(
        [...images, { uri: asset.uri, fileName: asset.fileName ?? undefined, type: asset.mimeType ?? 'image/jpeg' }]
          .slice(0, maxImages),
      );
    } catch {
      showToast('Failed to open camera. Please try again.', 'error');
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose} />
      <View style={s.sheet}>
        {/* Handle */}
        <View style={s.handle} />

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Source buttons */}
        <View style={s.optionsRow}>
          <TouchableOpacity
            style={[s.optionBtn, remaining === 0 && s.optionBtnDisabled]}
            onPress={pickFromCamera}
            activeOpacity={0.8}
            disabled={remaining === 0}
          >
            <View style={[s.optionIcon, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="camera-outline" size={26} color={remaining === 0 ? COLORS.textMuted : COLORS.primary} />
            </View>
            <Text style={[s.optionLabel, remaining === 0 && s.optionLabelDisabled]}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.optionBtn, remaining === 0 && s.optionBtnDisabled]}
            onPress={pickFromGallery}
            activeOpacity={0.8}
            disabled={remaining === 0}
          >
            <View style={[s.optionIcon, { backgroundColor: COLORS.successLight }]}>
              <Ionicons name="images-outline" size={26} color={remaining === 0 ? COLORS.textMuted : COLORS.success} />
            </View>
            <Text style={[s.optionLabel, remaining === 0 && s.optionLabelDisabled]}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Counter */}
        <Text style={s.counter}>
          {images.length} / {maxImages} photos
          {remaining === 0 ? '  · Limit reached' : ''}
        </Text>

        {/* Preview grid with remove buttons */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.previewRow}
          >
            {images.map((img, idx) => (
              <View key={idx} style={s.previewWrap}>
                <Image source={{ uri: img.uri }} style={s.previewImg} />
                <TouchableOpacity
                  style={s.removeBtn}
                  onPress={() => removeImage(idx)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Done */}
        <TouchableOpacity style={s.doneBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={s.doneBtnText}>
            {images.length > 0 ? `Done  (${images.length} selected)` : 'Done'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay:             { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:               { backgroundColor: '#fff', borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.md, paddingBottom: 36, ...SHADOW.lg },
  handle:              { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.md },
  header:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  title:               { fontSize: FONT.sizes.lg, fontWeight: '700', color: COLORS.text },
  optionsRow:          { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  optionBtn:           { flex: 1, alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, gap: SPACING.sm, ...SHADOW.sm },
  optionBtnDisabled:   { opacity: 0.45 },
  optionIcon:          { width: 56, height: 56, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  optionLabel:         { fontSize: FONT.sizes.sm, fontWeight: '600', color: COLORS.text },
  optionLabelDisabled: { color: COLORS.textMuted },
  counter:             { fontSize: FONT.sizes.xs, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.sm },
  previewRow:          { paddingVertical: SPACING.sm, gap: SPACING.sm, paddingHorizontal: 2 },
  previewWrap:         { position: 'relative' },
  previewImg:          { width: 80, height: 80, borderRadius: RADIUS.md, backgroundColor: COLORS.border },
  removeBtn:           { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 11 },
  doneBtn:             { marginTop: SPACING.md, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  doneBtnText:         { fontSize: FONT.sizes.md, fontWeight: '700', color: '#fff' },
});
