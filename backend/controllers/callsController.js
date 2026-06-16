// Calls = require("../models/callsModel");
const { Op } = require("sequelize");
const Calls = require("../models/callsModel");
const Leads = require("../models/leadModel");

exports.addCalls = async (req, res) => {
  const { emp_id } = req.body;

  if (!emp_id) {
    return res.status(400).json({ message: "emp_id is required" });
  }

  try {
    const newCalls = await Calls.create(req.body);
    res.status(201).json(newCalls); 
  } catch (error) {
    console.error("Error adding Call: ", error);
    res.status(500).json({ message: "Database error", error });
  }
};


exports.getCalls = async(req, res)=> {
    const {id} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try{
        const { rows: callsData, count: totalCount } = await Calls.findAndCountAll({
            where :{emp_id : id},
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json({
            success: true,
            calls: callsData,
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
        console.error("Error fetching Calls", error);
        res.status(500).json({message : "Database error", error});
    }
};

exports.getCallsByLeadId = async(req, res) =>{
    const{id} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try{
        const { rows: callData, count: totalCount } = await Calls.findAndCountAll({
            where :{lead_id: id},
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json({
            success: true,
            calls: callData,
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
        console.error("Error fetching calls", error);
        res.status(500).json({message : "Database error", error});
    }
};

exports.updateCall = async (req, res) => {
  const { callId } = req.params;
  const updatedData = req.body;

  try {
    const call = await Calls.findByPk(callId);
    
    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    await call.update(updatedData);
    res.status(200).json({ success: true, message: "Call updated successfully", data: call });
  } catch (error) {
    console.error("Error updating call:", error);
    res.status(500).json({ message: "Database error", error });
  }
};

exports.getCallsByDates = async (req, res) => {
  const { startDate, endDate } = req.query;
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  const offset = (page && limit) ? (page - 1) * limit : null;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "startDate and endDate are required" });
  }

  try {
    const queryOptions = {
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      order: [['createdAt', 'DESC']],
    };

    if (limit !== null) {
      queryOptions.limit = limit;
    }
    if (offset !== null) {
      queryOptions.offset = offset;
    }

    const { rows: callsData, count: totalCount } = await Calls.findAndCountAll(queryOptions);
    
    res.status(200).json({
      success: true,
      data: callsData,
      calls: callsData,
      pagination: {
        totalItems: totalCount,
        totalPages: limit ? Math.ceil(totalCount / limit) : 1,
        currentPage: page || 1,
        itemsPerPage: limit || totalCount,
        hasNextPage: limit ? (page < Math.ceil(totalCount / limit)) : false,
        hasPreviousPage: page ? (page > 1) : false,
      }
    });
  } catch (error) {
    console.error("Error fetching calls by dates", error);
    res.status(500).json({ message: "Database error", error });
  }
}

exports.getCallsByEmpIdAndDates = async (req, res) => {
    const { startDate, endDate } = req.query;
    const { emp_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!emp_id || !startDate || !endDate) {
        return res.status(400).json({ message: "emp_id, startDate and endDate are required" });
    }

    try {
        const { rows: callsData, count: totalCount } = await Calls.findAndCountAll({
            where: {
                emp_id: emp_id,
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json({
            success: true,
            data: callsData,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPreviousPage: page > 1,
            }
        });
    } catch (error) {
        console.error("Error fetching calls by emp_id and dates", error);
        res.status(500).json({ message: "Database error", error });
    }
};

exports.getTotalCallsCountByEmployeeId = async (req, res) => {
  const { emp_id } = req.params;

  if (!emp_id) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  try {
    const totalCount = await Calls.count({
      where: { emp_id }
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayCount = await Calls.count({
      where: {
        emp_id,
        createdAt: {
          [Op.between]: [startOfToday, endOfToday]
        }
      }
    });

    res.status(200).json({
      success: true,
      total: totalCount,
      totalCount,
      today: todayCount,
      emp_id
    });
  } catch (error) {
    console.error("Error getting total calls count:", error);
    res.status(500).json({ message: "Database error", error });
  }
};

exports.filterCalls = async (req, res) => {
  const { emp_id } = req.params;
  const { startDate, endDate, status, loanType } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  if (!emp_id) {
    return res.status(400).json({ message: "emp_id is required" });
  }

  try {
    const whereClause = { emp_id };

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Fetch calls with pagination
    const { rows: allCalls, count: totalCount } = await Calls.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Filter by lead's status and loanType
    const filteredCalls = [];

    for (const call of allCalls) {
      if (!call.lead_id) {
        filteredCalls.push(call.toJSON());
        continue;
      }

      const lead = await Leads.findOne({ where: { lead_id: call.lead_id } });
      if (!lead) continue;

      if (status && status !== 'All' && lead.status !== status) continue;
      if (loanType && loanType !== 'All' && lead.loan_type !== loanType) continue;

      filteredCalls.push({
        ...call.toJSON(),
        lead: {
          status: lead.status,
          loan_type: lead.loan_type,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: filteredCalls,
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
    console.error("Error filtering calls:", error);
    res.status(500).json({ message: "Error filtering calls", error });
  }
};
