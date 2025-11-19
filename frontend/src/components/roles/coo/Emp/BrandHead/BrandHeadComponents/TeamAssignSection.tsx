import { useState, Fragment, useEffect } from "react";
import {
  Users,
  User,
  Paintbrush,
  Mic,
  Settings,
  Plus,
  X,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "../../../../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../../../../redux/slice/authSlice";
import { RootState } from "../../../../../../redux/store";
import ToastNotification from "../../../../../ToastMessageComp";

// --- TYPE DEFINITIONS ---
type Role = "Digital Marketer" | "Graphic Designer" | "Content Writer";

interface MemberType {
  id: string;
  name: string;
  role: Role;
  avatarUrl: string;
}

interface TeamType {
  teamId: string;
  teamName: string;
  client: string;
  members: MemberType[];
}

const roleIcons: Record<Role, JSX.Element> = {
  "Digital Marketer": <User className="h-5 w-5 text-purple-600" />,
  "Graphic Designer": <Paintbrush className="h-5 w-5 text-red-600" />,
  "Content Writer": <Mic className="h-5 w-5 text-green-600" />,
};

// --- REUSABLE TEAM CARD COMPONENT ---
const TeamCard = ({
  team,
  onEdit,
}: {
  team: any;
  onEdit: (team: any) => void;
}) => (
  <div className="bg-white rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow overflow-hidden" style={{ borderLeftColor: '#0000CC' }}>
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{team.teamName}</h3>
          <p className="text-sm text-gray-500">
            Assigned to:{" "}
            <span className="font-semibold text-gray-700">
              {team.clientName}
            </span>
          </p>
        </div>
        <button
          onClick={() => onEdit(team)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          style={{ color: '#0000CC' }}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>

    <div className="bg-gray-50 px-6 py-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Team Members
      </h4>
      <div className="space-y-3">
        {team.members.map((member: any) => (
          <div key={member.profileId} className="flex items-center">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                member.name
              )}&background=random`}
              alt={member.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-800">
                {member.name}
              </p>
              <div className="flex items-center">
                {roleIcons[member.role as Role]}
                <p className="ml-1.5 text-xs text-gray-600">{member.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- MODAL FOR CREATING/EDITING TEAMS ---
const TeamFormModal = ({
  isOpen,
  onClose,
  onSave,
  selectedEmployee,
  selectedClients,
}: any) => {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Record<Role, string>>({
    "Digital Marketer": "",
    "Graphic Designer": "",
    "Content Writer": "",
  });
  const [client, setClient] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const packageName = useSelector((state: any) => state.profile.PackageName);
  const [loading, setloading] = useState(false);

  const handleSave = async () => {
    const data = {
      teamId: Date.now().toString(),
      teamName,
      clientName: client.name,
      clientId: client.id,
      members: Object.entries(members)
        .filter(([_, id]) => id)
        .map(([role, id]) => {
          const emp = selectedEmployee[role].find((e: any) => e.id === id);
          return { profileId: id, name: emp?.name, role };
        }),
    };

    try {
      setloading(true);
      const response = await api.BrandHead.team.createTeam(
        accessToken,
        dispatch,
        [data],
        packageName
      );
      console.log("Created:", response);
      onSave(data);
      onClose();
    } catch (error) {
      console.error("Error creating team:", error);
      setToast({
        show: true,
        message: `Team creation failed. Please try again.`,
        type: "error",
      });
    } finally {
      setloading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: '#0000CC' }}></div>
      </div>
    );

  const renderSelectForClient = (clients: any) => {
    if (clients.length === 0) {
      return <p>No clients available</p>;
    }
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Clients
        </label>
        <select
          value={client.id}
          onChange={(e) => {
            const selected = clients.find((c: any) => c.id === e.target.value);
            if (selected) setClient(selected);
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 
               focus:outline-none focus:ring-2 focus:border-transparent 
               sm:text-sm rounded-md"
          style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
        >
          <option value="">Select Clients</option>
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderSelectForRole = (role: Role) => {
    const filteredEmployees = selectedEmployee[role] || [];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {role}
        </label>
        <select
          value={members[role]}
          onChange={(e) =>
            setMembers((prev) => ({ ...prev, [role]: e.target.value }))
          }
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm rounded-md"
          style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
        >
          <option value="">Select Employee</option>
          {filteredEmployees.map((emp: any) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border-2" style={{ borderColor: '#0000CC' }}>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6"
                  style={{ color: '#0000CC' }}
                >
                  Assign New Team
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                    />
                  </div>
                  {renderSelectForClient(selectedClients)}

                  {Object.keys(selectedEmployee).map((role) => (
                    <div key={role}>{renderSelectForRole(role as Role)}</div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg text-white hover:opacity-90"
                    style={{ backgroundColor: '#0000CC' }}
                  >
                    Save Team
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

type Employee = {
  id: string;
  packageId: string;
  profileId: string;
  role: string;
  profile: {
    id: string;
    name: string;
  };
};

// Edit Modal
const EditTeamModal = ({ isOpen1, onClose1, onSave1 }: any) => {
  const dummyTeamData = {
    teamId: "t1",
    teamName: "Alpha Project Team",
    clientName: "Innovate Corp",
    members: [
      { profileId: "m1", name: "Alice Johnson", role: "Graphic Designer" },
      { profileId: "m3", name: "Charlie Brown", role: "Graphic Designer" },
    ],
  };

  const allClients = [
    { id: "c1", company_name: "Innovate Corp" },
    { id: "c2", company_name: "Quantum Solutions" },
    { id: "c3", company_name: "Nexus Enterprises" },
  ];

  const allMembers = [
    { profileId: "m1", name: "Alice Johnson", role: "Graphic Designer" },
    { profileId: "m2", name: "Bob Williams", role: "Digital Marketer" },
    { profileId: "m3", name: "Charlie Brown", role: "Graphic Designer" },
    { profileId: "m4", name: "Diana Miller", role: "Digital Marketer" },
    { profileId: "m5", name: "Edward Garcia", role: "Project Manager" },
  ];

  const groupedMembers = allMembers.reduce((acc: any, member: any) => {
    const role = member.role || "Unassigned";
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(member);
    return acc;
  }, {});

  const handleMemberChange = (role: any, selectedProfileId: any) => {
    setFormData((prev: any) => {
      if (!prev) return null;

      const otherMembers = prev.members.filter((m: any) => m.role !== role);

      if (selectedProfileId) {
        const newMember = allMembers.find(
          (m: any) => m.profileId === selectedProfileId
        );
        return { ...prev, members: [...otherMembers, newMember] };
      }

      return { ...prev, members: otherMembers };
    });
  };

  const [formData, setFormData] = useState(dummyTeamData);

  if (!isOpen1) {
    return null;
  }

  const currentClientId = allClients.find(
    (c) => c.company_name === formData.clientName
  )?.id;

  const handleClientChange = (e: any) => {
    const selectedClientName = e.target.options[e.target.selectedIndex].text;
    setFormData((prev) => ({ ...prev, clientName: selectedClientName }));
  };

  const handleSave = () => {
    onSave1(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md border-2" style={{ borderColor: '#0000CC' }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#0000CC' }}>
          Edit Team
        </h2>

        {/* Team Name (Display Only) */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Team Name
          </label>
          <p className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600">
            {formData.teamName}
          </p>
        </div>

        {/* Client Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Assign Client
          </label>
          <select
            value={currentClientId || ""}
            onChange={handleClientChange}
            className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
          >
            {allClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name}
              </option>
            ))}
          </select>
        </div>

        {/* Members Multi-Select Dropdown */}
        <div className="mb-6 space-y-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Team Members
          </label>

          {Object.keys(groupedMembers).map((role) => {
            const currentMemberForRole = formData.members.find(
              (m: any) => m.role === role
            );
            const currentMemberId = currentMemberForRole
              ? currentMemberForRole.profileId
              : "";

            return (
              <div key={role}>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {role}
                </label>
                <select
                  value={currentMemberId}
                  onChange={(e) => handleMemberChange(role, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                >
                  <option value="">-- Not Assigned --</option>

                  {groupedMembers[role].map((member: any) => (
                    <option key={member.profileId} value={member.profileId}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose1}
            className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-white hover:opacity-90"
            style={{ backgroundColor: '#0000CC' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// --- THE MAIN DASHBOARD COMPONENT ---
const TeamAssignSection = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<
    Record<string, { id: string; name: string }[]>
  >({});
  const [clients, setClients] = useState<any[]>([]);

  const PackageName = useSelector(
    (state: RootState) => state.profile.PackageName
  );

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true);
        const response = await api.BrandHead.team.fetchCard(
          accessToken,
          dispatch
        );
        console.log(response);
        setTeams(response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, []);

  function formatClient(data: any) {
    return data.map((item: any) => {
      return {
        id: item.clients.id,
        name: item.clients.company_name,
      };
    });
  }

  function formatApiResponse(apiData: any) {
    const desiredRoles = [
      "Digital Marketer",
      "Graphic Designer",
      "Content Writer",
    ];

    const formattedData: any = {};

    desiredRoles.forEach((role) => {
      const apiRoleKey =
        role === "Digital Marketer"
          ? "digitalMarketers"
          : role === "Graphic Designer"
          ? "graphicDesigners"
          : role === "Content Writer"
          ? "contentWriters"
          : null;

      if (apiRoleKey && apiData[apiRoleKey]) {
        formattedData[role] = apiData[apiRoleKey].map((employee: any) => ({
          id: employee.id,
          name: employee.name,
        }));
      } else {
        formattedData[role] = [];
      }
    });
    return formattedData;
  }

  const openModal = async () => {
    setIsModalOpen(true);
    try {
      const [empRes, cliRes] = await Promise.all([
        api.BrandHead.team.getEmployee(accessToken, dispatch, PackageName),
        api.BrandHead.team.getClient(accessToken, dispatch),
      ]);

      setEmployees(formatApiResponse(empRes));
      setClients(formatClient(cliRes));
    } catch (error) {
      console.log(error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTeamToEdit(null);

    setToast({
      show: true,
      message: `Team created successfully!`,
      type: "success",
    });
  };

  const handleEdit = (team: any) => {
    setTeamToEdit(team);
    setIsEditModalOpen(true);
  };

  const handleSaveTeam = (teamData: TeamType) => {
    if (teamToEdit) {
      setTeams(teams.map((t) => (t.teamId === teamData.teamId ? teamData : t)));
    } else {
      setTeams([...teams, teamData]);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: '#0000CC' }}></div>
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#0000CC' }}>
          Team Assignments
        </h1>
        <button
          onClick={openModal}
          className="flex items-center px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-sm"
          style={{ backgroundColor: '#0000CC' }}
        >
          <Plus className="h-5 w-5 mr-2 -ml-1" />
          Assign New Team
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => (
          <TeamCard key={team.teamId} team={team} onEdit={handleEdit} />
        ))}
      </div>

      <EditTeamModal
        isOpen1={isEditModalOpen}
        onClose1={() => setIsEditModalOpen(false)}
        onSave1={handleSaveTeam}
        teamToEdit={teamToEdit}
      />

      <TeamFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTeam}
        selectedEmployee={employees}
        selectedClients={clients}
      />
    </div>
  );
};

export default TeamAssignSection;
