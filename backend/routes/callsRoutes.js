const express = require("express");
const router = express.Router();
const callsController = require("../controllers/callsController");

router.post('/calls', callsController.addCalls);
router.get('/calls/:id', callsController.getCalls);
router.get('/callsByLeadId/:id', callsController.getCallsByLeadId);
router.put('/updateCall/:callId', callsController.updateCall);
router.get('/callsByDates', callsController.getCallsByDates);
router.get('/callsByEmpIdAndDate/:emp_id', callsController.getCallsByEmpIdAndDates);
router.get('/totalCallsCountByEmployee/:emp_id', callsController.getTotalCallsCountByEmployeeId);
router.get('/filterCalls/:emp_id', callsController.filterCalls);

module.exports = router;