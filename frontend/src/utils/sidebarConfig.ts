import {
  User,
  Building2,
  Target,
  Calendar,
  FileText,
  GraduationCap,
  Users,
  BarChart3,
  Search,
  Package,
  LayoutDashboard,
  Palette,
  AtSign,
  CreditCard,
  Gift,
  BarChart2,
  Bell,
  FileLock2,
  Settings,
  TrendingUp,
  UserPlus,
  MessageCircle,
} from "lucide-react";

export const getSidebarItems = (role: string) => {
  switch (role.toUpperCase()) {
    case "CEO":
      return [{ id: "profile", label: "Profile", icon: User },
        {id:"target", label: "Targets", icon:Target},
        {id:"profitLoss", label: "Profit & Loss", icon:Target},
        { id: "TargetVsAchive", label: "Target VS Achive", icon: UserPlus },
        { id: "performace", label: "Performace", icon: UserPlus }
      ];
    case "CMO":
      return [{ id: "profile", label: "Profile", icon: User },
        { id: "company-goals", label: "Company Goals", icon: Building2 },
        { id: "LeadSetter", label: "Lead Target Setter", icon: UserPlus }
        ,{ id: "UploadLeads", label: "Upload Leads", icon: UserPlus },
        
      ];
    case "COO":
      return [
        { id: "profile", label: "Profile", icon: User },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "attendance", label: "HR Attendance", icon: Calendar },
        { id: "company-goals", label: "Company Goals", icon: Building2 },
        { id: "department-goals", label: "Department Goals", icon: Target },
        { id: "reports", label: "Reports", icon: BarChart3 },
        { id: "meetings", label: "Meetings", icon: Calendar },
        { id: "documents", label: "Legal Documents", icon: FileText },
        { id: "tutorials", label: "Tutorials", icon: GraduationCap },
        { id: "team", label: "Team Members", icon: Users },
      ];

    case "HR":
      return [
        { id: "profile", label: "Profile", icon: User },
        { id: "employees", label: "Manage Employees", icon: Users },
        { id: "attendance", label: "Attendance Logs", icon: Calendar },
        { id: "recruitment", label: "Recruitment", icon: Target },
      ];

    case "CONTENT_WRITER":
      return [
        { id: "profile", label: "Profile", icon: User },
        { id: "calender", label: "Calender", icon: Calendar },
      ];
    case "GFX_DESIGNER":
      return [
        { id: "profile", label: "Profile", icon: User },
        { id: "events", label: "Events", icon: Calendar },
        { id: "work", label: "Work", icon: Calendar },
        { id: "reports", label: "Reports", icon: BarChart3 },
        { id: "meetings", label: "Meetings", icon: Calendar },
        { id: "documents", label: "Legal Documents", icon: FileText },
        { id: "tutorials", label: "Tutorials", icon: GraduationCap },
      ];

    case "DIGITAL_MARKETER":
      return [
        { id: "profile", label: "Profile", icon: User },
        { id: "events", label: "Events", icon: Calendar },
        { id: "work", label: "My Task", icon: Calendar },
        { id: "reports", label: "Reports", icon: BarChart3 },
        { id: "meetings", label: "Meetings", icon: Calendar },
        { id: "documents", label: "Legal Documents", icon: FileText },
        { id: "tutorials", label: "Tutorials", icon: GraduationCap },
      ];
    case "BRAND_HEAD":
      return [
        { id: "profile", label: "Profile", icon: User },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "BrandResearch", label: "Brand Research", icon: Search },
        { id: "calender", label: "Calender", icon: Search },
        { id: "TeamAssign", label: "Team Assign", icon: Users },
        { id: "goal", label: "Department Goal", icon: Target },
        { id: "ClientAccount", label: "Build Client Account", icon: Building2 },
        {
          id: "TargetAndGoals",
          label: "Client Target and Goals",
          icon: Target,
        },
        { id: "ClientDelivery", label: "Work Delivery", icon: Package },
        { id: "Report", label: "Report", icon: FileText },
      ];
    case "PROJECT_MANAGER":
      return [
        { id: "profile", label: "Profile", icon: User },
        { id: "BrandHead", label: "Dashboard", icon: LayoutDashboard },
        { id: "company-goals", label: "Company Goals", icon: Building2 },
        { id: "goal", label: "Department Goals", icon: Target },
        { id: "reports", label: "Reports", icon: BarChart3 },
        { id: "meetings", label: "Meetings", icon: Calendar },
        { id: "documents", label: "Legal Documents", icon: FileText },
        { id: "tutorials", label: "Tutorials", icon: GraduationCap },
      ];
    case "CLIENT":
      return [
        { id: "brandkit", label: "Brand Kit", icon: Palette },
        { id: "accounts", label: "Manage Accounts", icon: AtSign },
        { id: "calender", label: "Calender", icon: AtSign },
        {
          id: "subscriptionandbilling",
          label: "Subscription & Billing",
          icon: CreditCard,
        },
        { id: "offers", label: "Offers", icon: Gift },
        { id: "report", label: "Report", icon: BarChart2 },
        { id: "notification", label: "Notification", icon: Bell },
        { id: "team", label: "Team", icon: Users },
        { id: "legaldocument", label: "Legal Document", icon: FileLock2 },
        { id: "settings", label: "Settings", icon: Settings },
      ];
    case "BRAND_DEVELOPER":
      return [
        { id: "profile", label: "Profile", icon: User },
        { id: "callRecordAndStats", label: "Dashboard", icon: LayoutDashboard },
        { id: "Calendar", label: "Calendar", icon: Calendar },
        { id: "Chat", label: "Chat", icon: MessageCircle },
        { id: "lead_management", label: "Clients", icon: TrendingUp },
      ];

    case "TELLECALLER":
      return [
        { id: "profile", label: "Profile", icon: User },
        { id: "Dashboard", label: "Dashboard", icon: User },
        { id: "Chat", label: "Chat", icon: MessageCircle },
        { id: "Lead", label: "New Leads", icon: User },
      ];

    default:
      return [];
  }
};
