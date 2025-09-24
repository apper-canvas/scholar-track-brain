import React, { useState, useEffect } from "react";
import GradeEntryForm from "@/components/organisms/GradeEntryForm";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { studentService } from "@/services/api/studentService";
import { classService } from "@/services/api/classService";
import { gradeService } from "@/services/api/gradeService";
import { toast } from "react-toastify";

const Grades = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [studentsData, classesData, gradesData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll()
      ]);
      setStudents(studentsData);
      setClasses(classesData);
      setGrades(gradesData);
    } catch (err) {
      setError("Failed to load grades data. Please try again.");
      console.error("Grades loading error:", err);
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

  const handleGradeChange = async (studentId, assignment, score) => {
    try {
      const existingGrade = grades.find(g => 
        g.studentId === studentId && 
        g.assignment === assignment
      );

      const gradeData = {
        studentId,
        classId: selectedClass,
        assignment,
        score,
        maxScore: 100, // Default max score
        category: "Assignment",
        date: new Date().toISOString()
      };

      if (existingGrade) {
        await gradeService.update(existingGrade.Id, { ...gradeData, score });
      } else {
        await gradeService.create(gradeData);
      }

// Update local grades state
      setGrades(prev => {
        if (existingGrade) {
          return prev.map(g => g.Id === existingGrade.Id ? { ...g, score_c: score } : g);
        } else {
          const newGrade = { ...gradeData, Id: Date.now(), score_c: score }; // Temporary ID
          return [...prev, newGrade];
        }
      });

      toast.success("Grade updated successfully!");
    } catch (err) {
      toast.error("Failed to update grade. Please try again.");
      console.error("Grade update error:", err);
    }
  };

  const calculateClassAverage = (classId) => {
    const classGrades = grades.filter(g => g.classId === classId && g.score != null);
    if (classGrades.length === 0) return 0;
    const total = classGrades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0);
    return (total / classGrades.length).toFixed(1);
  };

  const getGradeDistribution = (classId) => {
    const classGrades = grades.filter(g => g.classId === classId && g.score != null);
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    
    classGrades.forEach(grade => {
      const percentage = (grade.score / grade.maxScore) * 100;
      if (percentage >= 90) distribution.A++;
      else if (percentage >= 80) distribution.B++;
      else if (percentage >= 70) distribution.C++;
      else if (percentage >= 60) distribution.D++;
      else distribution.F++;
    });

    return distribution;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <Loading rows={8} showHeader={true} />
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

  const selectedClassData = classes.find(c => c.Id === selectedClass);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Grade Management
        </h1>
        <p className="text-gray-600">
          Enter and manage student grades across all classes and assignments.
        </p>
      </div>

      {/* Class Overview Stats */}
      {selectedClass && selectedClassData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Class Average</p>
                <p className="text-2xl font-bold gradient-text">
                  {calculateClassAverage(selectedClass)}%
                </p>
              </div>
              <ApperIcon name="TrendingUp" className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold gradient-text">
                  {students.filter(s => s.status === "Active").length}
                </p>
              </div>
              <ApperIcon name="Users" className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold gradient-text">
                  {[...new Set(grades.filter(g => g.classId === selectedClass).map(g => g.assignment))].length}
                </p>
              </div>
              <ApperIcon name="FileText" className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grade Distribution</p>
                <div className="flex space-x-1 mt-1">
                  {Object.entries(getGradeDistribution(selectedClass)).map(([grade, count]) => (
                    count > 0 && (
                      <Badge 
                        key={grade} 
                        variant={grade === "A" ? "success" : grade === "F" ? "error" : "primary"}
                        size="sm"
                      >
                        {grade}: {count}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
              <ApperIcon name="BarChart3" className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Grade Entry Interface */}
      {classes.length === 0 ? (
        <Empty
          title="No classes available"
          description="You need to create classes before you can enter grades."
          icon="BookOpen"
          actionLabel="Go to Classes"
        />
) : students.filter(s => s.status_c === "Active" || s.status === "Active").length === 0 ? (
        <Empty
          title="No active students"
          description="You need active students to enter grades."
          icon="Users"
          actionLabel="Go to Students"
        />
      ) : (
        <GradeEntryForm
          students={students}
          classes={classes}
          selectedClass={selectedClass}
          onClassChange={handleClassChange}
          grades={grades}
          onGradeChange={handleGradeChange}
        />
      )}

      {/* Recent Grade Activity */}
      {grades.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Grade Entries
            </h3>
            <ApperIcon name="Clock" className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {grades
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 8)
              .map((grade) => {
const student = students.find(s => s.Id === grade.studentId);
                const cls = classes.find(c => c.Id === grade.classId);
                const percentage = ((grade.score / grade.maxScore) * 100).toFixed(1);
                
                return (
                  <div key={`${grade.Id}-${grade.date}`} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary-700">
{student ? `${(student.first_name_c || student.firstName)?.[0]}${(student.last_name_c || student.lastName)?.[0]}` : "??"}
                        </span>
                      </div>
                      <div>
<p className="text-sm font-medium text-gray-900">
                          {student ? `${student.first_name_c || student.firstName} ${student.last_name_c || student.lastName}` : "Unknown Student"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cls ? `${cls.name} - ${grade.assignment}` : grade.assignment}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {grade.score}/{grade.maxScore}
                      </p>
                      <Badge 
                        variant={
                          percentage >= 90 ? "success" :
                          percentage >= 80 ? "primary" :
                          percentage >= 70 ? "warning" : "error"
                        }
                        size="sm"
                      >
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Grades;