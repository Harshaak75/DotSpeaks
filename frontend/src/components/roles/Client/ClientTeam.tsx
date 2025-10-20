import React, { useEffect, useState } from "react";
import { User, Users, Paintbrush, Mic, Mail, Phone } from "lucide-react";
import { api } from "../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";

// --- TYPE DEFINITIONS ---
type Role =
  | "Digital Marketer"
  | "Graphic Designer"
  | "Content Writer"
  | "Brand Head";

interface TeamMemberFromAPI {
  name: string;
  designation: Role;
  email?: string; // Email is optional, only present for Brand Head in the screenshot
}

// Helper function to generate a placeholder avatar URL from a name
const generateAvatarUrl = (
  name: string,
  color: string = "7C3AED",
  bg: string = "E9D5FF"
) => {
  if (!name) return `https://placehold.co/100x100/${bg}/${color}?text=U`;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return `https://placehold.co/100x100/${bg}/${color}?text=${initials}`;
};

const roleIcons: Record<Role, JSX.Element> = {
  "Digital Marketer": <User className="h-5 w-5 text-purple-600" />,
  "Graphic Designer": <Paintbrush className="h-5 w-5 text-red-600" />, // Corrected key
  "Content Writer": <Mic className="h-5 w-5 text-green-600" />,
  "Brand Head": <User className="h-5 w-5 text-blue-600" />,
};

// --- MAIN COMPONENT ---
const AssignedTeamDashboard = () => {
  const accessToken = useSelector((state: any) => state.auth.accessToken);
  const dispatch = useDispatch();

  const [teamData, setTeamData] = useState<Record<
    string,
    TeamMemberFromAPI
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const GetTeamMembers = async () => {
      try {
        const response = await api.Client.getTeamMembers.get(
          accessToken,
          dispatch
        );
        console.log("Team Members: ", response);
        setTeamData(response);
      } catch (error) {
        console.error("Error fetching team members: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    GetTeamMembers();
  }, [accessToken, dispatch]);

  const brandHead = teamData ? teamData["Brand Head"] : null;
  const creativeTeamMembers = teamData
    ? Object.values(teamData).filter(
        (member) => member.designation !== "Brand Head"
      )
    : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Loading your team...</p>
      </div>
    );
  }

  if (!teamData || !brandHead) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">
          Could not load team information.
        </p>
      </div>
    );
  }

  return (
    <div className=" min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Your Dedicated Team
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Meet the experts from DotSpeaks who are committed to your brand's
            success.
          </p>
        </div>

        <div className="space-y-12">
          {/* Brand Head Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600 inline-block">
              Your Primary Point of Contact
            </h2>
            <div className="mt-4 bg-white p-8 rounded-lg shadow-lg border border-gray-200 flex items-center">
              <img
                src={generateAvatarUrl(brandHead.name, "ffffff", "3b82f6")}
                alt={brandHead.name}
                className="h-24 w-24 rounded-full ring-4 ring-blue-500"
              />
              <div className="ml-8">
                <p className="text-3xl font-bold text-gray-900">
                  {brandHead.name}
                </p>
                <p className="text-md text-gray-500">{brandHead.designation}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <a
                      href={`mailto:${brandHead.email}`}
                      className="inline-flex items-center text-sm text-gray-600 mt-2 transition-colors hover:text-blue-600 hover:underline"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{brandHead.email}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Team Section */}

          <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600 inline-block">
            Your Creative Team
          </h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {creativeTeamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-lg shadow-sm border border-gray-200 text-center p-6 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <img
                  src={generateAvatarUrl(member.name)}
                  alt={member.name}
                  className="h-20 w-20 rounded-full mx-auto mb-4"
                />
                <p className="text-lg font-semibold text-gray-800">
                  {member.name}
                </p>
                <div className="flex items-center justify-center mt-1">
                  {/* Use member.designation to get the correct icon */}
                  {roleIcons[member.designation]}
                  <p className="ml-2 text-sm text-gray-600">
                    {member.designation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedTeamDashboard;
