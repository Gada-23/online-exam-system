require("dotenv").config();
const connectDB = require("../config/db");
const createInitialAdmin = require("../utils/createAdmin");

(async () => {
  try {
    await connectDB();
    await createInitialAdmin();
    console.log("Done");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
