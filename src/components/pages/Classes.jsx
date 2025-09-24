import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import ActionButton from "@/components/molecules/ActionButton";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { classService } from "@/services/api/classService";
import { studentService } from "@/services/api/studentService";
import { toast } from "react-toastify";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list or grid

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    teacher: "",
    schedule: {
      days: [],
      startTime: "",
      endTime: "",
      room: ""
    },
    gradeWeights: {
      homework: 30,
      quizzes: 20,
      exams: 40,
      projects: 10
    },
    students: []
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [classesData, studentsData] = await Promise.all([
        classService.getAll(),
        studentService.getAll()
      ]);
      setClasses(classesData);
      setStudents(studentsData);
      setFilteredClasses(classesData);
    } catch (err) {
      setError("Failed to load classes. Please try again.");
      console.error("Classes loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter classes based on search and filters
  useEffect(() => {
    let filtered = classes;

    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter !== "all") {
      filtered = filtered.filter(cls => cls.subject.toLowerCase() === subjectFilter);
    }

    setFilteredClasses(filtered);
  }, [classes, searchTerm, subjectFilter]);

  const handleAddClass = () => {
    setSelectedClass(null);
    setFormData({
      name: "",
      subject: "",
      teacher: "",
      schedule: {
        days: [],
        startTime: "",
        endTime: "",
        room: ""
      },
      gradeWeights: {
        homework: 30,
        quizzes: 20,
        exams: 40,
        projects: 10
      },
      students: []
    });
    setIsModalOpen(true);
  };

  const handleEditClass = (cls) => {
    setSelectedClass(cls);
    setFormData({
      name: cls.name || "",
      subject: cls.subject || "",
      teacher: cls.teacher || "",
      schedule: cls.schedule || {
        days: [],
        startTime: "",
        endTime: "",
        room: ""
      },
      gradeWeights: cls.gradeWeights || {
        homework: 30,
        quizzes: 20,
        exams: 40,
        projects: 10
      },
      students: cls.students || []
    });
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await classService.delete(classId);
        toast.success("Class deleted successfully!");
        loadData();
      } catch (err) {
        toast.error("Failed to delete class. Please try again.");
      }
    }
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      if (selectedClass) {
        await classService.update(selectedClass.Id, formData);
        toast.success("Class updated successfully!");
      } else {
        await classService.create(formData);
        toast.success("Class added successfully!");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(selectedClass ? "Failed to update class." : "Failed to add class.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const subjects = [...new Set(classes.map(cls => cls.subject))];
  const getEnrollmentCount = (classId) => {
    const cls = classes.find(c => c.Id === classId);
    return cls?.students?.length || 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <Loading rows={6} showHeader={true} />
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
          Class Management
        </h1>
        <p className="text-gray-600">
          Manage classes, schedules, and student enrollments.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search classes..."
            className="flex-1 max-w-md"
          />
          
          <div className="flex gap-4">
            <FormField
              type="select"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject.toLowerCase()}>
                  {subject}
                </option>
              ))}
            </FormField>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <ApperIcon name="List" className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <ApperIcon name="Grid3x3" className="w-4 h-4" />
            </Button>
          </div>
          
          <ActionButton
            icon="Plus"
            onClick={handleAddClass}
            variant="primary"
          >
            Add Class
          </ActionButton>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredClasses.length} of {classes.length} classes
        </span>
        {(searchTerm || subjectFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSubjectFilter("all");
            }}
            className="text-primary-600 hover:text-primary-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Classes Display */}
      {filteredClasses.length === 0 ? (
        <Empty
          title="No classes found"
          description={searchTerm || subjectFilter !== "all" 
            ? "Try adjusting your search criteria or filters."
            : "Get started by adding your first class to the system."
          }
          icon="BookOpen"
          action={!searchTerm && subjectFilter === "all" ? handleAddClass : undefined}
          actionLabel="Add First Class"
        />
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredClasses.map((cls) => (
            <Card key={cls.Id} className={`p-6 ${viewMode === "list" ? "flex items-center justify-between" : ""}`} hover>
              <div className={`${viewMode === "list" ? "flex-1" : "space-y-4"}`}>
                <div className={`${viewMode === "list" ? "flex items-center space-x-6" : "space-y-3"}`}>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cls.name}
                    </h3>
                    <p className="text-sm text-gray-600">{cls.subject}</p>
                  </div>
                  
                  {viewMode === "list" && (
                    <>
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">Teacher:</span> {cls.teacher}</p>
                        <p><span className="font-medium">Room:</span> {cls.schedule?.room || "TBD"}</p>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">Schedule:</span></p>
                        <p>{cls.schedule?.days?.join(", ") || "TBD"}</p>
                        <p>{cls.schedule?.startTime && cls.schedule?.endTime 
                          ? `${cls.schedule.startTime} - ${cls.schedule.endTime}`
                          : "Time TBD"}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">
                          {getEnrollmentCount(cls.Id)}
                        </div>
                        <div className="text-xs text-gray-500">Students</div>
                      </div>
                    </>
                  )}
                </div>
                
                {viewMode === "grid" && (
                  <>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Teacher:</span> {cls.teacher}</p>
                      <p><span className="font-medium">Room:</span> {cls.schedule?.room || "TBD"}</p>
                      <p><span className="font-medium">Schedule:</span> {cls.schedule?.days?.join(", ") || "TBD"}</p>
                      {cls.schedule?.startTime && cls.schedule?.endTime && (
                        <p><span className="font-medium">Time:</span> {cls.schedule.startTime} - {cls.schedule.endTime}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <Badge variant="primary">
                        {getEnrollmentCount(cls.Id)} Students
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              
              <div className={`${viewMode === "list" ? "flex space-x-2" : "flex justify-end space-x-2 mt-4"}`}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditClass(cls)}
                >
                  <ApperIcon name="Edit" className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteClass(cls.Id)}
                  className="text-error-600 hover:text-error-700 hover:bg-error-50"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 glass flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedClass ? "Edit Class" : "Add New Class"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSaveClass} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Class Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Advanced Mathematics"
                  />
                  <FormField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <FormField
                  label="Teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleInputChange}
                  required
                  placeholder="Teacher name"
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      label="Start Time"
                      type="time"
                      name="schedule.startTime"
                      value={formData.schedule.startTime}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="End Time"
                      type="time"
                      name="schedule.endTime"
                      value={formData.schedule.endTime}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Room"
                      name="schedule.room"
                      value={formData.schedule.room}
                      onChange={handleInputChange}
                      placeholder="Room number"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <ActionButton 
                    type="submit" 
                    variant="primary" 
                    icon="Save"
                  >
                    {selectedClass ? "Update Class" : "Add Class"}
                  </ActionButton>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Classes;