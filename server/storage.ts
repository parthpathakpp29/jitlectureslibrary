import { createClient } from '@supabase/supabase-js';
import {
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

// Define the interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Branch methods
  getAllBranches(): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  getBranchByCode(code: string): Promise<Branch | undefined>;
  
  // Semester methods
  getSemestersByBranch(branchId: number): Promise<Semester[]>;
  
  // Subject methods
  getSubjectsBySemester(semesterId: number): Promise<Subject[]>;
  getSubjectsByBranchAndSemester(branchId: number, semesterNumber: number): Promise<Subject[]>;
  
  // Lecturer methods
  getLecturer(id: number): Promise<Lecturer | undefined>;
  
  // Video methods
  getVideosBySubject(subjectId: number): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
}

// Create a fallback memory storage for testing
class MemStorage implements IStorage {
  private users: User[] = [];
  private branches: Branch[] = [
    { id: 1, name: 'Computer Science Engineering', code: 'CSE', isActive: true, comingSoon: false },
    { id: 2, name: 'Electronics & Communication Engineering', code: 'ECE', isActive: false, comingSoon: true },
    { id: 3, name: 'Mechanical Engineering', code: 'ME', isActive: false, comingSoon: true },
    { id: 4, name: 'Civil Engineering', code: 'CE', isActive: false, comingSoon: true },
    { id: 5, name: 'Electrical Engineering', code: 'EE', isActive: false, comingSoon: true }
  ];
  private semesters: Semester[] = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    branchId: 1
  }));
  private subjects: Subject[] = [
    { id: 1, name: 'Engineering Mathematics I', description: 'Introduction to calculus, differential equations, and linear algebra', semesterId: 1, branchId: 1 },
    { id: 2, name: 'Physics', description: 'Mechanics, electromagnetism, and modern physics', semesterId: 1, branchId: 1 },
    { id: 3, name: 'Introduction to Computing', description: 'Basic computer organization, algorithms, and programming concepts', semesterId: 1, branchId: 1 }
  ];
  private lecturers: Lecturer[] = [];
  private videos: Video[] = [];

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = { ...user, id: this.users.length + 1 };
    this.users.push(newUser);
    return newUser;
  }

  async getAllBranches(): Promise<Branch[]> {
    console.log("Fetching branches...");
    console.log("Branches fetched:", this.branches);
    return this.branches;
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    return this.branches.find(b => b.id === id);
  }

  async getBranchByCode(code: string): Promise<Branch | undefined> {
    return this.branches.find(b => b.code === code);
  }

  async getSemestersByBranch(branchId: number): Promise<Semester[]> {
    return this.semesters.filter(s => s.branchId === branchId);
  }

  async getSubjectsBySemester(semesterId: number): Promise<Subject[]> {
    return this.subjects.filter(s => s.semesterId === semesterId);
  }

  async getSubjectsByBranchAndSemester(branchId: number, semesterNumber: number): Promise<Subject[]> {
    const semester = this.semesters.find(s => s.branchId === branchId && s.number === semesterNumber);
    if (!semester) return [];
    return this.subjects.filter(s => s.semesterId === semester.id && s.branchId === branchId);
  }

  async getLecturer(id: number): Promise<Lecturer | undefined> {
    return this.lecturers.find(l => l.id === id);
  }

  async getVideosBySubject(subjectId: number): Promise<Video[]> {
    return this.videos.filter(v => v.subjectId === subjectId);
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    return this.videos.find(v => v.id === id);
  }
}

export class SupabaseStorage implements IStorage {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    // Get credentials from environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase URL and anon key are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
    }
    
    // Initialize Supabase client
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ SupabaseStorage connected");
    
    // Initialize database
    this.initializeDatabase();
  }
  
  private async initializeDatabase() {
    try {
      // Check if tables exist
      console.log("Checking for existing tables...");
      const { data: existingTables, error } = await this.supabase
        .from('branches')
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') { // Table doesn't exist error
          console.log("Tables don't exist, creating them...");
          await this.createTables();
        } else {
          console.error("Error checking tables:", error);
        }
      } else if (!existingTables || existingTables.length === 0) {
        console.log("Tables exist but are empty, seeding initial data...");
        await this.seedInitialData();
      } else {
        console.log("Tables already exist with data");
      }
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }
  
  private async createTables() {
    try {
      // Create tables directly using the Supabase client
      console.log("Creating tables directly using Supabase client...");
      
      // Create branches table first
      const { error: branchesError } = await this.supabase
        .from('branches')
        .insert([
          { name: 'Computer Science Engineering', code: 'CSE', is_active: true, coming_soon: false },
          { name: 'Electronics & Communication Engineering', code: 'ECE', is_active: false, coming_soon: true },
          { name: 'Mechanical Engineering', code: 'ME', is_active: false, coming_soon: true },
          { name: 'Civil Engineering', code: 'CE', is_active: false, coming_soon: true },
          { name: 'Electrical Engineering', code: 'EE', is_active: false, coming_soon: true }
        ]);
        
      if (branchesError) {
        console.error("Error creating branches table:", branchesError);
      } else {
        console.log("✅ Branches table created and seeded");
        
        // Get the CSE branch ID
        const { data: branches } = await this.supabase
          .from('branches')
          .select('*')
          .eq('code', 'CSE');
          
        if (branches && branches.length > 0) {
          const cseBranch = branches[0];
          
          // Create semesters
          const semestersData = [];
          for (let i = 1; i <= 8; i++) {
            semestersData.push({ number: i, branch_id: cseBranch.id });
          }
          
          const { error: semestersError } = await this.supabase
            .from('semesters')
            .insert(semestersData);
            
          if (semestersError) {
            console.error("Error creating semesters:", semestersError);
          } else {
            console.log("✅ Semesters table created and seeded");
            
            // Get first semester ID
            const { data: semesters } = await this.supabase
              .from('semesters')
              .select('*')
              .eq('branch_id', cseBranch.id)
              .eq('number', 1);
              
            if (semesters && semesters.length > 0) {
              const firstSemester = semesters[0];
              
              // Create subjects
              const subjectsData = [
                {
                  name: 'Engineering Mathematics I',
                  description: 'Introduction to calculus, differential equations, and linear algebra',
                  semester_id: firstSemester.id,
                  branch_id: cseBranch.id
                },
                {
                  name: 'Physics',
                  description: 'Mechanics, electromagnetism, and modern physics',
                  semester_id: firstSemester.id,
                  branch_id: cseBranch.id
                },
                {
                  name: 'Introduction to Computing',
                  description: 'Basic computer organization, algorithms, and programming concepts',
                  semester_id: firstSemester.id,
                  branch_id: cseBranch.id
                }
              ];
              
              const { error: subjectsError } = await this.supabase
                .from('subjects')
                .insert(subjectsData);
                
              if (subjectsError) {
                console.error("Error creating subjects:", subjectsError);
              } else {
                console.log("✅ Subjects table created and seeded");
              }
            }
          }
        }
      }
      
      console.log("✅ Database initialization complete");
      
    } catch (error) {
      console.error("Error creating tables:", error);
      throw error;
    }
  }
  
  private async seedInitialData() {
    try {
      // Seed branches
      const branchesData = [
        { name: 'Computer Science Engineering', code: 'CSE', is_active: true, coming_soon: false },
        { name: 'Electronics & Communication Engineering', code: 'ECE', is_active: false, coming_soon: true },
        { name: 'Mechanical Engineering', code: 'ME', is_active: false, coming_soon: true },
        { name: 'Civil Engineering', code: 'CE', is_active: false, coming_soon: true },
        { name: 'Electrical Engineering', code: 'EE', is_active: false, coming_soon: true }
      ];
      
      const { data: branches, error: branchError } = await this.supabase
        .from('branches')
        .upsert(branchesData, { onConflict: 'code' })
        .select();
      
      if (branchError) {
        console.error("Error seeding branches:", branchError);
        return;
      }
      
      console.log("✅ Branches seeded:", branches?.length);
      
      // Get CSE branch id
      const cseBranch = branches?.find(b => b.code === 'CSE');
      if (!cseBranch) {
        console.error("Could not find CSE branch after seeding");
        return;
      }
      
      // Seed semesters for CSE
      const semestersData = [];
      for (let i = 1; i <= 8; i++) {
        semestersData.push({ number: i, branch_id: cseBranch.id });
      }
      
      const { data: semesters, error: semesterError } = await this.supabase
        .from('semesters')
        .upsert(semestersData, { onConflict: 'number, branch_id' })
        .select();
      
      if (semesterError) {
        console.error("Error seeding semesters:", semesterError);
        return;
      }
      
      console.log("✅ Semesters seeded:", semesters?.length);
      
      // Seed sample subjects for first semester
      if (semesters && semesters.length > 0) {
        const firstSemester = semesters.find(s => s.number === 1);
        if (firstSemester) {
          const subjectsData = [
            {
              name: 'Engineering Mathematics I',
              description: 'Introduction to calculus, differential equations, and linear algebra',
              semester_id: firstSemester.id,
              branch_id: cseBranch.id
            },
            {
              name: 'Physics',
              description: 'Mechanics, electromagnetism, and modern physics',
              semester_id: firstSemester.id,
              branch_id: cseBranch.id
            },
            {
              name: 'Introduction to Computing',
              description: 'Basic computer organization, algorithms, and programming concepts',
              semester_id: firstSemester.id,
              branch_id: cseBranch.id
            }
          ];
          
          const { data: subjects, error: subjectError } = await this.supabase
            .from('subjects')
            .upsert(subjectsData)
            .select();
          
          if (subjectError) {
            console.error("Error seeding subjects:", subjectError);
          } else {
            console.log("✅ Subjects seeded:", subjects?.length);
          }
        }
      }
      
      console.log("✅ Initial data seeded successfully");
    } catch (error) {
      console.error("Error seeding initial data:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
    
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
    
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating user:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    return data as User;
  }

  // Branch methods
  async getAllBranches(): Promise<Branch[]> {
    console.log("Fetching branches...");
    const { data, error } = await this.supabase
      .from('branches')
      .select('*')
      .order('id');
    
    if (error) {
      console.error("Error fetching branches:", error);
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }
    
    console.log("Branches fetched:", data);
    return data.map(branch => ({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      isActive: branch.is_active,
      comingSoon: branch.coming_soon
    })) as Branch[];
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const { data, error } = await this.supabase
      .from('branches')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error getting branch:", error);
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      isActive: data.is_active,
      comingSoon: data.coming_soon
    } as Branch;
  }

  async getBranchByCode(code: string): Promise<Branch | undefined> {
    const { data, error } = await this.supabase
      .from('branches')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error) {
      console.error("Error getting branch by code:", error);
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      isActive: data.is_active,
      comingSoon: data.coming_soon
    } as Branch;
  }

  // Semester methods
  async getSemestersByBranch(branchId: number): Promise<Semester[]> {
    const { data, error } = await this.supabase
      .from('semesters')
      .select('*')
      .eq('branch_id', branchId)
      .order('number');
    
    if (error) {
      console.error("Error getting semesters by branch:", error);
      return [];
    }
    
    return data.map(semester => ({
      id: semester.id,
      number: semester.number,
      branchId: semester.branch_id
    })) as Semester[];
  }

  // Subject methods
  async getSubjectsBySemester(semesterId: number): Promise<Subject[]> {
    const { data, error } = await this.supabase
      .from('subjects')
      .select('*')
      .eq('semester_id', semesterId);
    
    if (error) {
      console.error("Error getting subjects by semester:", error);
      return [];
    }
    
    return data.map(subject => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      semesterId: subject.semester_id,
      branchId: subject.branch_id
    })) as Subject[];
  }

  async getSubjectsByBranchAndSemester(
    branchId: number,
    semesterNumber: number
  ): Promise<Subject[]> {
    // First get the semester
    const { data: semesters, error: semesterError } = await this.supabase
      .from('semesters')
      .select('*')
      .eq('branch_id', branchId)
      .eq('number', semesterNumber);
    
    if (semesterError || !semesters || semesters.length === 0) {
      console.error("Error getting semester:", semesterError);
      return [];
    }
    
    const semesterId = semesters[0].id;
    
    // Now get subjects for this semester
    const { data, error } = await this.supabase
      .from('subjects')
      .select('*')
      .eq('semester_id', semesterId)
      .eq('branch_id', branchId);
    
    if (error) {
      console.error("Error getting subjects by branch and semester:", error);
      return [];
    }
    
    return data.map(subject => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      semesterId: subject.semester_id,
      branchId: subject.branch_id
    })) as Subject[];
  }

  // Lecturer methods
  async getLecturer(id: number): Promise<Lecturer | undefined> {
    const { data, error } = await this.supabase
      .from('lecturers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error getting lecturer:", error);
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.name,
      title: data.title,
      institution: data.institution,
      imageUrl: data.image_url
    } as Lecturer;
  }

  // Video methods
  async getVideosBySubject(subjectId: number): Promise<Video[]> {
    const { data, error } = await this.supabase
      .from('videos')
      .select('*')
      .eq('subject_id', subjectId);
    
    if (error) {
      console.error("Error getting videos by subject:", error);
      return [];
    }
    
    return data.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      youtubeId: video.youtube_id,
      duration: video.duration,
      subjectId: video.subject_id,
      lecturerId: video.lecturer_id,
      publishedAt: video.published_at
    })) as Video[];
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    const { data, error } = await this.supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error getting video by id:", error);
      return undefined;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      youtubeId: data.youtube_id,
      duration: data.duration,
      subjectId: data.subject_id,
      lecturerId: data.lecturer_id,
      publishedAt: data.published_at
    } as Video;
  }
}
// Use in-memory storage for now until Supabase connection is properly configured
export const storage = new MemStorage();
