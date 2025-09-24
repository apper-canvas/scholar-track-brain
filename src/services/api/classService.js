import { toast } from "react-toastify";
import React from "react";

const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const classService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "subject_c" } },
          { field: { Name: "teacher_c" } },
          { field: { Name: "schedule_days_c" } },
          { field: { Name: "schedule_start_time_c" } },
          { field: { Name: "schedule_end_time_c" } },
          { field: { Name: "schedule_room_c" } },
          { field: { Name: "grade_weights_homework_c" } },
          { field: { Name: "grade_weights_quizzes_c" } },
          { field: { Name: "grade_weights_exams_c" } },
          { field: { Name: "grade_weights_projects_c" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('class_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform data to match expected format
      const transformedData = (response.data || []).map(cls => ({
        ...cls,
        name: cls.name_c,
        subject: cls.subject_c,
        teacher: cls.teacher_c,
        schedule: {
          days: cls.schedule_days_c ? cls.schedule_days_c.split(',') : [],
          startTime: cls.schedule_start_time_c || "",
          endTime: cls.schedule_end_time_c || "",
          room: cls.schedule_room_c || ""
        },
        gradeWeights: {
          homework: cls.grade_weights_homework_c || 30,
          quizzes: cls.grade_weights_quizzes_c || 20,
          exams: cls.grade_weights_exams_c || 40,
          projects: cls.grade_weights_projects_c || 10
        }
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes");
      return [];
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "subject_c" } },
          { field: { Name: "teacher_c" } },
          { field: { Name: "schedule_days_c" } },
          { field: { Name: "schedule_start_time_c" } },
          { field: { Name: "schedule_end_time_c" } },
          { field: { Name: "schedule_room_c" } },
          { field: { Name: "grade_weights_homework_c" } },
          { field: { Name: "grade_weights_quizzes_c" } },
          { field: { Name: "grade_weights_exams_c" } },
          { field: { Name: "grade_weights_projects_c" } }
        ]
      };
      
      const response = await apperClient.getRecordById('class_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      const cls = response.data;
      if (!cls) return null;
      
      // Transform data to match expected format
      return {
        ...cls,
        name: cls.name_c,
        subject: cls.subject_c,
        teacher: cls.teacher_c,
        schedule: {
          days: cls.schedule_days_c ? cls.schedule_days_c.split(',') : [],
          startTime: cls.schedule_start_time_c || "",
          endTime: cls.schedule_end_time_c || "",
          room: cls.schedule_room_c || ""
        },
        gradeWeights: {
          homework: cls.grade_weights_homework_c || 30,
          quizzes: cls.grade_weights_quizzes_c || 20,
          exams: cls.grade_weights_exams_c || 40,
          projects: cls.grade_weights_projects_c || 10
        }
      };
    } catch (error) {
      console.error(`Error fetching class ${id}:`, error);
      toast.error("Failed to fetch class details");
      return null;
    }
  },

  async create(classData) {
    try {
      const params = {
        records: [{
          Name: classData.name,
          name_c: classData.name,
          subject_c: classData.subject,
          teacher_c: classData.teacher,
          schedule_days_c: classData.schedule?.days?.join(',') || "",
          schedule_start_time_c: classData.schedule?.startTime || "",
          schedule_end_time_c: classData.schedule?.endTime || "",
          schedule_room_c: classData.schedule?.room || "",
          grade_weights_homework_c: classData.gradeWeights?.homework || 30,
          grade_weights_quizzes_c: classData.gradeWeights?.quizzes || 20,
          grade_weights_exams_c: classData.gradeWeights?.exams || 40,
          grade_weights_projects_c: classData.gradeWeights?.projects || 10
        }]
      };
      
      const response = await apperClient.createRecord('class_c', params);
      
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
      console.error("Error creating class:", error);
      toast.error("Failed to create class");
      return null;
    }
  },

  async update(id, updateData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updateData.name,
          name_c: updateData.name,
          subject_c: updateData.subject,
          teacher_c: updateData.teacher,
          schedule_days_c: updateData.schedule?.days?.join(',') || "",
          schedule_start_time_c: updateData.schedule?.startTime || "",
          schedule_end_time_c: updateData.schedule?.endTime || "",
          schedule_room_c: updateData.schedule?.room || "",
          grade_weights_homework_c: updateData.gradeWeights?.homework || 30,
          grade_weights_quizzes_c: updateData.gradeWeights?.quizzes || 20,
          grade_weights_exams_c: updateData.gradeWeights?.exams || 40,
          grade_weights_projects_c: updateData.gradeWeights?.projects || 10
        }]
      };
      
      const response = await apperClient.updateRecord('class_c', params);
      
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
      console.error("Error updating class:", error);
      toast.error("Failed to update class");
      return null;
    }
  },

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('class_c', params);
      
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
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
      return false;
}
  }
};