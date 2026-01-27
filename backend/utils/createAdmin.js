const User = require("../models/User");

const createInitialAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminName = process.env.ADMIN_NAME || "Administrator";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(`Admin user already exists: ${existingAdmin.email}`);
      return existingAdmin;
    }

    // If no admin by role, check by the provided email
    const byEmail = await User.findOne({ email: adminEmail });
    if (byEmail) {
      // If the email exists but not admin, promote it
      if (byEmail.role !== "admin") {
        byEmail.role = "admin";
        await byEmail.save();
        console.log(`Promoted existing user to admin: ${byEmail.email}`);
        return byEmail;
      }
      console.log(`Admin user already exists by email: ${byEmail.email}`);
      return byEmail;
    }

    // Create a new admin user
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    console.log(`Created initial admin: ${admin.email}`);
    return admin;
  } catch (error) {
    console.error("Failed to create initial admin:", error.message);
    throw error;
  }
};

module.exports = createInitialAdmin;
