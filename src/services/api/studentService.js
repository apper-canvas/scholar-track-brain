import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const studentService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "grade_c" } },
          { field: { Name: "enrollment_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "parent_contact_name_c" } },
          { field: { Name: "parent_contact_phone_c" } },
          { field: { Name: "parent_contact_email_c" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
      return [];
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "grade_c" } },
          { field: { Name: "enrollment_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "parent_contact_name_c" } },
          { field: { Name: "parent_contact_phone_c" } },
          { field: { Name: "parent_contact_email_c" } }
        ]
      };
      
      const response = await apperClient.getRecordById('student_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      toast.error("Failed to fetch student details");
      return null;
    }
  },

async create(studentData) {
    try {
      // Validate required fields
      if (!studentData.first_name_c || !studentData.last_name_c) {
        throw new Error('First name and last name are required');
      }
      
      if (studentData.email_c && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email_c)) {
        throw new Error('Please enter a valid email address');
      }

      const params = {
        records: [{
          Name: `${studentData.first_name_c} ${studentData.last_name_c}`,
          first_name_c: studentData.first_name_c,
          last_name_c: studentData.last_name_c,
          email_c: studentData.email_c,
          phone_c: studentData.phone_c || "",
          grade_c: studentData.grade_c,
          enrollment_date_c: studentData.enrollment_date_c || new Date().toISOString(),
          status_c: studentData.status_c || "Active",
          parent_contact_name_c: studentData.parent_contact_name_c || "",
          parent_contact_phone_c: studentData.parent_contact_phone_c || "",
          parent_contact_email_c: studentData.parent_contact_email_c || ""
        }]
      };
      
      const response = await apperClient.createRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
record.errors?.forEach(error => toast.error(error));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error("Failed to create student");
      return null;
    }
  },

  async update(id, updateData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updateData.first_name_c && updateData.last_name_c ? 
                `${updateData.first_name_c} ${updateData.last_name_c}` : undefined,
          first_name_c: updateData.first_name_c,
          last_name_c: updateData.last_name_c,
          email_c: updateData.email_c,
          phone_c: updateData.phone_c,
          grade_c: updateData.grade_c,
          enrollment_date_c: updateData.enrollment_date_c,
          status_c: updateData.status_c,
          parent_contact_name_c: updateData.parent_contact_name_c,
          parent_contact_phone_c: updateData.parent_contact_phone_c,
          parent_contact_email_c: updateData.parent_contact_email_c
        }]
      };
      
      const response = await apperClient.updateRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
      return null;
    }
  },

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('student_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length === 1;
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
      return false;
    }
  }
};