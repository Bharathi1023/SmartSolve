// API Client with robust self-healing fallback to LocalStorage if backend is offline.
const BACKEND_URL = 'http://localhost:5000/api';

// Native client-side implementations of the AI solver, so it runs completely stand-alone if backend is offline!
function localSolveQuestion(text, mode, lengthMode, language) {
  const query = text.toLowerCase();
  let subject = 'General Study';
  
  if (query.includes('quadratic') || query.includes('x^2') || query.includes('x²') || query.includes('equation') || query.includes('math') || query.includes('solve for x')) {
    subject = 'Mathematics';
  } else if (query.includes('chemical') || query.includes('reaction') || query.includes('acid') || query.includes('balance') || query.includes('fe +') || query.includes('caco3')) {
    subject = 'Science (Chemistry)';
  } else if (query.includes('force') || query.includes('velocity') || query.includes('gravity') || query.includes('lens')) {
    subject = 'Science (Physics)';
  } else if (query.includes('cell') || query.includes('plant') || query.includes('photosynthesis')) {
    subject = 'Science (Biology)';
  }

  // Solve quadratic equations locally!
  const quadMatch = text.match(/(-?\d*)x[²2]\s*([+-]\s*\d*)x\s*([+-]\s*\d*)\s*=\s*0/i) || 
                    text.match(/(-?\d*)x[²2]\s*([+-]\s*\d*)x\s*([+-]\s*\d*)/i);

  let mathAnalysis = null;
  if (quadMatch) {
    let a = parseInt(quadMatch[1].replace(/\s+/g, '')) || 1;
    if (quadMatch[1] === '-') a = -1;
    let b = parseInt(quadMatch[2].replace(/\s+/g, '')) || 0;
    let c = parseInt(quadMatch[3].replace(/\s+/g, '')) || 0;
    mathAnalysis = localSolveQuadratic(a, b, c);
    subject = 'Mathematics';
  }

  let answerContent = '';
  let steps = [];
  let diagram = null;

  if (mathAnalysis) {
    steps = mathAnalysis.steps;
    diagram = mathAnalysis.diagram;
    answerContent = `The quadratic equation is **${mathAnalysis.equation} = 0**.\n\n` +
                    `### Roots Found:\n` +
                    `- **x₁ = ${mathAnalysis.x1}**\n` +
                    `- **x₂ = ${mathAnalysis.x2}**\n\n` +
                    `### Nature of Roots:\n` +
                    `${mathAnalysis.nature}\n\n` +
                    `### Discriminant (D):\n` +
                    `D = b² - 4ac = (${mathAnalysis.b})² - 4(${mathAnalysis.a})(${mathAnalysis.c}) = **${mathAnalysis.D}**`;
  } else {
    if (subject.includes('Chemistry')) {
      if (query.includes('fe') && query.includes('cuso4')) {
        answerContent = `This is a **Displacement Reaction**.\n\n` +
                        `**Equation:**\n` +
                        `$$\\text{Fe (s)} + \\text{CuSO}_4\\text{ (aq)} \\rightarrow \\text{FeSO}_4\\text{ (aq)} + \\text{Cu (s)}$$\n\n` +
                        `**Observation:**\n` +
                        `- The blue color of Copper Sulphate solution fades and turns light green due to the formation of Iron Sulphate (FeSO₄).\n` +
                        `- A reddish-brown deposit of copper is formed on the iron nail.`;
        steps = [
          "Identify the reactants: Iron (Fe) metal and Copper Sulphate (CuSO₄) solution.",
          "Compare reactivity: Iron is more reactive than Copper.",
          "The more reactive iron displaces copper from its sulphate salt.",
          "Write down the balanced products: Iron(II) Sulphate (FeSO₄) and copper metal (Cu)."
        ];
        diagram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" class="rounded-lg shadow-inner bg-slate-900 border border-slate-700">
          <rect x="150" y="30" width="100" height="130" rx="10" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="3" />
          <path d="M 150 60 L 250 60" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 4" />
          <path d="M 152 70 Q 200 68 248 70 L 248 158 C 248 160 240 160 200 160 C 160 160 152 160 152 158 Z" fill="rgba(14, 165, 233, 0.4)" />
          <rect x="195" y="40" width="10" height="100" rx="2" fill="#94a3b8" stroke="#64748b" stroke-width="2" transform="rotate(15 200 90)" />
          <rect x="195" y="110" width="10" height="30" rx="2" fill="#b45309" stroke="#78350f" stroke-width="2" transform="rotate(15 200 90)" />
          <text x="200" y="185" fill="#f8fafc" font-size="12" text-anchor="middle" font-family="system-ui">Iron Nail in Blue CuSO₄ solution</text>
        </svg>`;
      } else {
        answerContent = `**Chemical Reactions and Equations Solving**\n\n` +
                        `Here is a comprehensive breakdown of the chemical reaction in question.\n` +
                        `For balance: Make sure the number of atoms of each element is equal on both sides.`;
        steps = [
          "Write the unbalanced equation with chemical formulas.",
          "Count the atoms of each element on both sides.",
          "Use coefficients in front of formulas to balance the atoms.",
          "Verify that all elements are fully balanced."
        ];
      }
    } else {
      answerContent = `Here is the AI solution to your query:\n\n` +
                      `> "${text}"\n\n` +
                      `Based on analytical standards, we have generated a detailed response broken down step-by-step.`;
      steps = [
        "Analyze the core problem statement.",
        "Extract known constants and parameters.",
        "Apply standard logical frameworks and principles.",
        "Synthesize the final deduction and conclusion."
      ];
    }
  }

  // Teacher mode
  if (mode === 'teacher') {
    answerContent = `### 🧑‍🏫 Teacher Mode: Let's Learn Together!\n` +
                    `*“Hello! Let's break this concept down in a super simple, easy-to-understand way. Don't worry if it looks complicated at first. We will take it step-by-step, like we are in a classroom!”*\n\n` +
                    answerContent + `\n\n` +
                    `**Pro-Tip from Teacher:** Remember, the key to mastering this is practicing similar problems. Try changing the coefficients and solving it again!`;
  }

  if (lengthMode === '2-mark') {
    answerContent = `### 📝 2-Mark Short Answer (Consolidated & Precise):\n` +
                    `- **Core Point:** ${text.substring(0, 100)}... represents a fundamental process.\n` +
                    `- **Direct Answer:** ${mathAnalysis ? `The roots are x = ${mathAnalysis.x1}, ${mathAnalysis.x2}. D = ${mathAnalysis.D}.` : 'Balanced reaction Fe + CuSO₄ → FeSO₄ + Cu is a displacement reaction.'}\n` +
                    `- **Crucial take-away:** Maximum 2 key points for absolute exam-scoring precision.`;
    steps = steps.slice(0, 2);
  } else if (lengthMode === '10-mark') {
    answerContent = `### 📑 10-Mark Long Essay Answer (Comprehensive Details for Board Exams):\n` +
                    `#### 1. Introduction & Background:\n` +
                    `The concept relates to advanced academic standards, representing key modules of the syllabus. Below we detail the conceptual framework, practical applications, mathematical or chemical derivations, and detailed observations.\n\n` +
                    `#### 2. Detailed Explanation:\n` +
                    `${answerContent}\n\n` +
                    `#### 3. Core Steps and Analytical Proofs:\n` +
                    `All critical steps are derived below with logical reasoning.\n\n` +
                    `#### 4. Real-world Significance:\n` +
                    `- In academic grading, showing step-by-step derivations yields full credit.`;
  }

  if (language === 'kannada') {
    const dict = {
      "Roots Found": "ಪತ್ತೆಯಾದ ಮೂಲಗಳು (Roots)",
      "Nature of Roots": "ಮೂಲಗಳ ಸ್ವರೂಪ (Nature of Roots)",
      "Discriminant": "ವಿವೇಚಕ (Discriminant)",
      "Real and Distinct Roots": "ವಾಸ್ತವ ಮತ್ತು ವಿಭಿನ್ನ ಮೂಲಗಳು",
      "Real and Equal Roots": "ವಾಸ್ತವ ಮತ್ತು ಸಮಾನ ಮೂಲಗಳು",
      "Complex/Imaginary Roots": "ಸಂಕೀರ್ಣ/ಕಾಲ್ಪನಿಕ ಮೂಲಗಳು",
      "Apply quadratic formula": "ವರ್ಗೀಕರಣ ಸೂತ್ರವನ್ನು ಅನ್ವಯಿಸಿ",
      "Displacement Reaction": "ಸ್ಥಾನಪಲ್ಲಟ ಕ್ರಿಯೆ (Displacement Reaction)",
      "Equation": "ಸಮೀಕರಣ (Equation)",
      "Observation": "ವೀಕ್ಷಣೆ (Observation)"
    };
    let translated = answerContent;
    for (let k in dict) {
      translated = translated.replace(new RegExp(k, 'gi'), dict[k]);
    }
    answerContent = `🌐 **ಕನ್ನಡ ಅನುವಾದಿತ ವಿವರಣೆ (Kannada Translation):**\n\n${translated}`;
    steps = steps.map(s => `ಕನ್ನಡ: ${s}`);
  }

  let similarQuestions = [];
  let videoExplanation = null;
  let analysisReport = null;

  if (subject === 'Mathematics') {
    similarQuestions = [
      "Find the roots of 3x² - 2x + 5 = 0",
      "What is the discriminant of x² - 4x + 4 = 0?"
    ];
    videoExplanation = "https://www.youtube.com/embed/Z1e_S7G6lZ0";
    analysisReport = {
      chapter: "Quadratic Equations",
      difficulty: "Medium",
      importantTopics: ["Discriminant Nature", "Quadratic Formula", "Graph of Parabola"],
      examWeightage: "High (8-10 Marks)",
      studyTime: "2 Hours",
      shortNotes: "A quadratic equation is ax² + bx + c = 0. The discriminant D = b² - 4ac determines the nature of roots. If D > 0, roots are real and distinct. If D = 0, roots are real and equal. If D < 0, roots are complex.",
      generatedQuiz: [
        { q: "What is the formula for the discriminant?", options: ["b² + 4ac", "b² - 4ac", "2a / b"], ans: "b² - 4ac" }
      ]
    };
  } else if (subject.includes('Chemistry')) {
    similarQuestions = [
      "Balance the equation: H2 + O2 -> H2O",
      "What is a double displacement reaction?"
    ];
    videoExplanation = "https://www.youtube.com/embed/e1W5ZkQ_b5c";
    analysisReport = {
      chapter: "Chemical Reactions",
      difficulty: "Hard",
      importantTopics: ["Displacement Reactions", "Balancing Equations", "Oxidation-Reduction"],
      examWeightage: "Very High (10-12 Marks)",
      studyTime: "3 Hours",
      shortNotes: "A chemical equation must be balanced to satisfy the Law of Conservation of Mass. In a displacement reaction, a more reactive metal displaces a less reactive metal from its salt solution.",
      generatedQuiz: [
        { q: "Which of the following is a balanced equation?", options: ["H2 + O2 -> H2O", "2H2 + O2 -> 2H2O", "H2 + 2O2 -> H2O"], ans: "2H2 + O2 -> 2H2O" }
      ]
    };
  } else {
    similarQuestions = [
      "Can you explain the underlying concept again?",
      "Give me a real world example of this."
    ];
    videoExplanation = "https://www.youtube.com/embed/S2H_xJksKgs";
    analysisReport = {
      chapter: "General Concepts",
      difficulty: "Easy",
      importantTopics: ["Core Definitions", "Basic Formulas"],
      examWeightage: "Low",
      studyTime: "1 Hour",
      shortNotes: "Focus on understanding the fundamental definitions. Memorize the basic formulas and practice standard examples.",
      generatedQuiz: [
        { q: "What is the best way to learn this?", options: ["Rote memorization", "Practice and application"], ans: "Practice and application" }
      ]
    };
  }

  return { 
    subject, answer: answerContent, steps, diagram, 
    mathSolved: !!mathAnalysis, mathData: mathAnalysis, 
    similarQuestions, videoExplanation, analysisReport 
  };
}

function localSolveQuadratic(a, b, c) {
  const equation = `${a !== 1 ? (a === -1 ? '-' : a) : ''}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`;
  const D = b * b - 4 * a * c;
  let x1, x2, nature;
  let steps = [];

  steps.push(`Write down coefficients: a = ${a}, b = ${b}, c = ${c}.`);
  steps.push(`Calculate the Discriminant: D = b² - 4ac = (${b})² - 4 * (${a}) * (${c}) = ${D}.`);

  if (D > 0) {
    x1 = ((-b + Math.sqrt(D)) / (2 * a)).toFixed(2);
    x2 = ((-b - Math.sqrt(D)) / (2 * a)).toFixed(2);
    nature = "Real and Distinct Roots";
    steps.push(`Since D > 0, the equation has two distinct real roots.`);
    steps.push(`Apply quadratic formula: x = [-b ± √D] / 2a.`);
  } else if (D === 0) {
    x1 = (-b / (2 * a)).toFixed(2);
    x2 = x1;
    nature = "Real and Equal Roots";
    steps.push(`Since D = 0, the equation has real and equal roots.`);
  } else {
    const realPart = (-b / (2 * a)).toFixed(2);
    const imagPart = (Math.sqrt(-D) / (2 * a)).toFixed(2);
    x1 = `${realPart} + ${imagPart}i`;
    x2 = `${realPart} - ${imagPart}i`;
    nature = "Complex/Imaginary Roots";
    steps.push(`Since D < 0, the equation has two complex conjugate roots.`);
  }

  // SVG graphing points
  const points = [];
  for (let x = -8; x <= 8; x += 0.5) {
    points.push({ x, y: a * x * x + b * x + c });
  }

  const centerX = 200;
  const centerY = 150;
  const scaleX = 20;
  const scaleY = -4;

  const svgPoints = points.map(pt => {
    const sx = centerX + pt.x * scaleX;
    const sy = centerY + pt.y * scaleY;
    return `${sx},${sy}`;
  }).filter(coord => {
    const [x, y] = coord.split(',').map(Number);
    return y >= 20 && y <= 230 && x >= 20 && x <= 380;
  });

  const pathD = svgPoints.length > 0 ? `M ${svgPoints.join(' L ')}` : '';
  let rootsSvg = '';
  if (D >= 0) {
    const rx1 = centerX + parseFloat(x1) * scaleX;
    const rx2 = centerX + parseFloat(x2) * scaleX;
    if (rx1 >= 20 && rx1 <= 380) {
      rootsSvg += `<circle cx="${rx1}" cy="${centerY}" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
                   <text x="${rx1}" y="${centerY - 10}" fill="#ef4444" font-size="10" text-anchor="middle" font-weight="bold">x₁ = ${x1}</text>`;
    }
    if (D > 0 && rx2 >= 20 && rx2 <= 380) {
      rootsSvg += `<circle cx="${rx2}" cy="${centerY}" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
                   <text x="${rx2}" y="${centerY + 20}" fill="#ef4444" font-size="10" text-anchor="middle" font-weight="bold">x₂ = ${x2}</text>`;
    }
  }

  const diagram = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" class="rounded-lg shadow-inner bg-slate-950 border border-slate-800">
      <line x1="20" y1="${centerY}" x2="380" y2="${centerY}" stroke="#334155" stroke-width="1.5" />
      <line x1="${centerX}" y1="20" x2="${centerX}" y2="230" stroke="#334155" stroke-width="1.5" />
      <text x="375" y="${centerY - 5}" fill="#64748b" font-size="10" text-anchor="end">X</text>
      <text x="${centerX + 5}" y="30" fill="#64748b" font-size="10">Y</text>
      ${pathD ? `<path d="${pathD}" fill="none" stroke="#22c55e" stroke-width="3.5" stroke-linecap="round" />` : ''}
      <rect x="25" y="25" width="140" height="25" rx="4" fill="rgba(15, 23, 42, 0.8)" stroke="#1e293b" />
      <text x="35" y="41" fill="#22c55e" font-size="11" font-weight="bold" font-family="monospace">y = ${equation}</text>
      ${rootsSvg}
      <text x="${centerX - 10}" y="${centerY + 12}" fill="#64748b" font-size="9">(0,0)</text>
    </svg>
  `;

  return { a, b, c, equation, D, x1, x2, nature, steps, diagram };
}

// Initial fallback database template
const LOCAL_MOCK_TESTS = [
  {
    id: "math-101",
    title: "Class 10 CBSE Mathematics - Quadratic Equations",
    subject: "Mathematics",
    duration: 30,
    questions: [
      {
        id: "q1",
        question: "Find the roots of the quadratic equation 2x² - 5x + 3 = 0.",
        options: ["x = 1, x = 1.5", "x = -1, x = -1.5", "x = 2, x = 3", "x = 0, x = 5"],
        correctAnswer: 0,
        explanation: "Applying quadratic formula yields roots 1.5 and 1."
      },
      {
        id: "q2",
        question: "If one root of the quadratic equation kx² - 3x - 10 = 0 is 2, find the value of k.",
        options: ["k = 2", "k = 3", "k = 4", "k = 5"],
        correctAnswer: 2,
        explanation: "Substitute x=2 in the equation: k(4) - 6 - 10 = 0 => 4k = 16 => k=4."
      },
      {
        id: "q3",
        question: "What is the nature of the roots of the equation x² - 4x + 4 = 0?",
        options: ["Real and distinct", "Real and equal", "Imaginary/No real roots", "None of the above"],
        correctAnswer: 1,
        explanation: "Discriminant D = b²-4ac = 16-16 = 0. Hence real and equal roots."
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
        options: ["CaCO₃ → CaO + CO₂", "2H₂ + O₂ → 2H₂O", "Fe + CuSO₄ → FeSO₄ + Cu", "NaOH + HCl → NaCl + H₂O"],
        correctAnswer: 2,
        explanation: "Iron displacements copper from CuSO₄ since it is more reactive."
      },
      {
        id: "sq2",
        question: "What happens when dilute hydrochloric acid is added to iron filings?",
        options: ["Hydrogen gas and iron chloride are produced.", "Chlorine gas and iron hydroxide are produced.", "No reaction takes place.", "Iron salt and water are produced."],
        correctAnswer: 0,
        explanation: "Fe + 2HCl → FeCl₂ + H₂ (g). Hydrogen gas and iron chloride are formed."
      }
    ]
  }
];

const LOCAL_NOTES = [
  {
    id: "n1",
    title: "Quadratic Equations Formula Sheet",
    subject: "Mathematics",
    category: "formulas",
    content: `### Quadratic Equation: $ax^2 + bx + c = 0$\n\n#### 1. Discriminant ($D$)\n$D = b^2 - 4ac$\n\n#### 2. Nature of Roots\n- $D > 0$: Roots are real and distinct.\n- $D = 0$: Roots are real and equal.\n- $D < 0$: No real roots.\n\n#### 3. Quadratic Formula\n$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$`,
    videoUrl: "https://www.youtube.com/embed/Z1e_S7G6lZ0",
    flashcards: [
      { front: "What is the quadratic formula?", back: "x = (-b ± √(b² - 4ac)) / 2a" },
      { front: "What does the discriminant D determine?", back: "The nature of roots (real and distinct, equal, or imaginary)." },
      { front: "Formula for the sum of roots α + β?", back: "-b/a" }
    ]
  },
  {
    id: "n2",
    title: "Chemical Reactions and Balancing Equations",
    subject: "Science",
    category: "notes",
    content: `### Chemical Reactions Summary\n\n#### 1. Combination Reaction\n$2H_2 + O_2 \\rightarrow 2H_2O$\n\n#### 2. Decomposition Reaction\n$2H_2O \\rightarrow 2H_2 + O_2$\n\n#### 3. Displacement Reaction\n$Fe + CuSO_4 \\rightarrow FeSO_4 + Cu$`,
    videoUrl: "https://www.youtube.com/embed/e1W5ZkQ_b5c",
    flashcards: [
      { front: "Define displacement reaction.", back: "A reaction in which a more reactive element displaces a less reactive element from its compound." },
      { front: "What is a precipitation reaction?", back: "A chemical reaction that results in an insoluble precipitate." }
    ]
  }
];

const LOCAL_COURSES = [
  { id: "c1", type: "Entrance Exams", exam: "KCET", subject: "Physics", difficulty: "Hard" },
  { id: "c2", type: "Entrance Exams", exam: "NEET", subject: "Biology", difficulty: "Medium" },
  { id: "c3", type: "Government Exams", exam: "UPSC", subject: "Current Affairs", difficulty: "Hard" }
];

const LOCAL_LIVE_CLASSES = [
  { id: "lc1", title: "KCET Physics 1-Shot", instructor: "Prof. Kiran", scheduledAt: "2026-05-20T10:00:00Z", status: "Upcoming", batch: "KCET Batch" },
  { id: "lc2", title: "NEET Bio Masterclass", instructor: "Dr. Anjali", scheduledAt: "2026-05-19T09:00:00Z", status: "Ongoing", batch: "NEET Batch" }
];

const LOCAL_VIDEO_LECTURES = [
  { id: "vl1", title: "Motion in 1D - Physics Revision", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl2", title: "Chemical Reactions & Equations", subject: "Science", videoUrl: "https://www.youtube.com/embed/tItRof0Q4iE" },
  { id: "vl3", title: "Quadratic Equations Masterclass", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/Z1e_S7G6lZ0" },
  { id: "vl4", title: "Human Brain & Nervous System", subject: "Biology", videoUrl: "https://www.youtube.com/embed/x4PPZCLnVkA" },
  { id: "vl5", title: "Important Current Affairs 2026", subject: "UPSC/SSC", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
];

// Helper to write to local storage
const getStorageItem = (key, defaultVal) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultVal;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Fallback logic
const fallbackAPI = {
  isFallback: true,

  register: async (username, password) => {
    const users = getStorageItem('ss_users', []);
    if (users.find(u => u.username === username)) {
      throw new Error("Username already exists (Local DB)");
    }
    const newUser = {
      id: "u_" + Math.random().toString(36).substring(2, 9),
      username,
      coins: 100,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      badges: ["Welcome Explorer"],
      preferences: { darkMode: true, language: "english", explainMode: "standard", lengthMode: "standard" },
      studyTimeMinutes: 0,
      solvedCount: 0,
      testsTaken: 0,
      rankPrediction: "Aspirant"
    };
    users.push(newUser);
    setStorageItem('ss_users', users);
    setStorageItem('ss_current_user', newUser);
    return newUser;
  },

  login: async (username, password) => {
    const users = getStorageItem('ss_users', []);
    const user = users.find(u => u.username === username);
    if (!user) {
      // Auto-register for easy local-testing experience!
      return fallbackAPI.register(username, password);
    }
    
    // Streak logic
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = user.streak || 1;
    let newCoins = user.coins || 100;
    
    if (user.lastActiveDate === yesterday) {
      newStreak += 1;
      newCoins += 10;
      if (newStreak === 3 && !user.badges.includes("Streak Master (3 Days)")) {
        user.badges.push("Streak Master (3 Days)");
      }
    } else if (user.lastActiveDate !== today) {
      newStreak = 1;
    }

    user.streak = newStreak;
    user.coins = newCoins;
    user.lastActiveDate = today;
    
    setStorageItem('ss_users', users.map(u => u.id === user.id ? user : u));
    setStorageItem('ss_current_user', user);
    
    return { user, streakEarned: newStreak > 1 };
  },

  updatePreferences: async (userId, update) => {
    const users = getStorageItem('ss_users', []);
    const user = users.find(u => u.id === userId);
    if (user) {
      if (update.preferences) user.preferences = { ...user.preferences, ...update.preferences };
      if (update.studyTimeMinutes) {
        user.studyTimeMinutes = (user.studyTimeMinutes || 0) + update.studyTimeMinutes;
        if (user.studyTimeMinutes >= 25 && !user.badges.includes("Pomodoro Focus")) {
          user.badges.push("Pomodoro Focus");
        }
      }
      if (update.solvedCount) user.solvedCount = (user.solvedCount || 0) + update.solvedCount;
      if (update.testsTaken) user.testsTaken = (user.testsTaken || 0) + update.testsTaken;
      
      setStorageItem('ss_users', users.map(u => u.id === user.id ? user : u));
      setStorageItem('ss_current_user', user);
      return user;
    }
    throw new Error("User not found");
  },

  solve: async (text, userId, mode, lengthMode, language) => {
    const solution = localSolveQuestion(text, mode, lengthMode, language);
    
    if (userId) {
      const papers = getStorageItem('ss_papers', []);
      const newPaper = {
        id: "p_" + Date.now(),
        userId,
        title: text.length > 40 ? text.substring(0, 40) + "..." : text,
        question: text,
        subject: solution.subject,
        solution: solution.answer,
        steps: solution.steps,
        diagram: solution.diagram,
        mathSolved: solution.mathSolved,
        mathData: solution.mathData,
        date: new Date().toISOString()
      };
      papers.push(newPaper);
      setStorageItem('ss_papers', papers);
      
      // Update stats
      await fallbackAPI.updatePreferences(userId, { solvedCount: 1, coins: 5 });
    }
    return { solution };
  },

  uploadPaper: async (fileName, fileObject, userId, mode, lengthMode, language) => {
    // Simulate OCR text based on uploaded file name
    let ocrText = "What are the roots of 2x^2 - 5x + 3 = 0?";
    const name = fileName.toLowerCase();
    
    if (name.includes('math') || name.includes('quad') || name.includes('equation')) {
      ocrText = "Solve the quadratic equation x^2 - 4x + 4 = 0.";
    } else if (name.includes('chem') || name.includes('react') || name.includes('iron')) {
      ocrText = "What happens when iron filings are added to a solution of copper sulphate?";
    } else if (name.includes('physics') || name.includes('force')) {
      ocrText = "Explain Newton's second law of motion.";
    }

    const solution = localSolveQuestion(ocrText, mode, lengthMode, language);
    
    if (userId) {
      const papers = getStorageItem('ss_papers', []);
      const newPaper = {
        id: "p_" + Date.now(),
        userId,
        title: `Uploaded: ${fileName}`,
        question: ocrText,
        subject: solution.subject,
        solution: solution.answer,
        steps: solution.steps,
        diagram: solution.diagram,
        mathSolved: solution.mathSolved,
        mathData: solution.mathData,
        fileName,
        date: new Date().toISOString()
      };
      papers.push(newPaper);
      setStorageItem('ss_papers', papers);
      
      // Award extra coins (+15) for scanner
      const users = getStorageItem('ss_users', []);
      const user = users.find(u => u.id === userId);
      if (user) {
        user.coins = (user.coins || 0) + 15;
        user.solvedCount = (user.solvedCount || 0) + 1;
        if (!user.badges.includes("Scanner Pro")) user.badges.push("Scanner Pro");
        setStorageItem('ss_users', users.map(u => u.id === user.id ? user : u));
        setStorageItem('ss_current_user', user);
      }
    }

    return { ocrText, solution, fileName };
  },

  getHistory: async (userId) => {
    const papers = getStorageItem('ss_papers', []);
    return papers.filter(p => p.userId === userId).sort((a,b) => new Date(b.date) - new Date(a.date));
  },

  deleteHistory: async (historyId) => {
    const papers = getStorageItem('ss_papers', []);
    setStorageItem('ss_papers', papers.filter(p => p.id !== historyId));
    return { success: true };
  },

  getMockTests: async () => {
    return LOCAL_MOCK_TESTS;
  },

  submitTest: async (userId, testId, answers, timeSpentSeconds) => {
    const test = LOCAL_MOCK_TESTS.find(t => t.id === testId);
    if (!test) throw new Error("Test not found");

    let correctCount = 0;
    const detailedResults = [];
    const weakTopics = new Set();

    test.questions.forEach((q, index) => {
      const userAnswerIndex = answers[q.id];
      const isCorrect = userAnswerIndex === q.correctAnswer;
      if (isCorrect) correctCount++;
      else {
        if (test.subject === 'Mathematics') weakTopics.add('Quadratic Formula Calculation');
        else weakTopics.add('Chemical Equation Balancing');
      }

      detailedResults.push({
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswer: userAnswerIndex !== undefined ? q.options[userAnswerIndex] : "Not Answered",
        correctAnswer: q.options[q.correctAnswer],
        isCorrect,
        explanation: q.explanation
      });
    });

    const scorePercent = Math.round((correctCount / test.questions.length) * 100);
    const testResult = {
      id: "tr_" + Date.now(),
      userId,
      testId,
      testTitle: test.title,
      subject: test.subject,
      score: scorePercent,
      correctCount,
      totalQuestions: test.questions.length,
      timeSpentSeconds,
      date: new Date().toISOString(),
      results: detailedResults
    };

    const resultsList = getStorageItem('ss_test_results', []);
    resultsList.push(testResult);
    setStorageItem('ss_test_results', resultsList);

    // Update stats
    const users = getStorageItem('ss_users', []);
    const user = users.find(u => u.id === userId);
    if (user) {
      user.coins = (user.coins || 0) + 20;
      if (scorePercent >= 80) user.coins += 15;
      user.testsTaken = (user.testsTaken || 0) + 1;
      
      if (scorePercent === 100 && !user.badges.includes("Centum Performer")) user.badges.push("Centum Performer");
      if (user.testsTaken === 3 && !user.badges.includes("Exam Gladiator")) user.badges.push("Exam Gladiator");

      if (user.testsTaken >= 3) {
        if (scorePercent >= 85) user.rankPrediction = "Rank Holder (Legend)";
        else if (scorePercent >= 65) user.rankPrediction = "Scholar (Distinction)";
        else user.rankPrediction = "Achiever (First Class)";
      } else {
        if (scorePercent >= 75) user.rankPrediction = "Rising Star";
      }

      setStorageItem('ss_users', users.map(u => u.id === user.id ? user : u));
      setStorageItem('ss_current_user', user);
    }

    return { score: scorePercent, correctCount, totalQuestions: test.questions.length, weakTopics: Array.from(weakTopics), timeSpentSeconds, detailedResults };
  },

  getTestHistory: async (userId) => {
    const results = getStorageItem('ss_test_results', []);
    return results.filter(r => r.userId === userId).sort((a,b) => new Date(b.date) - new Date(a.date));
  },

  getLeaderboard: async () => {
    const users = getStorageItem('ss_users', []);
    const defaultLeaderboard = [
      { username: "Aditya Hegde (99% CBSE)", coins: 540, streak: 8, rankPrediction: "Rank Holder (Legend)", testsTaken: 12, studyTimeMinutes: 240 },
      { username: "Nisarga K.", coins: 410, streak: 5, rankPrediction: "Scholar (Distinction)", testsTaken: 9, studyTimeMinutes: 180 },
      { username: "Praveen Gowda", coins: 380, streak: 4, rankPrediction: "Scholar (Distinction)", testsTaken: 7, studyTimeMinutes: 150 }
    ];

    const currentList = users.map(u => ({
      username: u.username,
      coins: u.coins,
      streak: u.streak,
      rankPrediction: u.rankPrediction,
      testsTaken: u.testsTaken || 0,
      studyTimeMinutes: u.studyTimeMinutes || 0
    })).concat(defaultLeaderboard);

    currentList.sort((a, b) => b.coins - a.coins);
    return currentList.slice(0, 10);
  },

  getNotes: async (subject, category) => {
    let list = LOCAL_NOTES;
    if (subject) list = list.filter(n => n.subject.toLowerCase() === subject.toLowerCase());
    if (category) list = list.filter(n => n.category.toLowerCase() === category.toLowerCase());
    return list;
  },

  createNote: async (title, subject, category, content, flashcards, videoUrl, userId) => {
    const newNote = {
      id: "n_" + Date.now(),
      title,
      subject,
      category: category || "notes",
      content,
      flashcards: flashcards || [],
      videoUrl: videoUrl || "",
      userId: userId || "anonymous",
      date: new Date().toISOString()
    };
    // Save locally
    const userNotes = getStorageItem('ss_custom_notes', []);
    userNotes.push(newNote);
    setStorageItem('ss_custom_notes', userNotes);

    if (userId && userId !== "anonymous") {
      await fallbackAPI.updatePreferences(userId, { coins: 15 });
      const users = getStorageItem('ss_users', []);
      const user = users.find(u => u.id === userId);
      if (user && !user.badges.includes("Knowledge Sharer")) {
        user.badges.push("Knowledge Sharer");
        setStorageItem('ss_users', users.map(u => u.id === user.id ? user : u));
        setStorageItem('ss_current_user', user);
      }
    }
    return newNote;
  },

  getForumPosts: async () => {
    return getStorageItem('ss_forum', [
      {
        id: "f1",
        title: "How to solve quadratic equations quickly in board exams?",
        content: "Does anyone have shortcuts for factoring? Sometimes splitting the middle term takes way too long.",
        author: "Rahul S.",
        subject: "Mathematics",
        date: "2026-05-18T10:00:00.000Z",
        replies: [{ author: "Anjali Sharma (Educator)", content: "Always check the product a*c first. If numbers are too big, switch to the quadratic formula!", date: "2026-05-18T10:15:00.000Z" }]
      }
    ]);
  },

  createForumPost: async (title, content, author, subject, userId) => {
    const posts = await fallbackAPI.getForumPosts();
    const newPost = {
      id: "f_" + Date.now(),
      title,
      content,
      author,
      subject: subject || "General",
      date: new Date().toISOString(),
      replies: []
    };
    posts.unshift(newPost);
    setStorageItem('ss_forum', posts);
    if (userId) await fallbackAPI.updatePreferences(userId, { coins: 10 });
    return newPost;
  },

  replyToForumPost: async (postId, author, content, userId) => {
    const posts = await fallbackAPI.getForumPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.replies.push({ author, content, date: new Date().toISOString() });
      setStorageItem('ss_forum', posts);
      if (userId) await fallbackAPI.updatePreferences(userId, { coins: 5 });
      return post;
    }
    throw new Error("Post not found");
  },

  getStudyRooms: async () => {
    return getStorageItem('ss_rooms', [
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
          { author: "Rohan", content: "Yes, it is 2Pb(NO3)2 -> 2PbO + 4NO2 + O2. brown fumes of NO2!", time: "17:50" }
        ]
      }
    ]);
  },

  sendRoomMessage: async (roomId, author, content) => {
    const rooms = await fallbackAPI.getStudyRooms();
    const room = rooms.find(r => r.id === roomId);
    if (!room) throw new Error("Room not found");

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    room.messages.push({ author, content, time: timeStr });

    // Simulated responses
    let simulated = null;
    const lText = content.toLowerCase();
    if (lText.includes('hi') || lText.includes('hello') || lText.includes('hey')) {
      simulated = { author: "Sneha", content: "Hey! Ready to crush some board papers today?", time: timeStr };
    } else if (lText.includes('math') || lText.includes('quad') || lText.includes('roots')) {
      simulated = { author: "Aditya Hegde (99% CBSE)", content: "Let me know if you need quadratic tips! Just scored 100% on the mock test.", time: timeStr };
    } else if (lText.includes('stress') || lText.includes('exam') || lText.includes('scared')) {
      simulated = { author: "Anjali (Educator)", content: "Don't stress! Take a deep breath and check out the 'Exam Stress Tips' flashcards.", time: timeStr };
    } else if (Math.random() < 0.4) {
      simulated = { author: "Rahul", content: "Awesome! Let's keep studying 📚", time: timeStr };
    }

    if (simulated) {
      room.messages.push(simulated);
    }

    setStorageItem('ss_rooms', rooms);
    return { updatedRoom: room, simulatedReply: simulated };
  },

  getCourses: async () => {
    return LOCAL_COURSES;
  },

  getLiveClasses: async () => {
    return LOCAL_LIVE_CLASSES;
  },

  getVideoLectures: async () => {
    return LOCAL_VIDEO_LECTURES;
  }
};

// Main API transporter that auto-detects and forwards requests to server, falling back on error
export const API = {
  isLocal: false,

  request: async (endpoint, options = {}) => {
    if (API.isLocal) {
      return null; // Force fallback immediately
    }

    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API Request Failed");
      }
      return await response.json();
    } catch (err) {
      console.warn(`Backend connection failed for ${endpoint}. Healing with LocalStorage DB.`, err);
      // Automatically switch to local database fallback
      API.isLocal = true;
      return null;
    }
  },

  register: async (username, password) => {
    const res = await API.request('/auth/register', { method: 'POST', body: { username, password } });
    if (res) return res;
    return fallbackAPI.register(username, password);
  },

  login: async (username, password) => {
    const res = await API.request('/auth/login', { method: 'POST', body: { username, password } });
    if (res) return res;
    return fallbackAPI.login(username, password);
  },

  getProfile: async (userId) => {
    const res = await API.request(`/auth/profile/${userId}`);
    if (res) return res;
    
    const users = getStorageItem('ss_users', []);
    const user = users.find(u => u.id === userId);
    return user || getStorageItem('ss_current_user', null);
  },

  updatePreferences: async (userId, update) => {
    const res = await API.request(`/auth/profile/${userId}`, { method: 'PATCH', body: update });
    if (res) return res;
    return fallbackAPI.updatePreferences(userId, update);
  },

  solve: async (text, userId, mode, lengthMode, language) => {
    const res = await API.request('/solver/solve', { method: 'POST', body: { text, userId, mode, lengthMode, language } });
    if (res) return res.solution;
    const local = await fallbackAPI.solve(text, userId, mode, lengthMode, language);
    return local.solution;
  },

  uploadPaper: async (file, userId, mode, lengthMode, language) => {
    if (API.isLocal) {
      return fallbackAPI.uploadPaper(file.name, file, userId, mode, lengthMode, language);
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (userId) formData.append('userId', userId);
      if (mode) formData.append('mode', mode);
      if (lengthMode) formData.append('lengthMode', lengthMode);
      if (language) formData.append('language', language);

      const response = await fetch(`${BACKEND_URL}/solver/upload`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error("Upload failed");
      return await response.json();
    } catch (err) {
      console.warn("Upload connection failed. Healing with local simulation OCR.", err);
      API.isLocal = true;
      return fallbackAPI.uploadPaper(file.name, file, userId, mode, lengthMode, language);
    }
  },

  getHistory: async (userId) => {
    const res = await API.request(`/solver/history/${userId}`);
    if (res) return res;
    return fallbackAPI.getHistory(userId);
  },

  deleteHistory: async (historyId) => {
    const res = await API.request(`/solver/history/${historyId}`, { method: 'DELETE' });
    if (res) return res;
    return fallbackAPI.deleteHistory(historyId);
  },

  getMockTests: async () => {
    const res = await API.request('/tests');
    if (res) return res;
    return fallbackAPI.getMockTests();
  },

  submitTest: async (userId, testId, answers, timeSpentSeconds) => {
    const res = await API.request('/tests/submit', { method: 'POST', body: { userId, testId, answers, timeSpentSeconds } });
    if (res) return res;
    return fallbackAPI.submitTest(userId, testId, answers, timeSpentSeconds);
  },

  getTestHistory: async (userId) => {
    const res = await API.request(`/tests/history/${userId}`);
    if (res) return res;
    return fallbackAPI.getTestHistory(userId);
  },

  getLeaderboard: async () => {
    const res = await API.request('/tests/leaderboard');
    if (res) return res;
    return fallbackAPI.getLeaderboard();
  },

  getNotes: async (subject, category) => {
    let endpoint = '/notes';
    if (subject || category) {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (category) params.append('category', category);
      endpoint += `?${params.toString()}`;
    }
    const res = await API.request(endpoint);
    if (res) return res;
    
    // Merge local static notes with user contributed notes
    const local = await fallbackAPI.getNotes(subject, category);
    const userNotes = getStorageItem('ss_custom_notes', []);
    let filteredUser = userNotes;
    if (subject) filteredUser = filteredUser.filter(n => n.subject.toLowerCase() === subject.toLowerCase());
    if (category) filteredUser = filteredUser.filter(n => n.category.toLowerCase() === category.toLowerCase());
    return [...local, ...filteredUser];
  },

  createNote: async (title, subject, category, content, flashcards, videoUrl, userId) => {
    const res = await API.request('/notes', { method: 'POST', body: { title, subject, category, content, flashcards, videoUrl, userId } });
    if (res) return res;
    return fallbackAPI.createNote(title, subject, category, content, flashcards, videoUrl, userId);
  },

  getForumPosts: async () => {
    const res = await API.request('/social/forum');
    if (res) return res;
    return fallbackAPI.getForumPosts();
  },

  createForumPost: async (title, content, author, subject, userId) => {
    const res = await API.request('/social/forum', { method: 'POST', body: { title, content, author, subject, userId } });
    if (res) return res;
    return fallbackAPI.createForumPost(title, content, author, subject, userId);
  },

  replyToForumPost: async (postId, author, content, userId) => {
    const res = await API.request(`/social/forum/${postId}/reply`, { method: 'POST', body: { author, content, userId } });
    if (res) return res;
    return fallbackAPI.replyToForumPost(postId, author, content, userId);
  },

  getStudyRooms: async () => {
    const res = await API.request('/social/rooms');
    if (res) return res;
    return fallbackAPI.getStudyRooms();
  },

  sendRoomMessage: async (roomId, author, content) => {
    const res = await API.request(`/social/rooms/${roomId}/chat`, { method: 'POST', body: { author, content } });
    if (res) return res;
    return fallbackAPI.sendRoomMessage(roomId, author, content);
  },

  getCourses: async () => {
    const res = await API.request('/courses');
    if (res) return res;
    return fallbackAPI.getCourses();
  },

  getLiveClasses: async () => {
    const res = await API.request('/liveClasses');
    if (res) return res;
    return fallbackAPI.getLiveClasses();
  },

  getVideoLectures: async () => {
    const res = await API.request('/liveClasses/videos');
    if (res) return res;
    return fallbackAPI.getVideoLectures();
  }
};
export default API;
