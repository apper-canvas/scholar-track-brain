import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ActionButton from "@/components/molecules/ActionButton";
import ApperIcon from "@/components/ApperIcon";

const StudentModal = ({ student, isOpen, onClose, onSave }) => {
const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    status: "Active",
    enrollmentDate: "",
    parentContactName: "",
    parentContactPhone: "",
    parentContactEmail: ""
  });

  useEffect(() => {
    if (student) {
setFormData({
        firstName: student.first_name_c || "",
        lastName: student.last_name_c || "",
        email: student.email_c || "",
        phone: student.phone_c || "",
        grade: student.grade_c || "",
        status: student.status_c || "Active",
        enrollmentDate: student.enrollment_date_c ? student.enrollment_date_c.split('T')[0] : "",
        parentContactName: student.parent_contact_name_c || "",
        parentContactPhone: student.parent_contact_phone_c || "",
        parentContactEmail: student.parent_contact_email_c || ""
      });
    } else {
setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        grade: "",
        status: "Active",
        enrollmentDate: "",
        parentContactName: "",
        parentContactPhone: "",
        parentContactEmail: ""
      });
    }
  }, [student, isOpen]);

const handleChange = (e) => {
    const { name, value } = e.target;
// Ensure value is always a string to prevent object stringification
    const stringValue = typeof value === 'object' && value !== null ? '' : String(value || '');
    setFormData(prev => ({
      ...prev,
      [name]: stringValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 glass flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {student ? "Edit Student" : "Add New Student"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter last name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="student@email.com"
              />
              <FormField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Grade"
                type="select"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
              >
                <option value="">Select Grade</option>
                <option value="9th">9th Grade</option>
                <option value="10th">10th Grade</option>
                <option value="11th">11th Grade</option>
                <option value="12th">12th Grade</option>
              </FormField>
              <FormField
                label="Status"
                type="select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </FormField>
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Enrollment Date"
                type="date"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleChange}
                placeholder="Select enrollment date"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Contact Information</h3>
              
              <div className="space-y-6">
                <FormField
                  label="Parent/Guardian Name"
                  name="parentContactName"
                  value={formData.parentContactName}
                  onChange={handleChange}
                  placeholder="Enter parent/guardian name"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Parent/Guardian Phone"
                    name="parentContactPhone"
                    value={formData.parentContactPhone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                  <FormField
                    label="Parent/Guardian Email"
                    type="email"
                    name="parentContactEmail"
                    value={formData.parentContactEmail}
                    onChange={handleChange}
                    placeholder="parent@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <ActionButton 
                type="submit" 
                variant="primary" 
                icon="Save"
              >
                {student ? "Update Student" : "Add Student"}
              </ActionButton>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default StudentModal;