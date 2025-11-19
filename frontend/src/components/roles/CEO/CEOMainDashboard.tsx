// import ProfileSection from "../../../ProfileSection";

import ProfileSection from "../coo/ProfileSection";
import CEOYearlyTargetDashboard from "./CEOYearlyTargetDashboard";
import ExecutiveDashboard from "./Performace";
// import PerformanceDashboard from "./Performace";
import CEOProfitAndLoss from "./profitAndLoss";
import TargetVsAchive from "./TargetVsAchive";

interface CEOMainDashboardProps {
  activeSection: string;
}

export const CEOMainDashboard: React.FC<CEOMainDashboardProps> = ({
  activeSection,
}) => {
  const renderSection = () => {
    switch (activeSection) {
      // taken from coo
      case "profile":
        return <ProfileSection />;
      case "target":
        return <CEOYearlyTargetDashboard />;
      case "profitLoss":
        return <CEOProfitAndLoss/>
      case "TargetVsAchive":
        return <TargetVsAchive/>
      case"performace":
        return <ExecutiveDashboard/>
    }
  };

  return <div className="max-w-7xl mx-auto">{renderSection()}</div>;
};
