// import ProfileSection from "../../../ProfileSection";

import ProfileSection from "../coo/ProfileSection";
import CompanyGoalCMO from "./CompanyGoalCMO";
import CMOLeadTargetCalculator from "./LeadTargetSetter";
import CMOLeadDataUploader from "./UploadLeads";

interface CMOMainDashboardProps {
  activeSection: string;
}

export const CMOMainDashboard: React.FC<CMOMainDashboardProps> = ({
  activeSection,
}) => {
  const renderSection = () => {
    switch (activeSection) {
      // taken from coo
      case "profile":
        return <ProfileSection />;
      case "company-goals":
        return <CompanyGoalCMO />;
      case "LeadSetter":
        return <CMOLeadTargetCalculator />;
      case "UploadLeads":
        return <CMOLeadDataUploader/>
    }
  };

  return <div className="max-w-7xl mx-auto">{renderSection()}</div>;
};
