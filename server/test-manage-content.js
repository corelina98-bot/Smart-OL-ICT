const axios = require('axios');

// Test script to verify manage content functionality
const BASE_URL = 'http://localhost:5000';

// Test user credentials (you'll need to register/login first to get a token)
const TEST_TOKEN = 'your_jwt_token_here'; // Replace with actual token

async function testManageContent() {
  console.log('Testing Manage Content APIs...\n');

  try {
    // Test 1: Create a lesson
    console.log('1. Testing lesson creation...');
    const lessonData = {
      lesson_title: 'Test Lesson',
      lesson_content: 'This is a test lesson content',
      grade: '10',
      duration: 30,
      video_url: 'https://example.com/video.mp4'
    };

    const lessonResponse = await axios.post(`${BASE_URL}/api/lessons`, lessonData, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    console.log('Lesson created:', lessonResponse.data);
    const lessonId = lessonResponse.data._id;

    // Test 2: Update the lesson
    console.log('\n2. Testing lesson update...');
    const updateData = {
      lesson_title: 'Updated Test Lesson',
      lesson_content: 'Updated content'
    };

    const updateResponse = await axios.put(`${BASE_URL}/api/lessons/${lessonId}`, updateData, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    console.log('Lesson updated:', updateResponse.data);

    // Test 3: Create a quiz
    console.log('\n3. Testing quiz creation...');
    const quizData = {
      quiz_title: 'Test Quiz',
      quiz_type: 'multiple_choice',
      time_limit: 20,
      total_questions: 10,
      grade: '10',
      lesson_id: lessonId
    };

    const quizResponse = await axios.post(`${BASE_URL}/api/quizzes`, quizData, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    console.log('Quiz created:', quizResponse.data);
    const quizId = quizResponse.data._id;

    // Test 4: Update the quiz
    console.log('\n4. Testing quiz update...');
    const quizUpdateData = {
      quiz_title: 'Updated Test Quiz',
      time_limit: 25
    };

    const quizUpdateResponse = await axios.put(`${BASE_URL}/api/quizzes/${quizId}`, quizUpdateData, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    console.log('Quiz updated:', quizUpdateResponse.data);

    // Test 5: Fetch lessons by grade
    console.log('\n5. Testing fetch lessons by grade...');
    const lessonsResponse = await axios.get(`${BASE_URL}/api/lessons/grade/10`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    console.log('Lessons fetched:', lessonsResponse.data.length, 'lessons');

    // Test 6: Fetch quizzes by grade
    console.log('\n6. Testing fetch quizzes by grade...');
    const quizzesResponse = await axios.get(`${BASE_URL}/api/quizzes/grade/10`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    console.log('Quizzes fetched:', quizzesResponse.data.length, 'quizzes');

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

// Instructions for running the test
console.log('To run this test:');
console.log('1. Start your server: cd server && node server.js');
console.log('2. Login as admin/teacher and get JWT token');
console.log('3. Replace TEST_TOKEN with your actual token');
console.log('4. Run: node test-manage-content.js\n');

// Uncomment the line below to run the test (after setting the token)
testManageContent();
