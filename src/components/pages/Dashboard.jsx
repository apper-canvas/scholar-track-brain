import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { studentService } from "@/services/api/studentService";
import { classService } from "@/services/api/classService";
import { attendanceService } from "@/services/api/attendanceService";
import { format, isToday, subDays } from "date-fns";

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, classesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        attendanceService.getAll()
      ]);
      
      setStudents(studentsData);
      setClasses(classesData);
      setAttendance(attendanceData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>
        <Loading rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Error message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  // Calculate statistics
  const activeStudents = students.filter(s => s.status === "Active");
  const totalClasses = classes.length;
  
  // Today's attendance
  const todayAttendance = attendance.filter(a => 
    isToday(new Date(a.date))
  );
  const todayPresent = todayAttendance.filter(a => a.status === "Present").length;
  const attendanceRate = todayAttendance.length > 0 
    ? ((todayPresent / todayAttendance.length) * 100).toFixed(1)
    : 0;

  // Recent activity (last 7 days)
  const recentActivity = attendance
    .filter(a => {
      const date = new Date(a.date);
      const sevenDaysAgo = subDays(new Date(), 7);
      return date >= sevenDaysAgo;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const getActivityIcon = (status) => {
    switch (status) {
      case "Present":
        return "CheckCircle";
      case "Absent":
        return "XCircle";
      case "Tardy":
        return "Clock";
      default:
        return "FileText";
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case "Present":
        return "text-success-600";
      case "Absent":
        return "text-error-600";
      case "Tardy":
        return "text-warning-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening in your school today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={students.length}
          icon="Users"
          trend="up"
          trendValue={`${activeStudents.length} active`}
        />
        <StatCard
          title="Total Classes"
          value={totalClasses}
          icon="BookOpen"
          trend="up"
          trendValue="This semester"
        />
        <StatCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          icon="Calendar"
          trend={attendanceRate >= 90 ? "up" : "down"}
          trendValue={`${todayPresent}/${todayAttendance.length} present`}
        />
        <StatCard
          title="This Week"
          value={attendance.filter(a => {
            const date = new Date(a.date);
            const sevenDaysAgo = subDays(new Date(), 7);
            return date >= sevenDaysAgo;
          }).length}
          icon="Activity"
          trend="up"
          trendValue="attendance records"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <ApperIcon name="Clock" className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((record, index) => {
                const student = students.find(s => s.Id === record.studentId);
                return (
                  <div key={`${record.Id}-${index}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ApperIcon 
                        name={getActivityIcon(record.status)} 
                        className={`w-5 h-5 ${getActivityColor(record.status)}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(record.date), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={record.status.toLowerCase()}>
                      {record.status}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="Clock" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Student Status Overview
            </h3>
            <ApperIcon name="PieChart" className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Active Students</span>
              </div>
              <span className="text-lg font-bold text-success-700">
                {activeStudents.length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Graduated</span>
              </div>
              <span className="text-lg font-bold text-primary-700">
                {students.filter(s => s.status === "Graduated").length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Inactive</span>
              </div>
              <span className="text-lg font-bold text-gray-700">
                {students.filter(s => s.status === "Inactive").length}
              </span>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total Students</span>
                <span className="text-2xl font-bold gradient-text">
                  {students.length}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;