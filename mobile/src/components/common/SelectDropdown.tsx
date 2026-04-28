import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SectionList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../../config/theme';

export interface DropdownSection {
  title: string;
  data: string[];
}

interface Props {
  label?: string;
  value: string;
  placeholder?: string;
  sections?: DropdownSection[];   // sectioned list (for brand with Popular/All)
  options?: string[];             // flat list (for model)
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onSelect: (value: string) => void;
  searchPlaceholder?: string;
}

export const SelectDropdown: React.FC<Props> = ({
  label,
  value,
  placeholder = 'Select…',
  sections,
  options,
  loading = false,
  disabled = false,
  error,
  leftIcon,
  onSelect,
  searchPlaceholder = 'Search…',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => searchRef.current?.focus(), 150);
    }
  }, [open]);

  const filteredSections = useMemo<DropdownSection[]>(() => {
    if (sections) {
      if (!query.trim()) return sections;
      const q = query.toLowerCase();
      return sections
        .map(sec => ({ title: sec.title, data: sec.data.filter(d => d.toLowerCase().includes(q)) }))
        .filter(sec => sec.data.length > 0);
    }
    if (options) {
      if (!query.trim()) return [{ title: '', data: options }];
      const q = query.toLowerCase();
      return [{ title: '', data: options.filter(o => o.toLowerCase().includes(q)) }];
    }
    return [];
  }, [sections, options, query]);

  const totalCount = filteredSections.reduce((n, s) => n + s.data.length, 0);

  const handleSelect = (item: string) => {
    onSelect(item);
    setOpen(false);
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[d.item, item === value && d.itemSelected]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={[d.itemText, item === value && d.itemTextSelected]}>{item}</Text>
      {item === value && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: DropdownSection }) =>
    section.title ? (
      <View style={d.sectionHeader}>
        <Text style={d.sectionTitle}>{section.title}</Text>
      </View>
    ) : null;

  return (
    <View style={d.container}>
      {label && <Text style={d.label}>{label}</Text>}

      {/* ── Trigger ── */}
      <TouchableOpacity
        style={[d.trigger, error ? d.triggerError : d.triggerNormal, disabled && d.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={disabled ? 1 : 0.75}
      >
        {leftIcon && <Ionicons name={leftIcon} size={18} color={COLORS.textMuted} style={d.leftIcon} />}
        <Text style={[d.triggerText, !value && d.triggerPlaceholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        {loading
          ? <ActivityIndicator size="small" color={COLORS.primary} style={d.rightIcon} />
          : <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} style={d.rightIcon} />
        }
      </TouchableOpacity>

      {error && <Text style={d.error}>{error}</Text>}

      {/* ── Modal ── */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity style={d.overlay} activeOpacity={1} onPress={() => setOpen(false)} />

        <KeyboardAvoidingView
          style={d.sheet}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Handle bar */}
          <View style={d.handle} />

          {/* Header */}
          <View style={d.sheetHeader}>
            <Text style={d.sheetTitle}>{label ?? 'Select'}</Text>
            <TouchableOpacity onPress={() => setOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={d.searchBox}>
            <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={d.searchIcon} />
            <TextInput
              ref={searchRef}
              style={d.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="done"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Count */}
          {query.trim().length > 0 && (
            <Text style={d.countText}>
              {totalCount === 0 ? `No results for "${query}"` : `${totalCount} result${totalCount !== 1 ? 's' : ''}`}
            </Text>
          )}

          {/* List */}
          {loading ? (
            <View style={d.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <SectionList
              sections={filteredSections}
              keyExtractor={(item, idx) => `${item}-${idx}`}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              stickySectionHeadersEnabled={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={d.listContent}
              ListEmptyComponent={
                <View style={d.emptyBox}>
                  <Ionicons name="search-outline" size={36} color={COLORS.border} />
                  <Text style={d.emptyText}>No options found</Text>
                </View>
              }
            />
          )}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const d = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label:     { fontSize: FONT.sizes.sm, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.xs },

  trigger:           { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1.5, backgroundColor: COLORS.surface, minHeight: 48 },
  triggerNormal:     { borderColor: COLORS.border },
  triggerError:      { borderColor: COLORS.error },
  triggerDisabled:   { opacity: 0.5 },
  triggerText:       { flex: 1, fontSize: FONT.sizes.md, color: COLORS.text, paddingVertical: SPACING.sm },
  triggerPlaceholder:{ color: COLORS.textMuted },
  leftIcon:          { marginLeft: SPACING.md },
  rightIcon:         { marginRight: SPACING.md },
  error:             { fontSize: FONT.sizes.xs, color: COLORS.error, marginTop: SPACING.xs },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },

  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '75%',
    ...SHADOW.md,
  },
  handle:       { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: SPACING.sm, marginBottom: SPACING.xs },
  sheetHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  sheetTitle:   { fontSize: FONT.sizes.md, fontWeight: '700', color: COLORS.text },

  searchBox:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.md, marginBottom: SPACING.sm, backgroundColor: COLORS.background, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingRight: SPACING.sm },
  searchIcon:  { marginLeft: SPACING.sm, marginRight: SPACING.xs },
  searchInput: { flex: 1, fontSize: FONT.sizes.sm, color: COLORS.text, paddingVertical: SPACING.sm },
  countText:   { fontSize: FONT.sizes.xs, color: COLORS.textMuted, paddingHorizontal: SPACING.md, marginBottom: SPACING.xs },

  sectionHeader: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xs, backgroundColor: COLORS.surface },
  sectionTitle:  { fontSize: FONT.sizes.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  item:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemSelected:     { backgroundColor: COLORS.primaryLight + '22' },
  itemText:         { fontSize: FONT.sizes.sm, color: COLORS.text },
  itemTextSelected: { color: COLORS.primary, fontWeight: '600' },

  listContent: { paddingBottom: SPACING.xxl },
  loadingBox:  { paddingVertical: SPACING.xl, alignItems: 'center' },
  emptyBox:    { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyText:   { fontSize: FONT.sizes.sm, color: COLORS.textMuted },
});
