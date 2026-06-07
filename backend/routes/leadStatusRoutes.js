const express = require("express");
const router = express.Router();
const leadStatusController = require("../controllers/leadStatusController");

router.get("/lead-statuses", leadStatusController.getLeadStatuses);
router.post("/lead-statuses", leadStatusController.createLeadStatus);
router.put("/lead-statuses/:id", leadStatusController.updateLeadStatus);
router.delete("/lead-statuses/:id", leadStatusController.deleteLeadStatus);

module.exports = router;
