import React from 'react';
import AttendanceSection from '../../../AttendanceSection';
import CompanyGoalsSection from '../../../CompanyGoalsSection';
import DepartmentGoalsSection from '../../../DepartmentGoalsSection';
import ReportsSection from '../../../ReportsSection';
import MeetingsSection from '../../../MeetingsSection';
import DocumentsSection from '../../../DocumentsSection';
import TutorialsSection from '../../../TutorialsSection';
import TeamMembersSection from '../../../TeamMembersSection';
import ProfileSection from '../../../ProfileSection';
import EventSection from './EventSection';
import WorkSection from './WorkSection';

interface GDFDashboardProps {
  activeSection: string;
}

const GDFDashboard: React.FC<GDFDashboardProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      // taken from coo
      case 'profile':
        return <ProfileSection />;
      case 'events':
        return <EventSection />;
      case 'work':
        return <WorkSection />;
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

export default GDFDashboard;