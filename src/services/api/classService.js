import classesData from "@/services/mockData/classes.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let classes = [...classesData];

export const classService = {
  async getAll() {
    await delay(350);
    return [...classes];
  },

  async getById(id) {
    await delay(200);
    const cls = classes.find(c => c.Id === parseInt(id));
    if (!cls) {
      throw new Error("Class not found");
    }
    return { ...cls };
  },

  async create(classData) {
    await delay(450);
    const newId = Math.max(...classes.map(c => c.Id)) + 1;
    const newClass = {
      ...classData,
      Id: newId,
      students: classData.students || [],
      schedule: classData.schedule || {
        days: [],
        startTime: "",
        endTime: "",
        room: ""
      },
      gradeWeights: classData.gradeWeights || {
        homework: 30,
        quizzes: 20,
        exams: 40,
        projects: 10
      }
    };
    classes.push(newClass);
    return { ...newClass };
  },

  async update(id, updateData) {
    await delay(400);
    const index = classes.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Class not found");
    }
    
    classes[index] = {
      ...classes[index],
      ...updateData,
      Id: parseInt(id) // Ensure ID doesn't change
    };
    
    return { ...classes[index] };
  },

  async delete(id) {
    await delay(300);
    const index = classes.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Class not found");
    }
    
    const deletedClass = classes.splice(index, 1)[0];
    return { ...deletedClass };
  }
};