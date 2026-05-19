import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'smartsolve_db.json');

// Initialize database template
const initialData = {
  users: [],
  papers: [],
  mockTests: [
    {
      id: "math-101",
      title: "Class 10 CBSE Mathematics - Quadratic Equations",
      subject: "Mathematics",
      duration: 30, // 30 minutes
      questions: [
        {
          id: "q1",
          question: "Find the roots of the quadratic equation 2x² - 5x + 3 = 0.",
          options: [
            "x = 1, x = 1.5",
            "x = -1, x = -1.5",
            "x = 2, x = 3",
            "x = 0, x = 5"
          ],
          correctAnswer: 0,
          explanation: "Using the quadratic formula: x = [-b ± √(b² - 4ac)] / 2a. Here a=2, b=-5, c=3. b²-4ac = 25 - 24 = 1. Roots are (5 + 1)/4 = 1.5 and (5 - 1)/4 = 1. Hence, x = 1 and x = 1.5."
        },
        {
          id: "q2",
          question: "If one root of the quadratic equation kx² - 3x - 10 = 0 is 2, find the value of k.",
          options: [
            "k = 2",
            "k = 3",
            "k = 4",
            "k = 5"
          ],
          correctAnswer: 2,
          explanation: "Substitute x = 2 in the equation: k(2)² - 3(2) - 10 = 0 => 4k - 6 - 10 = 0 => 4k = 16 => k = 4."
        },
        {
          id: "q3",
          question: "What is the nature of the roots of the equation x² - 4x + 4 = 0?",
          options: [
            "Real and distinct",
            "Real and equal",
            "Imaginary/No real roots",
            "None of the above"
          ],
          correctAnswer: 1,
          explanation: "Calculate the discriminant D = b² - 4ac. Here, D = (-4)² - 4(1)(4) = 16 - 16 = 0. Since D = 0, the roots are real and equal."
        }
      ]
    },
    {
      id: "sci-102",
      title: "Class 10 CBSE Science - Chemical Reactions and Equations",
      subject: "Science",
      duration: 20,
      questions: [
        {
          id: "sq1",
          question: "Which of the following is a displacement reaction?",
          options: [
            "CaCO₃ → CaO + CO₂",
            "2H₂ + O₂ → 2H₂O",
            "Fe + CuSO₄ → FeSO₄ + Cu",
            "NaOH + HCl → NaCl + H₂O"
          ],
          correctAnswer: 2,
          explanation: "In Fe + CuSO₄ → FeSO₄ + Cu, Iron (Fe) is more reactive than Copper (Cu) and displaces it from its sulphate solution, making it a displacement reaction."
        },
        {
          id: "sq2",
          question: "What happens when dilute hydrochloric acid is added to iron filings?",
          options: [
            "Hydrogen gas and iron chloride are produced.",
            "Chlorine gas and iron hydroxide are produced.",
            "No reaction takes place.",
            "Iron salt and water are produced."
          ],
          correctAnswer: 0,
          explanation: "Fe + 2HCl → FeCl₂ + H₂. Hydrogen gas and iron(II) chloride are produced. This is a single displacement reaction."
        }
      ]
    }
  ],
  userTests: [],
  notes: [
    {
      id: "n1",
      title: "Quadratic Equations Formula Sheet",
      subject: "Mathematics",
      category: "formulas",
      content: `### Quadratic Equation: $ax^2 + bx + c = 0$

#### 1. Discriminant ($D$)
$D = b^2 - 4ac$

#### 2. Nature of Roots
- If $D > 0$: Roots are real and distinct: $x = \\frac{-b \\pm \\sqrt{D}}{2a}$
- If $D = 0$: Roots are real and equal: $x = -\\frac{b}{2a}$
- If $D < 0$: No real roots (imaginary roots).

#### 3. Quadratic Formula (Shreedharacharya Method)
$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

#### 4. Relation Between Roots and Coefficients
Let $\\alpha$ and $\\beta$ be the roots of the equation:
- Sum of roots: $\\alpha + \\beta = -\\frac{b}{a}$
- Product of roots: $\\alpha \\cdot \\beta = \\frac{c}{a}$`,
      videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs",
      flashcards: [
        { front: "What is the quadratic formula?", back: "x = (-b ± √(b² - 4ac)) / 2a" },
        { front: "What does the discriminant D determine?", back: "The nature of the roots (real & distinct, real & equal, or complex)." },
        { front: "Formula for the sum of roots α + β?", back: "-b/a" }
      ]
    },
    {
      id: "n2",
      title: "Chemical Reactions and Balancing Equations",
      subject: "Science",
      category: "notes",
      content: `### Chemical Reactions Summary

#### 1. Combination Reaction
Two or more reactants combine to form a single product.
$2H_2 + O_2 \\rightarrow 2H_2O$

#### 2. Decomposition Reaction
A single reactant breaks down into two or more simpler products.
$2H_2O \\rightarrow 2H_2 + O_2$ (Electrolytic decomposition)

#### 3. Displacement Reaction
A more reactive element displaces a less reactive element from its compound.
$Fe + CuSO_4 \\rightarrow FeSO_4 + Cu$

#### 4. Double Displacement Reaction
Exchange of ions between reactants.
$Na_2SO_4 + BaCl_2 \\rightarrow BaSO_4 \\downarrow + 2NaCl$`,
      videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI",
      flashcards: [
        { front: "Define displacement reaction.", back: "A reaction in which a more reactive element displaces a less reactive element from its salt solution." },
        { front: "What is a precipitation reaction?", back: "A reaction that produces an insoluble salt (precipitate)." }
      ]
    }
  ],
  forum: [
    {
      id: "f1",
      title: "How to solve quadratic equations quickly in board exams?",
      content: "Does anyone have shortcuts for factoring? Sometimes splitting the middle term takes way too long when numbers are big.",
      author: "Rahul S.",
      subject: "Mathematics",
      date: "2026-05-18T10:00:00.000Z",
      replies: [
        {
          author: "Anjali Sharma (Educator)",
          content: "Always check the product a*c first. Find prime factors of a*c, then look for pairs. If the numbers are too big, don't waste more than 30 seconds—instantly switch to the quadratic formula! It is foolproof.",
          date: "2026-05-18T10:15:00.000Z"
        }
      ]
    }
  ],
  studyRooms: [
    {
      id: "room-math",
      name: "Mathematics Board Prep 📐",
      subject: "Mathematics",
      activeUsers: 3,
      messages: [
        { author: "Kiran", content: "Hey guys, working on quadratic equations mock test. Anyone down to solve together?", time: "18:05" },
        { author: "Sneha", content: "Yes! I'm in the Pomodoro room now.", time: "18:07" }
      ]
    },
    {
      id: "room-science",
      name: "Science Masterminds 🧪",
      subject: "Science",
      activeUsers: 5,
      messages: [
        { author: "Deepak", content: "Does anyone understand the balancing equation of lead nitrate decomposition?", time: "17:45" },
        { author: "Rohan", content: "Yes, it is 2Pb(NO3)2 -> 2PbO + 4NO2 + O2. Remember lead oxide is yellow and nitrogen dioxide gas has brown fumes!", time: "17:50" }
      ]
    }
  ],
  liveClasses: [
    { id: "lc1", title: "KCET Physics 1-Shot", instructor: "Prof. Kiran", scheduledAt: "2026-05-20T10:00:00Z", status: "Upcoming", batch: "KCET Batch" },
    { id: "lc2", title: "NEET Bio Masterclass", instructor: "Dr. Anjali", scheduledAt: "2026-05-19T09:00:00Z", status: "Ongoing", batch: "NEET Batch" },
    { id: "lc3", title: "JEE Math Integration Sprint", instructor: "Dr. Dev", scheduledAt: "2026-05-20T14:00:00Z", status: "Upcoming", batch: "JEE Batch" },
    { id: "lc4", title: "UPSC Indian Polity Masterclass", instructor: "Manoj Sir", scheduledAt: "2026-05-21T11:00:00Z", status: "Upcoming", batch: "UPSC Batch" },
    { id: "lc5", title: "CBSE Class 10 Chemistry Balancing", instructor: "Ms. Divya", scheduledAt: "2026-05-19T18:00:00Z", status: "Ongoing", batch: "Class 10 CBSE" },
    { id: "lc6", title: "General English & Grammar Hacks", instructor: "Prof. Sarah", scheduledAt: "2026-05-22T15:00:00Z", status: "Upcoming", batch: "General English Batch" },
    { id: "lc7", title: "Banking QA & Reasoning Trick", instructor: "Mr. Ramesh", scheduledAt: "2026-05-21T16:00:00Z", status: "Upcoming", batch: "Banking PO Batch" },
    { id: "lc8", title: "Modern Indian History Fast-Track", instructor: "Dr. Meera", scheduledAt: "2026-05-23T10:00:00Z", status: "Upcoming", batch: "SSC Batch" },
    { id: "lc9", title: "PUC 2 Accountancy Partnership Accounts", instructor: "Mr. CA Anand", scheduledAt: "2026-05-20T17:00:00Z", status: "Upcoming", batch: "Commerce PU2" },
    { id: "lc10", title: "Kannada Language Poetry Breakdown", instructor: "Mrs. Shweta", scheduledAt: "2026-05-24T14:00:00Z", status: "Upcoming", batch: "State Board Batch" }
  ],
  videoLectures: [
    { id: "vl1", title: "Motion in 1D - Physics Revision", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
    { id: "vl2", title: "Chemical Reactions & Equations", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
    { id: "vl3", title: "Quadratic Equations Masterclass", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
    { id: "vl4", title: "Human Brain & Nervous System", subject: "Biology", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
    { id: "vl5", title: "Important Current Affairs 2026", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
    { id: "vl6", title: "Introduction to Python Programming", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/O5nskjZ_GoI" },
    { id: "vl7", title: "Romeo & Juliet Character Analysis", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
    { id: "vl8", title: "Kannada Vyakaran & Grammar Rules", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
    { id: "vl9", title: "Principles of Microeconomics", subject: "Economics", videoUrl: "https://www.youtube.com/embed/3ez14uE9cZ0" },
    { id: "vl10", title: "Accounting Basics & Journal Entries", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/c76tZ3U7l7w" },
    { id: "vl11", title: "General Knowledge - World Geography", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
    { id: "vl12", title: "Logical Reasoning & Syllogism", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
    { id: "vl13", title: "Speed Math & Quantitative Aptitude", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
    { id: "vl14", title: "Active & Passive Voice Masterclass", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
    { id: "vl15", title: "Indian Constitution & Preamble", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
    { id: "vl16", title: "The Silk Road & Ancient History", subject: "History", videoUrl: "https://www.youtube.com/embed/vn3e37IQBCk" },
    { id: "vl17", title: "Photosynthesis & Respiration in Plants", subject: "Biology", videoUrl: "https://www.youtube.com/embed/eo5XndJaz-Y" },
    { id: "vl18", title: "Light Reflection & Refraction", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
    { id: "vl19", title: "Periodic Classification of Elements", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
    { id: "vl20", title: "Trigonometric Identities Made Easy", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
    { id: "vl21", title: "Object Oriented Programming (OOP) in Java", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/O5nskjZ_GoI" },
    { id: "vl22", title: "Demand & Supply Curve Analysis", subject: "Economics", videoUrl: "https://www.youtube.com/embed/3ez14uE9cZ0" }
  ]
};

class Database {
  constructor() {
    this.data = initialData;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
        // Ensure all required fields from initialData are present!
        let updated = false;
        for (let key in initialData) {
          if (!this.data[key] || !Array.isArray(this.data[key]) || this.data[key].length === 0) {
            this.data[key] = initialData[key];
            updated = true;
          }
        }
        if (updated) {
          this.save();
        }
      } else {
        this.save();
      }
    } catch (error) {
      console.error("Database initialization error, using defaults:", error);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error("Database write error:", error);
    }
  }

  // CRUD utilities
  getCollection(name) {
    return this.data[name] || [];
  }

  setCollection(name, list) {
    this.data[name] = list;
    this.save();
  }

  find(collectionName, query = {}) {
    const list = this.getCollection(collectionName);
    return list.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const list = this.getCollection(collectionName);
    return list.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  insert(collectionName, item) {
    const list = this.getCollection(collectionName);
    const newItem = { ...item };
    if (!newItem.id) {
      newItem.id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    }
    list.push(newItem);
    this.setCollection(collectionName, list);
    return newItem;
  }

  update(collectionName, query, updates) {
    const list = this.getCollection(collectionName);
    let updatedCount = 0;
    const newList = list.map(item => {
      let matches = true;
      for (let key in query) {
        if (item[key] !== query[key]) matches = false;
      }
      if (matches) {
        updatedCount++;
        return { ...item, ...updates };
      }
      return item;
    });
    if (updatedCount > 0) {
      this.setCollection(collectionName, newList);
    }
    return updatedCount;
  }

  delete(collectionName, query) {
    const list = this.getCollection(collectionName);
    const beforeLength = list.length;
    const newList = list.filter(item => {
      let matches = true;
      for (let key in query) {
        if (item[key] !== query[key]) matches = false;
      }
      return !matches;
    });
    if (newList.length < beforeLength) {
      this.setCollection(collectionName, newList);
    }
    return beforeLength - newList.length;
  }
}

const db = new Database();
export default db;
