const expenseController = require("../controller/expense");
const router = require("express").Router();

router.post("/", expenseController.createExpense);
router.get("/", expenseController.getExpenses);
router.get("/total", expenseController.getTotalExpense);
router.get("/:id", expenseController.getExpense);
router.delete("/:id", expenseController.deleteExpense);
router.put("/:id", expenseController.updateExpense);

module.exports = router;
