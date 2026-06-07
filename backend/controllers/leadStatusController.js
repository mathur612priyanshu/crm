const LeadStatus = require("../models/leadStatusModel");

const VALID_TEAMS = ["calling", "operations", "both"];

exports.getLeadStatuses = async (req, res) => {
  try {
    const { team, includeInactive } = req.query;
    const where = {};

    if (includeInactive !== "true") {
      where.is_active = true;
    }

    const statuses = await LeadStatus.findAll({
      where,
      order: [
        ["sort_order", "ASC"],
        ["name", "ASC"],
      ],
    });

    const filteredStatuses = team
      ? statuses.filter((status) => status.team === team || status.team === "both")
      : statuses;

    return res.status(200).json({ success: true, statuses: filteredStatuses });
  } catch (error) {
    console.error("Error fetching lead statuses:", error);
    return res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
};

exports.createLeadStatus = async (req, res) => {
  try {
    const {
      name,
      team = "calling",
      is_initial = false,
      is_file_login = false,
      sort_order = 100,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Status name is required" });
    }

    if (!VALID_TEAMS.includes(team)) {
      return res.status(400).json({ message: "Invalid status team" });
    }

    if (is_initial) {
      await LeadStatus.update({ is_initial: false }, { where: { is_initial: true } });
    }

    if (is_file_login) {
      await LeadStatus.update({ is_file_login: false }, { where: { is_file_login: true } });
    }

    const status = await LeadStatus.create({
      name: name.trim(),
      team,
      is_initial,
      is_file_login,
      sort_order,
      is_active: true,
    });

    return res.status(201).json({ success: true, status });
  } catch (error) {
    console.error("Error creating lead status:", error);
    return res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await LeadStatus.findByPk(id);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    const updateData = {};
    const allowedFields = ["name", "team", "is_initial", "is_file_login", "is_active", "sort_order"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = field === "name" ? req.body[field].trim() : req.body[field];
      }
    }

    if (updateData.team && !VALID_TEAMS.includes(updateData.team)) {
      return res.status(400).json({ message: "Invalid status team" });
    }

    if (updateData.is_initial) {
      await LeadStatus.update({ is_initial: false }, { where: { is_initial: true } });
    }

    if (updateData.is_file_login) {
      await LeadStatus.update({ is_file_login: false }, { where: { is_file_login: true } });
    }

    await status.update(updateData);
    return res.status(200).json({ success: true, status });
  } catch (error) {
    console.error("Error updating lead status:", error);
    return res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
};

exports.deleteLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await LeadStatus.findByPk(id);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    if (status.is_protected || status.is_initial || status.is_file_login) {
      return res.status(400).json({ message: "This system status cannot be deleted" });
    }

    await status.destroy();
    return res.status(200).json({ success: true, message: "Status deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead status:", error);
    return res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
};
