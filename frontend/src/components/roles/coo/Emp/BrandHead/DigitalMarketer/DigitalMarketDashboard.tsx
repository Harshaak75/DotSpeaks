
import ProfileSection from '../../../ProfileSection';
// import EventSection from './EventSection'
import DepartmentGoalsSection from '../../../DepartmentGoalsSection';
import ReportsSection from '../../../ReportsSection';
import MeetingsSection from '../../../MeetingsSection';
import DocumentsSection from '../../../DocumentsSection';
import TutorialsSection from '../../../TutorialsSection';
import EventSection from "../GraphicDesigner/EventSection"
import DigitalWorkSection from './DigitalWorkSection';

interface DigitalMarketDashboardProps {
  activeSection: string;
}

export const DigitalMarketerDashboard: React.FC<DigitalMarketDashboardProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      // taken from coo
      case 'profile':
        return <ProfileSection />;
      case 'events':
        return <EventSection />;
      case 'work':
        return <DigitalWorkSection />;
      case 'department-goals':
        return <DepartmentGoalsSection />;
      case 'reports':
        return <ReportsSection />;
      case 'meetings':
        return <MeetingsSection />;
      case 'documents':
        return <DocumentsSection />;
      case 'tutorials':
        return <TutorialsSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {renderSection()}
    </div>
  );
};