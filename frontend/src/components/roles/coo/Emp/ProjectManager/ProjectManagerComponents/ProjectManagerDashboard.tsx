import CompanyGoalsSection from "../../../CompanyGoalsSection";
import DocumentsSection from "../../../DocumentsSection";
import MeetingsSection from "../../../MeetingsSection";
import ProfileSection from "../../../ProfileSection";
import ReportsSection from "../../../ReportsSection";
import TutorialsSection from "../../../TutorialsSection";
import ProjectManagerGoals from "./ProjectManagerGoal";
import ProjectManagerOverview from "./ProjectManagerOverview";

interface DigitalMarketDashboardProps {
  activeSection: string;
}

export const ProjectManagerDashboard: React.FC<DigitalMarketDashboardProps> = ({
  activeSection,
}) => {
  const renderSection = () => {
    switch (activeSection) {
      // taken from coo
      case "profile":
        return <ProfileSection />;
      case "BrandHead":
        return <ProjectManagerOverview />;
      case "company-goals":
        return <CompanyGoalsSection />;
      case "goal":
        return <ProjectManagerGoals />;
      case "reports":
        return <ReportsSection />;
      case "meetings":
        return <MeetingsSection />;
      case "documents":
        return <DocumentsSection />;
      case "tutorials":
        return <TutorialsSection />;
      default:
        return <ProfileSection />;
    }
  };

  return <div className="max-w-7xl mx-auto">{renderSection()}</div>;
};
