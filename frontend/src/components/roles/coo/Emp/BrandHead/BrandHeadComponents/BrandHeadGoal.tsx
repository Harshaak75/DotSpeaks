import { useState } from 'react';
import { 
    Target,
    Send,
    Plus,
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type Role = 'Digital Marketer' | 'Graphics Designer' | 'Content Strategist';

interface TeamMember {
    id: string;
    name: string;
    role: Role;
}

interface Team {
    id: string;
    name: string;
    members: TeamMember[];
}

interface DailyTask {
    id: number;
    description: string;
    dueDate: string;
    assignedTeamId: string | null;
    assignedMemberId: string | null;
}

interface WeeklyGoal {
    id: string;
    title: string;
    from: 'Project Manager';
}

// --- MOCK DATA ---
const projectManagerWeeklyGoal: WeeklyGoal = {
    id: 'wg-1',
    title: 'Finalize campaign creative concepts and ad copy for all platforms for Nexus Corp.',
    from: 'Project Manager'
};

const teams: Team[] = [
    { 
        id: 'team-alpha', 
        name: 'Alpha Squad', 
        members: [
            { id: 'emp-1', name: 'Rohan Sharma', role: 'Digital Marketer' },
            { id: 'emp-2', name: 'Priya Patel', role: 'Graphics Designer' },
            { id: 'emp-3', name: 'Amit Singh', role: 'Content Strategist' },
        ] 
    },
    { 
        id: 'team-bravo', 
        name: 'Bravo Unit',
        members: [
            { id: 'emp-4', name: 'Sneha Reddy', role: 'Digital Marketer' },
            { id: 'emp-5', name: 'Vikram Kumar', role: 'Graphics Designer' },
        ]
    },
];

const initialDailyTasks: DailyTask[] = [
    { id: 1, description: 'Draft 5 ad copy variations for the LinkedIn campaign.', dueDate: '2025-08-01', assignedTeamId: 'team-alpha', assignedMemberId: 'emp-3' },
    { id: 2, description: 'Create initial visual mockups for the Instagram posts.', dueDate: '2025-08-01', assignedTeamId: 'team-alpha', assignedMemberId: 'emp-2' },
];

// --- MAIN COMPONENT ---
const BrandHeadGoals = () => {
    const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(initialDailyTasks);
    const [planStatus, setPlanStatus] = useState<'Draft' | 'Sent'>('Draft');

    const handleTaskChange = (taskId: number, field: keyof DailyTask, value: string) => {
        setDailyTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === taskId) {
                    const updatedTask = { ...task, [field]: value };
                    // If team changes, reset the assigned member
                    if (field === 'assignedTeamId') {
                        updatedTask.assignedMemberId = null;
                    }
                    return updatedTask;
                }
                return task;
            })
        );
    };

    const addNewTask = () => {
        const newTask: DailyTask = {
            id: Date.now(),
            description: '',
            dueDate: '',
            assignedTeamId: null,
            assignedMemberId: null,
        };
        setDailyTasks([...dailyTasks, newTask]);
    };
    
    const handleSendPlan = () => {
        alert("Daily task plan has been sent to the team.");
        setPlanStatus('Sent');
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6" style={{ color: '#0000CC' }}>
                Brand Head: Goal Delegation
            </h1>

            {/* PM's Weekly Goal */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 mb-8" style={{ borderLeftColor: '#0000CC' }}>
                <div className="flex items-start">
                    <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#F0F0FF' }}>
                        <Target className="h-6 w-6" style={{ color: '#0000CC' }}/>
                    </div>
                    <div>
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Your Weekly Goal (from Project Manager)
                        </h2>
                        <p className="text-xl font-bold text-gray-800 mt-1">
                            {projectManagerWeeklyGoal.title}
                        </p>
                    </div>
                </div>
            </div>

            {/* Brand Head's Daily Task Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: '#0000CC' }}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Daily Task Breakdown</h2>
                        <p className="text-sm text-gray-500">
                            Break down the weekly goal into daily tasks and assign them to your team members.
                        </p>
                    </div>
                     <div className={`px-3 py-1 text-sm font-semibold rounded-full ${
                         planStatus === 'Draft' 
                             ? 'bg-yellow-100 text-yellow-800' 
                             : 'bg-green-100 text-green-800'
                     }`}>
                        {planStatus}
                    </div>
                </div>

                <div className="space-y-4">
                    {dailyTasks.map(task => {
                        const selectedTeam = teams.find(t => t.id === task.assignedTeamId);
                        return (
                            <div 
                                key={task.id} 
                                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start p-4 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors"
                            >
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500">
                                        Task Description
                                    </label>
                                    <textarea 
                                        value={task.description}
                                        onChange={(e) => handleTaskChange(task.id, 'description', e.target.value)}
                                        rows={2}
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">
                                        Due Date
                                    </label>
                                    <input 
                                        type="date"
                                        value={task.dueDate}
                                        onChange={(e) => handleTaskChange(task.id, 'dueDate', e.target.value)}
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">
                                        Assign Team
                                    </label>
                                    <select 
                                        value={task.assignedTeamId || ''}
                                        onChange={(e) => handleTaskChange(task.id, 'assignedTeamId', e.target.value)}
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                    >
                                        <option value="">Select Team...</option>
                                        {teams.map(team => (
                                            <option key={team.id} value={team.id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">
                                        Assign To
                                    </label>
                                    <select 
                                        value={task.assignedMemberId || ''}
                                        onChange={(e) => handleTaskChange(task.id, 'assignedMemberId', e.target.value)}
                                        disabled={!selectedTeam}
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{ '--tw-ring-color': '#0000CC' } as React.CSSProperties}
                                    >
                                        <option value="">Select Member...</option>
                                        {selectedTeam?.members.map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.name} ({member.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex justify-between items-center pt-6 border-t">
                    <button 
                        onClick={addNewTask}
                        className="flex items-center text-sm font-semibold hover:opacity-80 transition-opacity"
                        style={{ color: '#0000CC' }}
                    >
                        <Plus className="h-4 w-4 mr-2"/>
                        Add Another Task
                    </button>
                    <button 
                        onClick={handleSendPlan}
                        disabled={planStatus === 'Sent'}
                        className="flex items-center px-6 py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        style={planStatus === 'Sent' ? {} : { backgroundColor: '#0000CC' }}
                    >
                        <Send className="h-5 w-5 mr-2"/>
                        Send Daily Plan to Team
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrandHeadGoals;
