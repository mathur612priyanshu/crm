const Lead = require('../models/leadModel');
const Calls = require('../models/callsModel');
const Task = require('../models/taskModel');
const Attendance = require('../models/attendance_model');
const LeadStatus = require('../models/leadStatusModel');
const { Op } = require('sequelize');

exports.getPerformanceStats = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const dateCondition = {};
    if (startDate && endDate) {
      dateCondition[Op.between] = [new Date(startDate), new Date(endDate)];
    }

    // 1. Calls Stats
    const callsWhere = { emp_id: userId };
    if (startDate && endDate) callsWhere.createdAt = dateCondition;

    const totalCalls = await Calls.count({ where: callsWhere });
    
    const callsOverTimeRaw = await Calls.findAll({
      attributes: [
        [Calls.sequelize.fn('DATE', Calls.sequelize.col('createdAt')), 'date'],
        [Calls.sequelize.fn('COUNT', Calls.sequelize.col('call_id')), 'count']
      ],
      where: callsWhere,
      group: [Calls.sequelize.fn('DATE', Calls.sequelize.col('createdAt'))],
      raw: true
    });
    
    const callsPerDay = {};
    callsOverTimeRaw.forEach(row => {
      callsPerDay[row.date] = parseInt(row.count) || 0;
    });

    // 2. Tasks Stats
    const tasksWhere = { emp_id: userId };
    if (startDate && endDate) tasksWhere.createdAt = dateCondition;

    const totalTasks = await Task.count({ where: tasksWhere });
    const tasksByStatusRaw = await Task.findAll({
      attributes: ['status', [Task.sequelize.fn('COUNT', Task.sequelize.col('task_id')), 'count']],
      where: tasksWhere,
      group: ['status'],
      raw: true
    });
    const tasksStatusCounts = { Initial: 0, 'On Going': 0, Completed: 0 };
    tasksByStatusRaw.forEach(row => {
      if (tasksStatusCounts[row.status] !== undefined) {
        tasksStatusCounts[row.status] = parseInt(row.count) || 0;
      } else {
        tasksStatusCounts[row.status] = parseInt(row.count) || 0;
      }
    });

    // 3. Attendance Stats
    const attendanceWhere = { userId: userId };
    if (startDate && endDate) attendanceWhere.date = dateCondition;

    const totalAttendance = await Attendance.count({ where: attendanceWhere });
    const lateAttendance = await Attendance.count({ where: { ...attendanceWhere, isLate: true } });
    const fullAttendance = totalAttendance - lateAttendance;

    // 4. Leads Stats
    const leadsWhere = { person_id: userId };
    if (startDate && endDate) leadsWhere.createdAt = dateCondition;

    const totalLeads = await Lead.count({ where: leadsWhere });

    // Status Counts
    const statusCountsRaw = await Lead.findAll({
      attributes: ['status_id', [Lead.sequelize.fn('COUNT', Lead.sequelize.col('lead_id')), 'count']],
      where: leadsWhere,
      group: ['status_id'],
      raw: true
    });
    
    const allStatuses = await LeadStatus.findAll({ attributes: ['status_id', 'name'] });
    const leadStatusCounts = {};
    allStatuses.forEach(s => {
      const match = statusCountsRaw.find(row => row.status_id === s.status_id);
      if (match) {
        leadStatusCounts[s.name] = parseInt(match.count) || 0;
      }
    });

    // Loan Type Counts
    const loanCountsRaw = await Lead.findAll({
      attributes: ['loan_type', [Lead.sequelize.fn('COUNT', Lead.sequelize.col('lead_id')), 'count']],
      where: leadsWhere,
      group: ['loan_type'],
      raw: true
    });

    const loanTypeCounts = {};
    loanCountsRaw.forEach(row => {
      loanTypeCounts[row.loan_type] = parseInt(row.count) || 0;
    });

    res.status(200).json({
      success: true,
      data: {
        totalCalls,
        callsPerDay,
        totalTasks,
        tasksStatusCounts,
        totalAttendance,
        lateAttendance,
        fullAttendance,
        totalLeads,
        leadStatusCounts,
        loanTypeCounts
      }
    });

  } catch (error) {
    console.error('Error fetching performance stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
