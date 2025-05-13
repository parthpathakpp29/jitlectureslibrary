import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(false),
  comingSoon: boolean("coming_soon").notNull().default(true),
});

export const semesters = pgTable("semesters", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  branchId: integer("branch_id").notNull(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  semesterId: integer("semester_id").notNull(),
  branchId: integer("branch_id").notNull(),
});

export const lecturers = pgTable("lecturers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  institution: text("institution").notNull(),
  imageUrl: text("image_url"),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  youtubeId: text("youtube_id").notNull(),
  duration: integer("duration").notNull(), // in seconds
  subjectId: integer("subject_id").notNull(),
  lecturerId: integer("lecturer_id").notNull(),
  publishedAt: timestamp("published_at"),
});

// Insert schemas and types
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBranchSchema = createInsertSchema(branches).pick({
  name: true,
  code: true,
  isActive: true,
  comingSoon: true,
});

export const insertSemesterSchema = createInsertSchema(semesters).pick({
  number: true,
  branchId: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  name: true,
  description: true,
  semesterId: true,
  branchId: true,
});

export const insertLecturerSchema = createInsertSchema(lecturers).pick({
  name: true,
  title: true,
  institution: true,
  imageUrl: true,
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  title: true,
  description: true,
  youtubeId: true,
  duration: true,
  subjectId: true,
  lecturerId: true,
  publishedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

export type Semester = typeof semesters.$inferSelect;
export type InsertSemester = z.infer<typeof insertSemesterSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Lecturer = typeof lecturers.$inferSelect;
export type InsertLecturer = z.infer<typeof insertLecturerSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
