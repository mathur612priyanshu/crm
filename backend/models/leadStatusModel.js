const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DEFAULT_LEAD_STATUSES = [
  { name: "Fresh Lead", team: "calling", is_initial: true, is_protected: true, sort_order: 10 },
  { name: "Interested", team: "calling", sort_order: 20 },
  { name: "Call Back", team: "calling", sort_order: 30 },
  { name: "Follow up", team: "calling", sort_order: 40 },
  { name: "No Requirement", team: "calling", sort_order: 50 },
  { name: "Not Pick", team: "calling", sort_order: 60 },
  { name: "Not Connected", team: "calling", sort_order: 70 },
  { name: "Document Pending", team: "calling", sort_order: 80 },
  { name: "Document Rejected", team: "calling", sort_order: 90 },
  { name: "File Login", team: "both", is_file_login: true, is_protected: true, sort_order: 100 },
  { name: "Loan Section", team: "operations", sort_order: 110 },
  { name: "Loan Disbursement", team: "operations", sort_order: 120 },
];

const LeadStatus = sequelize.define(
  "LeadStatus",
  {
    status_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    team: {
      type: DataTypes.ENUM("calling", "operations", "both"),
      allowNull: false,
      defaultValue: "calling",
    },
    is_initial: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_file_login: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_protected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
  },
  {
    tableName: "lead_statuses",
    timestamps: true,
  }
);

LeadStatus.sync({ alter: false })
  .then(async () => {
    console.log("LeadStatus table created");
    for (const status of DEFAULT_LEAD_STATUSES) {
      await LeadStatus.findOrCreate({
        where: { name: status.name },
        defaults: status,
      });
    }
  })
  .catch((error) => {
    console.error("Error creating LeadStatus table:", error);
  });

module.exports = LeadStatus;
