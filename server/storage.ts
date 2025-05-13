import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import {
  users,
  branches,
  semesters,
  subjects,
  lecturers,
  videos,
  type User,
  type InsertUser,
  type Branch,
  type InsertBranch,
  type Semester,
  type InsertSemester,
  type Subject,
  type InsertSubject,
  type Lecturer,
  type InsertLecturer,
  type Video,
  type InsertVideo,
} from "@shared/schema";

export class SupabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = neon(process.env.SUPABASE_DB_URL!);
    this.db = drizzle(sql, { logger: true }); // Logs all SQL queries
    console.log("✅ SupabaseStorage connected");
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where({ id });
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where({ username });
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllBranches(): Promise<Branch[]> {
    return await this.db.select().from(branches).orderBy(branches.id);
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const result = await this.db.select().from(branches).where({ id });
    return result[0];
  }

  async getBranchByCode(code: string): Promise<Branch | undefined> {
    const result = await this.db.select().from(branches).where({ code });
    return result[0];
  }

  async getSemestersByBranch(branchId: number): Promise<Semester[]> {
    return await this.db
      .select()
      .from(semesters)
      .where({ branchId })
      .orderBy(semesters.number);
  }

  async getSubjectsBySemester(semesterId: number): Promise<Subject[]> {
    return await this.db.select().from(subjects).where({ semesterId });
  }

  async getSubjectsByBranchAndSemester(
    branchId: number,
    semesterNumber: number,
  ): Promise<Subject[]> {
    const semesterResult = await this.db
      .select()
      .from(semesters)
      .where({ branchId, number: semesterNumber });

    if (semesterResult.length === 0) return [];

    return await this.db
      .select()
      .from(subjects)
      .where({ semesterId: semesterResult[0].id, branchId });
  }

  async getLecturer(id: number): Promise<Lecturer | undefined> {
    const result = await this.db.select().from(lecturers).where({ id });
    return result[0];
  }

  async getVideosBySubject(subjectId: number): Promise<Video[]> {
    return await this.db.select().from(videos).where({ subjectId });
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    const result = await this.db.select().from(videos).where({ id });
    return result[0];
  }
}
// 👇 Add this to fix the import error in routes.ts
export const storage = new SupabaseStorage();
