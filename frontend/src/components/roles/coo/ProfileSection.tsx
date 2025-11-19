import React, { useState, Fragment, useEffect } from "react";
import { 
  User, 
  Edit3, 
  Save, 
  X,
  FileText,
  ChevronRight,
  Home,
  Fingerprint
} from "lucide-react";
import { Dialog, Transition } from '@headlessui/react';
import { api } from "../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../redux/slice/authSlice";
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
  <div 
    className="rounded-xl shadow-lg overflow-hidden flex items-center justify-between p-6"
    style={{ backgroundColor: '#0000CC' }}
  >
    <div className="flex items-center">
      <FileText className="h-8 w-8 text-white mr-4" />
      <div>
        <h3 
          className="text-white text-lg mb-1"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
        >
          Complete Your Profile Onboarding
        </h3>
        <p 
          className="text-sm text-white"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Please submit your required documents and information to finalize your profile.
        </p>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-center">
        <p 
          className="font-bold text-2xl text-white"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
        >
          {daysLeft}
        </p>
        <p 
          className="text-xs text-white"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          days remaining
        </p>
      </div>
      <button
        onClick={onStart}
        className="flex items-center px-4 py-1.5 bg-white rounded-lg hover:opacity-90 transition-opacity shadow"
        style={{ color: '#0000CC', fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
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
                    <input 
                      type="date" 
                      placeholder="Date of Birth" 
                      value={formData.personal.dob} 
                      onChange={e => handleInputChange('personal', 'dob', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <input 
                      placeholder="Emergency Contact Name" 
                      value={formData.personal.emergencyContactName} 
                      onChange={e => handleInputChange('personal', 'emergencyContactName', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <input 
                      placeholder="Emergency Contact Phone" 
                      value={formData.personal.emergencyContactPhone} 
                      onChange={e => handleInputChange('personal', 'emergencyContactPhone', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                </div>
            );
            case 1: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      placeholder="Aadhar Card Number (12 digits)" 
                      maxLength={12} 
                      value={formData.identity.aadhar} 
                      onChange={e => handleInputChange('identity', 'aadhar', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <input 
                      placeholder="PAN Card Number (10 characters)" 
                      maxLength={10} 
                      value={formData.identity.pan} 
                      onChange={e => handleInputChange('identity', 'pan', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                </div>
            );
            case 2: return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      placeholder="Street Address" 
                      value={formData.address.street} 
                      onChange={e => handleInputChange('address', 'street', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <input 
                      placeholder="City" 
                      value={formData.address.city} 
                      onChange={e => handleInputChange('address', 'city', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <input 
                      placeholder="State" 
                      value={formData.address.state} 
                      onChange={e => handleInputChange('address', 'state', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <input 
                      placeholder="ZIP Code" 
                      value={formData.address.zip} 
                      onChange={e => handleInputChange('address', 'zip', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                </div>
            );
            case 3: return (
                <div className="grid grid-cols-1 gap-4">
                    <input 
                      placeholder="GSTIN (if applicable)" 
                      value={formData.tax.gstin} 
                      onChange={e => handleInputChange('tax', 'gstin', e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
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
                                <Dialog.Title 
                                  as="h3" 
                                  className="text-lg leading-6 mb-4"
                                  style={{ 
                                    fontFamily: 'Inter, sans-serif', 
                                    fontWeight: 'bold',
                                    color: '#0000CC'
                                  }}
                                >
                                  Employee Onboarding Form
                                </Dialog.Title>
                                
                                {/* Stepper */}
                                <div className="flex items-center justify-between mb-6 border-b pb-4">
                                    {steps.map((step, index) => (
                                        <div 
                                          key={step.name} 
                                          className="flex items-center"
                                          style={{ 
                                            color: currentStep >= index ? '#0000CC' : '#9CA3AF',
                                            fontFamily: 'Roboto, sans-serif'
                                          }}
                                        >
                                            <div 
                                              className="h-8 w-8 rounded-full flex items-center justify-center border-2"
                                              style={{
                                                backgroundColor: currentStep >= index ? '#0000CC' : 'transparent',
                                                borderColor: currentStep >= index ? '#0000CC' : '#D1D5DB',
                                                color: currentStep >= index ? 'white' : '#9CA3AF'
                                              }}
                                            >
                                                <step.icon className="h-4 w-4" />
                                            </div>
                                            <span 
                                              className="ml-2"
                                              style={{ 
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: 'bold',
                                                color: currentStep >= index ? '#0000CC' : '#6B7280'
                                              }}
                                            >
                                              {step.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="min-h-[200px]">
                                    {renderStepContent()}
                                </div>
                                
                                {/* Navigation */}
                                <div className="mt-6 flex justify-between">
                                    <button 
                                      onClick={handleBack} 
                                      disabled={currentStep === 0} 
                                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                                    >
                                      Back
                                    </button>
                                    {currentStep < steps.length - 1 ? (
                                        <button 
                                          onClick={handleNext} 
                                          className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                                          style={{ 
                                            backgroundColor: '#0000CC',
                                            fontFamily: 'Inter, sans-serif',
                                            fontWeight: 'bold'
                                          }}
                                        >
                                          Next
                                        </button>
                                    ) : (
                                        <button 
                                          onClick={() => onSubmit(formData)} 
                                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                                        >
                                          Submit
                                        </button>
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


// --- PROFILE SECTION COMPONENT ---
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
        setTimeout(fetchProfile, 1000);
    }, [dispatch]);


    const handleSave = async () => {
        if (editedProfile) {
            try {
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


    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: '#0000CC' }}
          ></div>
        </div>
      );
    }
    
    if (!profile || !editedProfile) {
      return (
        <div className="text-center py-12">
          <p 
            className="text-gray-500"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Failed to load profile data.
          </p>
        </div>
      );
    }


    return (
        <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: '#0000CC' }}>
            {/* Header Section */}
            <div className="p-6 flex justify-between items-center">
                <h2 
                  className="text-2xl text-white"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  Profile Information
                </h2>
                {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="flex items-center px-4 py-2 bg-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ 
                        color: '#0000CC',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 'bold'
                      }}
                    >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button 
                          onClick={handleSave} 
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </button>
                        <button 
                          onClick={handleCancel} 
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </button>
                    </div>
                )}
            </div>
            
            {/* Content Section */}
            <div className="bg-white p-6">
                <div className="flex items-center mb-8">
                    <div 
                      className="h-20 w-20 rounded-full flex items-center justify-center ring-4"
                      style={{ backgroundColor: '#E6E6FF', borderColor: '#0000CC' }}
                    >
                        <User className="h-10 w-10" style={{ color: '#0000CC' }} />
                    </div>
                    <div className="ml-6">
                        <h3 
                          className="text-xl"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 'bold',
                            color: '#0000CC'
                          }}
                        >
                          {profile.name}
                        </h3>
                        <p 
                          className="text-gray-700"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          {profile.designation}
                        </p>
                        <p 
                          className="text-sm text-gray-500"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          {profile.department}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1 */}
                    <div>
                        <label 
                          className="block text-sm font-medium text-gray-500 mb-1"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                        >
                          Full Name
                        </label>
                        {isEditing ? (
                            <input 
                              type="text" 
                              value={editedProfile.name} 
                              onChange={(e) => handleInputChange("name", e.target.value)} 
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                              style={{ 
                                fontFamily: 'Roboto, sans-serif',
                                borderColor: '#0000CC'
                              }}
                            />
                        ) : (
                            <p 
                              className="mt-1 font-semibold"
                              style={{ 
                                fontFamily: 'Roboto, sans-serif',
                                color: '#333'
                              }}
                            >
                              {profile.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label 
                          className="block text-sm font-medium text-gray-500 mb-1"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                        >
                          Email Address
                        </label>
                        {isEditing ? (
                            <input 
                              type="email" 
                              value={editedProfile.email} 
                              onChange={(e) => handleInputChange("email", e.target.value)} 
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            />
                        ) : (
                            <p 
                              className="mt-1 font-semibold"
                              style={{ 
                                fontFamily: 'Roboto, sans-serif',
                                color: '#333'
                              }}
                            >
                              {profile.email}
                            </p>
                        )}
                    </div>
                    <div>
                        <label 
                          className="block text-sm font-medium text-gray-500 mb-1"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                        >
                          Contact Number
                        </label>
                        {isEditing ? (
                            <input 
                              type="text" 
                              value={editedProfile.contact} 
                              onChange={(e) => handleInputChange("contact", e.target.value)} 
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            />
                        ) : (
                            <p 
                              className="mt-1 font-semibold"
                              style={{ 
                                fontFamily: 'Roboto, sans-serif',
                                color: '#333'
                              }}
                            >
                              {profile.contact}
                            </p>
                        )}
                    </div>

                    {/* Column 2 */}
                    <div>
                        <label 
                          className="block text-sm font-medium text-gray-500 mb-1"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                        >
                          Employee Code
                        </label>
                        <p 
                          className="mt-1 font-semibold"
                          style={{ 
                            fontFamily: 'Roboto, sans-serif',
                            color: '#333'
                          }}
                        >
                          {profile.employeeCode}
                        </p>
                    </div>
                    <div>
                        <label 
                          className="block text-sm font-medium text-gray-500 mb-1"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                        >
                          Designation
                        </label>
                        {isEditing ? (
                            <input 
                              type="text" 
                              value={editedProfile.designation} 
                              onChange={(e) => handleInputChange("designation", e.target.value)} 
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            />
                        ) : (
                            <p 
                              className="mt-1 font-semibold"
                              style={{ 
                                fontFamily: 'Roboto, sans-serif',
                                color: '#333'
                              }}
                            >
                              {profile.designation}
                            </p>
                        )}
                    </div>
                    <div>
                        <label 
                          className="block text-sm font-medium text-gray-500 mb-1"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                        >
                          Join Date
                        </label>
                        <p 
                          className="mt-1 font-semibold"
                          style={{ 
                            fontFamily: 'Roboto, sans-serif',
                            color: '#333'
                          }}
                        >
                          {new Date(profile.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- THE NEW PARENT COMPONENT FOR THE PROFILE PAGE ---
const ProfilePage = () => {
    const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);


    const handleOnboardingSubmit = (formData: OnboardingFormData) => {
        console.log("Onboarding data submitted:", formData);
        setIsOnboardingComplete(true);
        setIsFormOpen(false);
        alert("Onboarding details submitted successfully!");
    };


    return (
        <div 
          className="min-h-screen p-6 space-y-6"
          style={{ backgroundColor: '#FEF9F5' }}
        >
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
