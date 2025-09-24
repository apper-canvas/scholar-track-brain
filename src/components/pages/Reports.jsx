import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import ActionButton from "@/components/molecules/ActionButton";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { studentService } from "@/services/api/studentService";
import { classService } from "@/services/api/classService";
import { gradeService } from "@/services/api/gradeService";
import { attendanceService } from "@/services/api/attendanceService";
import { toast } from "react-toastify";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Report filters
  const [selectedReport, setSelectedReport] = useState("student-progress");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [dateRange, setDateRange] = useState("month");
  
  // Generated report data
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [studentsData, classesData, gradesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);
      setStudents(studentsData);
      setClasses(classesData);
      setGrades(gradesData);
      setAttendance(attendanceData);
    } catch (err) {
      setError("Failed to load report data. Please try again.");
      console.error("Reports loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case "week":
        return subDays(now, 7);
      case "month":
        return startOfMonth(now);
      case "semester":
        return subDays(now, 120);
      default:
        return startOfMonth(now);
    }
  };

  const generateStudentProgressReport = (studentId) => {
    const student = students.find(s => s.Id === studentId);
    if (!student) return null;

    const studentGrades = grades.filter(g => g.studentId === studentId);
    const studentAttendance = attendance.filter(a => a.studentId === studentId);
    
    // Calculate overall GPA
    const gradesTotals = studentGrades.reduce((acc, grade) => {
      const percentage = (grade.score / grade.maxScore) * 100;
      acc.total += percentage;
      acc.count += 1;
      return acc;
    }, { total: 0, count: 0 });
    
    const overallGPA = gradesTotals.count > 0 ? (gradesTotals.total / gradesTotals.count).toFixed(2) : 0;
    
    // Calculate attendance rate
    const totalAttendance = studentAttendance.length;
    const presentDays = studentAttendance.filter(a => a.status === "Present").length;
    const attendanceRate = totalAttendance > 0 ? ((presentDays / totalAttendance) * 100).toFixed(1) : 0;
    
    // Get grades by class
    const gradesByClass = classes.map(cls => {
      const classGrades = studentGrades.filter(g => g.classId === cls.Id);
      const classAverage = classGrades.length > 0 ? 
        (classGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / classGrades.length).toFixed(1) : 0;
      
      return {
        className: cls.name,
        subject: cls.subject,
        grades: classGrades,
        average: classAverage
      };
    }).filter(c => c.grades.length > 0);

    return {
      student,
      overallGPA,
      attendanceRate,
      totalGrades: studentGrades.length,
      gradesByClass,
      recentAttendance: studentAttendance.slice(-10)
    };
  };

  const generateClassSummaryReport = (classId) => {
    const classData = classes.find(c => c.Id === classId);
    if (!classData) return null;

    const classGrades = grades.filter(g => g.classId === classId);
    const classAttendance = attendance.filter(a => a.classId === classId);
    
    // Get enrolled students
    const enrolledStudents = students.filter(s => s.status === "Active");
    
    // Calculate class statistics
    const studentStats = enrolledStudents.map(student => {
      const studentGrades = classGrades.filter(g => g.studentId === student.Id);
      const studentAttendance = classAttendance.filter(a => a.studentId === student.Id);
      
      const average = studentGrades.length > 0 ? 
        (studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / studentGrades.length).toFixed(1) : 0;
      
      const attendanceRate = studentAttendance.length > 0 ? 
        ((studentAttendance.filter(a => a.status === "Present").length / studentAttendance.length) * 100).toFixed(1) : 0;
      
      return {
        ...student,
        average: parseFloat(average),
        attendanceRate: parseFloat(attendanceRate)
      };
    });

    // Calculate class averages
    const classAverage = studentStats.length > 0 ? 
      (studentStats.reduce((sum, s) => sum + s.average, 0) / studentStats.length).toFixed(1) : 0;
    
    const classAttendanceRate = studentStats.length > 0 ? 
      (studentStats.reduce((sum, s) => sum + s.attendanceRate, 0) / studentStats.length).toFixed(1) : 0;

    return {
      classData,
      classAverage,
      classAttendanceRate,
      totalStudents: enrolledStudents.length,
      studentStats: studentStats.sort((a, b) => b.average - a.average)
    };
  };

  const generateAttendanceReport = () => {
    const dateFilter = getDateRangeFilter();
    const filteredAttendance = attendance.filter(a => new Date(a.date) >= dateFilter);
    
    const attendanceStats = students
      .filter(s => s.status === "Active")
      .map(student => {
        const studentAttendance = filteredAttendance.filter(a => a.studentId === student.Id);
        const present = studentAttendance.filter(a => a.status === "Present").length;
        const absent = studentAttendance.filter(a => a.status === "Absent").length;
        const tardy = studentAttendance.filter(a => a.status === "Tardy").length;
        const total = studentAttendance.length;
        
        return {
          ...student,
          present,
          absent,
          tardy,
          total,
          attendanceRate: total > 0 ? ((present / total) * 100).toFixed(1) : 0
        };
      })
      .sort((a, b) => parseFloat(a.attendanceRate) - parseFloat(b.attendanceRate));

    return {
      dateRange,
      totalRecords: filteredAttendance.length,
      attendanceStats
    };
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      let data = null;
      
      switch (selectedReport) {
        case "student-progress":
          if (!selectedStudent) {
            toast.error("Please select a student for the progress report.");
            return;
          }
          data = generateStudentProgressReport(selectedStudent);
          break;
        case "class-summary":
          if (!selectedClass) {
            toast.error("Please select a class for the summary report.");
            return;
          }
          data = generateClassSummaryReport(selectedClass);
          break;
        case "attendance-overview":
          data = generateAttendanceReport();
          break;
        default:
          toast.error("Please select a report type.");
          return;
      }
      
      setReportData(data);
      toast.success("Report generated successfully!");
    } catch (err) {
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExportReport = () => {
    if (!reportData) return;
    
    // Simple text export for demonstration
    const exportData = JSON.stringify(reportData, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedReport}-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report exported successfully!");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-600">
          Generate comprehensive reports on student progress, class performance, and attendance.
        </p>
      </div>

      {/* Report Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Report Configuration
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <FormField
            label="Report Type"
            type="select"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            required
          >
            <option value="student-progress">Student Progress Report</option>
            <option value="class-summary">Class Summary Report</option>
            <option value="attendance-overview">Attendance Overview</option>
          </FormField>
          
          {selectedReport === "student-progress" && (
            <FormField
              label="Select Student"
              type="select"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              <option value="">Choose a student</option>
              {students.filter(s => s.status === "Active").map(student => (
                <option key={student.Id} value={student.Id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </FormField>
          )}
          
          {selectedReport === "class-summary" && (
            <FormField
              label="Select Class"
              type="select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.Id} value={cls.Id}>
                  {cls.name} - {cls.subject}
                </option>
              ))}
            </FormField>
          )}
          
          {selectedReport === "attendance-overview" && (
            <FormField
              label="Date Range"
              type="select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">This Month</option>
              <option value="semester">This Semester</option>
            </FormField>
          )}
          
          <div className="flex items-end">
            <ActionButton
              icon="BarChart3"
              onClick={handleGenerateReport}
              disabled={generatingReport}
              variant="primary"
              className="w-full"
            >
              {generatingReport ? "Generating..." : "Generate Report"}
            </ActionButton>
          </div>
        </div>
      </Card>

      {/* Report Display */}
      {reportData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedReport === "student-progress" && "Student Progress Report"}
              {selectedReport === "class-summary" && "Class Summary Report"}
              {selectedReport === "attendance-overview" && "Attendance Overview Report"}
            </h3>
            <div className="flex space-x-4">
              <ActionButton
                icon="Download"
                onClick={handleExportReport}
                variant="secondary"
                size="sm"
              >
                Export Report
              </ActionButton>
              <ActionButton
                icon="Printer"
                onClick={() => window.print()}
                variant="secondary"
                size="sm"
              >
                Print Report
              </ActionButton>
            </div>
          </div>
          
          {/* Student Progress Report */}
          {selectedReport === "student-progress" && reportData && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {reportData.student.firstName} {reportData.student.lastName}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Overall GPA</p>
                    <p className="text-2xl font-bold gradient-text">{reportData.overallGPA}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                    <p className="text-2xl font-bold text-success-600">{reportData.attendanceRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Assignments</p>
                    <p className="text-2xl font-bold text-primary-600">{reportData.totalGrades}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Grades by Class</h5>
                <div className="space-y-4">
                  {reportData.gradesByClass.map((classData, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="font-medium text-gray-900">
                          {classData.className} - {classData.subject}
                        </h6>
                        <Badge 
                          variant={
                            classData.average >= 90 ? "success" :
                            classData.average >= 80 ? "primary" :
                            classData.average >= 70 ? "warning" : "error"
                          }
                        >
                          {classData.average}% Average
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {classData.grades.length} assignment{classData.grades.length !== 1 ? "s" : ""} completed
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Class Summary Report */}
          {selectedReport === "class-summary" && reportData && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {reportData.classData.name} - {reportData.classData.subject}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Class Average</p>
                    <p className="text-2xl font-bold gradient-text">{reportData.classAverage}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Class Attendance</p>
                    <p className="text-2xl font-bold text-success-600">{reportData.classAttendanceRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Enrolled Students</p>
                    <p className="text-2xl font-bold text-primary-600">{reportData.totalStudents}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Student Performance</h5>
                <div className="space-y-2">
                  {reportData.studentStats.slice(0, 10).map((student) => (
                    <div key={student.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary-700">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge 
                          variant={
                            student.average >= 90 ? "success" :
                            student.average >= 80 ? "primary" :
                            student.average >= 70 ? "warning" : "error"
                          }
                        >
                          {student.average}% Grade
                        </Badge>
                        <Badge variant="primary">
                          {student.attendanceRate}% Attendance
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Attendance Overview Report */}
          {selectedReport === "attendance-overview" && reportData && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Attendance Overview - {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}
                </h4>
                <p className="text-sm text-gray-600">
                  Total Records: {reportData.totalRecords}
                </p>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Student Attendance Rates</h5>
                <div className="space-y-2">
                  {reportData.attendanceStats.map((student) => (
                    <div key={student.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary-700">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-success-600 font-medium">
                          {student.present} Present
                        </span>
                        <span className="text-error-600 font-medium">
                          {student.absent} Absent
                        </span>
                        <Badge 
                          variant={
                            student.attendanceRate >= 95 ? "success" :
                            student.attendanceRate >= 85 ? "primary" :
                            student.attendanceRate >= 75 ? "warning" : "error"
                          }
                        >
                          {student.attendanceRate}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Reports;