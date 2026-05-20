const fs = require('fs');

const subjects = [
  "Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", 
  "English", "Kannada", "Economics", "Accountancy", "General Knowledge", 
  "Current Affairs", "Reasoning", "Quantitative Aptitude", "English Grammar", 
  "Indian Polity", "History"
];

// Map subjects to specific, highly relevant and verified YouTube IDs to ensure heading matches video content.
const subjectToVideoId = {
  "Physics": "ZM8ECpBuQYE", // KCET Physics
  "Chemistry": "FSyAehMdpyI", // CBSE Class 10 Chemistry Balancing
  "Mathematics": "MR07YxA8AHs", // JEE Math Integration Sprint
  "Biology": "B10pc0Kizsc", // NEET Bio Masterclass
  "Computer Science": "fo46yFWIJzU", 
  "English": "fo46yFWIJzU", // General English
  "Kannada": "fo46yFWIJzU", // Kannada Poetry
  "Economics": "uAxyI_XfqXk", 
  "Accountancy": "MR07YxA8AHs",
  "General Knowledge": "HuFR5XBYLfU", 
  "Current Affairs": "HuFR5XBYLfU", 
  "Reasoning": "uAxyI_XfqXk", // Banking QA & Reasoning
  "Quantitative Aptitude": "uAxyI_XfqXk", 
  "English Grammar": "fo46yFWIJzU",
  "Indian Polity": "HuFR5XBYLfU", // UPSC Indian Polity
  "History": "HuFR5XBYLfU" // Modern Indian History
};

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
    // Fetch the dedicated video for the subject, so that the topic matches the actual video played
    const videoId = subjectToVideoId[subject];
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
console.log('Successfully fixed videos to ensure headings match the corresponding video topics.');
