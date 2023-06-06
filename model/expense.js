const fs = require("fs");
const path = require("path");
const p = path.resolve(__dirname, "..", "db.json");

function readData() {
  const data = fs.readFileSync(p);
  const parsed = JSON.parse(data);
  return parsed.expense;
}

function writeData(expense) {
  const str = JSON.stringify({ expense }, null, 2);
  fs.writeFileSync(p, str);
}

module.exports = {
  generateID() {
    const allData = this.get();
    if (allData.length <= 0) {
      return 1;
    }
    const id = allData[allData.length - 1].id + 1;
    return id;
  },
  get() {
    return readData();
  },
  getOne(id) {
    const numID = parseInt(id);
    const datas = this.get();
    const idx = this.getIndexByID(numID);
    return datas[idx];
  },
  getIndexByID(id) {
    const data = readData();
    const idx = data.findIndex((x) => x.id === id);
    if (idx === -1) {
      throw new Error("data not found");
    }
    return idx;
  },
  create(expense) {
    const data = readData();
    data.push(expense);
    writeData(data);
  },
  update(id, newExpense) {
    const numID = parseInt(id);
    const data = readData();
    const idx = this.getIndexByID(numID);
    data[idx] = newExpense;
    writeData(data);
  },
  delete(id) {
    const numID = parseInt(id);
    const idx = this.getIndexByID(numID);
    const data = readData();
    data.splice(idx, 1);
    writeData(data);
  },
};
