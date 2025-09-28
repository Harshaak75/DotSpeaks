import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Edit3,
  Save,
  X,
  Users,
  Trash,
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

interface Department {
  id: string;
  name: string;
  head: string;
  accessible: boolean;
}

const DepartmentGoalsSection: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("Operations");
  const [goals, setGoals] = useState<DepartmentGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "on track":
        return "bg-blue-100 text-blue-800";
      case "behind":
        return "bg-yellow-100 text-yellow-800";
      case "at risk":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    // setEditingGoal(goalId)
    const goalToEdit = goals.find((goal) => goal.id == goalId);

    if (goalToEdit) {
      setEditingGoal(goalId); // Set the ID of the goal being edited
      setNewGoal({
        title: goalToEdit.title,
        description: goalToEdit.description,
        priority: goalToEdit.priority,
        start_date: goalToEdit.start_date,
        end_date: goalToEdit.end_date,
        assigned_to: goalToEdit.assigned_to,
      });
      setShowAddForm(true); // Show the form to edit
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Department Goals & Targets
        </h2>
        {selectedDepartment && (
          <button
            onClick={() => {
              setEditingGoal(null);
              setShowAddForm(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedDepartment === dept
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Delete icon row (only visible while editing) */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingGoal ? "Save Goal" : "Add New Goal"}
            </h3>

            {editingGoal && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => handleDeleteGoal(editingGoal)} // You'll define this function
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Delete this goal"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter goal title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <input
                type="text"
                value={newGoal.assigned_to}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, assigned_to: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter assignee"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter goal description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={newGoal.start_date}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, start_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={newGoal.end_date}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, end_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddGoal}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingGoal ? "Save Changes" : "Add Goal"}
            </button>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {goal.title}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {goal.editable && selectedDepartment === "Operations" && (
                  <button
                    onClick={() => handleEdit(goal.id)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                    goal.priority
                  )}`}
                >
                  {goal.priority}
                </span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    goal.status
                  )}`}
                >
                  {goal.status}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{goal.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Assigned to: {goal.assigned_to}
                </span>
              </div>
              <span className="text-gray-600">
                Due: {new Date(goal.end_date).toLocaleDateString()}
              </span>
            </div>

            {!goal.editable && (
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                Read-only goal
              </div>
            )}
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No goals found for {selectedDepartment} department
          </p>
        </div>
      )}
    </div>
  );
};

export default DepartmentGoalsSection;
