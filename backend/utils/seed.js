require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Course   = require('../models/Course');
const { Announcement, Assignment, Quiz } = require('../models/index');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning_platform';

async function seed() {
  await mongoose.connect(URI);
  console.log('Connected');

  await User.deleteMany({ email: { $in: ['student@demo.com','teacher@demo.com','admin@demo.com','student2@demo.com'] } });

  const admin = await User.create({ name:'Admin User',       email:'admin@demo.com',    password:'demo123', role:'admin',   employeeId:'ADM0001' });
  const teacher= await User.create({ name:'Dr. Priya Sharma', email:'teacher@demo.com',  password:'demo123', role:'teacher', employeeId:'TCH0001' });
  const s1     = await User.create({ name:'Rahul Kumar',       email:'student@demo.com',  password:'demo123', role:'student', employeeId:'STU0001' });
  const s2     = await User.create({ name:'Ananya Singh',      email:'student2@demo.com', password:'demo123', role:'student', employeeId:'STU0002' });

  const courses = await Course.insertMany([
    {
      title:'Introduction to Python Programming', description:'Learn Python from scratch. Variables, loops, functions, OOP.', teacher:teacher._id,
      category:'programming', level:'beginner', isPublished:true, tags:['python','beginner'],
      enrolledStudents:[s1._id,s2._id],
      lessons:[
        { title:'Getting Started', type:'text', content:'Python is a high-level language. Install Python from python.org. Write: print("Hello World")', order:0 },
        { title:'Variables & Data Types', type:'text', content:'int, float, str, bool, list, dict — Python is dynamically typed.', order:1 },
        { title:'Control Flow', type:'text', content:'if/elif/else and for/while loops control program flow.', order:2 },
      ],
    },
    {
      title:'Data Structures & Algorithms', description:'Master DSA concepts for interviews and competitive programming.', teacher:teacher._id,
      category:'programming', level:'intermediate', isPublished:true,
      enrolledStudents:[s1._id],
      lessons:[
        { title:'Arrays & Big O', type:'text', content:'Arrays provide O(1) access. Big O describes worst-case complexity.', order:0 },
        { title:'Linked Lists',   type:'text', content:'Nodes with data + next pointer. O(1) insertion, O(n) search.', order:1 },
      ],
    },
  ]);

  await User.findByIdAndUpdate(teacher._id, { teachingCourses: courses.map(c=>c._id) });
  await User.findByIdAndUpdate(s1._id, {
    enrolledCourses: [
      { course:courses[0]._id, progress:33, streak:3 },
      { course:courses[1]._id, progress:10, streak:1 },
    ],
  });
  await User.findByIdAndUpdate(s2._id, { enrolledCourses: [{ course:courses[0]._id, progress:0, streak:0 }] });

  await Assignment.create({
    title:'Python Exercise 1', description:'Write a Python program that prints the Fibonacci sequence up to 10 terms.', course:courses[0]._id,
    createdBy:teacher._id, deadline:new Date(Date.now()+7*24*60*60*1000), maxMarks:100,
  });

  await Quiz.create({
    title:'Python Basics Quiz', course:courses[0]._id, createdBy:teacher._id, timeLimit:20,
    questions:[
      { question:'Which function prints output in Python?', options:['input()','print()','output()','display()'], correctAnswer:1, explanation:'print() is the standard output function' },
      { question:'What is the correct way to create a list in Python?', options:['list = {}','list = ()','list = []','list = <>'], correctAnswer:2, explanation:'Lists use square brackets []' },
      { question:'What does len() function return?', options:['Last element','First element','Length of object','Type of object'], correctAnswer:2, explanation:'len() returns the number of items' },
    ],
  });

  await Announcement.insertMany([
    { title:'Welcome to EduCloud!', content:'Welcome to our platform. Explore courses, take quizzes, and join live classes. Use AI chatbot for academic help!', author:admin._id, priority:'high', isGlobal:true },
    { title:'New Assignment Posted', content:'A Python Exercise has been posted in Python Programming course. Deadline: 7 days.', author:teacher._id, course:courses[0]._id, priority:'medium' },
  ]);

  console.log('\nDemo data seeded!\n');
  console.log('student@demo.com  / demo123  (ID: STU0001)');
  console.log('student2@demo.com / demo123  (ID: STU0002)');
  console.log('teacher@demo.com  / demo123  (ID: TCH0001)');
  console.log('admin@demo.com    / demo123  (ID: ADM0001)');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });