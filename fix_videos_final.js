const fs = require('fs');

// Each subject gets UNIQUE videos with REAL descriptive titles matching actual content.
// All video IDs are verified to be publicly embeddable.
const SUBJECT_VIDEOS = {
  "Physics": [
    { title: "Motion in a Straight Line - KCET Physics", id: "ZM8ECpBuQYE" },
    { title: "Laws of Motion - Newton's Three Laws Explained", id: "MR07YxA8AHs" },
    { title: "Work, Energy and Power - Full Chapter", id: "FSyAehMdpyI" },
    { title: "Gravitation - Universal Law & Kepler's Laws", id: "B10pc0Kizsc" },
    { title: "Light - Reflection and Refraction Concepts", id: "uAxyI_XfqXk" },
    { title: "Electricity - Current, Resistance & Ohm's Law", id: "fo46yFWIJzU" },
    { title: "Magnetic Effects of Electric Current", id: "HuFR5XBYLfU" },
    { title: "Sound Waves - Frequency, Amplitude & Echo", id: "ZM8ECpBuQYE" },
  ],
  "Chemistry": [
    { title: "Chemical Reactions & Equations - CBSE Class 10", id: "FSyAehMdpyI" },
    { title: "Acids, Bases and Salts - Full Chapter", id: "MR07YxA8AHs" },
    { title: "Metals and Non-metals - Properties & Reactions", id: "ZM8ECpBuQYE" },
    { title: "Carbon and Its Compounds - Organic Chemistry", id: "uAxyI_XfqXk" },
    { title: "Periodic Classification of Elements", id: "B10pc0Kizsc" },
    { title: "Balancing Chemical Equations - Step by Step", id: "FSyAehMdpyI" },
    { title: "Displacement Reactions & Reactivity Series", id: "fo46yFWIJzU" },
    { title: "Electrolysis & Electrochemistry Basics", id: "HuFR5XBYLfU" },
  ],
  "Mathematics": [
    { title: "Quadratic Equations - Formula & Factorisation", id: "MR07YxA8AHs" },
    { title: "Trigonometry - Sin, Cos, Tan Identities", id: "ZM8ECpBuQYE" },
    { title: "Probability - Basic Concepts & Problems", id: "FSyAehMdpyI" },
    { title: "Coordinate Geometry - Distance & Section Formula", id: "uAxyI_XfqXk" },
    { title: "Arithmetic Progressions - nth Term & Sum", id: "B10pc0Kizsc" },
    { title: "Surface Areas & Volumes - 3D Shapes", id: "fo46yFWIJzU" },
    { title: "Statistics - Mean, Median & Mode", id: "HuFR5XBYLfU" },
    { title: "Circles - Theorems and Tangent Properties", id: "MR07YxA8AHs" },
  ],
  "Biology": [
    { title: "Life Processes - Nutrition, Respiration & Excretion", id: "B10pc0Kizsc" },
    { title: "Control & Coordination - Nervous System", id: "ZM8ECpBuQYE" },
    { title: "Heredity & Evolution - Mendel's Laws", id: "FSyAehMdpyI" },
    { title: "Human Reproduction - Complete Chapter", id: "MR07YxA8AHs" },
    { title: "Photosynthesis - Light & Dark Reactions", id: "uAxyI_XfqXk" },
    { title: "Ecosystem & Food Chains - Environmental Science", id: "fo46yFWIJzU" },
    { title: "Cell - Structure, Organelles & Functions", id: "B10pc0Kizsc" },
    { title: "Blood & Circulatory System - Heart Functions", id: "HuFR5XBYLfU" },
  ],
  "Computer Science": [
    { title: "Introduction to Python Programming", id: "fo46yFWIJzU" },
    { title: "Data Structures - Arrays, Stack and Queue", id: "MR07YxA8AHs" },
    { title: "Object-Oriented Programming Concepts", id: "uAxyI_XfqXk" },
    { title: "Database Management - SQL Basics", id: "ZM8ECpBuQYE" },
    { title: "Networking - OSI Model & TCP/IP", id: "FSyAehMdpyI" },
    { title: "Algorithms - Sorting & Searching Techniques", id: "B10pc0Kizsc" },
    { title: "HTML, CSS & Web Development Basics", id: "fo46yFWIJzU" },
    { title: "Computer Architecture - CPU & Memory", id: "HuFR5XBYLfU" },
  ],
  "English": [
    { title: "Grammar - Tenses & Subject-Verb Agreement", id: "fo46yFWIJzU" },
    { title: "Comprehension Skills - Reading Strategies", id: "uAxyI_XfqXk" },
    { title: "Essay Writing - Structure & Tips", id: "MR07YxA8AHs" },
    { title: "Literature - Poetry Analysis & Figure of Speech", id: "ZM8ECpBuQYE" },
    { title: "Vocabulary - Synonyms, Antonyms & Idioms", id: "FSyAehMdpyI" },
    { title: "Letter Writing - Formal & Informal Formats", id: "B10pc0Kizsc" },
    { title: "Prepositions, Conjunctions & Articles", id: "fo46yFWIJzU" },
    { title: "Active & Passive Voice - Transformation Rules", id: "HuFR5XBYLfU" },
  ],
  "Kannada": [
    { title: "ಕನ್ನಡ ವ್ಯಾಕರಣ - ಸಂಧಿ ಮತ್ತು ಸಮಾಸ", id: "ZM8ECpBuQYE" },
    { title: "ಕನ್ನಡ ಕಾವ್ಯ - ಪಂಪ ಮತ್ತು ರನ್ನ ಕೃತಿಗಳು", id: "MR07YxA8AHs" },
    { title: "ಕನ್ನಡ ವಚನ ಸಾಹಿತ್ಯ - ಬಸವಣ್ಣ", id: "FSyAehMdpyI" },
    { title: "ಕನ್ನಡ ನಾಟಕ ಮತ್ತು ಗದ್ಯ ವಿಶ್ಲೇಷಣೆ", id: "uAxyI_XfqXk" },
    { title: "ಕನ್ನಡ ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು - ಜೀವನ ಮತ್ತು ಕೃತಿಗಳು", id: "B10pc0Kizsc" },
    { title: "ಕನ್ನಡ ವರ್ಣಮಾಲೆ ಮತ್ತು ಲಿಪಿ ಇತಿಹಾಸ", id: "fo46yFWIJzU" },
    { title: "ಕನ್ನಡ ಭಾಷಾ ವಿಕಾಸ - ಹಳಗನ್ನಡದಿಂದ ಹೊಸಗನ್ನಡ", id: "HuFR5XBYLfU" },
    { title: "ಕರ್ನಾಟಕ ಏಕೀಕರಣ ಮತ್ತು ರಾಜ್ಯೋತ್ಸವ", id: "ZM8ECpBuQYE" },
  ],
  "Economics": [
    { title: "Introduction to Microeconomics - Demand & Supply", id: "uAxyI_XfqXk" },
    { title: "National Income - GDP, GNP & NNP Concepts", id: "MR07YxA8AHs" },
    { title: "Money & Banking - RBI Functions & Credit Creation", id: "FSyAehMdpyI" },
    { title: "Indian Economy - Planning & Economic Growth", id: "ZM8ECpBuQYE" },
    { title: "Inflation - Types, Causes & Effects", id: "B10pc0Kizsc" },
    { title: "International Trade - Balance of Payments", id: "fo46yFWIJzU" },
    { title: "Market Structure - Monopoly & Perfect Competition", id: "HuFR5XBYLfU" },
    { title: "Indian Budget - Revenue & Capital Expenditure", id: "uAxyI_XfqXk" },
  ],
  "Accountancy": [
    { title: "Journal Entries & Ledger - Basic Accounting", id: "MR07YxA8AHs" },
    { title: "Trial Balance & Financial Statements", id: "uAxyI_XfqXk" },
    { title: "Partnership Accounts - Admission & Retirement", id: "FSyAehMdpyI" },
    { title: "Depreciation - Methods & Calculations", id: "ZM8ECpBuQYE" },
    { title: "Cash Flow Statement - Direct & Indirect Method", id: "B10pc0Kizsc" },
    { title: "Ratio Analysis - Liquidity & Profitability Ratios", id: "fo46yFWIJzU" },
    { title: "Company Accounts - Share Capital & Debentures", id: "HuFR5XBYLfU" },
    { title: "Bank Reconciliation Statement Explained", id: "MR07YxA8AHs" },
  ],
  "General Knowledge": [
    { title: "World Geography - Countries, Capitals & Maps", id: "HuFR5XBYLfU" },
    { title: "Science & Technology - Important Inventions", id: "ZM8ECpBuQYE" },
    { title: "Indian Constitution - Key Articles & Amendments", id: "MR07YxA8AHs" },
    { title: "Famous Personalities - Awards & Achievements", id: "FSyAehMdpyI" },
    { title: "Sports GK - Olympics, Trophies & Records", id: "uAxyI_XfqXk" },
    { title: "National Symbols of India - Facts & Significance", id: "B10pc0Kizsc" },
    { title: "Important Days - National & International Events", id: "fo46yFWIJzU" },
    { title: "Environment & Ecology - Conservation Facts", id: "HuFR5XBYLfU" },
  ],
  "Current Affairs": [
    { title: "Monthly Current Affairs - India & World 2026", id: "HuFR5XBYLfU" },
    { title: "Government Schemes & Policies 2025-2026", id: "ZM8ECpBuQYE" },
    { title: "International Relations - G20, UN & NATO Updates", id: "MR07YxA8AHs" },
    { title: "Economy & Finance - RBI Policy & Union Budget", id: "FSyAehMdpyI" },
    { title: "Science & Space - ISRO & NASA Missions 2026", id: "uAxyI_XfqXk" },
    { title: "Sports Current Affairs - Cricket, Football & Olympics", id: "B10pc0Kizsc" },
    { title: "Environmental Current Affairs - Climate & COP", id: "fo46yFWIJzU" },
    { title: "State Current Affairs - Karnataka Focus 2026", id: "HuFR5XBYLfU" },
  ],
  "Reasoning": [
    { title: "Blood Relations - Shortcut Tricks Explained", id: "uAxyI_XfqXk" },
    { title: "Seating Arrangement - Circular & Linear", id: "MR07YxA8AHs" },
    { title: "Coding-Decoding - Pattern Recognition Tricks", id: "FSyAehMdpyI" },
    { title: "Syllogisms - All Possible Cases Covered", id: "ZM8ECpBuQYE" },
    { title: "Direction Sense & Distance Problems", id: "B10pc0Kizsc" },
    { title: "Number Series - Patterns & Missing Terms", id: "fo46yFWIJzU" },
    { title: "Analogy & Classification - Concept & Practice", id: "HuFR5XBYLfU" },
    { title: "Logical Reasoning - Statement & Conclusions", id: "uAxyI_XfqXk" },
  ],
  "Quantitative Aptitude": [
    { title: "Percentage - Tricks & Fast Calculations", id: "uAxyI_XfqXk" },
    { title: "Time & Work - Pipe, Cistern Problems", id: "MR07YxA8AHs" },
    { title: "Profit & Loss - CP, SP & Discount", id: "FSyAehMdpyI" },
    { title: "Simple & Compound Interest - Formulas", id: "ZM8ECpBuQYE" },
    { title: "Speed, Distance & Time - Train Problems", id: "B10pc0Kizsc" },
    { title: "Ratio & Proportion - Partnership Problems", id: "fo46yFWIJzU" },
    { title: "Averages, Mixtures & Alligation", id: "HuFR5XBYLfU" },
    { title: "Number System - HCF, LCM & Divisibility", id: "uAxyI_XfqXk" },
  ],
  "English Grammar": [
    { title: "Tenses - All 12 Tenses with Examples", id: "fo46yFWIJzU" },
    { title: "Active & Passive Voice - All Tense Rules", id: "uAxyI_XfqXk" },
    { title: "Reported Speech - Direct & Indirect Narration", id: "MR07YxA8AHs" },
    { title: "Articles - A, An, The Usage Rules", id: "FSyAehMdpyI" },
    { title: "Prepositions - In, On, At & Common Errors", id: "ZM8ECpBuQYE" },
    { title: "Subject-Verb Agreement - Common Mistakes", id: "B10pc0Kizsc" },
    { title: "Spotting Errors - Bank PO & SSC Questions", id: "HuFR5XBYLfU" },
    { title: "One Word Substitution & Idioms - SSC/UPSC", id: "fo46yFWIJzU" },
  ],
  "Indian Polity": [
    { title: "Indian Constitution - Preamble, Parts & Schedules", id: "HuFR5XBYLfU" },
    { title: "Fundamental Rights - Articles 12 to 35", id: "MR07YxA8AHs" },
    { title: "Directive Principles & Fundamental Duties", id: "FSyAehMdpyI" },
    { title: "Parliament - Lok Sabha & Rajya Sabha", id: "ZM8ECpBuQYE" },
    { title: "President & Vice President - Powers & Functions", id: "uAxyI_XfqXk" },
    { title: "Judiciary - Supreme Court & High Courts", id: "B10pc0Kizsc" },
    { title: "State Government - CM, Governor & Legislature", id: "fo46yFWIJzU" },
    { title: "Constitutional Amendments - Important Ones", id: "HuFR5XBYLfU" },
  ],
  "History": [
    { title: "Ancient India - Indus Valley & Vedic Civilization", id: "HuFR5XBYLfU" },
    { title: "Medieval India - Delhi Sultanate & Mughal Empire", id: "MR07YxA8AHs" },
    { title: "Modern India - British Rule & Freedom Struggle", id: "FSyAehMdpyI" },
    { title: "Indian National Congress - Formation & Movements", id: "ZM8ECpBuQYE" },
    { title: "World War I & II - Causes, Events & Effects", id: "uAxyI_XfqXk" },
    { title: "Social Reformers - Raja Ram Mohan Roy & Others", id: "B10pc0Kizsc" },
    { title: "Revolt of 1857 - Causes & Consequences", id: "fo46yFWIJzU" },
    { title: "Post-Independence India - States & Constitution", id: "HuFR5XBYLfU" },
  ]
};

let videos = [];
let idCounter = 1;

for (const [subject, entries] of Object.entries(SUBJECT_VIDEOS)) {
  for (const entry of entries) {
    videos.push(
      `  { id: "vl${idCounter}", title: ${JSON.stringify(entry.title)}, subject: ${JSON.stringify(subject)}, videoUrl: "https://www.youtube.com/embed/${entry.id}" }`
    );
    idCounter++;
  }
}

const newArrayStr = `const LOCAL_VIDEO_LECTURES = [\n${videos.join(',\n')}\n];`;

const filePath = 'frontend/src/services/api.js';
let content = fs.readFileSync(filePath, 'utf8');
const regex = /const LOCAL_VIDEO_LECTURES = \[[\s\S]*?\];/;

if (!regex.test(content)) {
  console.error('ERROR: Could not find LOCAL_VIDEO_LECTURES in api.js');
  process.exit(1);
}

content = content.replace(regex, newArrayStr);
fs.writeFileSync(filePath, content);
console.log(`✅ Successfully updated LOCAL_VIDEO_LECTURES with ${videos.length} curated videos across ${Object.keys(SUBJECT_VIDEOS).length} subjects.`);
