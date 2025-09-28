// import React, { useState } from "react";
// import { UserPlus, KeyRound, Shield, Send } from "lucide-react";
// import { api } from "../../../../utils/api/Employees/api";
// import { useDispatch, useSelector } from "react-redux";
// import { selectAccessToken } from "../../../../redux/slice/authSlice";

// // --- MOCK DATA ---
// const packages = ["SPARK", "RISE", "SCALE", "LEAD", "SIGNATURE", "TAILORED"];

// // --- MAIN COMPONENT ---
// const CreateClientAccount = () => {
//   const [companyName, setCompanyName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [selectedPackage, setSelectedPackage] = useState(packages[0]);
//   const accessToken = useSelector(selectAccessToken);
//   const dispatch = useDispatch();

//   const [loading, setloading] = useState(false);

//   const generatePassword = () => {
//     const chars =
//       "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
//     let pass = "";
//     for (let i = 0; i < 12; i++) {
//       pass += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     setPassword(pass);
//   };

//   const handleCreateAccount = async () => {
//     if (!companyName || !email || !password) {
//       alert("Please fill all fields before creating the account.");
//       return;
//     }

//     try {
//         setloading(true)
//       const response = await api.brandDeveloper.CreateAccount.post(
//         accessToken,
//         dispatch,
//         email,
//         password,
//         companyName,
//         selectedPackage,

//       );
//       console.log(response);
//       // Reset form after submission
//       setCompanyName("");
//       setEmail("");
//       setPassword("");
//       setSelectedPackage(packages[0]);
//       alert("the account is succesfully created");
//     } catch (error) {
//       console.log(error);
//       alert("There is some problem");
//     }
//     finally{
//         setloading(false)
//     }
//   };

//   if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

//   return (
//     <div className=" bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">
//         Create New Client Account
//       </h1>

//       <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm border">
//         <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 flex items-start">
//           <Shield className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0" />
//           <div>
//             <h3 className="font-bold text-blue-800">Secure Onboarding</h3>
//             <p className="text-sm text-blue-700">
//               You are creating an official client account. A secure, one-time
//               password will be generated, and an automated notification will be
//               sent to the assigned Brand Head upon creation.
//             </p>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Company Name
//             </label>
//             <input
//               type="text"
//               value={companyName}
//               onChange={(e) => setCompanyName(e.target.value)}
//               placeholder="e.g., Innovate Inc."
//               className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Client Contact Email
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="e.g., contact@innovate.com"
//               className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Package
//             </label>
//             <select
//               value={selectedPackage}
//               onChange={(e) => setSelectedPackage(e.target.value)}
//               className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
//             >
//               {packages.map((p) => (
//                 <option key={p}>{p}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Generated Password
//             </label>
//             <div className="relative mt-1">
//               <input
//                 type="text"
//                 value={password}
//                 readOnly
//                 placeholder="Click Generate to create a secure password"
//                 className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
//               />
//               <button
//                 onClick={generatePassword}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center px-3 py-1.5 text-sm bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300"
//               >
//                 <KeyRound className="h-4 w-4 mr-2" />
//                 Generate
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 pt-6 border-t">
//           <button
//             onClick={handleCreateAccount}
//             className="w-full flex items-center justify-center py-3 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
//           >
//             <UserPlus className="h-6 w-6 mr-3" />
//             Create Account & Trigger Onboarding
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateClientAccount;
