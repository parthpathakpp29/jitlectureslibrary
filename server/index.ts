import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes";
import { supabase } from "./storage"; // Make sure this is initializing correctly

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api", routes);

// Root route for health checks
app.get("/", (_req, res) => {
  res.send("✅ JitLecturesLibrary backend is running.");
});

// Optional: Run seed script if SEED_PATH is defined
async function maybeRunSeedScript() {
  const seedPath = process.env.SEED_PATH;
  if (!seedPath) {
    console.log("⏭️  Skipping seeding (SEED_PATH not set)");
    return;
  }

  try {
    // Ensure compatibility with ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const resolvedPath = path.resolve(__dirname, seedPath);

    console.log(`🌱 Seeding from: ${resolvedPath}`);
    const seedModule = await import(resolvedPath);
    if (seedModule.default) await seedModule.default();
    else if (typeof seedModule === "function") await seedModule();
    console.log("✅ Seeding complete");
  } catch (err) {
    console.error("❌ Failed to run seed script:", err);
  }
}

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // Optional seed
  await maybeRunSeedScript();
});
