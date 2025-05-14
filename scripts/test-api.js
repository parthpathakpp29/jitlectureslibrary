// Script to test the videos API endpoint
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000'; // The port where the app is running

async function testApi() {
  try {
    // Test subjects API
    console.log('Testing /api/subjects endpoint...');
    const response = await fetch(`${BASE_URL}/api/subjects?branchId=1&semester=3`);
    const subjects = await response.json();
    
    console.log(`Found ${subjects.length} subjects:`);
    console.log(JSON.stringify(subjects, null, 2));
    
    if (subjects.length === 0) {
      console.log('No subjects found. Exiting.');
      return;
    }
    
    // Test videos API for each subject
    for (const subject of subjects) {
      console.log(`\nTesting /api/subjects/${subject.id}/videos endpoint...`);
      try {
        const videosResponse = await fetch(`${BASE_URL}/api/subjects/${subject.id}/videos`);
        
        if (!videosResponse.ok) {
          console.error(`Error: ${videosResponse.status} ${videosResponse.statusText}`);
          const errorText = await videosResponse.text();
          console.error(`Response: ${errorText}`);
          continue;
        }
        
        const videos = await videosResponse.json();
        console.log(`Subject: ${subject.name} (ID: ${subject.id})`);
        console.log(`Found ${videos.length} videos.`);
        
        if (videos.length > 0) {
          console.log('First video:');
          console.log(JSON.stringify(videos[0], null, 2));
        } else {
          console.log('No videos found for this subject.');
        }
      } catch (error) {
        console.error(`Error testing videos for subject ${subject.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();