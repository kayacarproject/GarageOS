import React, { useRef, useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../stores/authStore";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import {
  DrawerProvider,
  useDrawer,
  setDrawerNavRef,
} from "../components/CustomDrawer";
import { COLORS, FONT } from "../config/theme";
import { UserRole } from "../types";

// ─── Auth ─────────────────────────────────────────────────────────────────────
import { LoginScreen } from "../screens/auth/LoginScreen";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen";
import { RoleGuideScreen } from "../screens/auth/RoleGuideScreen";

// ─── Owner ────────────────────────────────────────────────────────────────────
import { OwnerDashboard } from "../screens/owner/OwnerDashboard";
import { ApprovalsScreen } from "../screens/owner/ApprovalsScreen";
import { RevenueScreen } from "../screens/owner/RevenueScreen";

// ─── Manager ──────────────────────────────────────────────────────────────────
import { ManagerDashboard } from "../screens/manager/ManagerDashboard";
import { ManagerJobsScreen } from "../screens/manager/ManagerJobsScreen";
import { AssignMechanicScreen } from "../screens/manager/AssignMechanicScreen";
import { MechanicListScreen } from "../screens/manager/MechanicListScreen";
import { AddMechanicScreen } from "../screens/manager/AddMechanicScreen";

// ─── Mechanic ─────────────────────────────────────────────────────────────────
import { MechanicDashboard } from "../screens/mechanic/MechanicDashboard";
import { MechanicJobsScreen } from "../screens/mechanic/MechanicJobsScreen";
import { JobWorkScreen } from "../screens/mechanic/JobWorkScreen";

// ─── Receptionist ─────────────────────────────────────────────────────────────
import { ReceptionistDashboard } from "../screens/receptionist/ReceptionistDashboard";
import { BookingScreen } from "../screens/receptionist/BookingScreen";
import { NewServiceScreen } from "../screens/receptionist/NewServiceScreen";

// ─── Shared ───────────────────────────────────────────────────────────────────
import { JobCardDetailScreen } from "../screens/shared/JobCardDetailScreen";
import { CustomerListScreen } from "../screens/shared/CustomerListScreen";
import { CustomerDetailScreen } from "../screens/shared/CustomerDetailScreen";
import { CustomerFormScreen } from "../screens/shared/CustomerFormScreen";
import { AddCustomerScreen } from "../screens/shared/AddCustomerScreen";
import { AddVehicleScreen } from "../screens/shared/AddVehicleScreen";
import { VehiclesListScreen } from "../screens/shared/VehiclesListScreen";
import { InvoiceScreen } from "../screens/shared/InvoiceScreen";
import { EstimateScreen } from "../screens/shared/EstimateScreen";
import { InspectionScreen } from "../screens/shared/InspectionScreen";
import { PaymentScreen } from "../screens/shared/PaymentScreen";
import { NewBookingScreen } from "../screens/shared/NewBookingScreen";
import { ProfileScreen } from "../screens/shared/ProfileScreen";
import { NotificationsScreen } from "../screens/shared/NotificationsScreen";

// ─── Navigator ────────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator();

// ─── Role mappings ────────────────────────────────────────────────────────────
const ROLE_DASHBOARD: Record<UserRole, React.ComponentType<any>> = {
  OWNER: OwnerDashboard,
  SUPER_ADMIN: OwnerDashboard,
  MANAGER: ManagerDashboard,
  MECHANIC: MechanicDashboard,
  RECEPTIONIST: ReceptionistDashboard,
};

const ROLE_JOBS: Record<UserRole, React.ComponentType<any>> = {
  OWNER: ManagerJobsScreen,
  SUPER_ADMIN: ManagerJobsScreen,
  MANAGER: ManagerJobsScreen,
  MECHANIC: MechanicJobsScreen,
  RECEPTIONIST: ManagerJobsScreen,
};

// ─── Shared header options ────────────────────────────────────────────────────
const headerOpts = {
  headerStyle: { backgroundColor: "#fff" as const },
  headerTitleStyle: {
    fontFamily: FONT.heading,
    color: COLORS.text,
    fontSize: FONT.sizes.md,
  } as any,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

// ─── Hamburger ────────────────────────────────────────────────────────────────
const Hamburger: React.FC = () => {
  const { toggleDrawer } = useDrawer();
  return (
    <TouchableOpacity
      onPress={toggleDrawer}
      style={s.hamburger}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="menu-outline" size={26} color={COLORS.text} />
    </TouchableOpacity>
  );
};

const drawerLeft = () => <Hamburger />;

// ─── Auth stack (login / forgot password / role guide) ───────────────────────
const AuthStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ ...headerOpts, headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ headerShown: true, title: "Forgot Password" }}
    />
    <Stack.Screen
      name="RoleGuide"
      component={RoleGuideScreen}
      options={{ headerShown: true, title: "Role Guide" }}
    />
  </Stack.Navigator>
);

// ─── Authenticated app (drawer + stack) ──────────────────────────────────────
const AuthenticatedApp: React.FC<{ role: UserRole; navRef: any }> = ({
  role,
  navRef,
}) => {
  const DashboardScreen = ROLE_DASHBOARD[role] ?? OwnerDashboard;
  const JobsScreen = ROLE_JOBS[role] ?? ManagerJobsScreen;
  const [activeScreen, setActiveScreen] = useState("Dashboard");

  React.useEffect(() => {
    setDrawerNavRef(navRef.current);
  }, [navRef]);

  const withDrawer = { ...headerOpts, headerLeft: drawerLeft };

  return (
    <DrawerProvider activeScreen={activeScreen}>
      <Stack.Navigator
        screenOptions={headerOpts}
        screenListeners={{
          state: (e: any) => {
            const routes = e.data?.state?.routes;
            if (routes?.length) {
              setActiveScreen(routes[routes.length - 1].name);
            }
          },
        }}
      >
        {/* ── Main screens (hamburger menu) ── */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Jobs"
          component={JobsScreen}
          options={{ ...withDrawer, title: "Jobs" }}
        />
        <Stack.Screen
          name="Customers"
          component={CustomerListScreen}
          options={{ ...withDrawer, title: "Customers" }}
        />
        <Stack.Screen
          name="Vehicles"
          component={VehiclesListScreen}
          options={{ ...withDrawer, title: "Vehicles" }}
        />
        <Stack.Screen
          name="Mechanics"
          component={MechanicListScreen}
          options={{ ...withDrawer, title: "Mechanics" }}
        />
        <Stack.Screen
          name="Bookings"
          component={BookingScreen}
          options={{ ...withDrawer, title: "Bookings" }}
        />
        <Stack.Screen
          name="Revenue"
          component={RevenueScreen}
          options={{ ...withDrawer, title: "Revenue" }}
        />
        <Stack.Screen
          name="Approvals"
          component={ApprovalsScreen}
          options={{ ...withDrawer, title: "Approvals" }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ ...withDrawer, title: "Notifications" }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ ...withDrawer, title: "Profile" }}
        />

        {/* ── Detail screens (back arrow) ── */}
        <Stack.Screen
          name="JobCardDetail"
          component={JobCardDetailScreen}
          options={{ title: "Job Card" }}
        />
        <Stack.Screen
          name="JobWork"
          component={JobWorkScreen}
          options={{ title: "Job Work" }}
        />
        <Stack.Screen
          name="CustomerDetail"
          component={CustomerDetailScreen}
          options={{ title: "Customer" }}
        />
        <Stack.Screen
          name="CustomerForm"
          component={CustomerFormScreen}
          options={{ title: "Edit Customer" }}
        />
        <Stack.Screen
          name="AddCustomer"
          component={AddCustomerScreen}
          options={{ title: "New Customer" }}
        />
        <Stack.Screen
          name="AddVehicle"
          component={AddVehicleScreen}
          options={{ title: "Add Vehicle" }}
        />
        <Stack.Screen
          name="Estimate"
          component={EstimateScreen}
          options={{ title: "Estimate" }}
        />
        <Stack.Screen
          name="Invoice"
          component={InvoiceScreen}
          options={{ title: "Invoice" }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: "Record Payment" }}
        />
        <Stack.Screen
          name="Inspection"
          component={InspectionScreen}
          options={{ title: "Inspection" }}
        />
        <Stack.Screen
          name="NewBooking"
          component={NewBookingScreen}
          options={{ title: "New Booking" }}
        />
        <Stack.Screen
          name="NewService"
          component={NewServiceScreen}
          options={{ title: "New Service" }}
        />
        <Stack.Screen
          name="AssignMechanic"
          component={AssignMechanicScreen}
          options={{ title: "Assign Mechanic" }}
        />
        <Stack.Screen
          name="AddMechanic"
          component={AddMechanicScreen}
          options={{ title: "Add Mechanic" }}
        />
        <Stack.Screen
          name="CreateJobCard"
          component={NewServiceScreen}
          options={{ title: "New Job Card" }}
        />
      </Stack.Navigator>
    </DrawerProvider>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const navRef = useRef<NavigationContainerRef<any>>(null);

  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  const role = (user?.role ?? "OWNER") as UserRole;

  return (
    <NavigationContainer ref={navRef}>
      {isAuthenticated && user ? (
        <AuthenticatedApp role={role} navRef={navRef} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

const s = StyleSheet.create({
  hamburger: { marginLeft: 12 },
});
