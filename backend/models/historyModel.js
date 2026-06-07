const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");
const LeadStatus = require("../models/leadStatusModel");
const Employee = require("../models/employeesModel");

const History = sequelize.define(
    "History",
    {
        history_id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        lead_id :{
            type : DataTypes.INTEGER,
            allowNull : false
        },
        next_meeting:{
            type : DataTypes.DATE
        },
        status_id:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        previous_status_id: {
            type: DataTypes.INTEGER
        },
        changed_by_emp_id: {
            type: DataTypes.STRING
        },
        loanType: {
            type: DataTypes.STRING
        },
        remark: {
            type: DataTypes.STRING
        }
    },
    {
    tableName: "histories",
    timestamps: true,
  }
);

History.belongsTo(LeadStatus, {
    foreignKey: "status_id",
    as: "statusDetails",
});

History.belongsTo(LeadStatus, {
    foreignKey: "previous_status_id",
    as: "previousStatusDetails",
});

History.belongsTo(Employee, {
    foreignKey: "changed_by_emp_id",
    as: "changedBy",
});

    History.sync({alter : false}).then(()=> {
        console.log("History table created")
    }).catch((error) => {
        console.error("Error creating history table", error);
    });

module.exports = History;
