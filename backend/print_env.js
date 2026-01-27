require("dotenv").config();
console.log("MONGO_URI=" + (process.env.MONGO_URI || "<NOT SET>"));
console.log("JWT_SECRET=" + (process.env.JWT_SECRET || "<NOT SET>"));
console.log("PORT=" + (process.env.PORT || "<NOT SET>"));
