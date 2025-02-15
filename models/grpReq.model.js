const mongoose = require('mongoose');

const groupRequestSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredMembers: { type: Number, required: true },
  skills: [String],
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN'
  },
  interestedStudents: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING'
    }
  }],
  createdAt: { type: Date, default: Date.now },
  sections: [String] // Track sections already represented
}, { timestamps: true });

module.exports = mongoose.model('GroupRequest', groupRequestSchema);
