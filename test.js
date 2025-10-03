import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
});

// Test Database Connection when the server starts
pool.query("SELECT 1+1 AS test", (err, res) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
    } else {
      console.log("✅ Connected to PostgreSQL! Result:", res.rows[0].test);
    }
});

export default pool;