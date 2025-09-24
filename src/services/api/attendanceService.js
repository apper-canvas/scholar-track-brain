import attendanceData from "@/services/mockData/attendance.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let attendance = [...attendanceData];

export const attendanceService = {
  async getAll() {
    await delay(280);
    return [...attendance];
  },

  async getById(id) {
    await delay(200);
    const record = attendance.find(a => a.Id === parseInt(id));
    if (!record) {
      throw new Error("Attendance record not found");
    }
    return { ...record };
  },

  async getByStudentId(studentId) {
    await delay(300);
    return attendance.filter(a => a.studentId === parseInt(studentId));
  },

  async getByClassId(classId) {
    await delay(300);
    return attendance.filter(a => a.classId === parseInt(classId));
  },

  async getByDate(date) {
    await delay(300);
    const targetDate = new Date(date).toDateString();
    return attendance.filter(a => new Date(a.date).toDateString() === targetDate);
  },

  async create(attendanceData) {
    await delay(400);
    const newId = Math.max(...attendance.map(a => a.Id)) + 1;
    const newRecord = {
      ...attendanceData,
      Id: newId,
      date: attendanceData.date || new Date().toISOString(),
      status: attendanceData.status || "Present",
      notes: attendanceData.notes || ""
    };
    attendance.push(newRecord);
    return { ...newRecord };
  },

  async update(id, updateData) {
    await delay(400);
    const index = attendance.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Attendance record not found");
    }
    
    attendance[index] = {
      ...attendance[index],
      ...updateData,
      Id: parseInt(id) // Ensure ID doesn't change
    };
    
    return { ...attendance[index] };
  },

  async delete(id) {
    await delay(300);
    const index = attendance.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Attendance record not found");
    }
    
    const deletedRecord = attendance.splice(index, 1)[0];
    return { ...deletedRecord };
  }
};