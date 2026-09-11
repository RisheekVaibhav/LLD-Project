const RUBRIC = [
  {
    key: 'requirement_understanding',
    label: 'Requirement Understanding',
    description: 'Does the design address the stated requirements and reasonable edge cases?',
  },
  {
    key: 'responsibility_clarity',
    label: 'Class Responsibilities',
    description: 'Are responsibilities clearly assigned to classes, avoiding god-classes or misplaced logic?',
  },
  {
    key: 'coupling_cohesion',
    label: 'Coupling & Cohesion',
    description: 'Are classes loosely coupled and internally cohesive?',
  },
  {
    key: 'abstraction_interfaces',
    label: 'Abstraction & Interfaces',
    description: 'Is abstraction used appropriately, with interfaces where they add real value?',
  },
  {
    key: 'extensibility',
    label: 'Extensibility',
    description: 'Can the design accommodate reasonable future changes without a major rewrite?',
  },
  {
    key: 'explanation_quality',
    label: 'Explanation Quality',
    description: 'Is the reasoning behind design decisions clearly explained?',
  },
];

module.exports = RUBRIC;