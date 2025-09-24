import React, { useEffect, useState } from "react";
import { studentService } from "@/services/api/studentService";
import { toast } from "react-toastify";
import ActionButton from "@/components/molecules/ActionButton";
import SearchBar from "@/components/molecules/SearchBar";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import StudentModal from "@/components/organisms/StudentModal";
import StudentTable from "@/components/organisms/StudentTable";
import Grades from "@/components/pages/Grades";

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
  const [isViewMode, setIsViewMode] = useState(false);

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
        `${student.first_name_c} ${student.last_name_c}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email_c?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(student => student.status_c?.toLowerCase() === statusFilter);
    }

    // Grade filter
    if (gradeFilter !== "all") {
      filtered = filtered.filter(student => student.grade_c?.toLowerCase() === gradeFilter);
    }

    const sorted = filtered.sort((a, b) => {
      const aName = `${a.first_name_c} ${a.last_name_c}`;
      const bName = `${b.first_name_c} ${b.last_name_c}`;
      return aName.localeCompare(bName);
    });

    setFilteredStudents(sorted);
  }, [students, searchTerm, statusFilter, gradeFilter]);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      setLoading(true);
      await studentService.delete(studentId);
      toast.success("Student deleted successfully!");
      loadStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (formData) => {
    try {
      setLoading(true);
      if (selectedStudent) {
await studentService.update(selectedStudent.Id, {
          first_name_c: formData.firstName,
          last_name_c: formData.lastName,
          email_c: formData.email,
          phone_c: formData.phone,
          grade_c: formData.grade,
          status_c: formData.status,
          enrollment_date_c: formData.enrollmentDate ? new Date(formData.enrollmentDate).toISOString() : undefined,
          parent_contact_name_c: formData.parentContactName,
          parent_contact_phone_c: formData.parentContactPhone,
          parent_contact_email_c: formData.parentContactEmail
        });
        toast.success("Student updated successfully!");
      } else {
        await studentService.create({
          first_name_c: formData.firstName,
          last_name_c: formData.lastName,
          email_c: formData.email,
          phone_c: formData.phone,
          grade_c: formData.grade,
status_c: formData.status_c,
          enrollment_date_c: new Date().toISOString()
        });
        toast.success("Student created successfully!");
      }
      loadStudents();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("Failed to save student");
    } finally {
      setLoading(false);
    }
  };
const statusOptions = ["all", "active", "inactive", "graduated"];
  const gradeOptions = ["all", "9th", "10th", "11th", "12th"];

  if (loading && students.length === 0) return <Loading />;
  if (error) return <Error message={error} onRetry={loadStudents} />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <ActionButton
          icon="UserPlus"
          onClick={handleAddStudent}
          disabled={loading}
        >
          Add Student
        </ActionButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search students..."
          className="md:col-span-2"
        />
        
        <FormField
          label="Status"
          type="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full"
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </FormField>

        <FormField
          label="Grade"
          type="select"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="w-full"
        >
          {gradeOptions.map(grade => (
            <option key={grade} value={grade}>
              {grade === "all" ? "All Grades" : grade}
            </option>
          ))}
        </FormField>
      </div>

      {filteredStudents.length === 0 ? (
        <Empty 
          title="No students found"
          description="No students match your current filters."
          action={{
            label: "Add Student",
            onClick: handleAddStudent
          }}
        />
      ) : (
        <StudentTable
          students={filteredStudents}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onView={handleViewStudent}
        />
      )}

      <StudentModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
          setIsViewMode(false);
        }}
        onSave={handleSaveStudent}
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default Students;