import studentsData from "@/services/mockData/students.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let students = [...studentsData];

export const studentService = {
  async getAll() {
    await delay(300);
    return [...students];
  },

  async getById(id) {
    await delay(200);
    const student = students.find(s => s.Id === parseInt(id));
    if (!student) {
      throw new Error("Student not found");
    }
    return { ...student };
  },

  async create(studentData) {
    await delay(400);
    const newId = Math.max(...students.map(s => s.Id)) + 1;
    const newStudent = {
      ...studentData,
      Id: newId,
      enrollmentDate: studentData.enrollmentDate || new Date().toISOString(),
      parentContact: studentData.parentContact || {
        name: "",
        phone: "",
        email: ""
      }
    };
    students.push(newStudent);
    return { ...newStudent };
  },

  async update(id, updateData) {
    await delay(400);
    const index = students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    students[index] = {
      ...students[index],
      ...updateData,
      Id: parseInt(id) // Ensure ID doesn't change
    };
    
    return { ...students[index] };
  },

  async delete(id) {
    await delay(300);
    const index = students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    const deletedStudent = students.splice(index, 1)[0];
    return { ...deletedStudent };
  }
};