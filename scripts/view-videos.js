// Script to view videos from the database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase credentials
const supabaseUrl = 'https://jbcyhmhjlcfdavqdfosq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiY3lobWhqbGNmZGF2cWRmb3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzU5ODYsImV4cCI6MjA2MjcxMTk4Nn0.LvMCWlq-QhPL_aCGLSJjvq4Dt0Du4w25jp_2fXwlTQk';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function viewVideos() {
  try {
    console.log('Fetching videos from database...');
    
    // Fetch all videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*');
    
    if (videosError) {
      console.error('Error fetching videos:', videosError);
      return;
    }
    
    console.log(`Found ${videos.length} videos:`);
    console.log(JSON.stringify(videos, null, 2));
    
    // Fetch subjects for reference
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*');
    
    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      return;
    }
    
    // Fetch lecturers for reference
    const { data: lecturers, error: lecturersError } = await supabase
      .from('lecturers')
      .select('*');
    
    if (lecturersError) {
      console.error('Error fetching lecturers:', lecturersError);
      return;
    }
    
    // Generate a detailed report
    console.log('\n--- DETAILED VIDEO REPORT ---');
    for (const video of videos) {
      const subject = subjects.find(s => s.id === video.subject_id);
      const lecturer = lecturers.find(l => l.id === video.lecturer_id);
      
      console.log(`\nVIDEO ID: ${video.id}`);
      console.log(`Title: ${video.title}`);
      console.log(`Description: ${video.description || 'N/A'}`);
      console.log(`YouTube ID: ${video.youtube_id}`);
      console.log(`Duration: ${video.duration} seconds`);
      console.log(`Subject: ${subject ? subject.name : 'Unknown'} (ID: ${video.subject_id})`);
      console.log(`Lecturer: ${lecturer ? lecturer.name : 'Unknown'} (ID: ${video.lecturer_id})`);
    }
    
    // Check for subjects without videos
    console.log('\n--- SUBJECTS WITHOUT VIDEOS ---');
    for (const subject of subjects) {
      const hasVideos = videos.some(v => v.subject_id === subject.id);
      if (!hasVideos) {
        console.log(`- ${subject.name} (ID: ${subject.id})`);
      }
    }
    
  } catch (error) {
    console.error('Error viewing videos:', error);
  }
}

viewVideos();