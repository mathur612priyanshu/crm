const { json } = require("sequelize");
const Tasks = require("../models/taskModel");
const { Op } = require("sequelize");

exports.addTask = async (req, res)=>{
    const {emp_id} = req.body;
    if(emp_id == null){
        return res.status(400).json({message: "empid is required"});
    } 

    try{
        const newTask = await Tasks.create(req.body);
        res.status(200).json({message: "Task added successfully", task: newTask});
    }catch(error){
        console.log("error while adding task");
        res.status(500).json({message: "Database Error", error});
    }
};

exports.getTasks = async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const whereClause = { emp_id: id };

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const { rows: tasks, count: totalCount } = await Tasks.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            success: true,
            tasks: tasks,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error fetching tasks", error);
        res.status(500).json({ message: "Database error", error });
    }
};
exports.getTasksByLeadId = async(req, res)=>{
    const {id} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try{
        const { rows: tasks, count: totalCount } = await Tasks.findAndCountAll({
            where : {lead_id : id},
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json({
            success: true,
            tasks: tasks,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPreviousPage: page > 1,
            },
        });
    }catch(error){
        console.error("Error fetching tasks", error);
        res.status(500).json({message: "Database error", error});
    }
}

exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;

  try {
    const task = await Tasks.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Dynamically update only the passed fields
    Object.keys(updates).forEach(key => {
      if (task[key] !== undefined) {
        task[key] = updates[key];
      }
    });

    await task.save();

    return res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Database error", error });
  }
};

exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Tasks.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.destroy();

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Database error", error });
  }
};
