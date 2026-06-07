// models/employee.js
const { DataTypes, INTEGER, STRING } = require("sequelize");
const sequelize = require("../config/database");
const {
  EMPLOYEE_ROLE_VALUES,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUS_VALUES,
  EMPLOYEE_STATUSES,
} = require("../constants/employeeRoles");

const Employee = sequelize.define(
  "Employee",
  {
    emp_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...EMPLOYEE_ROLE_VALUES),
      allowNull: false,
      defaultValue: EMPLOYEE_ROLES.CALLING,
    },
    status: {
      type: DataTypes.ENUM(...EMPLOYEE_STATUS_VALUES),
      allowNull: false,
      defaultValue: EMPLOYEE_STATUSES.ACTIVE,
    },
  },
  {
    tableName: "employees",
    timestamps: false, // set to true if using createdAt/updatedAt
  }
);

Employee.sync({ alter: false })

  .then(() => {
    console.log("Employee table created");
  })
  .catch((error) => {
    console.error("Error creating Employee table:", error);
  });

module.exports = Employee;
