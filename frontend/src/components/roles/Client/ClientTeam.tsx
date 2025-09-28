import React from 'react';
import { 
    User,
    Users,
    Paintbrush,
    Mic,
    Mail,
    Phone
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type Role = 'Digital Marketer' | 'Graphics Designer' | 'Content Strategist';

interface TeamMember {
    name: string;
    role: Role;
    avatarUrl: string;
}

interface BrandHead {
    name: string;
    avatarUrl: string;
    email: string;
}

interface Team {
    name: string;
    members: TeamMember[];
}

// --- MOCK DATA ---
const assignedBrandHead: BrandHead = {
    name: 'Anika Sharma',
    avatarUrl: 'https://placehold.co/100x100/f87171/ffffff?text=AS',
    email: 'anika.sharma@dotspeaks.com'
};

const assignedTeam: Team = {
    name: 'Alpha Squad',
    members: [
      { name: 'Rohan Sharma', role: 'Digital Marketer', avatarUrl: 'https://placehold.co/100x100/E9D5FF/7C3AED?text=RS' },
      { name: 'Priya Patel', role: 'Graphics Designer', avatarUrl: 'https://placehold.co/100x100/FECACA/DC2626?text=PP' },
      { name: 'Amit Singh', role: 'Content Strategist', avatarUrl: 'https://placehold.co/100x100/A7F3D0/059669?text=AS' },
    ],
};

const roleIcons: Record<Role, JSX.Element> = {
  'Digital Marketer': <User className="h-5 w-5 text-purple-600" />,
  'Graphics Designer': <Paintbrush className="h-5 w-5 text-red-600" />,
  'Content Strategist': <Mic className="h-5 w-5 text-green-600" />,
};


// --- MAIN COMPONENT ---
const AssignedTeamDashboard = () => {
    return (
        <div className=" min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900">Your Dedicated Team</h1>
                    <p className="mt-3 text-lg text-gray-600">Meet the experts from DotSpeaks who are committed to your brand's success.</p>
                </div>

                <div className="space-y-12">
                    {/* Brand Head Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600 inline-block">Your Primary Point of Contact</h2>
                        <div className="mt-4 bg-white p-8 rounded-lg shadow-lg border border-gray-200 flex items-center">
                            <img src={assignedBrandHead.avatarUrl} alt={assignedBrandHead.name} className="h-24 w-24 rounded-full ring-4 ring-blue-500"/>
                            <div className="ml-8">
                                <p className="text-3xl font-bold text-gray-900">{assignedBrandHead.name}</p>
                                <p className="text-md text-gray-500">Brand Head</p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="h-4 w-4 mr-2"/>
                                        <span>{assignedBrandHead.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Creative Team Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600 inline-block">Your Creative Team: {assignedTeam.name}</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {assignedTeam.members.map(member => (
                                <div key={member.name} className="bg-white rounded-lg shadow-sm border border-gray-200 text-center p-6 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <img src={member.avatarUrl} alt={member.name} className="h-20 w-20 rounded-full mx-auto mb-4"/>
                                    <p className="text-lg font-semibold text-gray-800">{member.name}</p>
                                    <div className="flex items-center justify-center mt-1">
                                        {roleIcons[member.role]}
                                        <p className="ml-2 text-sm text-gray-600">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignedTeamDashboard;
