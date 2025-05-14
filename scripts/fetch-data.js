// Script to view data from the Supabase database
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// We'll use the existing DATABASE_URL
const supabaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl) {
  console.error("ERROR: DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Create a Supabase client - no API key needed since we're using connection string
const supabase = createClient(supabaseUrl);

async function fetchData() {
  try {
    console.log("Connecting to Supabase database...");
    
    // Fetch all subjects
    console.log("\n--- SUBJECTS ---");
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*');
    
    if (subjectsError) throw subjectsError;
    console.log(JSON.stringify(subjects, null, 2));
    
    // Fetch all videos
    console.log("\n--- VIDEOS ---");
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*');
    
    if (videosError) throw videosError;
    console.log(JSON.stringify(videos, null, 2));
    
    // Fetch all lecturers
    console.log("\n--- LECTURERS ---");
    const { data: lecturers, error: lecturersError } = await supabase
      .from('lecturers')
      .select('*');
    
    if (lecturersError) throw lecturersError;
    console.log(JSON.stringify(lecturers, null, 2));
    
    // Generate a report of videos with subject and lecturer info
    console.log("\n--- VIDEOS WITH RELATIONS ---");
    for (const video of videos || []) {
      const subject = subjects.find(s => s.id === video.subject_id);
      const lecturer = lecturers.find(l => l.id === video.lecturer_id);
      
      console.log(`\nVIDEO ID: ${video.id}`);
      console.log(`Title: ${video.title}`);
      console.log(`Description: ${video.description || 'N/A'}`);
      console.log(`YouTube ID: ${video.youtube_id}`);
      console.log(`Duration: ${video.duration} seconds`);
      console.log(`Subject: ${subject ? subject.name : 'Unknown'} (ID: ${video.subject_id})`);
      console.log(`Lecturer: ${lecturer ? lecturer.name : 'Unknown'} (ID: ${video.lecturer_id})`);
      console.log(`Published: ${video.published_at || 'N/A'}`);
    }
    
    // Group videos by subject
    console.log("\n--- VIDEOS GROUPED BY SUBJECT ---");
    for (const subject of subjects || []) {
      const subjectVideos = videos.filter(v => v.subject_id === subject.id);
      
      console.log(`\nSUBJECT: ${subject.name} (ID: ${subject.id})`);
      console.log(`Description: ${subject.description}`);
      console.log(`Number of videos: ${subjectVideos.length}`);
      
      if (subjectVideos.length > 0) {
        console.log("Videos:");
        subjectVideos.forEach((video, index) => {
          const lecturer = lecturers.find(l => l.id === video.lecturer_id);
          console.log(`  ${index + 1}. ${video.title} - ${lecturer ? lecturer.name : 'Unknown lecturer'}`);
        });
      } else {
        console.log("No videos available for this subject.");
      }
    }
    
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();