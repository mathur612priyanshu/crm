const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const upload = require('../middlewares/upload');

router.post('/submit-lead', isAuthenticated, leadController.addLead);
router.get('/leads', leadController.getLeads);
router.get('/unassigned-fresh-leads', leadController.getUnassignedFreshLeads);
router.post('/assign-unassigned-fresh-leads/:emp_id', leadController.assignUnassignedFreshLeads);
router.get('/leads/:emp_id', leadController.getLeadsById);
router.put('/leads/:id', isAuthenticated, leadController.updateLead);
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
router.get('/dashboardStats', leadController.getDashboardStats);
router.post('/reassignLeadsBulk', leadController.reassignLeadsBulk);
router.get('/getFollowups', leadController.getFollowupsPaginated);

module.exports = router;
