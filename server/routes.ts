import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = express.Router();

  // Get all branches
  apiRouter.get("/branches", async (req, res) => {
    try {
      console.log("Fetching branches...");
      const branches = await storage.getAllBranches();
      console.log("Branches fetched:", branches);
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  // Get branch by code
  apiRouter.get("/branches/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const branch = await storage.getBranchByCode(code);

      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      res.json(branch);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch branch" });
    }
  });

  // Get semesters by branch
  apiRouter.get("/branches/:branchId/semesters", async (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);

      if (isNaN(branchId)) {
        return res.status(400).json({ message: "Invalid branch ID" });
      }

      const semesters = await storage.getSemestersByBranch(branchId);
      res.json(semesters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch semesters" });
    }
  });

  // Get subjects by branch and semester
  apiRouter.get("/subjects", async (req, res) => {
    try {
      const branchId = parseInt(req.query.branchId as string);
      const semesterNumber = parseInt(req.query.semester as string);

      if (isNaN(branchId) || isNaN(semesterNumber)) {
        return res
          .status(400)
          .json({ message: "Invalid branch ID or semester number" });
      }

      const subjects = await storage.getSubjectsByBranchAndSemester(
        branchId,
        semesterNumber,
      );
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Get videos by subject
  apiRouter.get("/subjects/:subjectId/videos", async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);

      if (isNaN(subjectId)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }

      const videos = await storage.getVideosBySubject(subjectId);

      // Enhance videos with lecturer info
      const enhancedVideos = await Promise.all(
        videos.map(async (video) => {
          const lecturer = await storage.getLecturer(video.lecturerId);
          return {
            ...video,
            lecturer: lecturer || null,
          };
        }),
      );

      res.json(enhancedVideos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  apiRouter.get("/ping-supabase", async (_req, res) => {
    try {
      const branches = await storage.getAllBranches();
      res.json({ message: "✅ Supabase working!", branches });
    } catch (err: any) {
      console.error(err);
      res
        .status(500)
        .json({ message: "❌ Supabase failed", error: err.message });
    }
  });

  // Get video by id
  apiRouter.get("/videos/:id", async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);

      if (isNaN(videoId)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }

      const video = await storage.getVideoById(videoId);

      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const lecturer = await storage.getLecturer(video.lecturerId);

      res.json({
        ...video,
        lecturer: lecturer || null,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
