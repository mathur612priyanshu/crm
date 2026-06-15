const Lead = require('../models/leadModel');
const XLSX = require("xlsx");
const { Op } = require('sequelize'); // Import Op for date queries
const Employee = require("../models/employeesModel");
const LeadStatus = require("../models/leadStatusModel");
const History = require("../models/historyModel");
const { startOfToday, endOfToday, startOfTomorrow, endOfTomorrow } = require('date-fns');
const { EMPLOYEE_ROLES } = require("../constants/employeeRoles");

const MAX_SELF_ASSIGN_LEADS = 50;

const leadStatusInclude = {
  model: LeadStatus,
  as: "statusDetails",
  attributes: ["status_id", "name", "team", "is_initial", "is_file_login"],
};

const serializeLead = (lead) => {
  const plainLead = lead?.toJSON ? lead.toJSON() : lead;
  if (!plainLead) return plainLead;

  return {
    ...plainLead,
    status: plainLead.statusDetails?.name || null,
  };
};

const serializeLeads = (leads) => leads.map(serializeLead);

const getInitialLeadStatus = async () => {
  const initialStatus = await LeadStatus.findOne({
    where: { is_initial: true, is_active: true },
  });

  if (initialStatus) return initialStatus;

  return LeadStatus.findOne({
    where: { name: "Fresh Lead", is_active: true },
  });
};

const getFileLoginLeadStatus = async () => {
  const fileLoginStatus = await LeadStatus.findOne({
    where: { is_file_login: true, is_active: true },
  });

  if (fileLoginStatus) return fileLoginStatus;

  return LeadStatus.findOne({
    where: { name: "File Login", is_active: true },
  });
};

const getUnassignedWhere = (statusId) => ({
  status_id: statusId,
  [Op.and]: [
    {
      [Op.or]: [
        { person_id: null },
        { person_id: "" },
      ],
    },
    {
      [Op.or]: [
        { owner: null },
        { owner: "" },
      ],
    },
  ],
});

const resolveLeadStatus = async ({ status, status_id }) => {
  if (status_id) {
    return LeadStatus.findOne({ where: { status_id, is_active: true } });
  }

  if (status) {
    if (!isNaN(status)) {
      const parsedId = parseInt(status, 10);
      return LeadStatus.findOne({ where: { status_id: parsedId, is_active: true } });
    }
    return LeadStatus.findOne({ where: { name: status, is_active: true } });
  }

  return null;
};

const getActor = async (req) => {
  const empId = req.user?.id || req.body.changed_by_emp_id || req.body.updated_by_emp_id || req.body.person_id;
  const role = req.user?.role || req.body.changed_by_role || req.body.updated_by_role;

  if (!empId) {
    return {
      emp_id: null,
      role: role || null,
    };
  }

  const employee = await Employee.findByPk(empId);
  return {
    emp_id: empId,
    role: role || employee?.role || null,
  };
};

const canActorSetStatus = (actorRole, leadStatus) => {
  // Admin is treated as a MANAGER in this system, so allow full editing
  if (!actorRole || actorRole === EMPLOYEE_ROLES.MANAGER) return true;

  // Calling/Operations can only move status within their assigned team
  if (actorRole === EMPLOYEE_ROLES.OPERATIONS) {
    return leadStatus.team === "operations" || leadStatus.team === "both";
  }
  if (actorRole === EMPLOYEE_ROLES.CALLING) {
    return leadStatus.team === "calling" || leadStatus.team === "both";
  }

  // Default deny
  return false;
};

const addLeadHistory = async ({ lead, previousStatusId, actor, remark }) => {
  await History.create({
    lead_id: lead.lead_id,
    next_meeting: lead.next_meeting,
    status_id: lead.status_id,
    previous_status_id: previousStatusId || null,
    changed_by_emp_id: actor?.emp_id || null,
    loanType: lead.loan_type,
    remark: remark !== undefined ? remark : lead.remark,
  });
};

exports.addLead = async (req, res) => {
  // Convert empty strings to null
  if (req.body) {
    for (const key in req.body) {
      if (req.body[key] === "") {
        req.body[key] = null;
      }
    }
  }

  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ message: 'Name and number are required' });
  }

  try {
    const requestedStatus = await resolveLeadStatus(req.body);
    const leadStatus = requestedStatus || (await getInitialLeadStatus());
    const actor = await getActor(req);

    const newLead = await Lead.create({
      ...req.body,
      status_id: leadStatus?.status_id || null,
    });

    await addLeadHistory({
      lead: newLead,
      previousStatusId: null,
      actor,
      remark: req.body.remark,
    });

    res.status(200).json({
      message: "Lead added successfully",
      id: newLead.lead_id,
    });
  } catch (error) {
    console.error("Error adding lead:", error);
    res.status(500).json({ message: "Database error", error });
  }
};

exports.importLeadsFromExcel = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No Excel file uploaded" });
    }

    const initialStatus = await getInitialLeadStatus();

    // 📥 Parse Excel from buffer with date cell support
    const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let count = 0;
    let duplicates = 0;
    let failures = 0;

    for (const row of sheetData) {
      const {
        name,
        number,
        email,
        // dob,
        source,
        priority,
        next_meeting,
        employment_type,
        // loan_term,
        refrence,
        description,
        address,
        loan_type,
        est_budget,
        remark,
        // salary,
      } = row;

      // 🔁 Skip if name or number missing
      if (!name || !number) continue;

      // 🛠️ Manually add +1 day to dates if valid
      // let dobDate = null;
      // if (dob instanceof Date && !isNaN(dob)) {
      //   dob.setDate(dob.getDate() + 1);
      //   dobDate = dob;
      // }

      let meetingDate = null;
      if (next_meeting instanceof Date && !isNaN(next_meeting)) {
        next_meeting.setDate(next_meeting.getDate() + 1);
        meetingDate = next_meeting;
      }

      try {
        const newLead = await Lead.create({
          name,
          number,
          email,
          // dob: dobDate,
          source: source || 'Bulk excel',
          priority,
          next_meeting: meetingDate,
          employment_type,
          // loan_term,
          refrence,
          description,
          address,
          loan_type,
          est_budget,
          remark,
          // salary,
          status_id: initialStatus?.status_id || null,
          person_id: null,
          owner: null,
        });

        await addLeadHistory({
          lead: newLead,
          previousStatusId: null,
          actor: { emp_id: null, role: EMPLOYEE_ROLES.MANAGER },
          remark,
        });

        count++;
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError" || (err.errors && err.errors.some(e => e.type === 'unique violation'))) {
          duplicates++;
        } else {
          console.error(`❌ Error importing row for number ${number}:`, err);
          failures++;
        }
      }
    }

    let resultMessage = `Successfully imported ${count} unassigned leads.`;
    if (duplicates > 0) {
      resultMessage += ` Skipped ${duplicates} duplicate numbers.`;
    }
    if (failures > 0) {
      resultMessage += ` Failed to import ${failures} rows due to database errors.`;
    }

    return res.status(200).json({
      message: resultMessage,
    });

  } catch (error) {
    console.error("❌ Error importing leads:", error);
    return res.status(500).json({
      message: "Failed to import leads",
      error: error.message,
    });
  }
};

exports.updateLead = async (req, res) => {
    const { id } = req.params;

    // Convert empty strings to null
    if (req.body) {
        for (const key in req.body) {
            if (req.body[key] === "") {
                req.body[key] = null;
            }
        }
    }
    const updateData = { ...req.body };  // Accept any fields from the request body

    if (!id) {
        return res.status(400).json({ message: 'Lead ID is required' });
    }

    try {
        const lead = await Lead.findByPk(id);

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const previousStatusId = lead.status_id;
        const nextStatus = await resolveLeadStatus(updateData);
        const actor = await getActor(req);

        if (updateData.status || updateData.status_id) {
            if (!nextStatus) {
                return res.status(400).json({ message: 'Invalid lead status' });
            }

            if (!canActorSetStatus(actor.role, nextStatus)) {
                return res.status(403).json({ message: 'This employee role cannot set this status' });
            }

            updateData.status_id = nextStatus.status_id;
        }

        delete updateData.status;

        const [updated] = await Lead.update(updateData, {
            where: { lead_id: id }
        });

        if (updated === 0) {
            return res.status(404).json({ message: 'Lead not found or no changes made' });
        }

        const updatedLead = await Lead.findByPk(id);
        const statusChanged = updateData.status_id && previousStatusId !== updateData.status_id;
        const nextMeetingChanged = updateData.next_meeting && lead.next_meeting !== updateData.next_meeting;
        const remarkChanged = updateData.remark !== undefined && lead.remark !== updateData.remark;
        const loanTypeChanged = updateData.loan_type && lead.loan_type !== updateData.loan_type;
        const priorityChanged = updateData.priority && lead.priority !== updateData.priority;
        const sourceChanged = updateData.source && lead.source !== updateData.source;

        const shouldCreateHistory = statusChanged || nextMeetingChanged || remarkChanged || loanTypeChanged || priorityChanged || sourceChanged;

        if (shouldCreateHistory) {
            await addLeadHistory({
                lead: updatedLead,
                previousStatusId: statusChanged ? previousStatusId : null,
                actor,
                remark: updateData.remark,
            });
        }

        res.status(200).json({ message: 'Lead updated successfully' });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ message: 'Database error', error });
    }
};

exports.getLeadsForAdminPanel = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const fromDate = req.query.fromDate; 
    const toDate = req.query.toDate;     

    const offset = (page - 1) * limit;

    // 🛡️ Search condition (name or phone)
    const searchCondition = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { number: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};
      console.log(searchCondition);

    // 📅 Date filter condition
    const dateCondition =
      fromDate && toDate
        ? {
            createdAt: {
              [Op.between]: [new Date(fromDate), new Date(toDate)],
            },
          }
        : {};

    // 🛡️ Final where clause
    const whereCondition = {
      ...searchCondition,
      ...dateCondition,
    };

    // 🔍 Find leads with filters + pagination
    const { rows: leads, count: totalCount } = await Lead.findAndCountAll({
      where: whereCondition,
      include: [leadStatusInclude],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: serializeLeads(leads),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leads",
    });
  }
};


exports.getLeads = async (req, res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        
        let whereCondition = {};
        if (fromDate && toDate) {
            const startOfDay = new Date(fromDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(toDate);
            endOfDay.setUTCHours(23, 59, 59, 999);
            
            whereCondition.createdAt = {
                [Op.between]: [startOfDay, endOfDay],
            };
        }

        const { rows: leads, count: totalCount } = await Lead.findAndCountAll({
            where: whereCondition,
            include: [leadStatusInclude],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            success: true,
            data: serializeLeads(leads),
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
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Database error', error });
    } 
};

exports.getLeadsById = async (req, res)=>{
    const {emp_id} = req.params;
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const employee = await Employee.findByPk(emp_id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        let where = { person_id: emp_id };

        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        
        if (fromDate && toDate) {
            const startOfDay = new Date(fromDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(toDate);
            endOfDay.setUTCHours(23, 59, 59, 999);
            
            where.createdAt = {
                [Op.between]: [startOfDay, endOfDay],
            };
        }

        if (employee.role === EMPLOYEE_ROLES.OPERATIONS) {
            const operationStatuses = await LeadStatus.findAll({
                where: {
                    is_active: true,
                    team: { [Op.in]: ["operations", "both"] },
                },
            });

            where.status_id = {
                [Op.in]: operationStatuses.map((status) => status.status_id),
            };
        }

        const { rows: leads, count: totalCount } = await Lead.findAndCountAll({
            where,
            include: [leadStatusInclude],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            success: true,
            data: serializeLeads(leads),
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
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Database error', error : error });
    } 
};

exports.deleteLead = async (req, res)=> {
    const{id} = req.params;
    try{
        const deleted = await Lead.destroy({where:{lead_id : id}});
        if (deleted) {
            res.status(200).json({ message: 'Lead deleted successfully' });
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    }catch(error){
        console.error('Error deleting lead:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLeadDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const lead = await Lead.findByPk(id, { include: [leadStatusInclude] });

        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        return res.status(200).json(serializeLead(lead));
    } catch (error) {
        console.error("Error fetching lead details:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.searchByName = async (req, res)=>{
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { number: { [Op.like]: `%${search}%` } },
      ],
    } : {};

    const { rows: leads, count: totalCount } = await Lead.findAndCountAll({
      where: whereClause,
      include: [leadStatusInclude],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: serializeLeads(leads),
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
    console.error('Error searching leads:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

exports.leadsByDate = async (req, res) => {
  const { startDate, endDate } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  try {
    const { rows: leads, count: totalCount } = await Lead.findAndCountAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [leadStatusInclude],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: serializeLeads(leads),
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
    console.error('Error fetching leads by date:', error);
    res.status(500).json({ message: 'Database error', error });
  }
} 
exports.leadsByEmpIdAndDate = async (req, res) => {
  const { startDate, endDate } = req.query;
  const { emp_id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  if (!emp_id || !startDate || !endDate) {
    return res.status(400).json({ message: 'Employee ID, start date, and end date are required' });
  }

  try {
    const { rows: leads, count: totalCount } = await Lead.findAndCountAll({
      where: {
        person_id: emp_id,
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [leadStatusInclude],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: serializeLeads(leads),
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
    console.error('Error fetching leads by employee ID and date:', error);
    res.status(500).json({ message: 'Database error', error });
  }
}

exports.getLeadCountByEmpId = async (req, res) => {
  const { emp_id } = req.params;

  if (!emp_id) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  try {
    // Total leads by emp_id
    const leadsCount = await Lead.count({
      where: {
        person_id: emp_id
      }
    });

    // File Login status count (specific to this employee)
    const fileLoginStatus = await getFileLoginLeadStatus();
    const fileLoginLeads = await Lead.findAll({
      where: {
        person_id: emp_id,
        status_id: fileLoginStatus?.status_id || null,
      },
      include: [leadStatusInclude],
    });

    // Today’s date range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Tomorrow’s date range
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const endOfTomorrow = new Date(endOfToday);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

    // Today meeting count
    const todayLeads = await Lead.findAll({
      where: {
        person_id: emp_id,
        next_meeting: {
          [Op.between]: [startOfToday, endOfToday]
        }
      },
      include: [leadStatusInclude],
    });

    // Tomorrow meeting count
    const tomorrowLeads = await Lead.findAll({
      where: {
        person_id: emp_id,
        next_meeting: {
          [Op.between]: [startOfTomorrow, endOfTomorrow]
        }
      },
      include: [leadStatusInclude],
    });

    return res.status(200).json({
      totalLeads: leadsCount,
      fileLoginCount : serializeLeads(fileLoginLeads),
      todayFollowups: serializeLeads(todayLeads),
      tomorrowFollowups: serializeLeads(tomorrowLeads),
    });

  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Database error", error });
  }
};

exports.getFreshLeadsByEmpId = async (req, res) =>{
  const { emp_id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  if(!emp_id){
    return res.status(400).json({ message: "Employee ID is required" });
  }
  try {
    const initialStatus = await getInitialLeadStatus();
    const { rows: leads, count: totalCount } = await Lead.findAndCountAll({
      where : {
        person_id : emp_id,
        status_id : initialStatus?.status_id || null,
      },
      include: [leadStatusInclude],
      limit,
      offset,
      order: [["createdAt", "ASC"]],
    });
    return res.status(200).json({
      success: true,
      data: serializeLeads(leads),
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
    console.error("Error fetching fresh leads:", error);
    res.status(500).json({ message: "Database error", error });
  }
}

exports.getUnassignedFreshLeads = async (req, res) => {
  try {
    const initialStatus = await getInitialLeadStatus();
    const limit = Math.min(parseInt(req.query.limit) || MAX_SELF_ASSIGN_LEADS, MAX_SELF_ASSIGN_LEADS);

    if (!initialStatus) {
      return res.status(200).json({
        success: true,
        leads: [],
        availableCount: 0,
        maxAssignable: MAX_SELF_ASSIGN_LEADS,
      });
    }

    const where = getUnassignedWhere(initialStatus.status_id);
    const [availableCount, leads] = await Promise.all([
      Lead.count({ where }),
      Lead.findAll({
        where,
        include: [leadStatusInclude],
        order: [["createdAt", "ASC"]],
        limit,
      }),
    ]);

    return res.status(200).json({
      success: true,
      leads: serializeLeads(leads),
      availableCount,
      maxAssignable: MAX_SELF_ASSIGN_LEADS,
    });
  } catch (error) {
    console.error("Error fetching unassigned fresh leads:", error);
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

exports.assignUnassignedFreshLeads = async (req, res) => {
  const { emp_id } = req.params;
  const requestedCount = parseInt(req.body.count);

  if (!emp_id) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  if (!requestedCount || requestedCount < 1) {
    return res.status(400).json({ message: "Lead count must be at least 1" });
  }

  try {
    const employee = await Employee.findByPk(emp_id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const initialStatus = await getInitialLeadStatus();
    if (!initialStatus) {
      return res.status(404).json({ message: "Fresh Lead status not found" });
    }

    const requestedLimit = Math.min(requestedCount, MAX_SELF_ASSIGN_LEADS);
    const where = getUnassignedWhere(initialStatus.status_id);
    const availableCount = await Lead.count({ where });
    const assignCount = Math.min(requestedLimit, availableCount);

    if (assignCount < 1) {
      return res.status(400).json({ message: "No unassigned fresh leads available" });
    }

    const leads = await Lead.findAll({
      where,
      include: [leadStatusInclude],
      order: [["createdAt", "ASC"]],
      limit: assignCount,
    });

    const leadIds = leads.map((lead) => lead.lead_id);
    const ownerName = employee.ename || employee.username;

    await Lead.update(
      {
        person_id: employee.emp_id,
        owner: ownerName,
      },
      {
        where: {
          lead_id: { [Op.in]: leadIds },
          ...where,
        },
      }
    );

    const assignedLeads = await Lead.findAll({
      where: { lead_id: { [Op.in]: leadIds } },
      include: [leadStatusInclude],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: `${assignedLeads.length} leads assigned to ${ownerName}`,
      assignedCount: assignedLeads.length,
      requestedCount,
      maxAssignable: MAX_SELF_ASSIGN_LEADS,
      availableCount: Math.max(availableCount - assignedLeads.length, 0),
      leads: serializeLeads(assignedLeads),
    });
  } catch (error) {
    console.error("Error assigning unassigned fresh leads:", error);
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

exports.getLeadByNumber = async (req, res) =>{
  const { lead_number } = req.params;
  try {
    const lead = await Lead.findOne({
      where: {
        number: lead_number
      }});
      return res.status(200).json(lead);
  }catch(error){
    console.error("Error fetching lead by number:", error);
    return res.status(500).json({message: "Database error", error});
  }
}

exports.getLeadsByNextMeeting = async (req, res) => {
  try {
    // Get today's date range
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    // Get tomorrow's date range
    const tomorrowStart = startOfTomorrow();
    const tomorrowEnd = endOfTomorrow();

    // Today's follow-ups
    const todayFollowups = await Lead.findAll({
      where: {
        next_meeting: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    // Tomorrow's follow-ups
    const tomorrowFollowups = await Lead.findAll({
      where: {
        next_meeting: {
          [Op.between]: [tomorrowStart, tomorrowEnd],
        },
      },
    });

    // Pending follow-ups (next meeting after tomorrow)
    const pendingFollowups = await Lead.findAll({
      where: {
        next_meeting: {
          [Op.gt]: tomorrowEnd,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        todayFollowups,
        tomorrowFollowups,
        pendingFollowups,
      },
    });
  } catch (error) {
    console.error('Error in getLeadsByNextMeeting:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.getFilteredLeads = async (req, res) => {
  try {
    const { emp_id, startDate, endDate, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (emp_id) {
      whereClause.person_id = emp_id;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (status && status !== "All") {
      const leadStatus = await resolveLeadStatus({ status });
      whereClause.status_id = leadStatus?.status_id || null;
    }

    const { rows: leads, count: totalCount } = await Lead.findAndCountAll({
      attributes: ['lead_id', 'name', 'number', 'person_id', 'owner', 'status_id', 'loan_type', 'createdAt'],
      where: whereClause,
      include: [leadStatusInclude],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: serializeLeads(leads),
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
    console.error("Error fetching filtered leads", error);
    res.status(500).json({ message: "Server error", error });
  }
};
