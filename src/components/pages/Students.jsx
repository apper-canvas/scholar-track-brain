import React, { useState, useEffect } from "react";
import SearchBar from "@/components/molecules/SearchBar";
import ActionButton from "@/components/molecules/ActionButton";
import StudentTable from "@/components/organisms/StudentTable";
import StudentModal from "@/components/organisms/StudentModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import FormField from "@/components/molecules/FormField";
import { studentService } from "@/services/api/studentService";
import { toast } from "react-toastify";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await studentService.getAll();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      setError("Failed to load students. Please try again.");
      console.error("Students loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(student => student.status.toLowerCase() === statusFilter);
    }

    // Grade filter
    if (gradeFilter !== "all") {
      filtered = filtered.filter(student => student.grade === gradeFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter, gradeFilter]);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await studentService.delete(studentId);
        toast.success("Student deleted successfully!");
        loadStudents();
      } catch (err) {
        toast.error("Failed to delete student. Please try again.");
      }
    }
  };

  const handleViewStudent = (student) => {
    // For now, just open edit modal
    handleEditStudent(student);
  };

  const handleSaveStudent = async (formData) => {
    try {
      if (selectedStudent) {
        await studentService.update(selectedStudent.Id, formData);
        toast.success("Student updated successfully!");
      } else {
        await studentService.create({
          ...formData,
          enrollmentDate: new Date().toISOString(),
          parentContact: {
            name: "",
            phone: "",
            email: ""
          }
        });
        toast.success("Student added successfully!");
      }
      setIsModalOpen(false);
      loadStudents();
    } catch (err) {
      toast.error(selectedStudent ? "Failed to update student." : "Failed to add student.");
    }
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
        <Error message={error} onRetry={loadStudents} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Student Management
        </h1>
        <p className="text-gray-600">
          Manage student profiles, enrollment, and status information.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students..."
            className="flex-1 max-w-md"
          />
          
          <div className="flex gap-4">
            <FormField
              type="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-32"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
            </FormField>
            
            <FormField
              type="select"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-32"
            >
              <option value="all">All Grades</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </FormField>
          </div>
        </div>
        
        <ActionButton
          icon="UserPlus"
          onClick={handleAddStudent}
          variant="primary"
        >
          Add Student
        </ActionButton>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredStudents.length} of {students.length} students
        </span>
        {(searchTerm || statusFilter !== "all" || gradeFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setGradeFilter("all");
            }}
            className="text-primary-600 hover:text-primary-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <Empty
          title="No students found"
          description={searchTerm || statusFilter !== "all" || gradeFilter !== "all" 
            ? "Try adjusting your search criteria or filters."
            : "Get started by adding your first student to the system."
          }
          icon="Users"
          action={!searchTerm && statusFilter === "all" && gradeFilter === "all" ? handleAddStudent : undefined}
          actionLabel="Add First Student"
        />
      ) : (
        <StudentTable
          students={filteredStudents}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onView={handleViewStudent}
        />
      )}

      {/* Student Modal */}
      <StudentModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
      />
    </div>
  );
};

export default Students;