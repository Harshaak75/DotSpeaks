import { useCallback, useEffect, useState } from "react";
import ProfileSection from "../ProfileSection";
import CallRecordsDashboard from "./CallRecordAndStats";
import LeadManagementSection from "./LeadManagement";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../../redux/slice/authSlice";
import { api } from "../../../../utils/api/Employees/api";
import { supabase } from "../../../../utils/supabase";
import CalendarSyncDashboardBD from "./CalenderBD";
import Chatting from "./CharttingSystemBD";

interface BrandDeveloperDashboardProps {
  activeSection: string;
}

export const BrandDeveloperDashboard: React.FC<
  BrandDeveloperDashboardProps
> = ({ activeSection }) => {
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  const [data, setdata] = useState<any[]>([]);

  const getData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await api.brandDeveloper.getInfo.get(
        accessToken,
        dispatch
      );
      console.log("Fetched new data:", response.data);
      setdata(response.data);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    getData();

    const channel = supabase.channel("BD-changes-channel");

    const broadcastCallback = (payload: any) => {
      console.log("Broadcast received! Refetching data...", payload);
      getData();
    };

    channel
      .on("broadcast", { event: "new_lead" }, broadcastCallback)
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Frontend subscribed to broadcast channel.");
        }
        if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to channel:", err);
        }
      });

    return () => {
      console.log("Unsubscribing from broadcast channel.");
      supabase.removeChannel(channel);
    };
  }, [getData]);

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />;
      case "callRecordAndStats":
        return <CallRecordsDashboard />;
      case "Calendar":
        return <CalendarSyncDashboardBD />;
      case "Chat":
        return <Chatting />;
      case "lead_management":
        return <LeadManagementSection info={data} />;
      default:
        return <ProfileSection />;
    }
  };

  return <div className="max-w-7xl mx-auto">{renderSection()}</div>;
};
