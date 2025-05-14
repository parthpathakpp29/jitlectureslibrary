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
  getSubjectById(id: number): Promise<Subject | undefined>;
  getSubjectsBySemester(semesterId: number): Promise<Subject[]>;
  getSubjectsByBranchAndSemester(branchId: number, semesterNumber: number): Promise<Subject[]>;
  createSubject(subject: Partial<Subject>): Promise<Subject>;
  
  // Lecturer methods
  getLecturer(id: number): Promise<Lecturer | undefined>;
  getAllLecturers(): Promise<Lecturer[]>;
  
  // Video methods
  getVideosBySubject(subjectId: number): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  createVideo(video: Partial<Video>): Promise<Video>;
  updateVideo(id: number, video: Partial<Video>): Promise<Video>;
  deleteVideo(id: number): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  public supabase: ReturnType<typeof createClient>;

  constructor() {
    // Hardcoded credentials as per your request
    const supabaseUrl = 'https://jbcyhmhjlcfdavqdfosq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiY3lobWhqbGNmZGF2cWRmb3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzU5ODYsImV4cCI6MjA2MjcxMTk4Nn0.LvMCWlq-QhPL_aCGLSJjvq4Dt0Du4w25jp_2fXwlTQk';
    
    // Initialize Supabase client
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ SupabaseStorage connected");
    
    // Initialize database
    this.initializeDatabase();
  }
  
  private async initializeDatabase() {
    try {
      // Check if we need to seed data
      console.log("Checking if database needs seeding...");
      
      try {
        // Test if branches table has data
        const { data: existingBranches, error } = await this.supabase
          .from('branches')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error("Error checking branches table:", error);
          console.log("Supabase connection issue. Please verify tables are created.");
        } else if (!existingBranches || existingBranches.length === 0) {
          console.log("Branches table exists but is empty, seeding data...");
          await this.seedData();
        } else {
          console.log("Database already contains data, no seeding needed");
        }
      } catch (innerError) {
        console.error("Error initializing database:", innerError);
      }
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }
  
  private async seedData() {
    try {
      console.log("Seeding data into Supabase tables...");
      
      // Add additional subjects and semesters if needed
      console.log("Checking for subjects in semester 3...");
      const { data: semesterThreeSubjects, error: subjectCheckError } = await this.supabase
        .from('subjects')
        .select('*')
        .eq('semester_id', 3);
        
      if (subjectCheckError) {
        console.error("Error checking for semester 3 subjects:", subjectCheckError);
      } else if (!semesterThreeSubjects || semesterThreeSubjects.length === 0) {
        console.log("No subjects found for semester 3, adding additional seed data...");
        
        // First get the CSE branch and 3rd semester
        const { data: cseBranches } = await this.supabase
          .from('branches')
          .select('*')
          .eq('code', 'CSE');
          
        if (!cseBranches || cseBranches.length === 0) {
          console.error("CSE branch not found");
          return;
        }
        
        const cseBranchId = cseBranches[0].id;
        
        // Check if semester 3 exists
        const { data: semesters } = await this.supabase
          .from('semesters')
          .select('*')
          .eq('number', 3)
          .eq('branch_id', cseBranchId);
          
        let semesterId;
        
        if (!semesters || semesters.length === 0) {
          // Create 3rd semester if it doesn't exist
          const { data: newSemester, error: semesterError } = await this.supabase
            .from('semesters')
            .upsert([{ number: 3, branch_id: cseBranchId }])
            .select();
            
          if (semesterError || !newSemester || newSemester.length === 0) {
            console.error("Error creating 3rd semester:", semesterError);
            return;
          }
          
          semesterId = newSemester[0].id;
          console.log("Created 3rd semester with ID:", semesterId);
        } else {
          semesterId = semesters[0].id;
          console.log("Using existing 3rd semester with ID:", semesterId);
        }
        
        // Create subjects for 3rd semester
        const thirdSemesterSubjects = [
          {
            name: 'Data Structures and Algorithms',
            description: 'Advanced implementation of data structures, algorithm design and analysis',
            semester_id: semesterId,
            branch_id: cseBranchId
          },
          {
            name: 'Object-Oriented Programming',
            description: 'Principles of OOP, inheritance, polymorphism, and design patterns',
            semester_id: semesterId,
            branch_id: cseBranchId
          },
          {
            name: 'Database Management Systems',
            description: 'Relational databases, SQL, normalization, and transaction management',
            semester_id: semesterId,
            branch_id: cseBranchId
          }
        ];
        
        const { data: newSubjects, error: subjectsError } = await this.supabase
          .from('subjects')
          .upsert(thirdSemesterSubjects)
          .select();
          
        if (subjectsError) {
          console.error("Error creating 3rd semester subjects:", subjectsError);
          return;
        }
        
        console.log("Created 3rd semester subjects:", newSubjects?.length || 0);
        
        // Add lecturers and videos for these subjects if needed
        if (newSubjects && newSubjects.length > 0) {
          // First check if we have lecturers
          const { data: existingLecturers } = await this.supabase
            .from('lecturers')
            .select('*')
            .limit(2);
            
          if (!existingLecturers || existingLecturers.length < 2) {
            console.log("Need to add more lecturers");
            
            // Create more lecturers if needed
            const additionalLecturers = [
              { 
                name: 'Dr. Michael Chen', 
                title: 'Professor', 
                institution: 'Stanford University',
                image_url: null
              },
              { 
                name: 'Dr. Priya Sharma', 
                title: 'Associate Professor', 
                institution: 'IIT Delhi',
                image_url: null
              }
            ];
            
            await this.supabase
              .from('lecturers')
              .upsert(additionalLecturers);
          }
          
          // Get the lecturers to use for videos
          const { data: lecturers } = await this.supabase
            .from('lecturers')
            .select('*')
            .limit(2);
            
          if (lecturers && lecturers.length >= 2) {
            // Add videos for each subject
            const videosData = [
              {
                title: 'Introduction to Data Structures',
                description: 'Overview of common data structures and their applications',
                youtube_id: 'HtSuA80QTyo', // Example YouTube ID
                duration: 3600, // 1 hour in seconds
                subject_id: newSubjects[0].id,
                lecturer_id: lecturers[0].id,
                published_at: new Date().toISOString()
              },
              {
                title: 'Understanding OOP Concepts',
                description: 'Detailed explanation of Object-Oriented Programming principles',
                youtube_id: 'pTB0EiLXUC8', // Example YouTube ID
                duration: 2700, // 45 minutes in seconds
                subject_id: newSubjects[1].id,
                lecturer_id: lecturers[1].id,
                published_at: new Date().toISOString()
              },
              {
                title: 'SQL Fundamentals',
                description: 'Learn the basics of SQL and database queries',
                youtube_id: 'HXV3zeQKqGY', // Example YouTube ID
                duration: 3000, // 50 minutes in seconds
                subject_id: newSubjects[2].id,
                lecturer_id: lecturers[0].id,
                published_at: new Date().toISOString()
              }
            ];
            
            const { data: videos, error: videosError } = await this.supabase
              .from('videos')
              .upsert(videosData)
              .select();
              
            if (videosError) {
              console.error("Error creating videos for 3rd semester:", videosError);
            } else {
              console.log("Created videos for 3rd semester:", videos?.length || 0);
            }
          }
        }
      }
      
      // Step 2: Now seed the data into the tables
      console.log("Seeding initial data...");
      
      // Insert branches data
      const branchesData = [
        { name: 'Computer Science Engineering', code: 'CSE', is_active: true, coming_soon: false },
        { name: 'Electronics & Communication Engineering', code: 'ECE', is_active: false, coming_soon: true },
        { name: 'Mechanical Engineering', code: 'ME', is_active: false, coming_soon: true },
        { name: 'Civil Engineering', code: 'CE', is_active: false, coming_soon: true },
        { name: 'Electrical Engineering', code: 'EE', is_active: false, coming_soon: true }
      ];
      
      const { data: branches, error: branchesError } = await this.supabase
        .from('branches')
        .upsert(branchesData, { onConflict: 'code' })
        .select();
      
      if (branchesError) {
        console.error("Error seeding branches:", branchesError);
        return;
      }
      
      console.log("✅ Branches seeded:", branches?.length || 0);
      
      // Get CSE branch ID
      if (!branches || branches.length === 0) {
        console.error("No branches were created");
        return;
      }
      
      const cseBranch = branches.find(b => b.code === 'CSE');
      if (!cseBranch) {
        console.error("Could not find CSE branch after seeding");
        return;
      }
      
      // Insert semesters data
      const semestersData = [];
      for (let i = 1; i <= 8; i++) {
        semestersData.push({ number: i, branch_id: cseBranch.id });
      }
      
      const { data: semesters, error: semestersError } = await this.supabase
        .from('semesters')
        .upsert(semestersData, { onConflict: 'number, branch_id' })
        .select();
      
      if (semestersError) {
        console.error("Error seeding semesters:", semestersError);
        return;
      }
      
      console.log("✅ Semesters seeded:", semesters?.length || 0);
      
      // Add subjects for first semester
      if (!semesters || semesters.length === 0) {
        console.error("No semesters were created");
        return;
      }
      
      const firstSemester = semesters.find(s => s.number === 1);
      if (!firstSemester) {
        console.error("Could not find first semester after seeding");
        return;
      }
      
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
      
      const { data: subjects, error: subjectsError } = await this.supabase
        .from('subjects')
        .upsert(subjectsData, { onConflict: 'name, semester_id' })
        .select();
      
      if (subjectsError) {
        console.error("Error seeding subjects:", subjectsError);
        return;
      }
      
      console.log("✅ Subjects seeded:", subjects?.length || 0);
      
      // Add example lecturers
      const lecturersData = [
        { 
          name: 'Dr. John Smith', 
          title: 'Professor', 
          institution: 'MIT',
          image_url: null
        },
        { 
          name: 'Dr. Sarah Johnson', 
          title: 'Associate Professor', 
          institution: 'Stanford University',
          image_url: null
        }
      ];
      
      const { data: lecturers, error: lecturersError } = await this.supabase
        .from('lecturers')
        .upsert(lecturersData, { onConflict: 'name, institution' })
        .select();
      
      if (lecturersError) {
        console.error("Error seeding lecturers:", lecturersError);
        return;
      }
      
      console.log("✅ Lecturers seeded:", lecturers?.length || 0);
      
      // Add example videos if subjects and lecturers exist
      if (subjects && lecturers && subjects.length > 0 && lecturers.length > 0) {
        const videosData = [
          {
            title: 'Introduction to Calculus',
            description: 'Learn the basics of calculus, limits, derivatives, and integrals',
            youtube_id: 'dQw4w9WgXcQ', // Example YouTube ID
            duration: 3600, // 1 hour in seconds
            subject_id: subjects[0].id,
            lecturer_id: lecturers[0].id,
            published_at: new Date().toISOString()
          },
          {
            title: 'Newton\'s Laws of Motion',
            description: 'Detailed explanation of Newton\'s three laws of motion with examples',
            youtube_id: 'XGgus_oEVq4', // Example YouTube ID
            duration: 2700, // 45 minutes in seconds
            subject_id: subjects[1].id,
            lecturer_id: lecturers[1].id,
            published_at: new Date().toISOString()
          }
        ];
        
        const { data: videos, error: videosError } = await this.supabase
          .from('videos')
          .upsert(videosData)
          .select();
        
        if (videosError) {
          console.error("Error seeding videos:", videosError);
        } else {
          console.log("✅ Videos seeded:", videos?.length || 0);
        }
      }
      
      console.log("✅ Database setup complete!");
      
    } catch (error) {
      console.error("Error setting up database:", error);
    }
  }
  
  // Note: We've combined table creation and data seeding in createTables

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
    console.log(`Looking for subjects with branchId=${branchId}, semesterNumber=${semesterNumber}`);
    
    // First get the semester
    const { data: semesters, error: semesterError } = await this.supabase
      .from('semesters')
      .select('*')
      .eq('branch_id', branchId)
      .eq('number', semesterNumber);
    
    if (semesterError) {
      console.error("Error getting semester:", semesterError);
      return [];
    }
    
    if (!semesters || semesters.length === 0) {
      console.log(`No semester found with number ${semesterNumber} for branch ${branchId}. Creating it now...`);
      
      // Create the semester if it doesn't exist
      const { data: newSemester, error: newSemesterError } = await this.supabase
        .from('semesters')
        .upsert([{ number: semesterNumber, branch_id: branchId }])
        .select();
        
      if (newSemesterError || !newSemester || newSemester.length === 0) {
        console.error("Error creating new semester:", newSemesterError);
        return [];
      }
      
      console.log(`Created semester ${semesterNumber} with ID ${newSemester[0].id}`);
      
      // Add default subjects for this semester
      if (semesterNumber === 3) {
        const defaultSubjects = [
          {
            name: 'Data Structures and Algorithms',
            description: 'Advanced implementation of data structures, algorithm design and analysis',
            semester_id: newSemester[0].id,
            branch_id: branchId
          },
          {
            name: 'Object-Oriented Programming',
            description: 'Principles of OOP, inheritance, polymorphism, and design patterns',
            semester_id: newSemester[0].id,
            branch_id: branchId
          },
          {
            name: 'Database Management Systems',
            description: 'Relational databases, SQL, normalization, and transaction management',
            semester_id: newSemester[0].id,
            branch_id: branchId
          }
        ];
        
        const { data: addedSubjects, error: addSubjectsError } = await this.supabase
          .from('subjects')
          .upsert(defaultSubjects)
          .select();
          
        if (addSubjectsError) {
          console.error("Error adding default subjects:", addSubjectsError);
        } else {
          console.log(`Added ${addedSubjects?.length || 0} default subjects for semester 3`);
          
          // Return the newly created subjects
          return addedSubjects?.map(subject => ({
            id: subject.id,
            name: subject.name,
            description: subject.description,
            semesterId: subject.semester_id,
            branchId: subject.branch_id
          })) as Subject[] || [];
        }
      }
      
      return []; // Return empty if subjects couldn't be created
    }
    
    const semesterId = semesters[0].id;
    console.log(`Found semester with ID ${semesterId}`);
    
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
    
    console.log(`Found ${data?.length || 0} subjects for semester ${semesterNumber}`);
    
    return (data || []).map(subject => ({
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
  
  async getAllLecturers(): Promise<Lecturer[]> {
    const { data, error } = await this.supabase
      .from('lecturers')
      .select('*');
    
    if (error) {
      console.error("Error getting lecturers:", error);
      return [];
    }
    
    return data.map(lecturer => ({
      id: lecturer.id,
      name: lecturer.name,
      title: lecturer.title,
      institution: lecturer.institution,
      imageUrl: lecturer.image_url
    })) as Lecturer[];
  }

  // Video methods
  async getVideosBySubject(subjectId: number): Promise<Video[]> {
    console.log(`Storage: Getting videos for subject ID ${subjectId}`);
    
    const { data, error } = await this.supabase
      .from('videos')
      .select('*')
      .eq('subject_id', subjectId);
    
    if (error) {
      console.error("Error getting videos by subject:", error);
      return [];
    }
    
    console.log(`Storage: Raw videos data from Supabase:`, data);
    
    if (!data || data.length === 0) {
      console.log(`Storage: No videos found for subject ID ${subjectId}`);
      return [];
    }
    
    const mappedVideos = data.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      youtubeId: video.youtube_id,
      duration: video.duration,
      subjectId: video.subject_id,
      lecturerId: video.lecturer_id,
      publishedAt: video.published_at
    })) as Video[];
    
    console.log(`Storage: Mapped ${mappedVideos.length} videos for subject ID ${subjectId}`);
    return mappedVideos;
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
  
  async createVideo(videoData: Partial<Video>): Promise<Video> {
    // Map our Video model to Supabase's video schema
    const supabaseVideo = {
      title: videoData.title,
      description: videoData.description,
      youtube_id: videoData.youtubeId,
      duration: videoData.duration,
      subject_id: videoData.subjectId,
      lecturer_id: videoData.lecturerId,
      published_at: videoData.publishedAt || new Date().toISOString()
    };
    
    const { data, error } = await this.supabase
      .from('videos')
      .insert(supabaseVideo)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating video:", error);
      throw new Error(`Failed to create video: ${error.message}`);
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
  
  async updateVideo(id: number, videoData: Partial<Video>): Promise<Video> {
    // Map our Video model to Supabase's video schema
    const supabaseVideo: Record<string, any> = {};
    
    if (videoData.title !== undefined) supabaseVideo.title = videoData.title;
    if (videoData.description !== undefined) supabaseVideo.description = videoData.description;
    if (videoData.youtubeId !== undefined) supabaseVideo.youtube_id = videoData.youtubeId;
    if (videoData.duration !== undefined) supabaseVideo.duration = videoData.duration;
    if (videoData.subjectId !== undefined) supabaseVideo.subject_id = videoData.subjectId;
    if (videoData.lecturerId !== undefined) supabaseVideo.lecturer_id = videoData.lecturerId;
    if (videoData.publishedAt !== undefined) supabaseVideo.published_at = videoData.publishedAt;
    
    const { data, error } = await this.supabase
      .from('videos')
      .update(supabaseVideo)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating video:", error);
      throw new Error(`Failed to update video: ${error.message}`);
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
  
  async deleteVideo(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting video:", error);
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }
  
  async getSubjectById(id: number): Promise<Subject | undefined> {
    const { data, error } = await this.supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error getting subject by id:", error);
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      semesterId: data.semester_id,
      branchId: data.branch_id
    } as Subject;
  }
}
// Using Supabase storage since tables have been created
console.log("Using Supabase database storage");
export const storage = new SupabaseStorage();
