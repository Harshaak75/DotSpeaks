// import React, { useState, Fragment, useEffect } from "react";
// import { Dialog, Transition } from "@headlessui/react";
// import { UserPlus } from "lucide-react";
// // Removed unused icons
// import { Mail, Phone as PhoneIcon } from "lucide-react";
// import { api } from "../../../../utils/api/Employees/api";
// import { useDispatch, useSelector } from "react-redux";
// import { selectAccessToken } from "../../../../redux/slice/authSlice";

// // --- TYPE DEFINITIONS ---
// interface ProspectiveClient {
//   id: string;
//   company: string;
//   contact: string;
//   phone: string;
//   email: string;
// }

// const availablePackages = [
//   "SPARK",
//   "RISE",
//   "SCALE",
//   "LEAD",
//   "SIGNATURE",
//   "TAILORED",
// ];

// // --- HELPER FUNCTIONS ---
// const generatePassword = () => {
//   const length = 12;
//   const charset =
//     "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
//   let retVal = "";
//   for (let i = 0, n = charset.length; i < length; ++i) {
//     retVal += charset.charAt(Math.floor(Math.random() * n));
//   }
//   return retVal;
// };

// // --- MAIN COMPONENT ---
// const BusinessDeveloperDashboard = ({ info }: any) => {
//   const [prospects, setProspects] = useState(info || []); // Ensure prospects is an array
//   const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
//   const [selectedProspect, setSelectedProspect] =
//     useState<ProspectiveClient | null>(null);

//   const accessToken = useSelector(selectAccessToken);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     setProspects(info || []);
//   }, [info]);

//   const [selectedPackage, setSelectedPackage] = useState(availablePackages[0]);
//   const [generatedPassword, setGeneratedPassword] = useState("");
//   // REMOVED: isPasswordCopied state is no longer needed

//   const openConvertModal = (prospect: any) => {
//     // The full prospect data (including email/contact) is stored in state, but not shown in the modal
//     setSelectedProspect(prospect.TeleCommunication);
//     const newPassword = generatePassword();
//     setGeneratedPassword(newPassword);
//     setSelectedPackage(availablePackages[0]);
//     setIsConvertModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsConvertModalOpen(false);
//     setSelectedProspect(null);
//   };

//   // REMOVED: handleCopyToClipboard function is no longer needed

// const handleCreateAccount = async () => {
//   if (!selectedProspect) return;

//   const newAccountPayload = {
//     email: selectedProspect.email,
//     password: generatedPassword,
//     package: selectedPackage,
//     companyName: selectedProspect.company,
//     contactName: selectedProspect.contact, // Send all necessary data
//     phone: selectedProspect.phone,
//     leadId: selectedProspect.id,
//   };

//   console.log(newAccountPayload);

//   try {
//     const data = await api.brandDeveloper.CreateAccount.post(
//       accessToken,
//       dispatch,
//       newAccountPayload.email,
//       newAccountPayload.password,
//       newAccountPayload.companyName,
//       newAccountPayload.package,
//       newAccountPayload.leadId
//     );

//     console.log("data", data);
//   } catch (error) {
//     console.log(error);
//   }

//   console.log("Sending to backend:", newAccountPayload);

//   // MODIFIED: The alert message is now generic and does not expose sensitive info.
//   alert(
//     `Account for ${selectedProspect?.company} will be created with package "${selectedPackage}".\nAn invite will be sent to the registered contact.`
//   );

//   // This part remains the same, assuming you want to optimistically remove from the UI
//   setProspects((currentProspects: any) =>
//     currentProspects.filter((p: any) => p.id !== selectedProspect.id)
//   );

//   closeModal();
// };

//   return (
//     <div className="bg-gray-50 sm:p-6 md:p-8 min-h-screen">
//       {/* ... The top part of your component remains the same ... */}
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">
//         Clients dashboard
//       </h1>
//       <p className="text-gray-600 mb-6">
//         These prospective clients have been qualified by the telecalling team.
//         Your goal is to convert them into active clients.
//       </p>

//       {/* ... The table remains the same ... */}
//       <div className="bg-white p-6 rounded-lg shadow-sm border">
//         {/* ... */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             {/* ... table head ... */}
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Company / Contact
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Contact Info
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {prospects &&
//                 prospects.map((prospect: any) => (
//                   <tr key={prospect.id}>
//                     <td className="px-6 py-4">
//                       <p className="font-medium text-gray-900">
//                         {prospect.TeleCommunication.company}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         {prospect.TeleCommunication.contact}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       <div className="flex items-center mb-1">
//                         <Mail className="h-4 w-4 mr-2 text-gray-400" />
//                         <a
//                           href={`mailto:${prospect.email}`}
//                           className="hover:text-blue-600"
//                         >
//                           {prospect.TeleCommunication.email}
//                         </a>
//                       </div>
//                       <div className="flex items-center">
//                         <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
//                         <span>{prospect.TeleCommunication.phone}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <button
//                         onClick={() => openConvertModal(prospect)}
//                         className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                       >
//                         <UserPlus className="h-4 w-4 mr-2" /> Convert to Client
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               {prospects && prospects.length === 0 && (
//                 <tr>
//                   <td colSpan={3} className="text-center py-10 text-gray-500">
//                     No new prospective clients. Great work!
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* --- MODIFIED: Create Client Account Modal --- */}
//       <Transition appear show={isConvertModalOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-50" onClose={closeModal}>
//           {/* ... Transition and backdrop are the same ... */}
//           <Transition.Child
//             as={Fragment}
//             enter="ease-out duration-300"
//             enterFrom="opacity-0"
//             enterTo="opacity-100"
//             leave="ease-in duration-200"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <div className="fixed inset-0 bg-black/50" />
//           </Transition.Child>
//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0 scale-95"
//                 enterTo="opacity-100 scale-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100 scale-100"
//                 leaveTo="opacity-0 scale-95"
//               >
//                 <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                   <Dialog.Title
//                     as="h3"
//                     className="text-lg font-bold leading-6 text-gray-900"
//                   >
//                     Create New Client Account
//                   </Dialog.Title>
//                   <div className="mt-4 space-y-4">
//                     {/* VISIBLE: Company Name is okay to show */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Company Name
//                       </label>
//                       <input
//                         type="text"
//                         readOnly
//                         value={selectedProspect?.company || ""}
//                         className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed"
//                       />
//                     </div>

//                     {/* REMOVED: Contact Person input field is hidden */}
//                     {/* REMOVED: Contact Email input field is hidden */}

//                     {/* VISIBLE: Package selection is necessary */}
//                     <div>
//                       <label
//                         htmlFor="package"
//                         className="block text-sm font-medium text-gray-700"
//                       >
//                         Select Package
//                       </label>
//                       <select
//                         id="package"
//                         value={selectedPackage}
//                         onChange={(e) => setSelectedPackage(e.target.value)}
//                         className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
//                       >
//                         {availablePackages.map((pkg) => (
//                           <option key={pkg}>{pkg}</option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* SECURED: Password is now a password type and cannot be copied */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">
//                         Generated Password
//                       </label>
//                       <div className="mt-1 relative rounded-md shadow-sm">
//                         <input
//                           type="password"
//                           readOnly
//                           value={generatedPassword}
//                           className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
//                         />
//                         {/* The copy button has been removed */}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="mt-6 flex justify-end space-x-3">
//                     <button
//                       onClick={closeModal}
//                       className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleCreateAccount}
//                       className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
//                     >
//                       Create Account & Send Invite
//                     </button>
//                   </div>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </Dialog>
//       </Transition>
//     </div>
//   );
// };

// export default BusinessDeveloperDashboard;

import React, { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  UserPlus,
  Mail,
  Phone as PhoneIcon,
  KeyRound,
  Send,
  Users,
  ChevronRight,
} from "lucide-react";
// Removed dependencies that were causing errors to make the component self-contained.
import { api } from "../../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../../redux/slice/authSlice";

// --- TYPE DEFINITIONS ---
interface ProspectiveClient {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
}

const availablePackages = [
  "SPARK",
  "RISE",
  "SCALE",
  "LEAD",
  "SIGNATURE",
  "TAILORED",
];

// --- HELPER FUNCTIONS ---
const generatePassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

// --- MAIN COMPONENT ---
const BusinessDeveloperDashboard = ({ info }: any) => {
  const [telecommunicators, setTelecommunicators] = useState<any[]>([]);
  const [selectedTelecommunicator, setSelectedTelecommunicator] = useState<
    any | null
  >(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectiveClient | null>(null);

  const [name, setName] = useState("");

  const [loading, setloading] = useState(false);

  const [callMade, setCallMade] = useState(0);

  const [forwarded, setForwarded] = useState(0);

  const [convertionRate, setConvertionRate] = useState(0);

  // Removed Redux hooks
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch telecommunicators data from the backend
    const fetchTelecommunicators = async () => {
      try {
        setloading(true);
        const response = await api.brandDeveloper.getInfo.get(
          accessToken,
          dispatch
        );
        setTelecommunicators(response.data ?? []);
      } catch (error) {
        console.error("Error fetching telecommunicators:", error);
      } finally {
        setloading(false);
      }
    };

    fetchTelecommunicators();
  }, []);

  const fetchTellecaller = async (id: string, name: string) => {
    try {
      setloading(true);
      const response =
        await api.brandDeveloper.getInfo.getTelleCallerPushedClient(
          accessToken,
          dispatch,
          id
        );
      console.log(response.data);

      setForwarded(response.forwardedCount);

      setCallMade(response.othersCount);

      // formaul to find the convertion rate

      const info = Math.ceil(
        (response.forwardedCount / response.othersCount) * 100
      );

      setConvertionRate(info);

      setName(name);

      const leads = response.data.map((item: any) => ({
        id: item.TeleCommunication.id,
        company: item.TeleCommunication.company,
        contact: item.TeleCommunication.contact,
        phone: item.TeleCommunication.phone,
        email: item.TeleCommunication.email,
        status: item.TeleCommunication.status,
        created_at: item.TeleCommunication.created_at,
      }));

      setSelectedTelecommunicator((prev: any) => ({
        ...prev,
        forwardedLeads: leads,
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  const [selectedPackage, setSelectedPackage] = useState(availablePackages[0]);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const openConvertModal = (prospect: ProspectiveClient) => {
    setSelectedProspect(prospect);
    const newPassword = generatePassword();
    setGeneratedPassword(newPassword);
    setSelectedPackage(availablePackages[0]);
    setIsConvertModalOpen(true);
  };

  const closeModal = () => {
    setIsConvertModalOpen(false);
    setSelectedProspect(null);
  };

  const ScheduleMeet = async(id: string) =>{
    try {
      const data = await api.brandDeveloper.scheduleMeet.post(
        accessToken,
        dispatch,
        id
      );
      console.log("Meeting scheduled successfully:", data);
    } catch (error) {
      console.error("Error scheduling meeting:", error);
    }
  }

  const handleCreateAccount = async () => {
    if (!selectedProspect) return;

    const newAccountPayload = {
      email: selectedProspect.email,
      password: generatedPassword,
      package: selectedPackage,
      companyName: selectedProspect.company,
      contactName: selectedProspect.contact, // Send all necessary data
      phone: selectedProspect.phone,
      leadId: selectedProspect.id,
    };

    console.log(newAccountPayload);

    try {
      const data = await api.brandDeveloper.CreateAccount.post(
        accessToken,
        dispatch,
        newAccountPayload.email,
        newAccountPayload.password,
        newAccountPayload.companyName,
        newAccountPayload.package,
        newAccountPayload.leadId
      );

      console.log("data", data);
    } catch (error) {
      console.log(error);
    }

    console.log("Sending to backend:", newAccountPayload);

    // MODIFIED: The alert message is now generic and does not expose sensitive info.
    alert(
      `Account for ${selectedProspect?.company} will be created with package "${selectedPackage}".\nAn invite will be sent to the registered contact.`
    );

    // This part remains the same, assuming you want to optimistically remove from the UI
    setSelectedTelecommunicator((prev: any) => ({
      ...prev,
      forwardedLeads: prev.forwardedLeads.filter(
        (p: any) => p.id !== selectedProspect.id
      ),
    }));

    closeModal();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  const Avatar = ({ name }: { name: string }) => {
    const initials = name ? name.slice(0, 2).toUpperCase() : "??";

    return (
      <div className="w-8 h-8 rounded-full mr-4 bg-blue-600 text-white flex items-center justify-center font-semibold">
        {initials}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Business Developer Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Telecommunicators List */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-sm border h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Telecommunicators
            </h2>
            <div className="space-y-2">
              {telecommunicators.map((tele: any) => (
                <button
                  key={tele.id}
                  onClick={() => fetchTellecaller(tele.id, tele.profile?.name)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-all ${
                    selectedTelecommunicator?.id === tele.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <Avatar name={tele.profile?.name} />
                  <div>
                    <p
                      className={`font-semibold ${
                        selectedTelecommunicator?.id === tele.id
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {tele.profile?.name}
                    </p>
                    <p
                      className={`text-xs ${
                        selectedTelecommunicator?.id === tele.id
                          ? "text-blue-200"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedTelecommunicator &&
                        selectedTelecommunicator.forwardedLeads && (
                          <>
                            {selectedTelecommunicator.forwardedLeads.length}{" "}
                            leads
                          </>
                        )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedTelecommunicator && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-white rounded-lg shadow-sm border">
                  <p className="text-sm text-gray-500">Calls Made</p>
                  <p className="text-3xl font-bold text-gray-800">{callMade}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border">
                  <p className="text-sm text-gray-500">Leads Forwarded</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {forwarded}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border">
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-3xl font-bold text-green-600">
                    {convertionRate}%
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Forwarded Leads from {name}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr className="">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Company / Contact
                        </th>
                        <th className="px-12 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Contact Info
                        </th>
                        <th className="px-12 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Schedule Meet
                        </th>
                        <th className="px-[5rem] py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedTelecommunicator.forwardedLeads &&
                        selectedTelecommunicator.forwardedLeads.map(
                          (prospect: any) => (
                            <tr key={prospect.id}>
                              <td className="px-6 py-4">
                                <p className="font-medium text-gray-900">
                                  {prospect.company}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {prospect.contact}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {/* <div className="flex items-center mb-1">
                                  <Mail className="h-4 w-4 mr-2 text-gray-400" />{" "}
                                  <a
                                    href={`mailto:${prospect.email}`}
                                    className="hover:text-blue-600"
                                  >
                                    {prospect.email}
                                  </a>
                                </div>
                                <div className="flex items-center">
                                  <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />{" "}
                                  <span>{prospect.phone}</span>
                                </div> */}

                                <button
                                  onClick={() => alert(prospect.id)}
                                  className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" /> Contact Lead
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => ScheduleMeet(prospect.id)}
                                  className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" /> Schedule Meet
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => openConvertModal(prospect)}
                                  className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" /> Convert
                                  to Client
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      {selectedTelecommunicator.forwardedLeads &&
                        selectedTelecommunicator.forwardedLeads.length ===
                          0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="text-center py-10 text-gray-500"
                            >
                              No new prospective clients from this team member.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Transition appear show={isConvertModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900"
                  >
                    Create New Client Account
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedProspect?.company || ""}
                        className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="package"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Select Package
                      </label>
                      <select
                        id="package"
                        value={selectedPackage}
                        onChange={(e) => setSelectedPackage(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        {availablePackages.map((pkg) => (
                          <option key={pkg}>{pkg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Generated Password
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="password"
                          readOnly
                          value={generatedPassword}
                          className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateAccount}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                      Create Account & Send Invite
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default BusinessDeveloperDashboard;
