const express = require("express");
const attendancecontroller = require("../controllers/attendance_controller");
const router = express.Router();
const auth = require("../middlewares/isAuthenticated");

router.post(
  "/markattendance",
  auth.isAuthenticated,
  attendancecontroller.markattendance
);

router.put(
  "/closeattendance/:id",
  auth.isAuthenticated,
  attendancecontroller.closeattendance
);

router.get(
  "/checkattendance",
  auth.isAuthenticated,
  attendancecontroller.checkattendance
);

router.get(
  "/myattendance",
  auth.isAuthenticated,
  attendancecontroller.myattendance
);

router.get(
  "/:id/attendancedetails",
  attendancecontroller.getcompleteuserdetailsattendance
);

router.get("/monthlyattendance/:month", attendancecontroller.getMonthlyAttendance);

module.exports = router;
