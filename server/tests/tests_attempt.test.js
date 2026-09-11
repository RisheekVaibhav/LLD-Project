
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const RUBRIC = require('../config/rubric');
const { buildPrompt } = require('../services/evaluationService');
 
// These tests validate schema rules and core logic WITHOUT needing a live DB connection.
// Mongoose lets you run schema validation (validateSync) on an unsaved document.
 
describe('Rubric configuration', () => {
  test('rubric has at least one criterion', () => {
    expect(RUBRIC.length).toBeGreaterThan(0);
  });
 
  test('every rubric entry has key, label, and description', () => {
    RUBRIC.forEach((r) => {
      expect(r).toHaveProperty('key');
      expect(r).toHaveProperty('label');
      expect(r).toHaveProperty('description');
      expect(typeof r.key).toBe('string');
    });
  });
 
  test('rubric keys are unique (no duplicate criteria)', () => {
    const keys = RUBRIC.map((r) => r.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });
});
 
describe('Problem model validation', () => {
  test('a valid problem passes validation', () => {
    const problem = new Problem({
      title: 'Test Problem',
      slug: 'test-problem',
      description: 'A description',
      requirements: ['req 1'],
      difficulty: 'Medium',
    });
    const err = problem.validateSync();
    expect(err).toBeUndefined();
  });
 
  test('a problem missing a required field fails validation', () => {
    const problem = new Problem({ slug: 'no-title' }); // missing title, description
    const err = problem.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.title).toBeDefined();
  });
 
  test('an invalid difficulty value fails validation', () => {
    const problem = new Problem({
      title: 'T',
      slug: 'x',
      description: 'd',
      difficulty: 'Impossible', // not in enum
    });
    const err = problem.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.difficulty).toBeDefined();
  });
});
 
describe('Attempt model validation', () => {
  test('a valid attempt passes validation and defaults to InProgress', () => {
    const attempt = new Attempt({
      learnerId: 'learner-1',
      problem: new mongoose.Types.ObjectId(),
    });
    const err = attempt.validateSync();
    expect(err).toBeUndefined();
    expect(attempt.status).toBe('InProgress');
  });
 
  test('an attempt missing learnerId fails validation', () => {
    const attempt = new Attempt({ problem: new mongoose.Types.ObjectId() });
    const err = attempt.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.learnerId).toBeDefined();
  });
 
  test('an invalid status value fails validation', () => {
    const attempt = new Attempt({
      learnerId: 'learner-1',
      problem: new mongoose.Types.ObjectId(),
      status: 'NotARealStatus',
    });
    const err = attempt.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.status).toBeDefined();
  });
});
 
describe('Submission model validation', () => {
  test('a submission missing content fails validation', () => {
    const submission = new Submission({ attempt: new mongoose.Types.ObjectId() });
    const err = submission.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.content).toBeDefined();
  });
 
  test('a valid submission passes validation', () => {
    const submission = new Submission({
      attempt: new mongoose.Types.ObjectId(),
      content: 'A design description.',
    });
    const err = submission.validateSync();
    expect(err).toBeUndefined();
  });
});
 
describe('Evaluation model validation', () => {
  test('a valid evaluation with results passes validation', () => {
    const evaluation = new Evaluation({
      attempt: new mongoose.Types.ObjectId(),
      results: [
        { criterion: 'requirement_understanding', score: 4, evidence: 'e', concern: 'c', suggestion: 's' },
      ],
      overallScore: 4,
      summary: 'Solid design.',
    });
    const err = evaluation.validateSync();
    expect(err).toBeUndefined();
  });
 
  test('a result missing a required criterion score fails validation', () => {
    const evaluation = new Evaluation({
      attempt: new mongoose.Types.ObjectId(),
      results: [{ criterion: 'requirement_understanding' }], // missing score
    });
    const err = evaluation.validateSync();
    expect(err).toBeDefined();
  });
});
 
describe('Evaluation prompt building', () => {
  const mockProblem = {
    title: 'Parking Lot',
    description: 'Design a parking system.',
    requirements: ['Support multiple levels', 'Track spots'],
  };
 
  test('prompt includes the problem title and requirements', () => {
    const prompt = buildPrompt(mockProblem, 'My design: a ParkingLot class...');
    expect(prompt).toContain('Parking Lot');
    expect(prompt).toContain('Support multiple levels');
    expect(prompt).toContain('Track spots');
  });
 
  test('prompt includes the learner submission content', () => {
    const prompt = buildPrompt(mockProblem, 'A very specific design detail here');
    expect(prompt).toContain('A very specific design detail here');
  });
 
  test('prompt includes every rubric criterion by key', () => {
    const prompt = buildPrompt(mockProblem, 'Some design');
    RUBRIC.forEach((r) => {
      expect(prompt).toContain(r.key);
    });
  });
 
  test('prompt explicitly requests JSON-only output (no unconstrained scoring)', () => {
    const prompt = buildPrompt(mockProblem, 'Some design');
    expect(prompt.toLowerCase()).toContain('json');
  });
});
 
