const Attempt = require('../models/Attempt');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const { evaluateSubmission } = require('../services/evaluationService');

// Start a new attempt
const startAttempt = async (req, res) => {
  const { learnerId, problemSlug } = req.body;
  if (!learnerId || !problemSlug) {
    return res.status(400).json({ error: 'learnerId and problemSlug are required' });
  }

  const problem = await Problem.findOne({ slug: problemSlug });
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const attempt = await Attempt.create({ learnerId, problem: problem._id });
  res.status(201).json(attempt);
};

// Runs in the background, does not block the response
const runEvaluation = async (attemptId, problem, content) => {
  try {
    const evalResult = await evaluateSubmission(problem, content);
    await Evaluation.findOneAndUpdate(
      { attempt: attemptId },
      {
        attempt: attemptId,
        results: evalResult.results,
        overallScore: evalResult.overallScore,
        summary: evalResult.summary,
      },
      { upsert: true }
    );
    await Attempt.findByIdAndUpdate(attemptId, { status: 'Completed' });
  } catch (err) {
    console.error('Evaluation error:', err.message);
    await Attempt.findByIdAndUpdate(attemptId, { status: 'Failed' });
  }
};

// Submit a solution for an attempt -> stores it, kicks off evaluation in background, responds immediately
const submitAttempt = async (req, res) => {
  const { content } = req.body;
  if (!content || content.trim().length < 20) {
    return res.status(400).json({ error: 'Submission content is too short to evaluate meaningfully' });
  }

  const attempt = await Attempt.findById(req.params.id).populate('problem');
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  // upsert: retrying a submission replaces the previous one instead of creating duplicates
  const submission = await Submission.findOneAndUpdate(
    { attempt: attempt._id },
    { attempt: attempt._id, content },
    { upsert: true, new: true }
  );

  attempt.status = 'Evaluating';
  await attempt.save();

  // fire and forget - do not await, so the request returns immediately
  runEvaluation(attempt._id, attempt.problem, content);

  // 202 Accepted: request understood, processing not yet complete
  res.status(202).json({ attempt, submission, message: 'Submission received, evaluation in progress' });
};

// Get one attempt with its submission + evaluation - frontend polls this to see when evaluation finishes
const getAttempt = async (req, res) => {
  const attempt = await Attempt.findById(req.params.id).populate('problem');
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  const submission = await Submission.findOne({ attempt: attempt._id });
  const evaluation = await Evaluation.findOne({ attempt: attempt._id });

  res.json({ attempt, submission, evaluation });
};

// Get attempt history for a learner
const getHistory = async (req, res) => {
  const { learnerId } = req.query;
  if (!learnerId) return res.status(400).json({ error: 'learnerId is required' });

  const attempts = await Attempt.find({ learnerId })
    .populate('problem', 'title slug')
    .sort({ createdAt: -1 });

  res.json(attempts);
};

module.exports = { startAttempt, submitAttempt, getAttempt, getHistory };