// import ProfileSection from "../../../ProfileSection";

import ProfileSection from "../coo/ProfileSection";
import ClientCalendarDashboard from "./CalenderClient";
import ClientBrankKit from "./ClientBrandKit";
import LegalDocumentsDashboard from "./ClientLegalDocuments";
import ClientNotificationDashboard from "./ClientNotification";
import ClientReportsDashboard from "./ClientReport";
import ClientSettingsDashboard from "./ClientSettings";
import AssignedTeamDashboard from "./ClientTeam";
import SocialAccountsDashboard from "./ManageAccount";
import ClientOffersDashboard from "./Offers";
import SubscriptionDashboard from "./SubscriptionAndBilling";

interface DigitalMarketDashboardProps {
  activeSection: string;
}

export const ClientDashboard: React.FC<DigitalMarketDashboardProps> = ({
  activeSection,
}) => {
  const renderSection = () => {
    switch (activeSection) {
      // taken from coo
      case "brandkit":
        return <ClientBrankKit />;
      case "accounts":
        return <SocialAccountsDashboard />;
      case "calender":
        return <ClientCalendarDashboard />;
      case "subscriptionandbilling":
        return <SubscriptionDashboard />;
      case "offers":
        return <ClientOffersDashboard />;
      case "report":
        return <ClientReportsDashboard />;
      case "notification":
        return <ClientNotificationDashboard />;
      case "team":
        return <AssignedTeamDashboard />;
      case "legaldocument":
        return <LegalDocumentsDashboard />;
      case "settings":
        return <ClientSettingsDashboard />;
      default:
        return <ClientBrankKit />;
    }
  };

  return <div className="max-w-7xl mx-auto">{renderSection()}</div>;
};
