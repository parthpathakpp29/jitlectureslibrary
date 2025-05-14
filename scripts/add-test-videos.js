// Script to add test videos to the database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Supabase credentials - using the same ones from server/storage.ts
const supabaseUrl = 'https://jbcyhmhjlcfdavqdfosq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiY3lobWhqbGNmZGF2cWRmb3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzU5ODYsImV4cCI6MjA2MjcxMTk4Nn0.LvMCWlq-QhPL_aCGLSJjvq4Dt0Du4w25jp_2fXwlTQk';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestVideos() {
  try {
    console.log('Getting subjects to add videos to...');
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*');
    
    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      return;
    }
    
    console.log(`Found ${subjects.length} subjects`);
    
    if (subjects.length === 0) {
      console.log('No subjects found to add videos to');
      return;
    }
    
    console.log('Getting lecturers...');
    const { data: lecturers, error: lecturersError } = await supabase
      .from('lecturers')
      .select('*');
    
    if (lecturersError) {
      console.error('Error fetching lecturers:', lecturersError);
      return;
    }
    
    console.log(`Found ${lecturers.length} lecturers`);
    
    if (lecturers.length === 0) {
      console.log('No lecturers found. Adding a test lecturer...');
      const { data: newLecturer, error: newLecturerError } = await supabase
        .from('lecturers')
        .insert({
          name: 'Dr. John Smith',
          title: 'Professor',
          institution: 'MIT',
          image_url: 'https://randomuser.me/api/portraits/men/1.jpg'
        })
        .select();
      
      if (newLecturerError) {
        console.error('Error adding test lecturer:', newLecturerError);
        return;
      }
      
      console.log('Added test lecturer:', newLecturer);
      lecturers.push(newLecturer[0]);
    }
    
    // Now check if videos already exist
    console.log('Checking existing videos...');
    const { data: existingVideos, error: videosError } = await supabase
      .from('videos')
      .select('*');
    
    if (videosError) {
      console.error('Error checking existing videos:', videosError);
      return;
    }
    
    const videoCount = existingVideos ? existingVideos.length : 0;
    console.log(`Found ${videoCount} existing videos`);
    
    if (videoCount > 0) {
      console.log('Videos already exist in the database. Skipping test video creation.');
      return;
    }
    
    // Add test videos for each subject
    const testVideos = [];
    
    // Test video data
    const videoData = [
      {
        title: 'Introduction to Data Structures',
        description: 'Learn the basics of data structures and their importance in computer science.',
        youtubeId: 'dQw4w9WgXcQ', // This is just a placeholder YouTube ID
        duration: 1800, // 30 minutes in seconds
      },
      {
        title: 'Linked Lists Explained',
        description: 'Understanding linked lists and their implementation in programming.',
        youtubeId: 'RBSGKlAvoiM', // Another placeholder
        duration: 2400, // 40 minutes in seconds
      },
      {
        title: 'Arrays and Their Applications',
        description: 'Exploring arrays and how they are used in various algorithms.',
        youtubeId: 'UNWSdgaPkwY', // Another placeholder
        duration: 1500, // 25 minutes in seconds
      }
    ];
    
    // For each subject, add some test videos
    for (const subject of subjects.slice(0, 3)) { // Limit to first 3 subjects for testing
      console.log(`Adding videos for subject: ${subject.name} (ID: ${subject.id})`);
      
      for (const video of videoData) {
        testVideos.push({
          title: video.title,
          description: video.description,
          youtube_id: video.youtubeId,
          duration: video.duration,
          subject_id: subject.id,
          lecturer_id: lecturers[0].id,
          published_at: new Date().toISOString()
        });
      }
    }
    
    // Insert the test videos
    console.log(`Inserting ${testVideos.length} test videos...`);
    const { data: insertedVideos, error: insertError } = await supabase
      .from('videos')
      .insert(testVideos)
      .select();
    
    if (insertError) {
      console.error('Error inserting test videos:', insertError);
      return;
    }
    
    console.log(`Successfully added ${insertedVideos.length} test videos`);
    console.log('Sample of inserted videos:', insertedVideos.slice(0, 2));
    
  } catch (error) {
    console.error('Error in addTestVideos:', error);
  }
}

addTestVideos();