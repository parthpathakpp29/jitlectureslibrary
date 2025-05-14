// This script adds a new subject to the Semester 3 of CSE branch
// Run this with: node scripts/add-subjects.js

import { createClient } from '@supabase/supabase-js';

// Use environment variables or the same hardcoded credentials from your code
const supabaseUrl = process.env.SUPABASE_URL || 'https://jbcyhmhjlcfdavqdfosq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiY3lobWhqbGNmZGF2cWRmb3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzU5ODYsImV4cCI6MjA2MjcxMTk4Nn0.LvMCWlq-QhPL_aCGLSJjvq4Dt0Du4w25jp_2fXwlTQk';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Connecting to Supabase...');
    
    // Step 1: Get the CSE branch ID
    let { data: branches, error: branchError } = await supabase
      .from('branches')
      .select('id')
      .eq('code', 'CSE')
      .single();
    
    if (branchError) {
      throw new Error(`Error getting CSE branch: ${branchError.message}`);
    }
    
    const branchId = branches.id;
    console.log(`Found CSE branch with ID: ${branchId}`);
    
    // Step 2: Check if semester 3 exists, create it if not
    let { data: semesters, error: semesterError } = await supabase
      .from('semesters')
      .select('id')
      .eq('number', 3)
      .eq('branch_id', branchId);
    
    if (semesterError) {
      throw new Error(`Error checking for semester: ${semesterError.message}`);
    }
    
    let semesterId;
    
    if (!semesters || semesters.length === 0) {
      console.log('Creating Semester 3...');
      // Create semester 3
      const { data: newSemester, error: createError } = await supabase
        .from('semesters')
        .insert({ number: 3, branch_id: branchId })
        .select()
        .single();
      
      if (createError) {
        throw new Error(`Error creating semester: ${createError.message}`);
      }
      
      semesterId = newSemester.id;
      console.log(`Created semester 3 with ID: ${semesterId}`);
    } else {
      semesterId = semesters[0].id;
      console.log(`Found existing semester 3 with ID: ${semesterId}`);
    }
    
    // Step 3: Check if Data Structures subject exists
    let { data: subjects, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', 'Data Structures and Algorithms')
      .eq('semester_id', semesterId);
    
    if (subjectError) {
      throw new Error(`Error checking for subject: ${subjectError.message}`);
    }
    
    // Add Data Structures subject if it doesn't exist
    if (!subjects || subjects.length === 0) {
      console.log('Adding Data Structures and Algorithms subject...');
      const { data: newSubject, error: createSubjectError } = await supabase
        .from('subjects')
        .insert({
          name: 'Data Structures and Algorithms',
          description: 'Learn essential data structures like arrays, linked lists, trees, graphs, and algorithms for sorting, searching, and graph traversal.',
          semester_id: semesterId,
          branch_id: branchId
        })
        .select()
        .single();
      
      if (createSubjectError) {
        throw new Error(`Error creating subject: ${createSubjectError.message}`);
      }
      
      console.log(`Created Data Structures subject with ID: ${newSubject.id}`);
    } else {
      console.log(`Data Structures subject already exists with ID: ${subjects[0].id}`);
    }
    
    // Step 4: Check if Object Oriented Programming subject exists
    subjects = null;
    subjectError = null;
    
    let { data: oopSubjects, error: oopError } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', 'Object Oriented Programming')
      .eq('semester_id', semesterId);
    
    if (oopError) {
      throw new Error(`Error checking for OOP subject: ${oopError.message}`);
    }
    
    // Add OOP subject if it doesn't exist
    if (!oopSubjects || oopSubjects.length === 0) {
      console.log('Adding Object Oriented Programming subject...');
      const { data: newSubject, error: createSubjectError } = await supabase
        .from('subjects')
        .insert({
          name: 'Object Oriented Programming',
          description: 'Study object-oriented programming concepts including classes, objects, inheritance, polymorphism, encapsulation, and design patterns.',
          semester_id: semesterId,
          branch_id: branchId
        })
        .select()
        .single();
      
      if (createSubjectError) {
        throw new Error(`Error creating OOP subject: ${createSubjectError.message}`);
      }
      
      console.log(`Created OOP subject with ID: ${newSubject.id}`);
    } else {
      console.log(`OOP subject already exists with ID: ${oopSubjects[0].id}`);
    }
    
    // Success
    console.log('Script completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();