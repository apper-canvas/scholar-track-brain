import React, { useState } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Attendance from "@/components/pages/Attendance";

const AttendanceGrid = ({ 
  students, 
  selectedClass, 
  attendance, 
  onAttendanceChange,
  onClassChange,
  classes 
}) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const getAttendanceStatus = (studentId, date) => {
    const record = attendance.find(a => 
      a.studentId === studentId && 
      isSameDay(new Date(a.date), date)
    );
    return record ? record.status : "Present";
  };

  const handleAttendanceUpdate = (studentId, date, status) => {
    onAttendanceChange(studentId, date, status);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return "Check";
      case "Absent":
        return "X";
      case "Tardy":
        return "Clock";
      case "Excused":
        return "FileText";
      default:
        return "Check";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-success-100 text-success-800 border-success-200";
      case "Absent":
        return "bg-error-100 text-error-800 border-error-200";
      case "Tardy":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "Excused":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-success-100 text-success-800 border-success-200";
    }
  };

  const AttendanceButton = ({ studentId, date, currentStatus }) => {
    const statuses = ["Present", "Absent", "Tardy", "Excused"];
    const currentIndex = statuses.indexOf(currentStatus);
    
    const handleClick = () => {
      const nextIndex = (currentIndex + 1) % statuses.length;
      handleAttendanceUpdate(studentId, date, statuses[nextIndex]);
    };

    return (
      <button
        onClick={handleClick}
        className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${getStatusColor(currentStatus)}`}
        title={`${currentStatus} - Click to change`}
      >
        <ApperIcon 
          name={getStatusIcon(currentStatus)} 
          className="w-4 h-4 mx-auto" 
        />
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Class Selection and Week Navigation */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-sm">
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
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
            >
              <ApperIcon name="ChevronLeft" className="w-4 h-4 mr-1" />
              Previous Week
            </Button>
            <span className="text-sm font-medium text-gray-900">
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 4), "MMM d, yyyy")}
            </span>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
            >
              Next Week
              <ApperIcon name="ChevronRight" className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Attendance Grid */}
      {selectedClass && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">
                Weekly Attendance
              </h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-success-500 rounded"></div>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-error-500 rounded"></div>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-warning-500 rounded"></div>
                    <span>Tardy</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-500 rounded"></div>
                    <span>Excused</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase sticky left-0 bg-gray-50">
                    Student
                  </th>
                  {weekDays.map(day => (
                    <th key={day.toISOString()} className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                      <div>{format(day, "EEE")}</div>
                      <div className="text-gray-500">{format(day, "M/d")}</div>
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                    Week Summary
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
{students
                  .filter(student => student.status_c === "Active")
                  .map(student => {
                    const weekAttendance = weekDays.map(day => 
                      getAttendanceStatus(student.Id, day)
                    );
                    const presentDays = weekAttendance.filter(status => status === "Present").length;
                    const absentDays = weekAttendance.filter(status => status === "Absent").length;
                    
                    return (
                      <tr 
                        key={student.Id}
                        className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200"
                      >
<td className="px-6 py-4 sticky left-0 bg-white">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-semibold text-primary-700">
                                {student.first_name_c?.[0]}{student.last_name_c?.[0]}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.first_name_c} {student.last_name_c}
                            </div>
                          </div>
                        </td>
                        {weekDays.map(day => (
                          <td key={day.toISOString()} className="px-4 py-4 text-center">
                            <AttendanceButton
                              studentId={student.Id}
                              date={day}
                              currentStatus={getAttendanceStatus(student.Id, day)}
                            />
                          </td>
                        ))}
                        <td className="px-4 py-4 text-center">
                          <div className="space-y-1">
                            <Badge variant="success" size="sm">
                              {presentDays}/5 Present
                            </Badge>
                            {absentDays > 0 && (
                              <Badge variant="error" size="sm">
                                {absentDays} Absent
                              </Badge>
                            )}
                          </div>
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

export default AttendanceGrid;