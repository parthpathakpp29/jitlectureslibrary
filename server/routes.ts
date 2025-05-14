import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema } from "../shared/schema";

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
      console.log("Fetching subjects with params:", req.query);
      const branchId = parseInt(req.query.branchId as string);
      const semesterNumber = parseInt(req.query.semester as string);

      if (isNaN(branchId) || isNaN(semesterNumber)) {
        console.log("Invalid params - branchId:", branchId, "semesterNumber:", semesterNumber);
        return res
          .status(400)
          .json({ message: "Invalid branch ID or semester number" });
      }

      console.log("Looking for subjects with branchId:", branchId, "semesterNumber:", semesterNumber);
      const subjects = await storage.getSubjectsByBranchAndSemester(
        branchId,
        semesterNumber,
      );
      console.log("Found subjects:", subjects.length);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
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
  
  // User authentication and management
  
  // Create a new user (registration)
  apiRouter.post("/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // For simplicity, we're not hashing passwords in this example
      // In a real app, you should use bcrypt or similar
      const newUser = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // User login
  apiRouter.post("/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // For simplicity, we store the user ID in a query parameter
      // This simulates a session without implementing full session management
      // In a production app, you would use a secure session or JWT token
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        message: "Login successful",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // Logout
  apiRouter.post("/users/logout", async (req, res) => {
    // In a production app, you would destroy the session
    res.json({ message: "Logged out successfully" });
  });
  
  // Current user
  apiRouter.get("/users/me", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(Number(userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Middleware to check if user is a professor
  const isProfessor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(Number(userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.type !== "professor") {
        return res.status(403).json({ message: "Access denied. Only professors can perform this action." });
      }
      
      next();
    } catch (error) {
      console.error("Error checking professor status:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

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
  
  // Video management routes (for professors only)
  
  // Create a new video
  apiRouter.post("/videos", isProfessor, async (req, res) => {
    try {
      // Validate video data
      const videoData = req.body;
      
      if (!videoData.title || !videoData.youtubeId || !videoData.subjectId || !videoData.lecturerId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if the subject and lecturer exist
      const subject = await storage.getSubjectById(videoData.subjectId);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      const lecturer = await storage.getLecturer(videoData.lecturerId);
      if (!lecturer) {
        return res.status(404).json({ message: "Lecturer not found" });
      }
      
      // In a real application, we would validate the YouTube ID
      
      // Create the video
      const video = await storage.createVideo({
        title: videoData.title,
        description: videoData.description || "",
        youtubeId: videoData.youtubeId,
        duration: videoData.duration || 0,
        subjectId: videoData.subjectId,
        lecturerId: videoData.lecturerId,
        publishedAt: videoData.publishedAt || new Date().toISOString()
      });
      
      res.status(201).json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });
  
  // Update an existing video
  apiRouter.patch("/videos/:id", isProfessor, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const videoData = req.body;
      
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      // Check if the video exists
      const existingVideo = await storage.getVideoById(videoId);
      if (!existingVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Update the video
      const updatedVideo = await storage.updateVideo(videoId, videoData);
      
      res.json(updatedVideo);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });
  
  // Delete a video
  apiRouter.delete("/videos/:id", isProfessor, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      // Check if the video exists
      const existingVideo = await storage.getVideoById(videoId);
      if (!existingVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Delete the video
      await storage.deleteVideo(videoId);
      
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
