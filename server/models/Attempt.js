const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  learnerId: { type: String, required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  status: {
    type: String,
    enum: ['InProgress', 'Submitted', 'Evaluating', 'Completed', 'Failed'],
    default: 'InProgress',
  },
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);