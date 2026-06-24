const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeesController");
const multer = require("multer");
const Employee = require("../models/employeesModel");
const upload = multer({ storage: multer.memoryStorage() });

const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads/employee_documents", req.params.id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.params.id + '_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadDisk = multer({ storage: storage });

router.post("/add-employee", employeeController.addEmployee);
router.post(
  "/createuserusingexcel",
  upload.single("file"),
  employeeController.createuserusingexcel
);

router.get("/employees", employeeController.getEmployees);

router.get("/employees/:id", employeeController.getEmployeeById);

router.post("/login", employeeController.loginEmployee);

router.put("/update_employee/:id", employeeController.updateEmployee);
router.delete("/delete_employee/:id", employeeController.deleteEmployee);

router.post("/employees/:id/documents", uploadDisk.array("documents"), employeeController.uploadEmployeeDocuments);
router.delete("/employees/:id/documents/:docName", employeeController.deleteEmployeeDocument);

module.exports = router;
