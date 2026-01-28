// Ethiopian Exit Exam mock (Computer Science only)
//
// You said you will provide:
// - the exact 16 course/subject names
// - the minimum number of questions per course in each attempt
//
// Update `subjects` and `minQuestionsPerSubject` accordingly.

module.exports = {
  program: "computer_science",
  examType: "exit_exam",

  // Title/labels shown to students
  title: "Computer Science Exit Exam (Mock)",
  subjectLabel: "Ethiopian Exit Exam - Computer Science",

  // Duration for the whole combined exam (minutes)
  durationMinutes: 180,

  // Exact course names (16)
  subjects: [
    "Computer Programming",
    "Fundamental Database Systems",
    "Object Oriented Programming",
    "Computer organization and Architecture",
    "Data Communication and Computer Networking",
    "Data Structures and Algorithms",
    "Web programming",
    "Operating System",
    "Software Engineering",
    "Design and Analysis of Algorithms",
    "Introduction to Artificial Intelligence",
    "Computer Security",
    "Network and System Administration",
    "Automata and Complexity Theory",
    "Compiler Design",
    "Advanced Databse",
  ],

  // Question generation rules:
  // - Each course contributes baseQuestionsPerSubject (6) questions
  // - Then we add extraQuestionsTotal (4) questions by picking extraDistinctSubjects (4) random courses,
  //   adding 1 extra question from each selected course.
  baseQuestionsPerSubject: 6,
  extraQuestionsTotal: 4,
  extraDistinctSubjects: 4,
};

