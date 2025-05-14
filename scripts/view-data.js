// Script to view data from the Supabase database
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client
const supabase = createClient(
  process.env.DATABASE_URL,
  process.env.SUPABASE_KEY || 'dummy-key'  // Using DATABASE_URL for connection string
);

async function viewData() {
  try {
    // Get all videos with their related lecturers and subjects
    console.log('Fetching videos...');
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*');
    
    if (videosError) {
      throw videosError;
    }
    
    console.log('Videos:', JSON.stringify(videos, null, 2));
    
    // Get all subjects
    console.log('\nFetching subjects...');
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*');
    
    if (subjectsError) {
      throw subjectsError;
    }
    
    console.log('Subjects:', JSON.stringify(subjects, null, 2));
    
    // Get all lecturers
    console.log('\nFetching lecturers...');
    const { data: lecturers, error: lecturersError } = await supabase
      .from('lecturers')
      .select('*');
    
    if (lecturersError) {
      throw lecturersError;
    }
    
    console.log('Lecturers:', JSON.stringify(lecturers, null, 2));
    
    // Join videos with their lecturer information
    console.log('\nFetching videos with lecturer info...');
    const enhancedVideos = [];
    
    for (const video of videos) {
      const lecturer = lecturers.find(l => l.id === video.lecturer_id);
      const subject = subjects.find(s => s.id === video.subject_id);
      
      enhancedVideos.push({
        ...video,
        lecturer: lecturer || null,
        subject: subject || null
      });
    }
    
    console.log('Videos with lecturer and subject info:', JSON.stringify(enhancedVideos, null, 2));
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Run the function
viewData();