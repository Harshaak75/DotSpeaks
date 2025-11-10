import express from "express";
const router = express.Router();
import supabase from "../config/supabase";
import { authenticate_user } from "../middleware/authMiddleware";

// COO Profile
router.get("/profile", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", req.user?.user_id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update COO Profile
router.put("/profile", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(req.body)
      .eq("employee_code", "COO001")
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// COO Attendance
router.get("/attendance", authenticate_user, async (req, res) => {
  try {
    // Get profile first to get user_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("employee_code", "COO001")
      .single();

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get attendance data
    const { data: attendanceData, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", profile.id)
      .order("date", { ascending: false })
      .limit(30);

    if (error) throw error;

    // Calculate summary statistics
    const totalDays = attendanceData.length;
    const presentDays = attendanceData.filter(
      (a: any) => a.status === "Present"
    ).length;
    const absentDays = attendanceData.filter(
      (a: any) => a.status === "Absent"
    ).length;
    const leaveDays = attendanceData.filter((a: any) => a.status === "Leave").length;
    const totalHours = attendanceData.reduce(
      (sum: any, a: any) => sum + (a.hours_worked || 0),
      0
    );

    const response = {
      dailyAttendance: attendanceData.map((record: any) => ({
        date: record.date,
        login: record.login_time || "-",
        logout: record.logout_time || "-",
        status: record.status,
        hours: record.hours_worked || 0,
      })),
      leaveSummary: {
        totalLeaves: 25,
        usedLeaves: leaveDays,
        remainingLeaves: 25 - leaveDays,
        pendingRequests: 2,
      },
      monthlyStats: {
        presentDays,
        absentDays,
        leaveDays,
        totalWorkingDays: totalDays,
        totalHours: Math.round(totalHours * 10) / 10,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance data" });
  }
});

// Company Goals
router.get("/goals/company", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("company_goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedData = data.map((goal: any) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      target: `${goal.progress}%`,
      current: `${goal.progress}%`,
      progress: goal.progress,
      deadline: goal.end_date,
      status: goal.status,
      owner: goal.owner,
      category: goal.category,
      priority: goal.priority,
      department: goal.department,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching company goals:", error);
    res.status(500).json({ error: "Failed to fetch company goals" });
  }
});

// Department Goals
router.get("/goals/department", authenticate_user, async (req, res) => {
  try {
    const department = req.query.department || "Operations";

    const { data, error } = await supabase
      .from("department_goals")
      .select("*")
      .eq("department", department)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedData = data.map((goal: any) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      target: `${goal.progress}%`,
      current: `${goal.progress}%`,
      progress: goal.progress,
      end_date: goal.end_date,
      status: goal.status,
      priority: goal.priority,
      assigned_to: goal.assigned_to,
      editable: goal.editable,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching department goals:", error);
    res.status(500).json({ error: "Failed to fetch department goals" });
  }
});

// Create Department Goal
router.post("/goals/department", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("department_goals")
      .insert([
        {
          ...req.body,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(data);

    res.json(data);
  } catch (error) {
    console.error("Error creating department goal:", error);
    res.status(500).json({ error: "Failed to create department goal" });
  }
});

router.put(
  "/goals/updateDepartmentGoal/:goalId",
  authenticate_user,
  async (req, res) => {
    const { goalId } = req.params; // Get the goalId from the URL
    const goal = req.body; // Get the goal data from the body

    try {
      const { data, error } = await supabase
        .from("department_goals")
        .update({
          ...goal, // Update the goal with the provided data
        })
        .eq("id", goalId) // Make sure the goalId matches
        .select()
        .single(); // Ensure only one goal is updated

      if (error) throw error;

      res.json(data); // Return the updated goal
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ error: "Failed to update goal" });
    }
  }
);

router.delete(
  "/goals/deleteDepartmentGoal/:goalId",
  authenticate_user,
  async (req, res) => {
    const { goalId } = req.params;

    try {
      const { data, error } = await supabase
        .from("department_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;

      return res.json({ success: true, message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      return res
        .status(500)
        .json({ success: false, error: "Failed to delete goal" });
    }
  }
);

// Reports
router.get("/reports", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;

    const formattedData = data.map((report: any) => ({
      id: report.id,
      title: report.title,
      type: report.type,
      date: report.date,
      status: report.status,
      fileUrl: "#",
      summary: report.summary || {},
      uploadedBy: report.uploaded_by,
      fileSize: report.file_size,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Upload Report
router.post("/reports", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error uploading report:", error);
    res.status(500).json({ error: "Failed to upload report" });
  }
});

// Calendar/Meetings
router.get("/calendar", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;

    const formattedData = data.map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      time: `${meeting.time} (${meeting.duration})`,
      participants: meeting.participants || [],
      location: meeting.location,
      type: meeting.type,
      status: meeting.status,
      agenda: meeting.agenda,
      organizer: meeting.organizer,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching calendar:", error);
    res.status(500).json({ error: "Failed to fetch calendar data" });
  }
});

// Create Meeting
router.post("/calendar", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
});

// Legal Documents
router.get("/documents", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("last_modified", { ascending: false });

    if (error) throw error;

    const formattedData = data.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      date: doc.last_modified,
      status: "Active",
      fileUrl: doc.download_url,
      description: doc.description,
      category: doc.category,
      size: doc.size,
      confidentiality: doc.confidentiality,
      version: doc.version,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// Tutorials
router.get("/tutorials", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedData = data.map((tutorial: any) => ({
      id: tutorial.id,
      title: tutorial.title,
      category: tutorial.category,
      type: tutorial.type,
      duration: tutorial.duration,
      progress: tutorial.is_watched ? 100 : 0,
      status: tutorial.is_watched ? "Completed" : "Not Started",
      url: tutorial.url,
      description: tutorial.description,
      instructor: tutorial.instructor,
      thumbnailUrl: tutorial.thumbnail_url,
      lastUpdated: tutorial.last_updated,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching tutorials:", error);
    res.status(500).json({ error: "Failed to fetch tutorials" });
  }
});

// Update Tutorial Watch Status
router.put("/tutorials/:id", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tutorials")
      .update({ is_watched: req.body.is_watched })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error updating tutorial:", error);
    res.status(500).json({ error: "Failed to update tutorial" });
  }
});

// Team Members
router.get("/team-members", authenticate_user, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("reports_to", "COO")
      .order("name", { ascending: true });

    if (error) throw error;

    const formattedData = data.map((member: any) => ({
      id: member.id,
      name: member.name,
      title: member.position,
      email: member.email,
      phone: member.phone,
      department: member.department,
      joinDate: member.join_date,
      currentProjects: member.current_projects || [],
      skills: member.skills || [],
      performance: "Excellent",
      avatar: member.avatar,
      status: member.status,
      location: member.location,
      directReports: member.direct_reports,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

export default router;
