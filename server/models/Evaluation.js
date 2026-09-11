const mongoose = require('mongoose');

const criterionResultSchema = new mongoose.Schema({
  criterion: { type: String, required: true },
  score: { type: Number, required: true },
  evidence: { type: String },
  concern: { type: String },
  suggestion: { type: String },
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true, unique: true },
  results: [criterionResultSchema],
  overallScore: { type: Number },
  summary: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);