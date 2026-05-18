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
      videoUrl: "https://www.youtube.com/embed/Z1e_S7G6lZ0",
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
      videoUrl: "https://www.youtube.com/embed/e1W5ZkQ_b5c",
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
