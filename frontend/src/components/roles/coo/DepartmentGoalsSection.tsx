import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Edit3,
  Users,
  Trash2,
} from "lucide-react";
import { api } from "../../../utils/api/Employees/api";
import { useDispatch, useSelector } from "react-redux";
import { selectAccessToken } from "../../../redux/slice/authSlice";


interface DepartmentGoal {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: "On Track" | "Behind" | "Completed" | "At Risk";
  progress: number;
  start_date: string;
  end_date: string;
  assigned_to: string;
  department: string;
  editable: boolean;
}


const DepartmentGoalsSection: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("Operations");
  const [goals, setGoals] = useState<DepartmentGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    priority: "High",
    start_date: "",
    end_date: "",
    assigned_to: "",
  });

  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();

  const departments = [
    "Operations",
    "Technology",
    "Marketing",
    "Finance",
    "Human Resources",
  ];

  useEffect(() => {
    fetchDepartmentGoals();
  }, [selectedDepartment]);

  const fetchDepartmentGoals = async () => {
    try {
      setLoading(true);
      const goalsData = await api.coo.goals.department(selectedDepartment, accessToken, dispatch);
      console.log("goal", goalsData);
      setGoals(goalsData);
    } catch (error) {
      console.error("Error fetching department goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    // All statuses now have white background with blue text
    return "bg-white";
  };

  const getPriorityColor = () => {
    // All priorities now have white background with blue text
    return "bg-white";
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

  const handleAddGoal = async () => {
    try {
      console.log(newGoal);
      if (newGoal.title && newGoal.description && newGoal.priority) {
        const goal = {
          ...newGoal,
          status: "On Track",
          progress: 0,
          department: selectedDepartment,
          editable: selectedDepartment == "Operations" ? true : false,
        };

        setLoading(true);

        let response;

        if (editingGoal) {
          response = await api.coo.goals.updateDepartmentGoal(
            editingGoal,
            goal,
            accessToken,
            dispatch
          );
        } else {
          response = await api.coo.goals.createDepartmentGoal(goal,accessToken,dispatch);
        }

        console.log("response from backend: ", response);

        if (response) {
          if (editingGoal) {
            setGoals(goals.map((g) => (g.id == editingGoal ? response : g)));
          } else {
            setGoals([...goals, response]);
          }
        }

        setNewGoal({
          title: "",
          description: "",
          priority: "High",
          start_date: "",
          end_date: "",
          assigned_to: "",
        });
        setShowAddForm(false);
        setEditingGoal(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goalId: string) => {
    const goalToEdit = goals.find((goal) => goal.id == goalId);

    if (goalToEdit) {
      setEditingGoal(goalId);
      setNewGoal({
        title: goalToEdit.title,
        description: goalToEdit.description,
        priority: goalToEdit.priority,
        start_date: goalToEdit.start_date,
        end_date: goalToEdit.end_date,
        assigned_to: goalToEdit.assigned_to,
      });
      setShowAddForm(true);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setLoading(true);
      if (editingGoal) {
        const response = await api.coo.goals.deleteDepartmentGoal(goalId, accessToken, dispatch);
        if (response?.success) {
          setGoals(goals.filter((g) => g.id !== goalId));
        }
        setShowAddForm(false);
        setEditingGoal(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen p-6 space-y-6"
      style={{ backgroundColor: '#FEF9F5' }}
    >
      <div className="flex justify-between items-center">
        <h1 
          className="text-3xl"
          style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontWeight: 'bold',
            color: '#0000CC'
          }}
        >
          Department Goals & Targets
        </h1>
        {selectedDepartment && (
          <button
            onClick={() => {
              setEditingGoal(null);
              setShowAddForm(true);
            }}
            className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: '#0000CC',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </button>
        )}
      </div>

      {/* Department Selector */}
      <div className="flex space-x-2 overflow-x-auto">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDepartment(dept)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedDepartment === dept
                ? "text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
            }`}
            style={selectedDepartment === dept ? { 
              backgroundColor: '#0000CC',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold'
            } : {
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            {dept}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div 
          className="rounded-xl shadow-lg overflow-hidden"
          style={{ backgroundColor: '#0000CC' }}
        >
          {/* Form Header */}
          <div className="p-6 flex items-center justify-between">
            <h3 
              className="text-xl text-white"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
            >
              {editingGoal ? "Edit Goal" : "Add New Goal"}
            </h3>
            {editingGoal && (
              <button
                onClick={() => handleDeleteGoal(editingGoal)}
                className="text-white hover:text-red-300 transition-colors"
                title="Delete this goal"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Form Content */}
          <div className="bg-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm mb-2 text-gray-700"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    fontFamily: 'Roboto, sans-serif',
                    borderColor: '#D1D5DB'
                  }}
                  placeholder="Enter goal title"
                />
              </div>
              <div>
                <label 
                  className="block text-sm mb-2 text-gray-700"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  Assigned To
                </label>
                <input
                  type="text"
                  value={newGoal.assigned_to}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, assigned_to: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                  placeholder="Enter assignee"
                />
              </div>
              <div className="md:col-span-2">
                <label 
                  className="block text-sm mb-2 text-gray-700"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                  rows={3}
                  placeholder="Enter goal description"
                />
              </div>
              <div>
                <label 
                  className="block text-sm mb-2 text-gray-700"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  Priority
                </label>
                <select
                  value={newGoal.priority}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      priority: e.target.value as "High" | "Medium" | "Low",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm mb-2 text-gray-700"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={newGoal.start_date}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, start_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm mb-2 text-gray-700"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={newGoal.end_date}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, end_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold',
                  color: '#666'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ 
                  backgroundColor: '#0000CC',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold'
                }}
              >
                {editingGoal ? "Save Changes" : "Add Goal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="rounded-xl shadow-lg overflow-hidden"
            style={{ backgroundColor: '#0000CC' }}
          >
            {/* Goal Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <Target className="h-5 w-5 text-white mr-2" />
                  <h3 
                    className="text-lg text-white"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}
                  >
                    {goal.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  {goal.editable && selectedDepartment === "Operations" && (
                    <button
                      onClick={() => handleEdit(goal.id)}
                      className="p-1 text-white hover:text-gray-200 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                  <span
                    className={`inline-flex px-3 py-1 text-xs rounded-lg ${getPriorityColor()}`}
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    {goal.priority}
                  </span>
                  <span
                    className={`inline-flex px-3 py-1 text-xs rounded-lg ${getStatusColor()}`}
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 'bold',
                      color: '#0000CC'
                    }}
                  >
                    {goal.status}
                  </span>
                </div>
              </div>

              <p 
                className="text-sm text-white mb-4"
                style={{ fontFamily: 'Roboto, sans-serif', opacity: 0.9 }}
              >
                {goal.description}
              </p>
            </div>

            {/* Goal Content */}
            <div className="bg-white p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Progress
                  </span>
                  <span 
                    className="font-medium"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${goal.progress}%`,
                      backgroundColor: '#0000CC'
                    }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Users 
                    className="h-4 w-4 mr-2"
                    style={{ color: '#0000CC' }}
                  />
                  <span 
                    className="text-gray-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Assigned to: {goal.assigned_to}
                  </span>
                </div>
                <span 
                  className="text-gray-600"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Due: {new Date(goal.end_date).toLocaleDateString()}
                </span>
              </div>

              {!goal.editable && (
                <div 
                  className="mt-3 text-xs px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: '#E6E6FF',
                    color: '#0000CC',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold'
                  }}
                >
                  Read-only goal
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Target 
            className="h-12 w-12 mx-auto mb-4"
            style={{ color: '#0000CC' }}
          />
          <p 
            className="text-gray-500"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            No goals found for {selectedDepartment} department
          </p>
        </div>
      )}
    </div>
  );
};

export default DepartmentGoalsSection;
