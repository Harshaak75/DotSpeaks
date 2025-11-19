import ProfileSection from '../../../ProfileSection';
import ContentWriterCalender from './CalenderContentWriter';

interface ContentWriterDashboardProps {
  activeSection: string;
}

export const ContentWriterDashboard: React.FC<ContentWriterDashboardProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'calender':
        return <ContentWriterCalender />;
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
