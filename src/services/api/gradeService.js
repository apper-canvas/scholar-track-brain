import { toast } from "react-toastify";
import React from "react";

const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const gradeService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "assignment_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "max_score_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "date_c" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('grade_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Transform data to match expected format
      const transformedData = (response.data || []).map(grade => ({
        ...grade,
        studentId: grade.student_id_c?.Id || grade.student_id_c,
        classId: grade.class_id_c?.Id || grade.class_id_c,
        assignment: grade.assignment_c,
        score: grade.score_c,
        maxScore: grade.max_score_c,
        category: grade.category_c,
        date: grade.date_c
      }));
      
      return transformedData;
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to fetch grades");
      return [];
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "assignment_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "max_score_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "date_c" } }
        ]
      };
      
      const response = await apperClient.getRecordById('grade_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      const grade = response.data;
      if (!grade) return null;
      
      return {
        ...grade,
        studentId: grade.student_id_c?.Id || grade.student_id_c,
        classId: grade.class_id_c?.Id || grade.class_id_c,
        assignment: grade.assignment_c,
        score: grade.score_c,
        maxScore: grade.max_score_c,
        category: grade.category_c,
        date: grade.date_c
      };
    } catch (error) {
      console.error(`Error fetching grade ${id}:`, error);
      toast.error("Failed to fetch grade details");
      return null;
    }
  },

  async getByStudentId(studentId) {
    try {
      const params = {
        fields: [
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "assignment_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "max_score_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "date_c" } }
        ],
        where: [{
          FieldName: "student_id_c",
          Operator: "EqualTo",
          Values: [parseInt(studentId)]
        }]
      };
      
      const response = await apperClient.fetchRecords('grade_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(grade => ({
        ...grade,
        studentId: grade.student_id_c?.Id || grade.student_id_c,
        classId: grade.class_id_c?.Id || grade.class_id_c,
        assignment: grade.assignment_c,
        score: grade.score_c,
        maxScore: grade.max_score_c,
        category: grade.category_c,
        date: grade.date_c
      }));
    } catch (error) {
      console.error("Error fetching student grades:", error);
      return [];
    }
  },

  async getByClassId(classId) {
    try {
      const params = {
        fields: [
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "assignment_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "max_score_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "date_c" } }
        ],
        where: [{
          FieldName: "class_id_c",
          Operator: "EqualTo",
          Values: [parseInt(classId)]
        }]
      };
      
      const response = await apperClient.fetchRecords('grade_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return (response.data || []).map(grade => ({
        ...grade,
        studentId: grade.student_id_c?.Id || grade.student_id_c,
        classId: grade.class_id_c?.Id || grade.class_id_c,
        assignment: grade.assignment_c,
        score: grade.score_c,
        maxScore: grade.max_score_c,
        category: grade.category_c,
        date: grade.date_c
      }));
    } catch (error) {
      console.error("Error fetching class grades:", error);
      return [];
    }
  },

  async create(gradeData) {
    try {
      const params = {
        records: [{
          student_id_c: parseInt(gradeData.studentId),
          class_id_c: parseInt(gradeData.classId),
          assignment_c: gradeData.assignment,
          score_c: gradeData.score,
          max_score_c: gradeData.maxScore || 100,
          category_c: gradeData.category || "Assignment",
          date_c: gradeData.date || new Date().toISOString()
        }]
      };
      
      const response = await apperClient.createRecord('grade_c', params);
      
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
      console.error("Error creating grade:", error);
      toast.error("Failed to create grade");
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
          assignment_c: updateData.assignment,
          score_c: updateData.score,
          max_score_c: updateData.maxScore,
          category_c: updateData.category,
          date_c: updateData.date
        }]
      };
      
      const response = await apperClient.updateRecord('grade_c', params);
      
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
      console.error("Error updating grade:", error);
      toast.error("Failed to update grade");
      return null;
    }
  },

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('grade_c', params);
      
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
      console.error("Error deleting grade:", error);
      toast.error("Failed to delete grade");
      return false;
}
  }
};