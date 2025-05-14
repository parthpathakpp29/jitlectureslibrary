// Script to verify the videos table in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(databaseUrl);

async function verifyVideosTable() {
  try {
    console.log('Checking "videos" table in Supabase...');
    
    // Check if the videos table exists by trying to fetch data
    const { data: videos, error } = await supabase
      .from('videos')
      .select('count()')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') { // Table does not exist
        console.error('The "videos" table does not exist in the database');
        console.log('Creating the "videos" table...');
        
        // Create the videos table with the specified schema
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS videos (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            youtube_id TEXT NOT NULL,
            duration INTEGER NOT NULL,
            subject_id INTEGER NOT NULL REFERENCES subjects(id),
            lecturer_id INTEGER NOT NULL REFERENCES lecturers(id),
            published_at TIMESTAMP
          );
        `;
        
        const { error: createError } = await supabase.rpc('exec', { query: createTableQuery });
        
        if (createError) {
          console.error('Failed to create videos table:', createError);
          return;
        }
        
        console.log('Videos table created successfully');
      } else {
        console.error('Error checking videos table:', error);
        return;
      }
    } else {
      console.log('Videos table exists');
      
      // Check the structure of the videos table
      const { data: columns, error: columnsError } = await supabase.rpc('exec', { 
        query: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'videos';
        `
      });
      
      if (columnsError) {
        console.error('Error checking videos table structure:', columnsError);
        return;
      }
      
      console.log('Videos table structure:');
      console.log(columns);
      
      // Check foreign key constraints
      const { data: constraints, error: constraintsError } = await supabase.rpc('exec', {
        query: `
          SELECT
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'videos';
        `
      });
      
      if (constraintsError) {
        console.error('Error checking videos table constraints:', constraintsError);
        return;
      }
      
      console.log('Videos table foreign key constraints:');
      console.log(constraints);
    }
    
    // Now let's check for existing videos
    const { data: videoCount, error: countError } = await supabase
      .from('videos')
      .select('count(*)');
    
    if (countError) {
      console.error('Error counting videos:', countError);
      return;
    }
    
    console.log(`Number of videos in the table: ${videoCount[0].count}`);
    
    // If we have videos, let's fetch a sample
    if (parseInt(videoCount[0].count) > 0) {
      const { data: sampleVideos, error: sampleError } = await supabase
        .from('videos')
        .select(`
          *,
          lecturer:lecturers(*),
          subject:subjects(*)
        `)
        .limit(5);
      
      if (sampleError) {
        console.error('Error fetching sample videos:', sampleError);
        return;
      }
      
      console.log('Sample videos with relations:');
      console.log(JSON.stringify(sampleVideos, null, 2));
    } else {
      console.log('No videos found in the table');
    }
    
  } catch (error) {
    console.error('Error verifying videos table:', error);
  }
}

verifyVideosTable();