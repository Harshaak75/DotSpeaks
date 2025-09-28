import ClientDeliverySection from "../../../ClientDeliverySection";
import ProfileSection from "../../../ProfileSection";
import CalendarSyncDashboard from "./BrandHeadCalender";
import BrandHeadGoals from "./BrandHeadGoal";
import BrandheadOverview from "./BrandheadOverview";
import BrandResearchSection from "./BrandResearchSection";
import BuildClientAccount from "./BuildClientAccount";
import ClientGoalsSection from "./ClientGoalsSection";
import ReportsSection from "./ReportsSection";
import TeamAssignSection from "./TeamAssignSection";

interface DigitalMarketDashboardProps {
  activeSection: string;
}

export const BrandHeadDashboard: React.FC<DigitalMarketDashboardProps> = ({
  activeSection,
}) => {
  const renderSection = () => {
    switch (activeSection) {
      // taken from coo
      case "profile":
        return <ProfileSection />;
      case "dashboard":
        return <BrandheadOverview />;
      case "BrandResearch":
        return <BrandResearchSection />;
      case "calender":
        return <CalendarSyncDashboard/>
      case "TeamAssign":
        return <TeamAssignSection />;
      case "goal":
        return <BrandHeadGoals />;
      case "ClientAccount":
        return <BuildClientAccount />;
      case "TargetAndGoals":
        return <ClientGoalsSection />;
      case "ClientDelivery":
        return <ClientDeliverySection />;
      case "Report":
        return <ReportsSection />;
      default:
        return <ProfileSection />;
    }
  };

  return <div className="max-w-7xl mx-auto">{renderSection()}</div>;
};
