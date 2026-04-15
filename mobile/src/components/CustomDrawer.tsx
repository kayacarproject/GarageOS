import React, { useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Animated, Modal,
  TouchableWithoutFeedback, Dimensions, Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { Avatar } from './common/Avatar';
import { COLORS, SPACING, FONT, RADIUS } from '../config/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 280;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_COLOR: Record<string, string> = {
  OWNER:        COLORS.primary,
  SUPER_ADMIN:  '#7C3AED',
  MANAGER:      '#7C3AED',
  MECHANIC:     COLORS.success,
  RECEPTIONIST: COLORS.warning,
};

// ─── Menu items ───────────────────────────────────────────────────────────────

interface MenuItem {
  label: string;
  screen: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  roles?: string[];
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard',     screen: 'Dashboard',     icon: 'grid-outline',             activeIcon: 'grid' },
  { label: 'Jobs',          screen: 'Jobs',           icon: 'construct-outline',        activeIcon: 'construct' },
  { label: 'Customers',     screen: 'Customers',      icon: 'people-outline',           activeIcon: 'people' },
  { label: 'Vehicles',      screen: 'Vehicles',       icon: 'car-outline',              activeIcon: 'car' },
  { label: 'Mechanics',     screen: 'Mechanics',      icon: 'people-circle-outline',    activeIcon: 'people-circle',    roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'] },
  { label: 'Bookings',      screen: 'Bookings',       icon: 'calendar-outline',         activeIcon: 'calendar',         roles: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'SUPER_ADMIN'] },
  { label: 'Revenue',       screen: 'Revenue',        icon: 'cash-outline',             activeIcon: 'cash',             roles: ['OWNER', 'SUPER_ADMIN'] },
  { label: 'Approvals',     screen: 'Approvals',      icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle', roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'] },
  { label: 'Notifications', screen: 'Notifications',  icon: 'notifications-outline',    activeIcon: 'notifications' },
  { label: 'Profile',       screen: 'Profile',        icon: 'person-outline',           activeIcon: 'person' },
];

// ─── Drawer context ───────────────────────────────────────────────────────────

interface DrawerContextValue {
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const DrawerContext = React.createContext<DrawerContextValue>({
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
});

export const useDrawer = () => React.useContext(DrawerContext);

// ─── Drawer Provider ──────────────────────────────────────────────────────────

// Navigation ref set by AppNavigator
let _navRef: any = null;
export const setDrawerNavRef = (ref: any) => { _navRef = ref; };

interface DrawerProviderProps {
  children: React.ReactNode;
  activeScreen: string;
}

export const DrawerProvider: React.FC<DrawerProviderProps> = ({
  children,
  activeScreen,
}) => {
  const navigation = _navRef;
  const { user, company, logout } = useAuthStore();
  const [visible, setVisible] = React.useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const roleColor = ROLE_COLOR[user?.role ?? ''] ?? COLORS.primary;

  const openDrawer = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, overlayOpacity]);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [translateX, overlayOpacity]);

  const toggleDrawer = useCallback(() => {
    if (visible) closeDrawer(); else openDrawer();
  }, [visible, openDrawer, closeDrawer]);

  const handleNavigate = (screen: string) => {
    closeDrawer();
    // Small delay so drawer closes before navigation
    setTimeout(() => navigation.navigate(screen), 50);
  };

  const handleLogout = () => {
    closeDrawer();
    setTimeout(() => {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]);
    }, 300);
  };

  const visibleItems = MENU_ITEMS.filter(
    item => !item.roles || (user?.role && item.roles.includes(user.role)),
  );

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, toggleDrawer }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeDrawer}
      >
        {/* Overlay */}
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View style={[s.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Drawer panel */}
        <Animated.View style={[s.drawer, { transform: [{ translateX }] }]}>

          {/* Profile header */}
          <View style={[s.header, { backgroundColor: roleColor }]}>
            <Avatar name={user?.name ?? 'User'} size={52} />
            <View style={s.headerInfo}>
              <Text style={s.headerName} numberOfLines={1}>{user?.name}</Text>
              <Text style={s.headerRole}>{user?.role}</Text>
              {company && (
                <Text style={s.headerCompany} numberOfLines={1}>{company.name}</Text>
              )}
            </View>
          </View>

          {/* Menu */}
          <ScrollView style={s.menu} showsVerticalScrollIndicator={false}>
            {visibleItems.map(item => {
              const isActive = activeScreen === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[s.menuItem, isActive && s.menuItemActive]}
                  onPress={() => handleNavigate(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={[s.menuIconBox, isActive && { backgroundColor: roleColor + '22' }]}>
                    <Ionicons
                      name={isActive ? item.activeIcon : item.icon}
                      size={20}
                      color={isActive ? roleColor : COLORS.textSecondary}
                    />
                  </View>
                  <Text style={[s.menuLabel, isActive && { color: roleColor, fontWeight: '700' }]}>
                    {item.label}
                  </Text>
                  {isActive && (
                    <View style={[s.activeBar, { backgroundColor: roleColor }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sign out */}
          <View style={s.footer}>
            <View style={s.footerDivider} />
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
              <Text style={s.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </Modal>
    </DrawerContext.Provider>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },

  // Header
  header:      { paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 16, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerInfo:  { flex: 1 },
  headerName:  { fontSize: FONT.sizes.md, fontWeight: '700', color: '#fff' },
  headerRole:  { fontSize: FONT.sizes.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: '600' },
  headerCompany: { fontSize: FONT.sizes.xs, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

  // Menu
  menu:          { flex: 1, paddingTop: SPACING.xs },
  menuItem:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: SPACING.lg, gap: SPACING.md, position: 'relative' },
  menuItemActive:{ backgroundColor: COLORS.background },
  menuIconBox:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel:     { fontSize: FONT.sizes.md, color: COLORS.textSecondary, flex: 1 },
  activeBar:     { position: 'absolute', right: 0, top: 8, bottom: 8, width: 3, borderRadius: 2 },

  // Footer
  footer:        { paddingBottom: Platform.OS === 'ios' ? 32 : SPACING.lg },
  footerDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  logoutBtn:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: 13, paddingHorizontal: SPACING.lg },
  logoutText:    { fontSize: FONT.sizes.md, color: COLORS.danger, fontWeight: '600' },
});
