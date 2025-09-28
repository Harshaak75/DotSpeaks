import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../../../utils/api/Employees/api";
import ProfileSection from "../../ProfileSection";
import LeadManagementSection from "../LeadManagement";
import FollowUpDashboard from "./LeadDashboard";
import NewLeadsDashboard from "./TellecallerInfo";
import { selectAccessToken } from "../../../../../redux/slice/authSlice";
import { useEffect, useState } from "react";
import { supabase } from "../../../../../utils/supabase";
import Chatting from "../CharttingSystemBD";

interface TellecallerDashboardProps {
  activeSection: string;
}

export const TellecallerDashboard: React.FC<TellecallerDashboardProps> = ({
  activeSection,
}) => {
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  const [data, setdata] = useState<any[]>([]);

  useEffect(() => {
    // This function will only be called ONCE to get the initial data.
    const fetchData = async () => {
      try {
        // Make sure you have a valid accessToken before fetching
        if (!accessToken) return;
        const response = await api.TelleCaller.GetInfo.get(
          accessToken,
          dispatch
        );
        setdata(response);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();
    const channel = supabase.channel("lead-changes-channel");

    // 2. Listen for the 'broadcast' type and our specific 'leads_updated' event
    channel.on("broadcast", { event: "leads_updated" }, (payload) => {
      // 3. When the backend sends our custom message, we run fetchData()
      console.log(
        "✅ Frontend received 'leads_updated' broadcast from backend!",
        payload
      );
      fetchData(); // Now we fetch the fresh data
    });

    channel.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("Frontend subscribed to broadcast channel.");
      }
      if (status === "CHANNEL_ERROR") {
        console.error("Error subscribing to channel:", err);
      }
    });

    // Cleanup function remains the same
    return () => {
      console.log(
        "Component unmounting. Unsubscribing from broadcast channel."
      );
      supabase.removeChannel(channel);
    };
  }, [accessToken, dispatch]); // Dependency array remains correct

  const renderSection = () => {
    switch (activeSection) {
      // taken from coo
      case "profile":
        return <ProfileSection />;
      case "Dashboard":
        return <NewLeadsDashboard info={data} />;
            case "Chat":
              return <Chatting/>;
      case "Lead":
        return <FollowUpDashboard info={data} />;
      default:
        return <ProfileSection />;
    }
  };

  return <div className="max-w-7xl mx-auto">{renderSection()}</div>;
};
