const GroupRequest = require('../models/grpReq.model.js');
const Group = require('../models/grp.model.js');
const User = require('../models/user.model.js');
const { sendEmail , sendAcceptanceEmail  } = require('../utils/emailService.js');

exports.createGroupRequest = async (req, res) => {
  try {
    const { title, description, requiredMembers, skills } = req.body;
    const creator = req.user.id;

    // Get creator's section
    const user = await User.findById(creator);
    if (user.currentGroup) {
      return res.status(400).json({ message: 'You are already in a group' });
    }

    const groupRequest = new GroupRequest({
      creator,
      title,
      description,
      requiredMembers,
      skills,
      sections: [user.section]
    });

    await groupRequest.save();
    res.status(201).json(groupRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.showInterest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const studentId = req.user.id;

    const student = await User.findById(studentId).select('name email section');
    const groupRequest = await GroupRequest.findById(requestId)
      .populate('creator', 'name email');

    if (!groupRequest || !groupRequest.creator || !groupRequest.creator.email) {
      throw new Error('Invalid group request or creator email missing');
    }

    // Check if student is already in a group
    if (student.currentGroup) {
      return res.status(400).json({ message: 'You are already in a group' });
    }

    // Check if student's section is already represented
    if (groupRequest.sections.includes(student.section)) {
      return res.status(400).json({ message: 'A student from your section is already in this group' });
    }

    // Add student to interested list
    groupRequest.interestedStudents.push({
      student: studentId,
      status: 'PENDING'
    });

    await groupRequest.save();

    // Log email data for debugging
    console.log('Sending email to:', groupRequest.creator.email);
    
    const emailHtml = `
      <h2>New Interest in Your Group Request</h2>
      <p>Hello ${groupRequest.creator.name},</p>
      <p>${student.name} from section ${student.section} has shown interest in your group request "${groupRequest.title}".</p>
      <p>Login to the platform to review their profile and accept/reject their request.</p>
    `;

    // Verify email data before sending
    if (!groupRequest.creator.email) {
      throw new Error('Creator email is missing');
    }

    await sendEmail({
      to: groupRequest.creator.email,
      subject: 'New Interest in Your PBL Group',
      html: emailHtml
    });

    res.json(groupRequest);
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.acceptStudent = async (req, res) => {
  try {
    const { requestId, studentId } = req.params;
    const creatorId = req.user.id;

    const groupRequest = await GroupRequest.findById(requestId)
      .populate('creator', 'name email phone')
      .populate('interestedStudents.student', 'name email section phone');

    if (!groupRequest || groupRequest.creator.toString() !== creatorId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const student = await User.findById(studentId).select('name email section phone');
    
    // Update student status
    const studentRequest = groupRequest.interestedStudents.find(
      req => req.student._id.toString() === studentId
    );

    if (studentRequest) {
      studentRequest.status = 'ACCEPTED';
      groupRequest.sections.push(student.section);

      // Send acceptance email
      await sendAcceptanceEmail({
        to: student.email,
        studentName: student.name,
        groupTitle: groupRequest.title,
        creatorName: groupRequest.creator.name,
        creatorPhone: groupRequest.creator.phone,
        creatorEmail: groupRequest.creator.email
      });
    }

    // Check if group is complete
    const acceptedStudents = groupRequest.interestedStudents.filter(
      req => req.status === 'ACCEPTED'
    );

    if (acceptedStudents.length + 1 === groupRequest.requiredMembers) {
      // Create new group
      const group = new Group({
        name: `${groupRequest.title} Group`,
        members: [creatorId, ...acceptedStudents.map(req => req.student._id)],
        project: {
          title: groupRequest.title,
          description: groupRequest.description
        }
      });

      await group.save();
      groupRequest.status = 'CLOSED';
    }

    await groupRequest.save();
    res.json({
      message: 'Student accepted successfully',
      groupRequest,
      studentContact: {
        name: student.name,
        email: student.email,
        phone: student.phone
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await GroupRequest.find({ status: 'OPEN' })
      .populate('creator', 'name section')
      .populate('interestedStudents.student', 'name section');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.closeGroup = async (req, res) => {
  try {
      const { requestId } = req.params;
      console.log(requestId)
      const group = await GroupRequest.findById(requestId);

      if (!group) {
          return res.status(404).json({ message: 'Group not found' });
      }

      if (group.creator.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized to close this group' });
      }

      group.status = 'CLOSED';
      await group.save();

      res.status(200).json({ message: 'Group closed successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
};

// Show Interested Students for a Group
exports.getInterestedStudents = async (req, res) => {
  try {
      const { requestId } = req.params;
      
      const group = await Group.findById(requestId).populate('interestedStudents.student', 'name email section');

      if (!group) {
          return res.status(404).json({ message: 'Group not found' });
      }

      res.status(200).json({ interestedStudents: group.interestedStudents });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await GroupRequest.find({ 
      creator: req.user.id,
      status: 'OPEN' 
    })
    .populate('creator', 'name section')
    .populate('interestedStudents.student', 'name section');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};