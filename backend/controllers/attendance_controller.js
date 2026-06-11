const { Op, Sequelize } = require("sequelize");
const Attendance = require("../models/attendance_model");
const moment = require("moment-timezone");
const { read } = require("xlsx");
const User = require("../models/employeesModel");
const schedule = require("node-schedule");
const { json } = require("body-parser");

const markattendance = async (req, res) => {
  const userId1 = req.user.id;
  const { isLate, remark } = req.body;
  // console.log(locationName, "=========?");
  try {
    const todayIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
    const existingAttendance = await Attendance.findOne({
      where: { userId:userId1, date: todayIST },
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: "Attendance already marked today." });
    }

    // Mark attendance with the current timestamp in IST
    const attendance = await Attendance.create({
      userId : userId1,
      // attendancesite: locationName,
      startTime: moment().tz("Asia/Kolkata").toDate(),
      date: todayIST,
      isLate,
      remark
    });
    console.log("==============",attendance);
    res.status(200).json({message : "Successfully marked attendance", attendance});
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const closeattendance = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  // const { locationName } = req.body;
  // console.log(locationName, "=========?");
  try {
    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found." });
    }

    if (attendance.endTime) {
      return res.status(400).json({ message: "Attendance already closed." });
    }
    // if (attendance.attendancesite != locationName) {
    //   return res
    //     .status(400)
    //     .json({ message: "Attendance location doesn't match." });
    // }

    // Set the end time in IST
    const endTimeIST = moment().tz("Asia/Kolkata").toDate();
    attendance.endTime = endTimeIST;

    // Calculate the attendance duration
    // const start = moment(attendance.startTime).tz("Asia/Kolkata");
    // const end = moment(endTimeIST).tz("Asia/Kolkata");
    // const duration = moment.duration(end.diff(start)).asHours(); // Duration in hours

    // Check if start time is between 6:00 AM and 9:45 AM IST
    // const isMarkedEarly = start.isBetween(
    //   moment().tz("Asia/Kolkata").startOf("day").add(6, "hours"),
    //   moment()
    //     .tz("Asia/Kolkata")
    //     .startOf("day")
    //     .add(9, "hours")
    //     .add(45, "minutes"),
    //   null,
    //   "[)"
    // );

    // Check if duration is at least 8 hours and 30 minutes
    // const isFullDay = duration >= 8.5 && isMarkedEarly;

    // Set attendance status
    // attendance.status =  "Full Day" ;

    // Save the updated attendance
    await attendance.save();

    res.status(200).json({message: "Attendance closed successfully", attendance});
  } catch (error) {
    console.log("Error closing attendance:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
const checkattendance = async (req, res) => {
  const userId = req.user.id;
  const currentDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
  console.log(currentDate, "=========?");
  console.log("Current Date:", currentDate);
  console.log("Current Date Type:", typeof currentDate);

  try {
    const attendance = await Attendance.findOne({
      where: {
        userId: userId,
        date: currentDate,
      },
    });
    console.log(attendance, currentDate, "=========?");
    if (attendance) {
      if(attendance.endTime==null){
        return res.status(200).json({ alreadyMarked: true, closed: false, attendance });
      }else{
        return res.status(200).json({ alreadyMarked: true, closed: true });
      } 
    } else {
      return res.status(200).json({ alreadyMarked: false, closed: false });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error checking attendance.", error});
  }
};

const myattendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows: attendanceRecords, count: totalCount } = await Attendance.findAndCountAll({
      where: { userId },
      attributes: ["date", "isLate", "startTime", "endTime"],
      limit,
      offset,
      order: [['date', 'DESC']],
    });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    }

    const formattedData = attendanceRecords.map((record) => ({
      date: moment(record.date).format("YYYY-MM-DD"),
      isLate : record.isLate,
      startTime: moment(record.startTime),
      endTime: record.endTime ? moment(record.endTime) : null,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
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
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getcompleteuserdetailsattendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { rows: attendances, count: totalCount } = await Attendance.findAndCountAll({
      where: { userId: user.id },
      limit,
      offset,
      order: [['date', 'DESC']],
    });

    const transformedAttendances = attendances.map((attendance) => {
      const plainAttendance = attendance.get({ plain: true });
      return {
        ...plainAttendance,
        startTime: moment(plainAttendance.startTime)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"),
        endTime: plainAttendance.endTime
          ? moment(plainAttendance.endTime)
              .tz("Asia/Kolkata")
              .format("YYYY-MM-DD HH:mm:ss")
          : null,
      };
    });

    const categorizedAttendance = {
      total: totalCount,
      fullDay: transformedAttendances.filter(
        (attendance) => attendance.status === "Full Day"
      ).length,
      halfDay: transformedAttendances.filter(
        (attendance) => attendance.status === "Half Day"
      ).length,
    };

    res.json({
      success: true,
      user,
      attendances: transformedAttendances,
      categorizedAttendance,
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
    console.error(error);
    res.status(500).json({ message: "Error fetching attendance data" });
  }
};

const autoCloseAttendances = async () => {
  try {
    console.log("Running auto-close attendance job...");

    // Get current date and time in IST
    const currentTimeIST = moment().tz("Asia/Kolkata");

    // Find all attendances without an end time
    const attendances = await Attendance.findAll({
      where: {
        startTime: { [Op.ne]: null }, // Ensure startTime is not null
        endTime: null, // Ensure endTime is still null
      },
    });

    for (const attendance of attendances) {
      // Set the end time as 8 PM IST
      const endTimeIST = currentTimeIST
        .clone()
        .startOf("day")
        .add(20, "hours") // 8 PM IST
        .toDate();
      attendance.endTime = endTimeIST;

      // Calculate the duration
      const start = moment(attendance.startTime).tz("Asia/Kolkata");
      const end = moment(endTimeIST).tz("Asia/Kolkata");
      const duration = moment.duration(end.diff(start)).asHours(); // Duration in hours

      // Check if start time is between 6:00 AM and 9:45 AM IST
      const isMarkedEarly = start.isBetween(
        moment().tz("Asia/Kolkata").startOf("day").add(6, "hours"),
        moment()
          .tz("Asia/Kolkata")
          .startOf("day")
          .add(9, "hours")
          .add(45, "minutes"),
        null,
        "[)"
      );

      // Check if duration is at least 8 hours and 30 minutes
      const isFullDay = duration >= 8.5 && isMarkedEarly;

      // Set attendance status
      if (isFullDay) {
        attendance.status = "Full Day";
      } else {
        attendance.status = "Half Day";
      }

      await attendance.save();
    }

    console.log("Auto-close attendance job completed.");
  } catch (error) {
    console.error("Error auto-closing attendances:", error);
  }
};

const getMonthlyAttendance = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const month = req.query.month || req.params.month;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 31;
    const offset = (page - 1) * limit;

    let start, end;
    const dateWhere = {};

    if (startDate && endDate) {
      start = moment(startDate, "YYYY-MM-DD", true);
      end = moment(endDate, "YYYY-MM-DD", true);

      if (!start.isValid() || !end.isValid()) {
        return res.status(400).json({ message: "Invalid startDate or endDate." });
      }

      dateWhere[Op.between] = [start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD")];
    } else if (month) {
      if (!moment(month, "YYYY-MM", true).isValid()) {
        return res.status(400).json({ message: "Invalid month parameter." });
      }

      start = moment(month, "YYYY-MM").startOf("month");
      end = moment(month, "YYYY-MM").endOf("month");
      dateWhere[Op.between] = [start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD")];
    } else {
      return res.status(400).json({ message: "Either month param or startDate & endDate required." });
    }

    const whereClause = {
      date: dateWhere,
    };

    if (userId) {
      whereClause.userId = userId;
    }

    const { rows: attendanceRecords, count: totalCount } = await Attendance.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["date", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: attendanceRecords,
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
    console.error("Error fetching attendance:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}



schedule.scheduleJob(
  { hour: 20, minute: 0, dayOfWeek: [0, 1, 3, 4, 5, 6] },
  () => {
    autoCloseAttendances();
  }
);

module.exports = {
  markattendance,
  closeattendance,
  checkattendance,
  myattendance,
  getcompleteuserdetailsattendance,
  getMonthlyAttendance
};
