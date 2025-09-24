import gradesData from "@/services/mockData/grades.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let grades = [...gradesData];

export const gradeService = {
  async getAll() {
    await delay(250);
    return [...grades];
  },

  async getById(id) {
    await delay(200);
    const grade = grades.find(g => g.Id === parseInt(id));
    if (!grade) {
      throw new Error("Grade not found");
    }
    return { ...grade };
  },

  async getByStudentId(studentId) {
    await delay(300);
    return grades.filter(g => g.studentId === parseInt(studentId));
  },

  async getByClassId(classId) {
    await delay(300);
    return grades.filter(g => g.classId === parseInt(classId));
  },

  async create(gradeData) {
    await delay(400);
    const newId = Math.max(...grades.map(g => g.Id)) + 1;
    const newGrade = {
      ...gradeData,
      Id: newId,
      date: gradeData.date || new Date().toISOString(),
      category: gradeData.category || "Assignment",
      maxScore: gradeData.maxScore || 100
    };
    grades.push(newGrade);
    return { ...newGrade };
  },

  async update(id, updateData) {
    await delay(400);
    const index = grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    
    grades[index] = {
      ...grades[index],
      ...updateData,
      Id: parseInt(id) // Ensure ID doesn't change
    };
    
    return { ...grades[index] };
  },

  async delete(id) {
    await delay(300);
    const index = grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    
    const deletedGrade = grades.splice(index, 1)[0];
    return { ...deletedGrade };
  }
};