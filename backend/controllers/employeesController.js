const Employee = require("../models/employeesModel");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
  EMPLOYEE_ROLE_VALUES,
  EMPLOYEE_STATUS_VALUES,
} = require("../constants/employeeRoles");

const SECRETE_KEY = process.env.SECRET_KEY;

const ADMIN_PANEL_ROLES = [EMPLOYEE_ROLES.MANAGER, EMPLOYEE_ROLES.OPERATIONS];

const normalizeRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();
  const roleAliases = {
    "calling employee": EMPLOYEE_ROLES.CALLING,
    caller: EMPLOYEE_ROLES.CALLING,
    "operations employee": EMPLOYEE_ROLES.OPERATIONS,
    operation: EMPLOYEE_ROLES.OPERATIONS,
    admin: EMPLOYEE_ROLES.MANAGER,
  };

  if (roleAliases[normalizedRole]) {
    return roleAliases[normalizedRole];
  }

  return EMPLOYEE_ROLE_VALUES.includes(normalizedRole)
    ? normalizedRole
    : EMPLOYEE_ROLES.CALLING;
};

const normalizeStatus = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  return EMPLOYEE_STATUS_VALUES.includes(normalizedStatus)
    ? normalizedStatus
    : EMPLOYEE_STATUSES.ACTIVE;
};

exports.addEmployee = async (req, res) => {
  const { emp_id, email, username, ename, password, phone, role, status } =
    req.body;

  if (!emp_id || !email || !phone || !username || !ename || !password) {
    return res
      .status(400)
      .json({ message: "All employee fields are required" });
  }

  try {
    const newEmployee = await Employee.create({
      emp_id,
      email,
      phone,
      username,
      ename,
      password,
      role: normalizeRole(role),
      status: normalizeStatus(status),
    });

    return res.status(200).json({
      message: "employee added successfully",
      id: newEmployee.emp_id, // or newEmployee.id depending on schema
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    return res.status(500).json({ message: "Database error", error });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            { ename: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { emp_id: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } },
            { role: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: employees } = await Employee.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["emp_id", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: "success",

      employees,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res
      .status(500)
      .json({ message: "Database error", error: error.message });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.createuserusingexcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const createdUsers = [];

    for (const row of data) {
      const {
        "Employee Id": employeeId,
        Name: name,
        "Mobile Number": phone,
        "Email Id": email,
        Role: role,
      } = row;
      const password = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await Employee.create({
        emp_id: employeeId,
        ename: name,
        phone,
        email,
        username: employeeId,
        password: password,
        role: normalizeRole(role),
        status: EMPLOYEE_STATUSES.ACTIVE,
      });
      // const mailOptions = {
      //   from: process.env.EMAIL_USER,
      //   to: email,
      //   subject: "Your login Details for website",
      //   text: `Your employee ID is: ${employeeId}\nYour temporary password is: ${password}\nPlease change your password after first login.`,
      // };
      // await transporter.sendMail(mailOptions);

      createdUsers.push({
        employeeId: newUser.employeeId,
        name: newUser.name,
        email: newUser.email,
        password: password, // Note: This is the unhashed password
      });
    }

    res.status(200).json({
      message: "Users created successfully",
      users: createdUsers,
    });
  } catch (error) {
    console.log("Error creating users from Excel:", error);
    res
      .status(500)
      .json({ message: "Error creating users", error: error.message });
  }
};

exports.loginEmployee = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required fields" });
  }

  try {
    const employee = await Employee.findOne({ where: { username } });

    if (!employee) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // const isPasswordValid = await bcrypt.compare(password, employee.password);

    // if(!isPasswordValid){
    //   return res.status(401).json({message : "Invalid username or password"});
    // }

    if (employee.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (employee.status !== EMPLOYEE_STATUSES.ACTIVE) {
      return res.status(403).json({ message: "Employee account is inactive" });
    }

    const token = jwt.sign(
      { id: employee.emp_id, username: employee.username, role: employee.role },
      SECRETE_KEY,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      message: "login Successfull",
      token,
      employee: {
        emp_id: employee.emp_id,
        username: employee.username,
        email: employee.email,
        ename: employee.ename,
        role: employee.role,
        status: employee.status,
        canAccessAdminPanel: ADMIN_PANEL_ROLES.includes(employee.role),
      },
    });
  } catch (e) {
    console.error("login error : ", e);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: e.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await Employee.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch {
    console.error("Error fetching user by id", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateEmployee = async (req, res) =>{
  const userId = req.params.id;
  const updateData = { ...req.body };
  if(!userId) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }
  if (updateData.role) {
    updateData.role = normalizeRole(updateData.role);
  }
  if (updateData.status) {
    updateData.status = normalizeStatus(updateData.status);
  }
  try{
      const [updated] = await Employee.update(updateData, {
        where: { emp_id: userId }
      });  
      if (updated === 0) {
        return res.status(404).json({ message: 'User not found or no changes made' });
      }

      res.status(200).json({ message: 'Employee data updated successfully' });  
  }catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ message: 'Database error', error });
  }
}

exports.deleteEmployee = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  try {
    const deleted = await Employee.destroy({
      where: { emp_id: userId },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({ message: "Database error", error });
  }
}

const fs = require('fs');
const path = require('path');

exports.uploadEmployeeDocuments = async (req, res) => {
  try {
    const empId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const employee = await Employee.findByPk(empId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let existingDocs = employee.documents || [];
    let nextDocNum = existingDocs.length + 1;

    const newDocs = files.map(file => {
      const docName = `document${nextDocNum++}`;
      return {
        name: docName,
        originalName: file.originalname,
        url: `/uploads/employee_documents/${empId}/${file.filename}`,
        fileName: file.filename
      };
    });

    const updatedDocs = [...existingDocs, ...newDocs];
    employee.documents = updatedDocs;
    await employee.save();

    res.status(200).json({
      message: "Documents uploaded successfully",
      documents: updatedDocs
    });

  } catch (error) {
    console.error("Error uploading documents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteEmployeeDocument = async (req, res) => {
  try {
    const empId = req.params.id;
    const docName = req.params.docName; // e.g., document1

    const employee = await Employee.findByPk(empId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let docs = employee.documents || [];
    const docToDelete = docs.find(d => d.name === docName);

    if (!docToDelete) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, "../uploads/employee_documents", empId, docToDelete.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from array and save
    docs = docs.filter(d => d.name !== docName);
    employee.documents = docs;
    await employee.save();

    res.status(200).json({
      message: "Document deleted successfully",
      documents: docs
    });

  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
