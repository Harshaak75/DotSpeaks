import React, { useState, Fragment, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Badge, 
  Edit3, 
  Save, 
  X,
  FileText,
  ChevronRight,
  Home,
  Briefcase,
  Fingerprint
} from "lucide-react";
import { Dialog, Transition } from '@headlessui/react';
import { api } from "../../../utils/api/Employees/api"; // Assuming correct path
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../redux/slice/authSlice"; // Assuming correct path
import { setProfileDetails } from "../../../redux/slice/profileSlice";

// --- TYPE DEFINITIONS ---
interface ProfileData {
  employeeCode: string;
  name: string;
  contact: string;
  email: string;
  designation: string;
  department: string;
  joinDate: string;
}

interface OnboardingFormData {
    personal: {
        dob: string;
        emergencyContactName: string;
        emergencyContactPhone: string;
    };
    identity: {
        aadhar: string;
        pan: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    tax: {
        gstin: string;
    };
}

// --- ONBOARDING BANNER COMPONENT ---
const OnboardingBanner = ({ daysLeft, onStart }: any) => (
  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 flex items-center justify-between shadow-sm">
    <div className="flex items-center">
      <FileText className="h-8 w-8 text-blue-600 mr-4" />
      <div>
        <h3 className="font-bold text-gray-800">Complete Your Profile Onboarding</h3>
        <p className="text-sm text-gray-600">Please submit your required documents and information to finalize your profile.</p>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-center">
        <p className="font-bold text-xl text-blue-700">{daysLeft}</p>
        <p className="text-xs text-gray-500">days remaining</p>
      </div>
      <button
        onClick={onStart}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
      >
        Start Form <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  </div>
);

// --- ONBOARDING FORM MODAL COMPONENT ---
const OnboardingForm = ({ isOpen, onClose, onSubmit }: any) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<OnboardingFormData>({
        personal: { dob: '', emergencyContactName: '', emergencyContactPhone: '' },
        identity: { aadhar: '', pan: '' },
        address: { street: '', city: '', state: '', zip: '' },
        tax: { gstin: '' },
    });

    const steps = [
        { name: 'Personal', icon: User },
        { name: 'Identity', icon: Fingerprint },
        { name: 'Address', icon: Home },
    ];

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleInputChange = (section: keyof OnboardingFormData, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const renderStepContent = () => {
        switch(currentStep) {
            case 0: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="date" placeholder="Date of Birth" value={formData.personal.dob} onChange={e => handleInputChange('personal', 'dob', e.target.value)} className="w-full p-2 border rounded" />
                    <input placeholder="Emergency Contact Name" value={formData.personal.emergencyContactName} onChange={e => handleInputChange('personal', 'emergencyContactName', e.target.value)} className="w-full p-2 border rounded" />
                    <input placeholder="Emergency Contact Phone" value={formData.personal.emergencyContactPhone} onChange={e => handleInputChange('personal', 'emergencyContactPhone', e.target.value)} className="w-full p-2 border rounded md:col-span-2" />
                </div>
            );
            case 1: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Aadhar Card Number (12 digits)" maxLength={12} value={formData.identity.aadhar} onChange={e => handleInputChange('identity', 'aadhar', e.target.value)} className="w-full p-2 border rounded" />
                    <input placeholder="PAN Card Number (10 characters)" maxLength={10} value={formData.identity.pan} onChange={e => handleInputChange('identity', 'pan', e.target.value)} className="w-full p-2 border rounded" />
                </div>
            );
            case 2: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Street Address" value={formData.address.street} onChange={e => handleInputChange('address', 'street', e.target.value)} className="w-full p-2 border rounded md:col-span-2" />
                    <input placeholder="City" value={formData.address.city} onChange={e => handleInputChange('address', 'city', e.target.value)} className="w-full p-2 border rounded" />
                    <input placeholder="State" value={formData.address.state} onChange={e => handleInputChange('address', 'state', e.target.value)} className="w-full p-2 border rounded" />
                    <input placeholder="ZIP Code" value={formData.address.zip} onChange={e => handleInputChange('address', 'zip', e.target.value)} className="w-full p-2 border rounded md:col-span-2" />
                </div>
            );
            case 3: return (
                <div className="grid grid-cols-1 gap-4">
                    <input placeholder="GSTIN (if applicable)" value={formData.tax.gstin} onChange={e => handleInputChange('tax', 'gstin', e.target.value)} className="w-full p-2 border rounded" />
                </div>
            );
            default: return null;
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">Employee Onboarding Form</Dialog.Title>
                                
                                {/* Stepper */}
                                <div className="flex items-center justify-between mb-6 border-b pb-4">
                                    {steps.map((step, index) => (
                                        <div key={step.name} className={`flex items-center ${currentStep >= index ? 'text-blue-600' : 'text-gray-400'}`}>
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= index ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                                <step.icon className="h-4 w-4" />
                                            </div>
                                            <span className={`ml-2 font-semibold ${currentStep >= index ? 'text-gray-800' : 'text-gray-500'}`}>{step.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="min-h-[200px]">
                                    {renderStepContent()}
                                </div>
                                
                                {/* Navigation */}
                                <div className="mt-6 flex justify-between">
                                    <button onClick={handleBack} disabled={currentStep === 0} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50">Back</button>
                                    {currentStep < steps.length - 1 ? (
                                        <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Next</button>
                                    ) : (
                                        <button onClick={() => onSubmit(formData)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Submit</button>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};


// --- PROFILE SECTION COMPONENT (FROM YOUR CODE) ---
const ProfileSection: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const accessToken = useSelector(selectAccessToken);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // Mocking API call for demonstration as it's not available here
                // const profileData = {
                //     employee_code: "DS-0078",
                //     name: "Priya Sharma",
                //     contact: "+91 98765 43210",
                //     email: "priya.sharma@dotspeaks.com",
                //     designation: "Graphic Designer",
                //     department: "Creative Design",
                //     join_date: "2023-08-21T00:00:00.000Z",
                // };

                // const profileData = await api.coo.profile.get(accessToken, dispatch);
                const profileData = await api.BrandHead.profile.get(accessToken, dispatch);
                console.log(profileData)
                const formattedProfile: ProfileData = {
                    employeeCode: profileData.profile.employee_code,
                    name: profileData.profile.name,
                    contact: profileData.profile.contact,
                    email: profileData.profile.email,
                    designation: profileData.profile.designation,
                    department: profileData.profile.department,
                    joinDate: profileData.profile.join_date,
                };
                setProfile(formattedProfile);
                dispatch(setProfileDetails({ name: profileData.profile.name, PackageName: profileData.PackageName}));
                setEditedProfile(formattedProfile);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        // Using a timeout to simulate network delay
        setTimeout(fetchProfile, 1000);
    }, [dispatch]);

    const handleSave = async () => {
        if (editedProfile) {
            try {
                // Here you would make the actual API call
                console.log("Saving profile:", editedProfile);
                setProfile(editedProfile);
                setIsEditing(false);
            } catch (error) {
                console.error("Error updating profile:", error);
            }
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const handleInputChange = (field: keyof ProfileData, value: string) => {
        if (editedProfile) {
            setEditedProfile({ ...editedProfile, [field]: value });
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    if (!profile || !editedProfile) return <div className="text-center py-12"><p className="text-gray-500">Failed to load profile data.</p></div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button onClick={handleSave} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </button>
                        <button onClick={handleCancel} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </button>
                    </div>
                )}
            </div>
            
            <div className="flex items-center mb-8">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center ring-4 ring-blue-200">
                    <User className="h-10 w-10 text-blue-600" />
                </div>
                <div className="ml-6">
                    <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                    <p className="text-gray-600">{profile.designation}</p>
                    <p className="text-sm text-gray-500">{profile.department}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Column 1 */}
                <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    {isEditing ? (
                        <input type="text" value={editedProfile.name} onChange={(e) => handleInputChange("name", e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg"/>
                    ) : (
                        <p className="mt-1 text-gray-900 font-semibold">{profile.name}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                    {isEditing ? (
                        <input type="email" value={editedProfile.email} onChange={(e) => handleInputChange("email", e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg"/>
                    ) : (
                        <p className="mt-1 text-gray-900 font-semibold">{profile.email}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">Contact Number</label>
                    {isEditing ? (
                        <input type="text" value={editedProfile.contact} onChange={(e) => handleInputChange("contact", e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg"/>
                    ) : (
                        <p className="mt-1 text-gray-900 font-semibold">{profile.contact}</p>
                    )}
                </div>

                {/* Column 2 */}
                <div>
                    <label className="block text-sm font-medium text-gray-500">Employee Code</label>
                    <p className="mt-1 text-gray-900 font-semibold">{profile.employeeCode}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">Designation</label>
                    {isEditing ? (
                        <input type="text" value={editedProfile.designation} onChange={(e) => handleInputChange("designation", e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg"/>
                    ) : (
                        <p className="mt-1 text-gray-900 font-semibold">{profile.designation}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">Join Date</label>
                    <p className="mt-1 text-gray-900 font-semibold">{new Date(profile.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        </div>
    );
};


// --- THE NEW PARENT COMPONENT FOR THE PROFILE PAGE ---
const ProfilePage = () => {
    // In a real app, this would come from the user's profile data from the backend.
    const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleOnboardingSubmit = (formData: OnboardingFormData) => {
        console.log("Onboarding data submitted:", formData);
        // Here you would make an API call to save the data
        setIsOnboardingComplete(true);
        setIsFormOpen(false);
        alert("Onboarding details submitted successfully!");
    };

    return (
        <div className="space-y-6">
            {!isOnboardingComplete && (
                <OnboardingBanner daysLeft={10} onStart={() => setIsFormOpen(true)} />
            )}
            
            <ProfileSection />

            <OnboardingForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleOnboardingSubmit}
            />
        </div>
    );
};

export default ProfilePage;
