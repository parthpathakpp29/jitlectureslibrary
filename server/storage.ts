import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { Client } from "pg";
import { 
  users, branches, semesters, subjects, lecturers, videos,
  type User, type InsertUser,
  type Branch, type InsertBranch,
  type Semester, type InsertSemester,
  type Subject, type InsertSubject,
  type Lecturer, type InsertLecturer,
  type Video, type InsertVideo
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private branches: Map<number, Branch>;
  private semesters: Map<number, Semester>;
  private subjects: Map<number, Subject>;
  private lecturers: Map<number, Lecturer>;
  private videos: Map<number, Video>;
  
  private userCurrentId: number;
  private branchCurrentId: number;
  private semesterCurrentId: number;
  private subjectCurrentId: number;
  private lecturerCurrentId: number;
  private videoCurrentId: number;

  constructor() {
    this.users = new Map();
    this.branches = new Map();
    this.semesters = new Map();
    this.subjects = new Map();
    this.lecturers = new Map();
    this.videos = new Map();
    
    this.userCurrentId = 1;
    this.branchCurrentId = 1;
    this.semesterCurrentId = 1;
    this.subjectCurrentId = 1;
    this.lecturerCurrentId = 1;
    this.videoCurrentId = 1;
    
    // Initialize with some data
    this.seedBranches();
    this.seedSemesters();
    this.seedLecturers();
    this.seedSubjects();
    this.seedVideos();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Branch methods
  async getAllBranches(): Promise<Branch[]> {
    return Array.from(this.branches.values());
  }
  
  async getBranch(id: number): Promise<Branch | undefined> {
    return this.branches.get(id);
  }
  
  async getBranchByCode(code: string): Promise<Branch | undefined> {
    return Array.from(this.branches.values()).find(
      (branch) => branch.code === code,
    );
  }
  
  // Semester methods
  async getSemestersByBranch(branchId: number): Promise<Semester[]> {
    return Array.from(this.semesters.values()).filter(
      (semester) => semester.branchId === branchId,
    );
  }
  
  // Subject methods
  async getSubjectsBySemester(semesterId: number): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(
      (subject) => subject.semesterId === semesterId,
    );
  }
  
  async getSubjectsByBranchAndSemester(branchId: number, semesterNumber: number): Promise<Subject[]> {
    const semester = Array.from(this.semesters.values()).find(
      (sem) => sem.branchId === branchId && sem.number === semesterNumber,
    );
    
    if (!semester) return [];
    
    return Array.from(this.subjects.values()).filter(
      (subject) => subject.semesterId === semester.id && subject.branchId === branchId,
    );
  }
  
  // Lecturer methods
  async getLecturer(id: number): Promise<Lecturer | undefined> {
    return this.lecturers.get(id);
  }
  
  // Video methods
  async getVideosBySubject(subjectId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.subjectId === subjectId,
    );
  }
  
  async getVideoById(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }
  
  // Seed methods
  private seedBranches() {
    const branches: InsertBranch[] = [
      { name: 'Computer Science Engineering', code: 'CSE', isActive: true, comingSoon: false },
      { name: 'Electronics & Communication Engineering', code: 'ECE', isActive: false, comingSoon: true },
      { name: 'Mechanical Engineering', code: 'ME', isActive: false, comingSoon: true },
      { name: 'Civil Engineering', code: 'CE', isActive: false, comingSoon: true },
      { name: 'Electrical Engineering', code: 'EE', isActive: false, comingSoon: true },
    ];
    
    branches.forEach(branch => {
      const id = this.branchCurrentId++;
      this.branches.set(id, { ...branch, id });
    });
  }
  
  private seedSemesters() {
    // Get CSE branch id
    const cseBranch = Array.from(this.branches.values()).find(branch => branch.code === 'CSE');
    if (!cseBranch) return;
    
    for (let i = 1; i <= 8; i++) {
      const id = this.semesterCurrentId++;
      this.semesters.set(id, {
        id,
        number: i,
        branchId: cseBranch.id,
      });
    }
  }
  
  private seedLecturers() {
    const lecturers: InsertLecturer[] = [
      {
        name: 'Dr. James Roberts',
        title: 'Associate Professor',
        institution: 'MIT',
        imageUrl: 'https://images.unsplash.com/photo-1567515004624-219c11d31f2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&h=96',
      },
      {
        name: 'Prof. Sarah Chen',
        title: 'Senior Lecturer',
        institution: 'Stanford',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&h=96',
      },
      {
        name: 'Dr. Michael Wei',
        title: 'Professor',
        institution: 'UC Berkeley',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&h=96',
      },
      {
        name: 'Prof. David Huang',
        title: 'Professor',
        institution: 'Georgia Tech',
        imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&h=96',
      },
      {
        name: 'Dr. Emma Thompson',
        title: 'Professor',
        institution: 'Caltech',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&h=96',
      },
      {
        name: 'Prof. Robert Zhang',
        title: 'Associate Professor',
        institution: 'Cornell',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=96&h=96',
      },
    ];
    
    lecturers.forEach(lecturer => {
      const id = this.lecturerCurrentId++;
      this.lecturers.set(id, { ...lecturer, id });
    });
  }
  
  private seedSubjects() {
    const cseBranch = Array.from(this.branches.values()).find(branch => branch.code === 'CSE');
    if (!cseBranch) return;
    
    const semester3 = Array.from(this.semesters.values()).find(
      sem => sem.branchId === cseBranch.id && sem.number === 3
    );
    if (!semester3) return;
    
    const subjects: (InsertSubject & { semesterNumber: number })[] = [
      {
        name: 'Data Structures & Algorithms',
        description: 'Learn about arrays, linked lists, trees, and fundamental algorithms.',
        branchId: cseBranch.id,
        semesterId: semester3.id,
        semesterNumber: 3,
      },
      {
        name: 'Object-Oriented Programming',
        description: 'Master classes, inheritance, polymorphism and encapsulation.',
        branchId: cseBranch.id,
        semesterId: semester3.id,
        semesterNumber: 3,
      },
      {
        name: 'Database Management Systems',
        description: 'Understanding SQL, normalization, and database design.',
        branchId: cseBranch.id,
        semesterId: semester3.id,
        semesterNumber: 3,
      },
      {
        name: 'Computer Networks',
        description: 'Protocols, networking fundamentals, and OSI model.',
        branchId: cseBranch.id,
        semesterId: semester3.id,
        semesterNumber: 3,
      },
      {
        name: 'Discrete Mathematics',
        description: 'Logic, set theory, graph theory, and combinatorics.',
        branchId: cseBranch.id,
        semesterId: semester3.id,
        semesterNumber: 3,
      },
      {
        name: 'Digital Logic Design',
        description: 'Boolean algebra, logic gates, and circuit design.',
        branchId: cseBranch.id,
        semesterId: semester3.id,
        semesterNumber: 3,
      },
    ];
    
    subjects.forEach(subject => {
      const { semesterNumber, ...insertSubject } = subject;
      const id = this.subjectCurrentId++;
      this.subjects.set(id, { ...insertSubject, id });
    });
  }
  
  private seedVideos() {
    const videos: (Omit<InsertVideo, 'subjectId' | 'lecturerId'> & { subjectName: string, lecturerName: string })[] = [
      // Data Structures & Algorithms videos
      {
        title: 'Introduction to Arrays',
        description: 'This lecture introduces arrays data structures, their properties, and common operations.',
        youtubeId: 'Lw-hfTfwOh0',
        duration: 23 * 60, // 23 minutes
        subjectName: 'Data Structures & Algorithms',
        lecturerName: 'Dr. James Roberts',
        publishedAt: new Date('2023-01-15'),
      },
      {
        title: 'Linked Lists Explained',
        description: 'Understanding linked lists and their operations.',
        youtubeId: '7xOmMTC6AYs',
        duration: 31 * 60, // 31 minutes
        subjectName: 'Data Structures & Algorithms',
        lecturerName: 'Dr. James Roberts',
        publishedAt: new Date('2023-01-22'),
      },
      {
        title: 'Binary Trees & Traversals',
        description: 'Learn about binary trees and different traversal methods.',
        youtubeId: 'K7RFXn-Yj5U',
        duration: 42 * 60, // 42 minutes
        subjectName: 'Data Structures & Algorithms',
        lecturerName: 'Dr. James Roberts',
        publishedAt: new Date('2023-01-29'),
      },
      
      // Object-Oriented Programming videos
      {
        title: 'Classes and Objects',
        description: 'Introduction to classes and objects in OOP.',
        youtubeId: 'BIbWI8iHnWo',
        duration: 28 * 60, // 28 minutes
        subjectName: 'Object-Oriented Programming',
        lecturerName: 'Prof. Sarah Chen',
        publishedAt: new Date('2023-02-05'),
      },
      {
        title: 'Inheritance & Polymorphism',
        description: 'Understanding inheritance and polymorphism concepts.',
        youtubeId: 'S6Zb_MpRr4I',
        duration: 35 * 60, // 35 minutes
        subjectName: 'Object-Oriented Programming',
        lecturerName: 'Prof. Sarah Chen',
        publishedAt: new Date('2023-02-12'),
      },
      {
        title: 'Abstraction & Interfaces',
        description: 'Learn about abstraction and interfaces in OOP.',
        youtubeId: 'xN6rnp-k2lQ',
        duration: 26 * 60, // 26 minutes
        subjectName: 'Object-Oriented Programming',
        lecturerName: 'Prof. Sarah Chen',
        publishedAt: new Date('2023-02-19'),
      },
      
      // Database Management Systems videos
      {
        title: 'SQL Fundamentals',
        description: 'Introduction to SQL and basic queries.',
        youtubeId: 'p3qvj9hO_Bo',
        duration: 40 * 60, // 40 minutes
        subjectName: 'Database Management Systems',
        lecturerName: 'Dr. Michael Wei',
        publishedAt: new Date('2023-03-05'),
      },
      {
        title: 'Normalization Forms',
        description: 'Understanding database normalization forms.',
        youtubeId: '3RBzDm0LMIw',
        duration: 32 * 60, // 32 minutes
        subjectName: 'Database Management Systems',
        lecturerName: 'Dr. Michael Wei',
        publishedAt: new Date('2023-03-12'),
      },
      {
        title: 'Transactions & Concurrency',
        description: 'Learn about database transactions and concurrency control.',
        youtubeId: 'P80Js4H6zYc',
        duration: 37 * 60, // 37 minutes
        subjectName: 'Database Management Systems',
        lecturerName: 'Dr. Michael Wei',
        publishedAt: new Date('2023-03-19'),
      },
      
      // Computer Networks videos
      {
        title: 'OSI Model Explained',
        description: 'Understanding the OSI model layers and their functions.',
        youtubeId: 'LANW3m7UgWs',
        duration: 33 * 60, // 33 minutes
        subjectName: 'Computer Networks',
        lecturerName: 'Prof. David Huang',
        publishedAt: new Date('2023-04-05'),
      },
      {
        title: 'TCP/IP Protocol Suite',
        description: 'Learn about the TCP/IP protocol stack.',
        youtubeId: '8CX1vPXDN00',
        duration: 45 * 60, // 45 minutes
        subjectName: 'Computer Networks',
        lecturerName: 'Prof. David Huang',
        publishedAt: new Date('2023-04-12'),
      },
      {
        title: 'Routing Algorithms',
        description: 'Understanding routing protocols and algorithms.',
        youtubeId: 'AkPDgF8xnYc',
        duration: 38 * 60, // 38 minutes
        subjectName: 'Computer Networks',
        lecturerName: 'Prof. David Huang',
        publishedAt: new Date('2023-04-19'),
      },
      
      // Discrete Mathematics videos
      {
        title: 'Propositional Logic',
        description: 'Introduction to propositional logic and truth tables.',
        youtubeId: '_W4zGm4YaMs',
        duration: 29 * 60, // 29 minutes
        subjectName: 'Discrete Mathematics',
        lecturerName: 'Dr. Emma Thompson',
        publishedAt: new Date('2023-05-05'),
      },
      {
        title: 'Set Theory Fundamentals',
        description: 'Learn about sets, operations, and relations.',
        youtubeId: 'Gk-6vCMLbCY',
        duration: 34 * 60, // 34 minutes
        subjectName: 'Discrete Mathematics',
        lecturerName: 'Dr. Emma Thompson',
        publishedAt: new Date('2023-05-12'),
      },
      {
        title: 'Graph Theory Introduction',
        description: 'Understanding graphs, trees, and network analysis.',
        youtubeId: 'QpCdwrhKdXc',
        duration: 36 * 60, // 36 minutes
        subjectName: 'Discrete Mathematics',
        lecturerName: 'Dr. Emma Thompson',
        publishedAt: new Date('2023-05-19'),
      },
      
      // Digital Logic Design videos
      {
        title: 'Boolean Algebra & Logic Gates',
        description: 'Introduction to Boolean algebra and basic logic gates.',
        youtubeId: 'z6UXr68zUZY',
        duration: 31 * 60, // 31 minutes
        subjectName: 'Digital Logic Design',
        lecturerName: 'Prof. Robert Zhang',
        publishedAt: new Date('2023-06-05'),
      },
      {
        title: 'Combinational Circuits',
        description: 'Learn about combinational circuit design and analysis.',
        youtubeId: 'VX18SeH3tUY',
        duration: 39 * 60, // 39 minutes
        subjectName: 'Digital Logic Design',
        lecturerName: 'Prof. Robert Zhang',
        publishedAt: new Date('2023-06-12'),
      },
      {
        title: 'Sequential Logic Circuits',
        description: 'Understanding sequential circuits, flip-flops, and memory.',
        youtubeId: '52K1YDZzF5E',
        duration: 43 * 60, // 43 minutes
        subjectName: 'Digital Logic Design',
        lecturerName: 'Prof. Robert Zhang',
        publishedAt: new Date('2023-06-19'),
      },
    ];
    
    videos.forEach(videoData => {
      const { subjectName, lecturerName, ...videoInfo } = videoData;
      
      const subject = Array.from(this.subjects.values()).find(
        subj => subj.name === subjectName
      );
      
      const lecturer = Array.from(this.lecturers.values()).find(
        lect => lect.name === lecturerName
      );
      
      if (subject && lecturer) {
        const id = this.videoCurrentId++;
        this.videos.set(id, {
          ...videoInfo,
          id,
          subjectId: subject.id,
          lecturerId: lecturer.id,
        });
      }
    });
  }
}

export class SupabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    console.log("Connecting to database...");
    
    try {
      // First test the direct connection with pg Client
      const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
      });
      
      client.connect()
        .then(() => {
          console.log("Successfully connected with pg Client!");
          // Test a query
          return client.query('SELECT NOW()');
        })
        .then(result => {
          console.log("Query result:", result.rows[0]);
          client.end();
        })
        .catch(err => {
          console.error("Error with direct pg connection:", err);
        });
      
      // Use neon with drizzle
      const sql = neon(dbUrl);
      this.db = drizzle(sql);
      console.log("Drizzle initialized with neon");
    } catch (error) {
      console.error("Error initializing database connection:", error);
      throw error;
    }
  }

  // User methods
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
  
  // Branch methods
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
  
  // Semester methods
  async getSemestersByBranch(branchId: number): Promise<Semester[]> {
    return await this.db.select().from(semesters).where({ branchId }).orderBy(semesters.number);
  }
  
  // Subject methods
  async getSubjectsBySemester(semesterId: number): Promise<Subject[]> {
    return await this.db.select().from(subjects).where({ semesterId });
  }
  
  async getSubjectsByBranchAndSemester(branchId: number, semesterNumber: number): Promise<Subject[]> {
    const semesterResult = await this.db.select().from(semesters)
      .where({ branchId, number: semesterNumber });
    
    if (semesterResult.length === 0) return [];
    
    return await this.db.select().from(subjects)
      .where({ semesterId: semesterResult[0].id, branchId });
  }
  
  // Lecturer methods
  async getLecturer(id: number): Promise<Lecturer | undefined> {
    const result = await this.db.select().from(lecturers).where({ id });
    return result[0];
  }
  
  // Video methods
  async getVideosBySubject(subjectId: number): Promise<Video[]> {
    return await this.db.select().from(videos).where({ subjectId });
  }
  
  async getVideoById(id: number): Promise<Video | undefined> {
    const result = await this.db.select().from(videos).where({ id });
    return result[0];
  }
}

// Use SupabaseStorage when DATABASE_URL is available, otherwise fallback to MemStorage
export const storage = process.env.DATABASE_URL 
  ? new SupabaseStorage() 
  : new MemStorage();
