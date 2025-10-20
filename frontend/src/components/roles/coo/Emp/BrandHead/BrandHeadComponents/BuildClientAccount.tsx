import React, { useState } from "react";
import {
  Building,
  Target,
  Users,
  Gem,
  CheckCircle,
  ChevronRight,
  MessageCircle,
  Globe,
  X,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../../redux/store";
import { api } from "../../../../../../utils/api/Employees/api";
import ToastNotification from "../../../../../ToastMessageComp";
// import { api } from '../../../../../../utils/api';

// --- HELPER COMPONENTS ---
const StepIndicator = ({ currentStep, steps }: any) => (
  <nav className="flex items-center justify-center" aria-label="Progress">
    <ol className="flex items-center space-x-4 md:space-x-8">
      {steps.map((step: any, index: any) => (
        <li key={step.name}>
          {index < currentStep ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="ml-2 text-sm font-medium hidden md:block">
                {step.name}
              </span>
            </div>
          ) : index === currentStep ? (
            <div
              className="flex items-center text-blue-600"
              aria-current="step"
            >
              <span className="relative flex h-6 w-6 items-center justify-center">
                <span className="absolute h-6 w-6 rounded-full bg-blue-200"></span>
                <span className="relative block h-3 w-3 rounded-full bg-blue-600"></span>
              </span>
              <span className="ml-2 text-sm font-medium hidden md:block">
                {step.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">
                {step.name}
              </span>
            </div>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const CheckboxGroup = ({ title, options, checkedOptions, onChange }: any) => (
  <div className="p-4 border rounded-lg">
    <label className="text-sm font-medium text-gray-900">{title}</label>
    <div className="mt-2 grid grid-cols-2 gap-2">
      {options.map((option: string) => (
        <label
          key={option}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={checkedOptions[option] || false}
            onChange={() => onChange(option)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const ClientOnboardingForm = () => {
  const initialFormData = {
    // Step 1: Company & Contact
    companyName: "",
    yearOfEstablishment: "",
    about: "",
    websiteUrl: "",
    industry: "",
    keyProducts: "",
    primaryContactPerson: "",
    positionTitle: "",
    emailAddress: "",
    contactNumber: "",
    // Step 2: Goals & Audience
    marketingGoals: {},
    timeline: "",
    targetAudience: "",
    // Step 3: Current Marketing
    currentMarketingActivities: {},
    socialMediaAccounts: {}, // Links removed
    // Step 4: Challenges & Competitors
    currentChallenges: "",
    competitors: [] as string[],
    // Step 5: Package
    selectedPackage: "",
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch();
  const [loading, setloading] = useState(false);

   const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "info",
      });

  const steps = [
    { name: "Company Info", icon: Building },
    { name: "Goals & Audience", icon: Target },
    { name: "Current Marketing", icon: Globe },
    { name: "Challenges", icon: MessageCircle },
    { name: "Package", icon: Gem },
  ];

  const marketingGoalOptions = [
    "Brand Awareness",
    "Lead Generation",
    "Customer Retention",
    "Website Traffic",
    "Product Launch",
  ];
  const marketingActivityOptions = [
    "Social Media Marketing",
    "Content Marketing",
    "Email Marketing",
    "Paid Advertising",
    "SEO",
  ];
  const socialMediaOptions = [
    "Facebook",
    "Instagram",
    "LinkedIn",
    "Twitter",
    "TikTok",
    "YouTube",
  ];
  const packageOptions = [
    { name: "Spark", desc: "For solopreneurs & small businesses." },
    { name: "Rise", desc: "For SMEs & D2C startups." },
    { name: "Scale", desc: "For B2B brands & funded startups." },
    { name: "Lead", desc: "For Retail chains & enterprises." },
    { name: "Signature", desc: "For Retail chains & enterprises." },
    { name: "Tailored", desc: "For custom enterprise needs." },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category: string, option: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [option]: !prev[category][option],
      },
    }));
  };

  // ✅ NEW: Validation function to check if the current step is complete
  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Company Info
        return (
          formData.companyName.trim() !== "" &&
          formData.websiteUrl.trim() !== "" &&
          formData.primaryContactPerson.trim() !== "" &&
          formData.emailAddress.trim() !== ""
        );
      case 1: // Goals & Audience
        // Ensures at least one marketing goal is checked
        return (
          Object.values(formData.marketingGoals).some((v) => v) &&
          formData.targetAudience.trim() !== ""
        );
      case 2: // Current Marketing - Optional
      case 3: // Challenges - Optional
        return true;
      case 4: // Package
        return formData.selectedPackage !== "";
      default:
        return false;
    }
  };

  const [currentCompetitor, setCurrentCompetitor] = useState("");

  // ✅ MODIFIED: handleSubmit now sends data to the backend
  const handleSubmit = async () => {
    if (!isStepValid()) {
      setToast({
        show: true,
        message: "Please complete all required fields before submitting.",
        type: "warning"
      });
      return;
    }
    setIsSubmitting(true);
    console.log("Submitting Onboarding Data:", formData);

    try {
      setloading(true)
      // await api.onboarding.createClient.post(accessToken, dispatch, formData);
      api.BrandHead.BuildClientAccount.post(accessToken, dispatch, formData);
      setToast({
        show: true,
        message: `Onboarding for "${formData.companyName}" has been successfully submitted!`,
        type: "success",
      });
      console.log(formData);
      setCurrentStep(0);
      setFormData(initialFormData);
    } catch (error: any) {
      console.error("Failed to submit onboarding form:", error);
      alert(`Error: ${error.message || "Could not submit form."}`);
      setToast({
        show: true,
        message: `Could not submit form. Please try again.`,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setloading(false);
    }
  };

    if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  

  const handleCompetitorKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // Prevent form submission on Enter
      const newCompetitor = currentCompetitor.trim();
      if (newCompetitor && !formData.competitors.includes(newCompetitor)) {
        setFormData((prev: any) => ({
          ...prev,
          competitors: [...prev.competitors, newCompetitor],
        }));
      }
      setCurrentCompetitor(""); // Clear the input
    }
  };

  const removeCompetitor = (competitorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      competitors: prev.competitors.filter((c) => c !== competitorToRemove),
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Company & Contact
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Company Name *"
              className="p-3 border rounded-lg"
            />
            <input
              name="yearOfEstablishment"
              value={formData.yearOfEstablishment}
              onChange={handleInputChange}
              placeholder="Year of Establishment"
              className="p-3 border rounded-lg"
            />
            <textarea
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              placeholder="About the Company"
              className="md:col-span-2 p-3 border rounded-lg"
              rows={3}
            ></textarea>
            <input
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleInputChange}
              placeholder="Website URL *"
              className="p-3 border rounded-lg"
            />
            <input
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              placeholder="Industry"
              className="p-3 border rounded-lg"
            />
            <textarea
              name="keyProducts"
              value={formData.keyProducts}
              onChange={handleInputChange}
              placeholder="Key Products or Services"
              className="md:col-span-2 p-3 border rounded-lg"
              rows={2}
            ></textarea>
            <input
              name="primaryContactPerson"
              value={formData.primaryContactPerson}
              onChange={handleInputChange}
              placeholder="Primary Contact Person *"
              className="p-3 border rounded-lg"
            />
            <input
              name="positionTitle"
              value={formData.positionTitle}
              onChange={handleInputChange}
              placeholder="Position / Title"
              className="p-3 border rounded-lg"
            />
            <input
              name="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={handleInputChange}
              placeholder="Email Address *"
              className="p-3 border rounded-lg"
            />
            <input
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="Contact Number"
              className="p-3 border rounded-lg"
            />
          </div>
        );
      case 1: // Goals & Audience
        return (
          <div className="space-y-4">
            <CheckboxGroup
              title="Primary Marketing Objectives *"
              options={marketingGoalOptions}
              checkedOptions={formData.marketingGoals}
              onChange={(option: string) =>
                handleCheckboxChange("marketingGoals", option)
              }
            />
            <input
              name="timeline"
              value={formData.timeline}
              onChange={handleInputChange}
              placeholder="Preferred timeline for seeing results?"
              className="w-full p-3 border rounded-lg"
            />
            <textarea
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              placeholder="Describe your target audience (age, gender, etc.) *"
              className="w-full p-3 border rounded-lg"
              rows={4}
            ></textarea>
          </div>
        );
      case 2: // Current Marketing
        return (
          <div className="space-y-6">
            <CheckboxGroup
              title="Current Marketing Activities"
              options={marketingActivityOptions}
              checkedOptions={formData.currentMarketingActivities}
              onChange={(option: string) =>
                handleCheckboxChange("currentMarketingActivities", option)
              }
            />
            <CheckboxGroup
              title="Which social media accounts do you have?"
              options={socialMediaOptions}
              checkedOptions={formData.socialMediaAccounts}
              onChange={(option: string) =>
                handleCheckboxChange("socialMediaAccounts", option)
              }
            />
          </div>
        );
      case 3: // Challenges
        return (
          <div className="space-y-6">
            <textarea
              name="currentChallenges"
              value={formData.currentChallenges}
              onChange={handleInputChange}
              placeholder="What challenges are you currently facing with your marketing?"
              className="w-full p-3 border rounded-lg"
              rows={5}
            />

            {/* ✅ NEW Tag-based input for competitors */}
            <div>
              <label className="text-sm font-medium text-gray-900">
                Who are your main competitors?
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Type a competitor and press Enter or Comma to add it as a tag.
              </p>
              <div className="p-3 border rounded-lg flex flex-wrap gap-2 items-center">
                {formData.competitors.map((competitor: string) => (
                  <div
                    key={competitor}
                    className="flex items-center bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full"
                  >
                    <span>{competitor}</span>
                    <button
                      onClick={() => removeCompetitor(competitor)}
                      className="ml-2 text-gray-500 hover:text-gray-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={currentCompetitor}
                  onChange={(e) => setCurrentCompetitor(e.target.value)}
                  onKeyDown={handleCompetitorKeyDown}
                  placeholder={
                    formData.competitors.length === 0
                      ? "Add competitors..."
                      : "Add another..."
                  }
                  className="flex-grow p-1 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
        );
      case 4: // Package
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              Choose Your Relevant Package *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packageOptions.map((pkg) => (
                <button
                  key={pkg.name}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      selectedPackage: pkg.name,
                    }))
                  }
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.selectedPackage === pkg.name
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                  <p className="text-sm text-gray-600">{pkg.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isFinalStep = currentStep === steps.length - 1;
  const canProceed = isStepValid();

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Client Onboarding Form
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Please provide the following details to help us understand your
        business.
      </p>

      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} steps={steps} />
        </div>

        <div className="min-h-[400px]">{renderStepContent()}</div>

        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0 || isSubmitting}
            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Back
          </button>

          <div className="flex-grow text-center">
            {!canProceed && !isFinalStep && (
              <p className="text-xs text-red-500">
                Please fill all required fields marked with *
              </p>
            )}
          </div>

          <button
            onClick={() =>
              isFinalStep ? handleSubmit() : setCurrentStep((s) => s + 1)
            }
            disabled={isSubmitting || !canProceed}
            className={`px-6 py-2 text-white font-semibold rounded-lg transition-colors flex items-center justify-center min-w-[150px] ${
              isFinalStep
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : isFinalStep ? (
              "Submit Onboarding"
            ) : (
              <>
                Next Step <ChevronRight className="inline h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientOnboardingForm;
