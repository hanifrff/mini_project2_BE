const dayjs = require("dayjs");
const expenseModel = require("../model/expense");

module.exports = {
  getExpenses(req, res) {
    let data;
    try {
      data = expenseModel.get();
    } catch (err) {
      return res.status(500).send({
        message: "failed get data",
        errors: err,
      });
    }
    res.send({
      message: "success get data",
      result: data,
    });
  },
  deleteExpense(req, res) {
    const { id } = req.params;
    try {
      expenseModel.delete(id);
    } catch (error) {
      let status = 500;
      if (error.message === "data not found") {
        status = 404;
      }
      return res.status(status).send({
        message: "failed remove data",
        errors: error,
      });
    }
    res.send({
      message: "data successfully deleted",
    });
  },
  getExpense(req, res) {
    const { id } = req.params;
    let data;
    try {
      data = expenseModel.getOne(id);
    } catch (error) {
      let status = 500;
      if (error.message === "data not found") {
        status = 404;
      }
      return res.status(status).send({
        message: "failed get data",
        errors: error,
      });
    }
    res.send({
      message: "success get data",
      result: data,
    });
  },
  createExpense(req, res) {
    const { name, category, nominal } = req.body;
    const payload = {
      name,
      category,
      nominal,
      id: expenseModel.generateID(),
      date: new Date(),
    };
    expenseModel.create(payload);
    res.status(201).send({
      message: "data created successfully",
      result: payload,
    });
  },
  updateExpense(req, res) {
    const { id } = req.params;
    const { name, category, nominal } = req.body;
    let oldData;
    try {
      oldData = expenseModel.getOne(id);
      oldData.name = name;
      oldData.category = category;
      oldData.nominal = nominal;
      expenseModel.update(id, oldData);
    } catch (error) {
      let status = 500;
      let errors = error;
      if (error.message === "data not found") {
        status = 404;
        errors = {
          name: error.name,
          stack: error.stack,
        };
      }
      return res.status(status).send({
        message: "failed update data",
        errors,
      });
    }
    res.send({
      message: "update data success",
      result: oldData,
    });
  },
  getTotalExpense(req, res) {
    const { query } = req;
    let data = expenseModel.get();
    if (query.category) {
      data = data.filter((item) => item.category === query.category);
    }
    if (query.startDate && query.endDate) {
      data = data.filter((item) => {
        return dayjs(item.date).isBetween(
          query.startDate,
          query.endDate,
          "day",
          "[]"
        );
      });
    }
    const nominalData = data.map((item) => item.nominal);
    const totalExpense = nominalData.reduce((total, item) => total + item);
    res.send({
      message: "success get total",
      result: {
        totalExpense: totalExpense,
        data,
      },
    });
  },
};
