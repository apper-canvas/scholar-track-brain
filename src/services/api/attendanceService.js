import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const attendanceService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "notes_c" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('attendance_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform data to match expected format
      const transformedData = (response.data || []).map(att => ({
        ...att,
        studentId: att.student_id_c?.Id || att.student_id_c,
        classId: att.class_id_c?.Id || att.class_id_c,
        date: att.date_c,
        status: att.status_c,
        notes: att.notes_c || ""
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance records");
      return [];
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "notes_c" } }
        ]
      };
      
      const response = await apperClient.getRecordById('attendance_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      const att = response.data;
      if (!att) return null;
      
      return {
        ...att,
        studentId: att.student_id_c?.Id || att.student_id_c,
        classId: att.class_id_c?.Id || att.class_id_c,
        date: att.date_c,
        status: att.status_c,
        notes: att.notes_c || ""
      };
    } catch (error) {
      console.error(`Error fetching attendance ${id}:`, error);
      toast.error("Failed to fetch attendance record");
      return null;
    }
  },

  async getByStudentId(studentId) {
    try {
      const params = {
        fields: [
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "notes_c" } }
        ],
        where: [{
          FieldName: "student_id_c",
          Operator: "EqualTo",
          Values: [parseInt(studentId)]
        }]
      };
      
      const response = await apperClient.fetchRecords('attendance_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(att => ({
        ...att,
        studentId: att.student_id_c?.Id || att.student_id_c,
        classId: att.class_id_c?.Id || att.class_id_c,
        date: att.date_c,
        status: att.status_c,
        notes: att.notes_c || ""
      }));
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      return [];
    }
  },

  async getByClassId(classId) {
    try {
      const params = {
        fields: [
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "notes_c" } }
        ],
        where: [{
          FieldName: "class_id_c",
          Operator: "EqualTo",
          Values: [parseInt(classId)]
        }]
      };
      
      const response = await apperClient.fetchRecords('attendance_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(att => ({
        ...att,
        studentId: att.student_id_c?.Id || att.student_id_c,
        classId: att.class_id_c?.Id || att.class_id_c,
        date: att.date_c,
        status: att.status_c,
        notes: att.notes_c || ""
      }));
    } catch (error) {
      console.error("Error fetching class attendance:", error);
      return [];
    }
  },

  async getByDate(date) {
    try {
      const targetDate = new Date(date).toISOString().split('T')[0];
      const params = {
        fields: [
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "notes_c" } }
        ],
        where: [{
          FieldName: "date_c",
          Operator: "StartsWith",
          Values: [targetDate]
        }]
      };
      
      const response = await apperClient.fetchRecords('attendance_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(att => ({
        ...att,
        studentId: att.student_id_c?.Id || att.student_id_c,
        classId: att.class_id_c?.Id || att.class_id_c,
        date: att.date_c,
        status: att.status_c,
        notes: att.notes_c || ""
      }));
    } catch (error) {
      console.error("Error fetching attendance by date:", error);
      return [];
    }
  },

  async create(attendanceData) {
    try {
      const params = {
        records: [{
          student_id_c: parseInt(attendanceData.studentId),
          class_id_c: parseInt(attendanceData.classId),
          date_c: attendanceData.date || new Date().toISOString(),
          status_c: attendanceData.status || "Present",
          notes_c: attendanceData.notes || ""
        }]
      };
      
      const response = await apperClient.createRecord('attendance_c', params);
      
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
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating attendance:", error);
      toast.error("Failed to create attendance record");
      return null;
    }
  },

  async update(id, updateData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          student_id_c: updateData.studentId ? parseInt(updateData.studentId) : undefined,
          class_id_c: updateData.classId ? parseInt(updateData.classId) : undefined,
          date_c: updateData.date,
          status_c: updateData.status,
          notes_c: updateData.notes
        }]
      };
      
      const response = await apperClient.updateRecord('attendance_c', params);
      
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
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance record");
      return null;
    }
  },

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('attendance_c', params);
      
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
      console.error("Error deleting attendance:", error);
      toast.error("Failed to delete attendance record");
      return false;
    }
  }
};