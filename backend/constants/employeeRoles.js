const EMPLOYEE_ROLES = {
  CALLING: "calling",
  MANAGER: "manager",
  OPERATIONS: "operations",
};

const EMPLOYEE_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

const EMPLOYEE_ROLE_VALUES = Object.values(EMPLOYEE_ROLES);
const EMPLOYEE_STATUS_VALUES = Object.values(EMPLOYEE_STATUSES);

module.exports = {
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
  EMPLOYEE_ROLE_VALUES,
  EMPLOYEE_STATUS_VALUES,
};
