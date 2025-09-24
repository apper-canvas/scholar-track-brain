import React, { useState, useEffect } from "react";
import AttendanceGrid from "@/components/organisms/AttendanceGrid";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { studentService } from "@/services/api/studentService";
import { classService } from "@/services/api/classService";
import { attendanceService } from "@/services/api/attendanceService";
import { toast } from "react-toastify";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const loadData = async () => {
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
      setError("Failed to load attendance data. Please try again.");
      console.error("Attendance loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
  };

  const handleAttendanceChange = async (studentId, date, status) => {
    try {
      const existingRecord = attendance.find(a => 
a.studentId === studentId && 
        format(new Date(a.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );

      const attendanceData = {
studentId,
        classId: selectedClass,
        date: date.toISOString(),
        status,
        notes: ""
      };

      if (existingRecord) {
        await attendanceService.update(existingRecord.Id, { ...attendanceData, status });
        setAttendance(prev => 
          prev.map(a => a.Id === existingRecord.Id ? { ...a, status } : a)
        );
      } else {
        const newRecord = await attendanceService.create(attendanceData);
        setAttendance(prev => [...prev, newRecord]);
      }

      toast.success("Attendance updated successfully!");
    } catch (err) {
      toast.error("Failed to update attendance. Please try again.");
      console.error("Attendance update error:", err);
    }
  };

  const getWeeklyStats = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    
    const weeklyAttendance = attendance.filter(a => {
      const date = new Date(a.date);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });

    const totalRecords = weeklyAttendance.length;
    const presentCount = weeklyAttendance.filter(a => a.status === "Present").length;
    const absentCount = weeklyAttendance.filter(a => a.status === "Absent").length;
    const tardyCount = weeklyAttendance.filter(a => a.status === "Tardy").length;
    
    return {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      tardy: tardyCount,
      attendanceRate: totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0
    };
  };

  const getStudentAttendanceSummary = () => {
    const activeStudents = students.filter(s => s.status === "Active");
    return activeStudents.map(student => {
const studentAttendance = attendance.filter(a => a.studentId === student.Id);
      const totalDays = studentAttendance.length;
      const presentDays = studentAttendance.filter(a => a.status === "Present").length;
      const absentDays = studentAttendance.filter(a => a.status === "Absent").length;
      
      return {
        ...student,
        totalDays,
        presentDays,
        absentDays,
        attendanceRate: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0
      };
    }).sort((a, b) => parseFloat(a.attendanceRate) - parseFloat(b.attendanceRate));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
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
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  const weeklyStats = getWeeklyStats();
  const studentSummaries = getStudentAttendanceSummary();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Attendance Tracking
        </h1>
        <p className="text-gray-600">
          Track daily attendance and monitor student presence patterns.
        </p>
      </div>

      {/* Weekly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold gradient-text">
                {weeklyStats.attendanceRate}%
              </p>
            </div>
            <ApperIcon name="TrendingUp" className="w-8 h-8 text-success-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-success-600">
                {weeklyStats.present}
              </p>
            </div>
            <ApperIcon name="CheckCircle" className="w-8 h-8 text-success-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-error-600">
                {weeklyStats.absent}
              </p>
            </div>
            <ApperIcon name="XCircle" className="w-8 h-8 text-error-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tardy</p>
              <p className="text-2xl font-bold text-warning-600">
                {weeklyStats.tardy}
              </p>
            </div>
            <ApperIcon name="Clock" className="w-8 h-8 text-warning-600" />
          </div>
        </Card>
      </div>

      {/* Attendance Grid */}
      {classes.length === 0 ? (
        <Empty
          title="No classes available"
          description="You need to create classes before you can track attendance."
          icon="BookOpen"
          actionLabel="Go to Classes"
        />
      ) : students.filter(s => s.status === "Active").length === 0 ? (
        <Empty
          title="No active students"
          description="You need active students to track attendance."
          icon="Users"
          actionLabel="Go to Students"
        />
      ) : (
        <AttendanceGrid
          students={students}
          selectedClass={selectedClass}
          attendance={attendance}
          onAttendanceChange={handleAttendanceChange}
          onClassChange={handleClassChange}
          classes={classes}
        />
      )}

      {/* Student Attendance Summary */}
      {students.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Student Attendance Summary
            </h3>
            <ApperIcon name="Users" className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentSummaries.slice(0, 9).map((student) => (
              <div key={student.Id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary-700">
{student.first_name_c?.[0]}{student.last_name_c?.[0]}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
{student.first_name_c} {student.last_name_c}
                    </span>
                  </div>
                  <Badge 
                    variant={
                      student.attendanceRate >= 95 ? "success" :
                      student.attendanceRate >= 85 ? "primary" :
                      student.attendanceRate >= 75 ? "warning" : "error"
                    }
                    size="sm"
                  >
                    {student.attendanceRate}%
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Present:</span>
                    <span className="text-success-600 font-medium">{student.presentDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absent:</span>
                    <span className="text-error-600 font-medium">{student.absentDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{student.totalDays} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Attendance;