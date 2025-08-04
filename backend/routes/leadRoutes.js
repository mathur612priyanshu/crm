const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const upload = require('../middlewares/upload');

router.post('/submit-lead', leadController.addLead);
router.get('/leads', leadController.getLeads);
router.get('/leads/:emp_id', leadController.getLeadsById);
router.put('/leads/:id', leadController.updateLead);
router.delete('/delete-lead/:id', leadController.deleteLead);
router.get('/getLead/:id', leadController.getLeadDetails);
router.get('/getLeadsByDate', leadController.leadsByDate);
router.get('/getLeadsByEmpIdAndDate/:emp_id', leadController.leadsByEmpIdAndDate);
router.post(
  '/addLeadsFromExcel',
  upload.single('file'),
  leadController.importLeadsFromExcel
);
router.get('/getCountsByEmpId/:emp_id', leadController.getLeadCountByEmpId);
router.get('/getFreshLeadsByEmpId/:emp_id', leadController.getFreshLeadsByEmpId);
router.get('/getLeadByNumber/:lead_number', leadController.getLeadByNumber);
router.get('/getLeadsForAdminPanel', leadController.getLeadsForAdminPanel);
router.get('/getFollowupsCount', leadController.getLeadsByNextMeeting);
router.get('/getFilteredLeads', leadController.getFilteredLeads);

module.exports = router;