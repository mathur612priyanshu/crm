const History = require("../models/historyModel");
const LeadStatus = require("../models/leadStatusModel");
const Employee = require("../models/employeesModel");

exports.addHistory = async (req, res) => {
    const { lead_id } = req.body;

    if (lead_id == null) {
        return res.status(400).json({ message: "lead_id is required" });
    }

    if (req.body.next_meeting === 'Invalid date' || req.body.next_meeting === 'Invalid Date') {
        req.body.next_meeting = null;
    }

    try {
        if (req.body.status && !req.body.status_id) {
            const statusObj = await LeadStatus.findOne({ where: { name: req.body.status } });
            if (statusObj) req.body.status_id = statusObj.status_id;
        }
        if (req.body.previousStatus && !req.body.previous_status_id) {
            const prevStatusObj = await LeadStatus.findOne({ where: { name: req.body.previousStatus } });
            if (prevStatusObj) req.body.previous_status_id = prevStatusObj.status_id;
        }
        
        // If status_id is still not found (e.g. from an old frontend bug), don't crash the server, just return success since updateLead already handles history.
        if (req.body.status_id == null) {
            return res.status(200).json({ message: "History skipped (handled by lead controller)", id: null });
        }

        const newHistory = await History.create(req.body);
        res.status(200).json({ message: "New History added successfully", id: newHistory.history_id });
    } catch (error) {
        console.error("Error adding History:", error);
        res.status(500).json({ message: "Database error", error });
    }
};

exports.getHistory = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const { rows: historyData, count: totalCount } = await History.findAndCountAll({
            where: { lead_id: id },
            include: [
                { model: LeadStatus, as: "statusDetails", attributes: ["name"] },
                { model: LeadStatus, as: "previousStatusDetails", attributes: ["name"] },
                { model: Employee, as: "changedBy", attributes: ["emp_id", "ename"] },
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            success: true,
            history: historyData,
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
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Database error", error });
    }
};
