// Script to add more videos to the subjects without videos
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase credentials
const supabaseUrl = 'https://jbcyhmhjlcfdavqdfosq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiY3lobWhqbGNmZGF2cWRmb3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzU5ODYsImV4cCI6MjA2MjcxMTk4Nn0.LvMCWlq-QhPL_aCGLSJjvq4Dt0Du4w25jp_2fXwlTQk';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function addMoreVideos() {
  try {
    // Fetch all videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*');
    
    if (videosError) {
      console.error('Error fetching videos:', videosError);
      return;
    }
    
    console.log(`Found ${videos.length} existing videos`);
    
    // Fetch all subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*');
    
    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      return;
    }
    
    console.log(`Found ${subjects.length} subjects`);
    
    // Fetch all lecturers
    const { data: lecturers, error: lecturersError } = await supabase
      .from('lecturers')
      .select('*');
    
    if (lecturersError) {
      console.error('Error fetching lecturers:', lecturersError);
      return;
    }
    
    console.log(`Found ${lecturers.length} lecturers`);
    
    // Find subjects without videos
    const subjectsWithoutVideos = subjects.filter(subject => 
      !videos.some(video => video.subject_id === subject.id)
    );
    
    console.log(`Found ${subjectsWithoutVideos.length} subjects without videos`);
    
    if (subjectsWithoutVideos.length === 0) {
      console.log('All subjects have videos already. No need to add more.');
      return;
    }
    
    // Sample video data templates
    const videoTemplates = [
      {
        title: "Introduction to %SUBJECT%",
        description: "A comprehensive introduction to the fundamentals of %SUBJECT%",
        youtubeId: "dQw4w9WgXcQ", // This is just a placeholder
        duration: 2400 // 40 minutes
      },
      {
        title: "Advanced Concepts in %SUBJECT%",
        description: "Explore advanced topics and applications in %SUBJECT%",
        youtubeId: "9bZkp7q19f0", // Another placeholder
        duration: 3000 // 50 minutes
      },
      {
        title: "Practical %SUBJECT% Tutorial",
        description: "A hands-on tutorial with examples and exercises in %SUBJECT%",
        youtubeId: "JGwWNGJdvx8", // Another placeholder
        duration: 1800 // 30 minutes
      }
    ];
    
    // Prepare videos to insert
    const videosToInsert = [];
    
    for (const subject of subjectsWithoutVideos) {
      console.log(`Preparing videos for subject: ${subject.name} (ID: ${subject.id})`);
      
      // Randomly select 1 or 2 templates
      const numTemplates = Math.floor(Math.random() * 2) + 1;
      const selectedTemplates = [...videoTemplates].sort(() => 0.5 - Math.random()).slice(0, numTemplates);
      
      for (const template of selectedTemplates) {
        // Randomly select a lecturer
        const lecturer = lecturers[Math.floor(Math.random() * lecturers.length)];
        
        videosToInsert.push({
          title: template.title.replace('%SUBJECT%', subject.name),
          description: template.description.replace('%SUBJECT%', subject.name),
          youtube_id: template.youtubeId,
          duration: template.duration,
          subject_id: subject.id,
          lecturer_id: lecturer.id,
          published_at: new Date().toISOString()
        });
      }
    }
    
    console.log(`Prepared ${videosToInsert.length} videos to insert`);
    
    if (videosToInsert.length === 0) {
      console.log('No videos to insert. Exiting.');
      return;
    }
    
    // Insert the videos
    const { data: insertedVideos, error: insertError } = await supabase
      .from('videos')
      .insert(videosToInsert)
      .select();
    
    if (insertError) {
      console.error('Error inserting videos:', insertError);
      return;
    }
    
    console.log(`Successfully inserted ${insertedVideos.length} videos`);
    
    // Display details of the inserted videos
    for (const video of insertedVideos) {
      const subject = subjects.find(s => s.id === video.subject_id);
      const lecturer = lecturers.find(l => l.id === video.lecturer_id);
      
      console.log(`- "${video.title}" for subject "${subject?.name || 'Unknown'}" by "${lecturer?.name || 'Unknown'}"`);
    }
    
  } catch (error) {
    console.error('Error adding more videos:', error);
  }
}

addMoreVideos();