const express = require('express');
const router = express.Router();
const { 
  createGroupRequest, 
  getAllRequests, 
  showInterest, 
  acceptStudent ,
  closeGroup,
  getMyRequests,
  getInterestedStudents
} = require('../controllers/group.controller.js');
const auth = require('../middlewares/authMiddleware.js');

router.post('/request', auth, createGroupRequest);
router.get('/requests', auth, getAllRequests);
router.post('/request/:requestId/interest', auth, showInterest);
router.post('/request/:requestId/accept/:studentId', auth, acceptStudent);


router.post('/request/:requestId/close', auth, closeGroup);

router.get('/request/:requestId/interested-students', auth, getInterestedStudents);
router.get('/my-requests', auth, getMyRequests);

module.exports = router;
