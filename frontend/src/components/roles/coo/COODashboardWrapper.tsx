import React from 'react';
import ProfileSection from './ProfileSection';
import AttendanceSection from './AttendanceSection';
import CompanyGoalsSection from './CompanyGoalsSection';
import DepartmentGoalsSection from './DepartmentGoalsSection';
import ReportsSection from './ReportsSection';
import MeetingsSection from './MeetingsSection';
import DocumentsSection from './DocumentsSection';
import TutorialsSection from './TutorialsSection';
import TeamMembersSection from './TeamMembersSection';
import CooDashboardReview from './COOdashboardReview';

interface COODashboardProps {
  activeSection: string;
}

const COODashboard: React.FC<COODashboardProps> = ({ activeSection }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'dashboard':
        return <CooDashboardReview />;
      case 'attendance':
        return <AttendanceSection />;
      case 'company-goals':
        return <CompanyGoalsSection />;
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
      case 'team':
        return <TeamMembersSection />;
      default:
        return <CooDashboardReview />;
    }
  };

  return <div>{renderSection()}</div>;
};

export default COODashboard;
