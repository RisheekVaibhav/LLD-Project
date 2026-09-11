const Problem = require('../models/Problem');

const getAllProblems = async (req, res) => {
  const problems = await Problem.find().select('title slug difficulty description');
  res.json(problems);
};

const getProblemBySlug = async (req, res) => {
  const problem = await Problem.findOne({ slug: req.params.slug });
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  res.json(problem);
};

module.exports = { getAllProblems, getProblemBySlug };