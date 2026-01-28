require("dotenv").config();

const fs = require("fs");
const path = require("path");

const connectDB = require("../config/db");
const Question = require("../models/Question");

/**
 * Seed Exit Exam questions into MongoDB.
 *
 * Usage:
 * 1) Create a JSON file (recommended) with this shape:
 *    [
 *      {
 *        "subject": "Operating Systems",
 *        "questionText": "What is ...?",
 *        "options": ["A", "B", "C", "D"],
 *        "correctAnswer": "B",
 *        "difficulty": "medium"
 *      }
 *    ]
 *
 * 2) Run:
 *    node backend/scripts/seedExitExamQuestions.js backend/scripts/exit_exam_questions.json
 *
 * Notes:
 * - This script UPSERTS by (subject + questionText).
 * - You can re-run it safely after edits.
 */

function normalizeString(s) {
  return String(s || "").trim();
}

function validateQuestion(q) {
  const subject = normalizeString(q.subject);
  const questionText = normalizeString(q.questionText);
  const options = Array.isArray(q.options) ? q.options.map(normalizeString).filter(Boolean) : [];
  const correctAnswer = normalizeString(q.correctAnswer);
  const explanation = q.explanation ? normalizeString(q.explanation) : "";
  const difficulty = q.difficulty ? normalizeString(q.difficulty) : "medium";

  if (!subject) return { ok: false, message: "Missing subject" };
  if (!questionText) return { ok: false, message: "Missing questionText" };
  if (options.length < 2 || options.length > 6) return { ok: false, message: "Options must be 2..6" };
  if (!correctAnswer) return { ok: false, message: "Missing correctAnswer" };
  if (!options.includes(correctAnswer)) return { ok: false, message: "correctAnswer must match one of options" };
  if (!["easy", "medium", "hard"].includes(difficulty)) return { ok: false, message: "Invalid difficulty" };

  return {
    ok: true,
    value: { subject, questionText, options, correctAnswer, explanation, difficulty },
  };
}

(async () => {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Please provide a JSON file path.");
    console.error("Example: node backend/scripts/seedExitExamQuestions.js backend/scripts/exit_exam_questions.json");
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(resolved, "utf-8"));
  } catch (err) {
    console.error("Failed to read/parse JSON:", err.message);
    process.exit(1);
  }

  if (!Array.isArray(raw)) {
    console.error("JSON must be an array of questions.");
    process.exit(1);
  }

  const valid = [];
  const invalid = [];

  raw.forEach((q, idx) => {
    const v = validateQuestion(q);
    if (!v.ok) invalid.push({ idx, error: v.message, q });
    else valid.push(v.value);
  });

  if (invalid.length > 0) {
    console.error(`Found ${invalid.length} invalid questions. Fix them and re-run.`);
    console.error(invalid.slice(0, 10));
    process.exit(1);
  }

  try {
    await connectDB();

    let created = 0;
    let updated = 0;

    for (const q of valid) {
      const filter = { subject: q.subject, questionText: q.questionText };
      const update = { $set: q };
      const existing = await Question.findOne(filter).select("_id");

      if (existing) {
        await Question.updateOne(filter, update);
        updated += 1;
      } else {
        await Question.create(q);
        created += 1;
      }
    }

    console.log(`Seed complete. Created: ${created}, Updated: ${updated}, Total input: ${valid.length}`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
})();

