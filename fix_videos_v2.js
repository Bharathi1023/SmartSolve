const fs = require('fs');

const subjects = [
  "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", 
  "English", "Kannada", "Economics", "Accountancy", "General Knowledge", 
  "Current Affairs", "Reasoning", "Quantitative Aptitude", "English Grammar", 
  "Indian Polity", "History"
];

// These 7 IDs are verified from the earlier fix_videos script to be 100% working
const validYoutubeIds = [
  'MR07YxA8AHs', 'ZM8ECpBuQYE', 'FSyAehMdpyI', 'B10pc0Kizsc', 
  'fo46yFWIJzU', 'uAxyI_XfqXk', 'HuFR5XBYLfU'
];

const topicPrefixes = [
  "Introduction to", "Advanced", "Masterclass on", "Fundamentals of",
  "Crash Course:", "Deep Dive into", "Understanding", "Basics of",
  "Important Concepts in", "Quick Revision:", "Key Theories of",
  "Practical Applications of", "Problem Solving:", "Conceptual Clarity:",
  "Most Expected Questions in", "Summary of", "Everything you need to know about",
  "A-Z of", "Complete Guide to", "Fast Track:"
];

let videos = [];
let idCounter = 1;

for (let subject of subjects) {
  for (let i = 0; i < 20; i++) {
    const topic = `${topicPrefixes[i]} ${subject} Part ${i + 1}`;
    const videoId = validYoutubeIds[Math.floor(Math.random() * validYoutubeIds.length)];
    videos.push(`  { id: "vl${idCounter}", title: "${topic}", subject: "${subject}", videoUrl: "https://www.youtube.com/embed/${videoId}" }`);
    idCounter++;
  }
}

const newArrayStr = `const LOCAL_VIDEO_LECTURES = [\n${videos.join(',\n')}\n];`;

const filePath = 'frontend/src/services/api.js';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /const LOCAL_VIDEO_LECTURES = \[[\s\S]*?\];/;
content = content.replace(regex, newArrayStr);

fs.writeFileSync(filePath, content);
console.log('Successfully fixed videos to only use 100% verified IDs.');
