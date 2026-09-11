const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true, unique: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);