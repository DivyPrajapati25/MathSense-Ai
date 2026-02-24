export const ASSIGNMENTS = [
  { id: 1, title: "Algebra Worksheet - Chapter 5", status: "Uploaded",     points: 50,  submissions: 28, date: "Sep 28, 2025" },
  { id: 2, title: "Geometry Problems Set A",        status: "Under Review", points: 40,  submissions: 24, date: "Sep 25, 2025" },
  { id: 3, title: "Fractions Quiz",                 status: "Pending",      points: 30,  submissions: 31, date: "Sep 23, 2025" },
  { id: 4, title: "Linear Equations - Homework 3",  status: "Uploaded",     points: 100, submissions: 25, date: "Oct 2, 2025"  },
];

export const ASSIGNMENT_DETAIL = {
  1: {
    students: [
      {
        id: 1, name: "Michael Chen", date: "Sep 28, 2025", status: "Pending Review",
        aiFeedback: "Strong understanding of linear equations. Minor arithmetic errors in Q3 and Q4.",
        questions: [
          { id: 1, label: "Question 1", status: "Perfect",      aiScore: 10, maxScore: 10, question: "Solve for x: 2x + 5 = 15",                         studentWork: "x = 5",   correctAnswer: "x = 5",   analysis: "Correct. Student shows clear working." },
          { id: 2, label: "Question 2", status: "Perfect",      aiScore: 15, maxScore: 15, question: "Expand and simplify: 3(x+4) - 2(x-1)",              studentWork: "x + 14",  correctAnswer: "x + 14",  analysis: "Correct expansion and simplification." },
          { id: 3, label: "Question 3", status: "Minor Issues", aiScore: 10, maxScore: 12, question: "Factorise: x² + 5x + 6",                            studentWork: "(x+2)(x+3)", correctAnswer: "(x+2)(x+3)", analysis: "Correct answer but method not shown." },
          { id: 4, label: "Question 4", status: "Minor Issues", aiScore: 11, maxScore: 13, question: "Solve the inequality: 3x - 7 > 2",                  studentWork: "x > 1",   correctAnswer: "x > 3",   analysis: "Arithmetic error. Should be x > 3." },
        ],
      },
      { id: 2, name: "Sarah Martinez", date: "Sep 28, 2025", status: "Not Graded",    aiFeedback: "",  questions: [] },
      { id: 3, name: "David Lee",      date: "Sep 28, 2025", status: "Not Graded",    aiFeedback: "",  questions: [] },
      { id: 4, name: "Liam Chen",      date: "Sep 28, 2025", status: "Not Graded",    aiFeedback: "",  questions: [] },
    ],
  },
  2: {
    students: [
      {
        id: 1, name: "Emma Wilson", date: "Sep 25, 2025", status: "Pending Review",
        aiFeedback: "Good grasp of angle relationships. Some confusion with parallel lines.",
        questions: [
          { id: 1, label: "Question 1", status: "Minor Issues", aiScore: 9,  maxScore: 10, question: "Find x if angles are supplementary: x + 40 = 180",  studentWork: "x = 130", correctAnswer: "x = 140", analysis: "Subtraction error. Should be 140." },
          { id: 2, label: "Question 2", status: "Perfect",      aiScore: 10, maxScore: 10, question: "What is the sum of interior angles of a triangle?", studentWork: "180°",    correctAnswer: "180°",    analysis: "Correct." },
          { id: 3, label: "Question 3", status: "Minor Issues", aiScore: 8,  maxScore: 10, question: "Find angle y if two parallel lines are cut by a transversal and corresponding angle is 65°", studentWork: "y = 115°", correctAnswer: "y = 65°", analysis: "Incorrect. Corresponding angles are equal when parallel lines are cut by transversal. Answer should be 65°, not 115°." },
          { id: 4, label: "Question 4", status: "Perfect",      aiScore: 10, maxScore: 10, question: "Name the type of triangle with sides 5, 5, 8",      studentWork: "Isosceles", correctAnswer: "Isosceles", analysis: "Correct." },
        ],
      },
      { id: 2, name: "James Thompson", date: "Sep 25, 2025", status: "Not Graded", aiFeedback: "", questions: [] },
      { id: 3, name: "Priya Patel",    date: "Sep 25, 2025", status: "Not Graded", aiFeedback: "", questions: [] },
    ],
  },
  3: {
    students: [
      { id: 1, name: "Noah Williams", date: "Sep 23, 2025", status: "Not Graded", aiFeedback: "", questions: [] },
      { id: 2, name: "Ava Johnson",   date: "Sep 23, 2025", status: "Not Graded", aiFeedback: "", questions: [] },
    ],
  },
  4: {
    students: [
      {
        id: 1, name: "Emily Johnson", date: "Oct 2, 2025", status: "Graded",
        aiScore: 85, finalScore: 85, maxScore: 100,
        aiFeedback: "Strong problem-solving approach with clear methodology. Minor sign errors in Questions 2 and 4.",
        finalFeedback: "Excellent work! Pay closer attention to negative signs during operations.",
        questions: [],
      },
      {
        id: 2, name: "Marcus Thompson", date: "Oct 2, 2025", status: "Graded",
        aiScore: 92, finalScore: 92, maxScore: 100,
        aiFeedback: "Outstanding work with excellent notation and clear step-by-step solutions.",
        finalFeedback: "Exemplary performance! Your work shows deep understanding.",
        questions: [],
      },
      {
        id: 3, name: "Sophia Chen", date: "Oct 2, 2025", status: "Graded",
        aiScore: 78, finalScore: 78, maxScore: 100,
        aiFeedback: "Good foundational understanding. Some gaps in showing working for complex problems.",
        finalFeedback: "Good effort! Focus on showing all steps clearly.",
        questions: [],
      },
    ],
  },
};

export const STATUS_STYLES = {
  Uploaded:         "bg-green-100 text-green-800 border-green-200",
  "Under Review":   "bg-yellow-100 text-yellow-800 border-yellow-200",
  Pending:          "bg-gray-100 text-gray-600 border-gray-200",
  Approved:         "bg-green-100 text-green-800 border-green-200",
  "Pending Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Not Graded":     "bg-amber-50 text-amber-700 border-amber-200",
};