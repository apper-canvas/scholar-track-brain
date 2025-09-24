import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import ActionButton from "@/components/molecules/ActionButton";
import Badge from "@/components/atoms/Badge";

const GradeEntryForm = ({ 
  students, 
  classes, 
  selectedClass, 
  onClassChange, 
  grades, 
  onGradeChange 
}) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [newAssignment, setNewAssignment] = useState({
    name: "",
    category: "Homework",
    maxScore: 100
  });

  useEffect(() => {
    // Simulate loading assignments for selected class
    if (selectedClass) {
      const classAssignments = [
        { id: "1", name: "Quiz 1", category: "Quiz", maxScore: 25 },
        { id: "2", name: "Homework 1", category: "Homework", maxScore: 50 },
        { id: "3", name: "Midterm Exam", category: "Exam", maxScore: 100 },
        { id: "4", name: "Project 1", category: "Project", maxScore: 75 }
      ];
      setAssignments(classAssignments);
    }
  }, [selectedClass]);

  const handleGradeUpdate = (studentId, score) => {
    if (selectedAssignment && score !== "") {
      onGradeChange(studentId, selectedAssignment, parseFloat(score));
    }
  };

  const calculateLetterGrade = (percentage) => {
    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 65) return "D";
    return "F";
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "warning";
    return "error";
  };

  return (
    <div className="space-y-6">
      {/* Class and Assignment Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Grade Entry
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Select Class"
            type="select"
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            required
          >
            <option value="">Choose a class</option>
            {classes.map(cls => (
              <option key={cls.Id} value={cls.Id}>
                {cls.name} - {cls.subject}
              </option>
            ))}
          </FormField>
          
          <FormField
            label="Select Assignment"
            type="select"
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            required
          >
            <option value="">Choose an assignment</option>
            {assignments.map(assignment => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.name} ({assignment.maxScore} pts)
              </option>
            ))}
          </FormField>
        </div>
      </Card>

      {/* Grade Entry Table */}
      {selectedClass && selectedAssignment && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h4 className="text-lg font-semibold text-gray-900">
              Student Grades - {assignments.find(a => a.id === selectedAssignment)?.name}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                    Percentage
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                    Letter Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students
                  .filter(student => student.status === "Active")
                  .map(student => {
                    const grade = grades.find(g => 
                      g.studentId === student.Id && 
                      g.assignment === selectedAssignment
                    );
                    const score = grade ? grade.score : "";
                    const maxScore = assignments.find(a => a.id === selectedAssignment)?.maxScore || 100;
                    const percentage = score ? ((score / maxScore) * 100) : 0;
                    
                    return (
                      <tr 
                        key={student.Id}
                        className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-semibold text-primary-700">
                                {student.firstName[0]}{student.lastName[0]}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max={maxScore}
                            value={score}
                            onChange={(e) => handleGradeUpdate(student.Id, e.target.value)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500 ml-1">
                            / {maxScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {score ? `${percentage.toFixed(1)}%` : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {score ? (
                            <Badge variant={getGradeColor(percentage)}>
                              {calculateLetterGrade(percentage)}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GradeEntryForm;