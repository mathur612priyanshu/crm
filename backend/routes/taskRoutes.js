const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.post('/add_task', taskController.addTask);
router.get('/task/:id', taskController.getTasks);
router.get('/task_by_lead_id/:id', taskController.getTasksByLeadId);
router.put('/update_task/:taskId', taskController.updateTask);
router.delete('/deleteTask/:taskId', taskController.deleteTask);


module.exports = router;