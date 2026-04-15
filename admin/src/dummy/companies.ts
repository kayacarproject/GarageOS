import type { Company, CompanyUser, MonthlyDataPoint, Plan } from '../types';

export const dummyCompanies: Company[] = [
  {
    id: 'c1', name: 'Kumar Auto Works', email: 'kumar@autoworks.com', phone: '9876543210',
    address: '12 MG Road', city: 'Bangalore', state: 'Karnataka', gst: '29AABCU9603R1ZX',
    bankDetails: { accountName: 'Kumar Auto Works', accountNumber: '1234567890', ifsc: 'HDFC0001234', bank: 'HDFC Bank' },
    plan: 'Pro', status: 'Active', usersCount: 8, activeJobs: 12, totalJobCards: 340,
    totalVehicles: 210, totalRevenue: 482000, createdAt: '2024-01-10',
  },
  {
    id: 'c2', name: 'Sharma Motors', email: 'sharma@motors.com', phone: '9876543211',
    address: '45 Linking Road', city: 'Mumbai', state: 'Maharashtra', gst: '27AABCS1234R1ZX',
    plan: 'Starter', status: 'Active', usersCount: 3, activeJobs: 4, totalJobCards: 98,
    totalVehicles: 72, totalRevenue: 124000, createdAt: '2024-01-15',
  },
  {
    id: 'c3', name: 'Nair Garage', email: 'nair@garage.com', phone: '9876543212',
    address: '7 NH Bypass', city: 'Kochi', state: 'Kerala', gst: '32AABCN5678R1ZX',
    bankDetails: { accountName: 'Nair Garage', accountNumber: '9876543210', ifsc: 'SBI0001234', bank: 'SBI' },
    plan: 'Pro', status: 'Active', usersCount: 12, activeJobs: 18, totalJobCards: 520,
    totalVehicles: 380, totalRevenue: 760000, createdAt: '2024-02-01',
  },
  {
    id: 'c4', name: 'Singh Auto Care', email: 'singh@autocare.com', phone: '9876543213',
    address: '88 Sector 18', city: 'Noida', state: 'Uttar Pradesh', gst: '09AABCS9012R1ZX',
    bankDetails: { accountName: 'Singh Auto Care Pvt Ltd', accountNumber: '1122334455', ifsc: 'ICIC0001234', bank: 'ICICI Bank' },
    plan: 'Enterprise', status: 'Active', usersCount: 25, activeJobs: 34, totalJobCards: 1240,
    totalVehicles: 890, totalRevenue: 2100000, createdAt: '2024-02-10',
  },
  {
    id: 'c5', name: 'Reddy Service Center', email: 'reddy@service.com', phone: '9876543214',
    address: '23 Jubilee Hills', city: 'Hyderabad', state: 'Telangana',
    plan: 'Starter', status: 'Trial', usersCount: 4, activeJobs: 2, totalJobCards: 28,
    totalVehicles: 22, totalRevenue: 34000, createdAt: '2024-03-01',
  },
  {
    id: 'c6', name: 'Patel Auto Hub', email: 'patel@autohub.com', phone: '9876543215',
    address: '56 CG Road', city: 'Ahmedabad', state: 'Gujarat', gst: '24AABCP3456R1ZX',
    plan: 'Pro', status: 'Active', usersCount: 9, activeJobs: 11, totalJobCards: 290,
    totalVehicles: 195, totalRevenue: 390000, createdAt: '2024-03-05',
  },
  {
    id: 'c7', name: 'Mehta Motors', email: 'mehta@motors.com', phone: '9876543216',
    address: '11 Race Course Road', city: 'Vadodara', state: 'Gujarat',
    plan: 'Free', status: 'Active', usersCount: 2, activeJobs: 1, totalJobCards: 14,
    totalVehicles: 10, totalRevenue: 12000, createdAt: '2024-03-12',
  },
  {
    id: 'c8', name: 'Iyer Auto Clinic', email: 'iyer@autoclinic.com', phone: '9876543217',
    address: '34 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', gst: '33AABCI7890R1ZX',
    plan: 'Starter', status: 'Suspended', usersCount: 5, activeJobs: 0, totalJobCards: 145,
    totalVehicles: 98, totalRevenue: 178000, createdAt: '2024-01-20',
  },
];

export const dummyUsers: CompanyUser[] = [
  { id: 'u1',  companyId: 'c1', name: 'Rajesh Kumar',   mobile: '9811001001', email: 'owner@autoworks.com',   role: 'OWNER',        isActive: true,  createdAt: '2024-01-10' },
  { id: 'u2',  companyId: 'c1', name: 'Priya Sharma',   mobile: '9811001002', email: 'manager@autoworks.com', role: 'MANAGER',      isActive: true,  createdAt: '2024-01-10' },
  { id: 'u3',  companyId: 'c1', name: 'Suresh Kumar',   mobile: '9811001003',                                  role: 'MECHANIC',     isActive: true,  createdAt: '2024-01-11' },
  { id: 'u4',  companyId: 'c1', name: 'Anita Rao',      mobile: '9811001004',                                  role: 'RECEPTIONIST', isActive: true,  createdAt: '2024-01-11' },
  { id: 'u5',  companyId: 'c1', name: 'Deepak Verma',   mobile: '9811001005',                                  role: 'MECHANIC',     isActive: false, createdAt: '2024-02-01' },
  { id: 'u6',  companyId: 'c2', name: 'Vikram Sharma',  mobile: '9822001001', email: 'vikram@motors.com',     role: 'OWNER',        isActive: true,  createdAt: '2024-01-15' },
  { id: 'u7',  companyId: 'c2', name: 'Ritu Sharma',    mobile: '9822001002',                                  role: 'RECEPTIONIST', isActive: true,  createdAt: '2024-01-16' },
  { id: 'u8',  companyId: 'c3', name: 'Arun Nair',      mobile: '9833001001', email: 'arun@garage.com',       role: 'OWNER',        isActive: true,  createdAt: '2024-02-01' },
  { id: 'u9',  companyId: 'c4', name: 'Harpreet Singh', mobile: '9844001001', email: 'hp@autocare.com',       role: 'OWNER',        isActive: true,  createdAt: '2024-02-10' },
  { id: 'u10', companyId: 'c5', name: 'Venkat Reddy',   mobile: '9855001001', email: 'venkat@service.com',    role: 'OWNER',        isActive: true,  createdAt: '2024-03-01' },
];

export const monthlyData: MonthlyDataPoint[] = [
  { month: 'Oct', companies: 28, revenue: 142000, jobs: 820 },
  { month: 'Nov', companies: 33, revenue: 178000, jobs: 960 },
  { month: 'Dec', companies: 36, revenue: 195000, jobs: 1040 },
  { month: 'Jan', companies: 40, revenue: 218000, jobs: 1180 },
  { month: 'Feb', companies: 44, revenue: 234000, jobs: 1290 },
  { month: 'Mar', companies: 48, revenue: 258000, jobs: 1420 },
];

export const plans: Plan[] = [
  {
    id: 'Free', price: 0, priceLabel: 'Free forever', colorClass: 'gray', userLimit: 2, jobCardLimit: 50,
    features: [
      { label: '2 users', included: true },
      { label: '50 job cards/month', included: true },
      { label: 'Basic reports', included: true },
      { label: 'Estimates & Invoices', included: false },
      { label: 'WhatsApp notifications', included: false },
      { label: 'Multi-branch', included: false },
    ],
  },
  {
    id: 'Starter', price: 1499, priceLabel: '₹1,499/mo', colorClass: 'blue', userLimit: 5, jobCardLimit: 300,
    features: [
      { label: '5 users', included: true },
      { label: '300 job cards/month', included: true },
      { label: 'Estimates & Invoices', included: true },
      { label: 'Basic reports', included: true },
      { label: 'WhatsApp notifications', included: false },
      { label: 'Multi-branch', included: false },
    ],
  },
  {
    id: 'Pro', price: 4999, priceLabel: '₹4,999/mo', colorClass: 'violet', userLimit: 15, jobCardLimit: -1, highlight: true,
    features: [
      { label: '15 users', included: true },
      { label: 'Unlimited job cards', included: true },
      { label: 'Estimates & Invoices', included: true },
      { label: 'Advanced reports', included: true },
      { label: 'WhatsApp notifications', included: true },
      { label: 'Multi-branch', included: false },
    ],
  },
  {
    id: 'Enterprise', price: 12999, priceLabel: '₹12,999/mo', colorClass: 'amber', userLimit: -1, jobCardLimit: -1,
    features: [
      { label: 'Unlimited users', included: true },
      { label: 'Unlimited job cards', included: true },
      { label: 'Estimates & Invoices', included: true },
      { label: 'Advanced reports + export', included: true },
      { label: 'WhatsApp + SMS notifications', included: true },
      { label: 'Multi-branch', included: true },
    ],
  },
];
