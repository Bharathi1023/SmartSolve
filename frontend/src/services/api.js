// API Client with robust self-healing fallback to LocalStorage if backend is offline.
import { QUIZ_BANK } from './quizData.js';
import { QUIZ_BANK_2 } from './quizData2.js';
const BACKEND_URL = 'http://localhost:5000/api';

// Native client-side implementations of the AI solver, so it runs completely stand-alone if backend is offline!
function localSolveQuestion(text, mode, lengthMode, language) {
  const query = text.toLowerCase();
  let subject = 'General Study';
  
  if (query.includes('force') || query.includes('velocity') || query.includes('gravity') || query.includes('lens') || query.includes('mirror') || query.includes('newton') || query.includes('motion') || query.includes('speed') || query.includes('acceleration')) {
    subject = 'Science (Physics)';
  } else if (query.includes('chemical') || query.includes('reaction') || query.includes('acid') || query.includes('balance') || query.includes('fe +') || query.includes('caco3') || query.includes('iron filings') || query.includes('copper sulphate')) {
    subject = 'Science (Chemistry)';
  } else if (query.includes('cell') || query.includes('plant') || query.includes('blood') || query.includes('heart') || query.includes('photosynthesis') || query.includes('respiratory') || query.includes('lung')) {
    subject = 'Science (Biology)';
  } else if (query.includes('quadratic') || query.includes('x^2') || query.includes('x²') || query.includes('equation') || query.includes('math') || query.includes('solve for x') || query.includes('roots')) {
    subject = 'Mathematics';
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
      // Dynamic fallback that actually addresses the user's specific question
      const cleanText = text.replace(/^\[.*?\]\s*/, '').trim(); // Remove subject prefix if any
      const isQuestion = cleanText.endsWith('?') || cleanText.toLowerCase().startsWith('what') || cleanText.toLowerCase().startsWith('how') || cleanText.toLowerCase().startsWith('explain');
      
      answerContent = `Here is a detailed explanation regarding: **"${cleanText}"**\n\n`;
      
      if (subject === 'Mathematics') {
        answerContent += `To solve this mathematical problem, we need to carefully apply the relevant formulas and logical steps. Make sure to identify the known variables first before attempting to isolate the unknown variable.`;
        steps = [
          `Identify the knowns and unknowns in "${cleanText}"`,
          "Select the appropriate mathematical formula or theorem.",
          "Substitute the given values into the formula.",
          "Perform the calculation and verify the final result."
        ];
      } else if (subject.includes('Science')) {
        answerContent += `In science, phenomena like this are governed by fundamental laws. When analyzing **"${cleanText}"**, we look at the interaction of different elements, forces, or biological systems involved.`;
        steps = [
          `Define the key scientific terms mentioned in "${cleanText}"`,
          "Identify the underlying scientific principle or law.",
          "Explain the process step-by-step.",
          "Provide a real-world example to illustrate the concept."
        ];
      } else if (subject === 'Kannada') {
        answerContent = `ನಿಮ್ಮ ಪ್ರಶ್ನೆ: **"${cleanText}"**\n\nಕನ್ನಡ ಭಾಷೆ ಮತ್ತು ಸಾಹಿತ್ಯದ ದೃಷ್ಟಿಯಿಂದ ಇದನ್ನು ವಿಶ್ಲೇಷಿಸೋಣ. ಈ ವಿಷಯವು ವ್ಯಾಕರಣ ಅಥವಾ ಸಾಹಿತ್ಯ ಚರಿತ್ರೆಗೆ ಸಂಬಂಧಿಸಿದ್ದಿರಬಹುದು.`;
        steps = [
          "ಪ್ರಶ್ನೆಯ ಮೂಲ ಅರ್ಥವನ್ನು ಗ್ರಹಿಸುವುದು.",
          "ಸೂಕ್ತ ವ್ಯಾಕರಣ ನಿಯಮ ಅಥವಾ ಸಾಹಿತ್ಯಿಕ ಉಲ್ಲೇಖವನ್ನು ಹುಡುಕುವುದು.",
          "ಸ್ಪಷ್ಟ ಮತ್ತು ಸರಳ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸುವುದು.",
          "ಉದಾಹರಣೆಗಳೊಂದಿಗೆ ಉತ್ತರವನ್ನು ದೃಢೀಕರಿಸುವುದು."
        ];
      } else {
        answerContent += `This is an interesting topic in **${subject}**. To properly understand it, we should break it down into its core components and analyze them individually.`;
        steps = [
          `Analyze the core concepts in "${cleanText}"`,
          "Break down the topic into smaller, manageable parts.",
          "Evaluate the relationships between these parts.",
          "Synthesize a comprehensive final conclusion."
        ];
      }
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
    videoExplanation = "https://www.youtube.com/embed/hQpCGGuZvtQ";
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
    videoExplanation = "https://www.youtube.com/embed/aqM4bO04F8A";
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
  } else if (subject.includes('Physics')) {
    similarQuestions = [
      "What is Newton's First Law of Motion?",
      "State the formula for Centripetal Force."
    ];
    videoExplanation = "https://www.youtube.com/embed/aqM4bO04F8A";
    analysisReport = {
      chapter: "Kinematics & Motion",
      difficulty: "Medium",
      importantTopics: ["Newton's Laws", "Velocity Vectors", "Centripetal Acceleration"],
      examWeightage: "High",
      studyTime: "2 Hours",
      shortNotes: "Motion in a straight line is governed by kinematics equations. Newton's second law states F = ma. Centripetal acceleration is v^2/r.",
      generatedQuiz: [
        { q: "What is the formula for Force?", options: ["F = m/a", "F = ma", "F = mv"], ans: "F = ma" }
      ]
    };
  } else if (subject.includes('Biology')) {
    similarQuestions = [
      "Explain the transport of oxygen in the human body.",
      "Where does the Calvin cycle take place in photosynthesis?"
    ];
    videoExplanation = "https://www.youtube.com/embed/hQpCGGuZvtQ";
    analysisReport = {
      chapter: "Human Physiology & Photosynthesis",
      difficulty: "Medium",
      importantTopics: ["Gas Exchange in Alveoli", "Oxyhemoglobin Transport", "Stroma reactions"],
      examWeightage: "High",
      studyTime: "2 Hours",
      shortNotes: "Alveoli are the sites of gas exchange. Majority of oxygen is transported as oxyhemoglobin. Calvin cycle occurs in the stroma of chloroplasts.",
      generatedQuiz: [
        { q: "Where does gas exchange occur?", options: ["Bronchi", "Alveoli", "Trachea"], ans: "Alveoli" }
      ]
    };
  } else {
    similarQuestions = [
      "Can you explain the underlying concept again?",
      "Give me a real world example of this."
    ];
    videoExplanation = "https://www.youtube.com/embed/84Zl0pED4QY";
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
  ...QUIZ_BANK,
  ...QUIZ_BANK_2
];

const LOCAL_NOTES = [
  {
    id: "n1", title: "Quadratic Equations Formula Sheet", subject: "Mathematics", category: "formulas",
    content: `## Quadratic Equation: ax² + bx + c = 0\n\n**Discriminant:** D = b² - 4ac\n- D > 0 → Real and distinct roots\n- D = 0 → Real and equal roots\n- D < 0 → No real roots\n\n**Quadratic Formula:** x = (-b ± √D) / 2a\n\n**Sum of roots:** α + β = -b/a\n**Product of roots:** αβ = c/a\n\n**Trigonometry Identities:**\n- sin²θ + cos²θ = 1\n- tan θ = sin θ / cos θ\n- sin(A+B) = sinA cosB + cosA sinB`,
    videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs",
    flashcards: [
      { front: "Quadratic formula?", back: "x = (-b ± √(b²-4ac)) / 2a" },
      { front: "Sum of roots α + β?", back: "-b/a" },
      { front: "Product of roots αβ?", back: "c/a" }
    ]
  },
  {
    id: "n2", title: "Physics Key Formulas", subject: "Physics", category: "formulas",
    content: `## Physics Important Formulas\n\n**Newton's Laws:**\n- F = ma (Second Law)\n- Every action has equal & opposite reaction\n\n**Motion:**\n- v = u + at\n- s = ut + ½at²\n- v² = u² + 2as\n\n**Work & Energy:**\n- W = F × d × cosθ\n- KE = ½mv²\n- PE = mgh\n\n**Electricity:**\n- V = IR (Ohm's Law)\n- P = VI = I²R\n- R (series) = R₁ + R₂\n- 1/R (parallel) = 1/R₁ + 1/R₂\n\n**Optics:**\n- Mirror formula: 1/f = 1/v + 1/u\n- Lens formula: 1/f = 1/v - 1/u\n- Magnification: m = -v/u`,
    videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE",
    flashcards: [
      { front: "Newton's Second Law?", back: "F = ma" },
      { front: "Ohm's Law?", back: "V = IR" },
      { front: "Kinetic Energy formula?", back: "KE = ½mv²" }
    ]
  },
  {
    id: "n3", title: "Chemistry Quick Reference", subject: "Chemistry", category: "formulas",
    content: `## Chemistry Key Concepts\n\n**Types of Reactions:**\n- Combination: A + B → AB\n- Decomposition: AB → A + B\n- Displacement: A + BC → AC + B\n- Double Displacement: AB + CD → AD + CB\n\n**Acids & Bases:**\n- pH < 7 → Acidic\n- pH = 7 → Neutral\n- pH > 7 → Basic/Alkaline\n\n**Important Compounds:**\n- Baking Soda: NaHCO₃\n- Washing Soda: Na₂CO₃\n- Bleaching Powder: CaOCl₂\n- Plaster of Paris: CaSO₄·½H₂O\n\n**Periodic Table Groups:**\n- Group 1: Alkali metals (Na, K, Li)\n- Group 17: Halogens (F, Cl, Br)\n- Group 18: Noble gases (He, Ne, Ar)`,
    videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI",
    flashcards: [
      { front: "Baking Soda formula?", back: "NaHCO₃ (Sodium Bicarbonate)" },
      { front: "pH of neutral solution?", back: "7" },
      { front: "Most reactive metal in reactivity series?", back: "Potassium (K)" }
    ]
  },
  {
    id: "n4", title: "Biology Conceptual Summary", subject: "Biology", category: "notes",
    content: `## Biology Key Concepts\n\n**Cell Biology:**\n- Powerhouse of cell: Mitochondria\n- Control center: Nucleus\n- Protein synthesis: Ribosomes\n- Energy currency of cell: ATP\n\n**Photosynthesis:**\n6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂\n- Occurs in: Chloroplast\n- Light reactions: Thylakoid membrane\n- Calvin cycle: Stroma\n\n**Human Systems:**\n- Blood circulation: Heart (4 chambers)\n- Functional unit of kidney: Nephron\n- Functional unit of lung: Alveoli\n- Nervous system unit: Neuron\n\n**Genetics:**\n- Father of Genetics: Gregor Mendel\n- DNA: Deoxyribonucleic Acid\n- RNA: Ribonucleic Acid\n- Chromosomes in humans: 46 (23 pairs)`,
    videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc",
    flashcards: [
      { front: "Powerhouse of cell?", back: "Mitochondria" },
      { front: "Photosynthesis equation?", back: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂" },
      { front: "Functional unit of kidney?", back: "Nephron" }
    ]
  },
  {
    id: "n5", title: "Computer Science Notes", subject: "Computer Science", category: "notes",
    content: `## Computer Science Concepts\n\n**OOP Principles:**\n- Encapsulation: Bundling data & methods\n- Inheritance: Child class inherits parent\n- Polymorphism: Same method, different forms\n- Abstraction: Hide implementation details\n\n**Data Structures:**\n- Array: Fixed size, sequential\n- Stack: LIFO (Last In First Out)\n- Queue: FIFO (First In First Out)\n- Linked List: Dynamic nodes\n\n**Sorting Algorithms:**\n- Bubble Sort: O(n²)\n- Merge Sort: O(n log n)\n- Quick Sort: O(n log n) avg\n\n**SQL Commands:**\n- SELECT, INSERT, UPDATE, DELETE\n- CREATE, DROP, ALTER\n- WHERE, GROUP BY, ORDER BY`,
    videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE",
    flashcards: [
      { front: "What is OOP?", back: "Object Oriented Programming - uses objects to structure code" },
      { front: "Stack uses which principle?", back: "LIFO - Last In First Out" },
      { front: "Time complexity of Merge Sort?", back: "O(n log n)" }
    ]
  },
  {
    id: "n6", title: "Kannada Vyakaran Notes", subject: "Kannada", category: "notes",
    content: `## ಕನ್ನಡ ವ್ಯಾಕರಣ ಟಿಪ್ಪಣಿ\n\n**ಸ್ವರಗಳು (Vowels):** ಅ, ಆ, ಇ, ಈ, ಉ, ಊ, ಋ, ಎ, ಏ, ಐ, ಒ, ಓ, ಔ (13)\n\n**ವ್ಯಂಜನಗಳು (Consonants):** ಕ, ಖ, ಗ... (34)\n\n**ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು:**\n- 1ನೇ ವಿಭಕ್ತಿ: ಉ (ರಾಮನು)\n- 2ನೇ ವಿಭಕ್ತಿ: ಅನ್ನು (ರಾಮನನ್ನು)\n- 3ನೇ ವಿಭಕ್ತಿ: ಇಂದ (ರಾಮನಿಂದ)\n- 4ನೇ ವಿಭಕ್ತಿ: ಗೆ/ಕ್ಕೆ (ರಾಮನಿಗೆ)\n- 5ನೇ ವಿಭಕ್ತಿ: ಅ (ರಾಮನ)\n- 6ನೇ ವಿಭಕ್ತಿ: ಅಲ್ಲಿ (ರಾಮನಲ್ಲಿ)\n\n**ಪ್ರಸಿದ್ಧ ಕವಿಗಳು:**\n- ಪಂಪ (ಆದಿಕವಿ) - 10ನೇ ಶತಮಾನ\n- ರನ್ನ, ಪೊನ್ನ (ರತ್ನತ್ರಯ)\n- ಕುಮಾರವ್ಯಾಸ - ಮಹಾಭಾರತ\n- ಕುವೆಂಪು - ರಾಷ್ಟ್ರಕವಿ`,
    videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU",
    flashcards: [
      { front: "ಕನ್ನಡದ ಆದಿಕವಿ ಯಾರು?", back: "ಪಂಪ" },
      { front: "ಕನ್ನಡ ಸ್ವರಗಳ ಸಂಖ್ಯೆ?", back: "13" },
      { front: "ರಾಷ್ಟ್ರಕವಿ ಯಾರು?", back: "ಕುವೆಂಪು" }
    ]
  },
  {
    id: "n7", title: "Economics Formula Sheet", subject: "Economics", category: "formulas",
    content: `## Economics Key Formulas & Concepts\n\n**National Income:**\n- GDP = C + I + G + (X - M)\n- NNP = GNP - Depreciation\n- Per Capita Income = National Income / Population\n\n**Demand & Supply:**\n- Law of Demand: Price ↑ → Demand ↓\n- Law of Supply: Price ↑ → Supply ↑\n- Equilibrium: Demand = Supply\n\n**Types of Markets:**\n- Perfect Competition: Many buyers & sellers\n- Monopoly: Single seller\n- Oligopoly: Few sellers\n- Monopsony: Single buyer\n\n**Banking Terms:**\n- CRR: Cash Reserve Ratio\n- SLR: Statutory Liquidity Ratio\n- Repo Rate: Rate RBI lends to banks\n- Reverse Repo: Rate banks lend to RBI`,
    videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk",
    flashcards: [
      { front: "GDP formula?", back: "C + I + G + (X - M)" },
      { front: "Law of Demand?", back: "As price increases, demand decreases (inverse relationship)" },
      { front: "What is Repo Rate?", back: "Rate at which RBI lends money to commercial banks" }
    ]
  },
  {
    id: "n8", title: "Accountancy Formula Sheet", subject: "Accountancy", category: "formulas",
    content: `## Accountancy Key Formulas\n\n**Accounting Equation:**\nAssets = Liabilities + Capital\n\n**Profit & Loss:**\n- Gross Profit = Net Sales - COGS\n- Net Profit = Gross Profit - Expenses\n- COGS = Opening Stock + Purchases - Closing Stock\n\n**Important Ratios:**\n- Current Ratio = Current Assets / Current Liabilities\n- Gross Profit Ratio = (Gross Profit / Net Sales) × 100\n- Net Profit Ratio = (Net Profit / Net Sales) × 100\n\n**Partnership Accounts:**\n- Fixed Capital Method: Capital + Current A/c\n- Fluctuating Capital: Single capital account\n- Profit sharing ratio as per agreement\n\n**Journal Entry Rules:**\n- Debit: Assets ↑, Expenses ↑, Losses ↑\n- Credit: Liabilities ↑, Income ↑, Capital ↑`,
    videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs",
    flashcards: [
      { front: "Accounting equation?", back: "Assets = Liabilities + Capital" },
      { front: "Gross Profit formula?", back: "Net Sales - Cost of Goods Sold" },
      { front: "Debit rule for assets?", back: "Debit when assets increase, Credit when assets decrease" }
    ]
  },
  {
    id: "n9", title: "Indian Polity Summary Notes", subject: "Indian Polity", category: "notes",
    content: `## Indian Polity Key Points\n\n**Constitution Facts:**\n- Adopted: 26 November 1949\n- Enacted: 26 January 1950\n- Total Articles: 395 (originally)\n- Total Schedules: 12\n- Father of Constitution: Dr. B.R. Ambedkar\n\n**Fundamental Rights (Part III):**\n1. Right to Equality (Art 14-18)\n2. Right to Freedom (Art 19-22)\n3. Right against Exploitation (Art 23-24)\n4. Right to Freedom of Religion (Art 25-28)\n5. Cultural & Educational Rights (Art 29-30)\n6. Right to Constitutional Remedies (Art 32)\n\n**Parliament:**\n- Lok Sabha: 543 elected seats (max 545)\n- Rajya Sabha: 250 max (238 elected + 12 nominated)\n- President: Elected by Electoral College\n\n**Preamble Keywords:**\nSovereign, Socialist, Secular, Democratic, Republic`,
    videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU",
    flashcards: [
      { front: "When was Constitution adopted?", back: "26 November 1949 (enacted 26 Jan 1950)" },
      { front: "How many Fundamental Rights?", back: "6 Fundamental Rights" },
      { front: "Lok Sabha seats?", back: "543 elected + 2 nominated = 545 max" }
    ]
  },
  {
    id: "n10", title: "History Timeline Notes", subject: "History", category: "notes",
    content: `## Indian History Key Timelines\n\n**Ancient India:**\n- 3000 BCE: Indus Valley Civilization\n- 600 BCE: Mahajanapadas\n- 322 BCE: Maurya Empire (Chandragupta)\n- 268 BCE: Ashoka's reign begins\n- 320 CE: Gupta Empire founded\n\n**Medieval India:**\n- 1206: Delhi Sultanate established\n- 1526: First Battle of Panipat (Babur defeats Lodi)\n- 1556: Second Battle of Panipat (Akbar)\n- 1600: British East India Company formed\n\n**Modern India:**\n- 1857: First War of Independence\n- 1885: Indian National Congress formed\n- 1919: Jallianwala Bagh Massacre\n- 1920: Non-Cooperation Movement\n- 1930: Dandi March / Salt Satyagraha\n- 1942: Quit India Movement\n- 1947: Independence (15 August)\n- 1950: Republic Day (26 January)`,
    videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU",
    flashcards: [
      { front: "When was Maurya Empire founded?", back: "322 BCE by Chandragupta Maurya" },
      { front: "Year of Dandi March?", back: "1930 - Gandhi's Salt Satyagraha" },
      { front: "India's Independence Day?", back: "15 August 1947" }
    ]
  },
  {
    id: "n11", title: "English Grammar Rules", subject: "English", category: "formulas",
    content: `## English Grammar Quick Reference\n\n**Tenses:**\n- Simple Present: He plays\n- Present Continuous: He is playing\n- Present Perfect: He has played\n- Simple Past: He played\n- Simple Future: He will play\n\n**Active → Passive Voice:**\n- Active: Subject + V + Object\n- Passive: Object + is/was + V3 + by + Subject\n- Example: "He writes a letter" → "A letter is written by him"\n\n**Direct → Indirect Speech:**\n- Say/Says → no change; Said → no change\n- "I am happy" → He said that he was happy\n- Present → Past in reported speech\n\n**Common Idioms:**\n- Break a leg = Good luck\n- Bite the bullet = Endure pain\n- Cost an arm and a leg = Very expensive\n- Hit the nail on the head = Exactly right`,
    videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU",
    flashcards: [
      { front: "Active to Passive: 'She reads a book'?", back: "'A book is read by her'" },
      { front: "What does 'Break a leg' mean?", back: "Good luck" },
      { front: "Present Perfect tense formula?", back: "Subject + has/have + V3 (past participle)" }
    ]
  },
  {
    id: "n12", title: "General Knowledge Capsule", subject: "General Knowledge", category: "notes",
    content: `## GK Quick Capsule\n\n**India - Important Facts:**\n- Capital: New Delhi\n- Largest State (area): Rajasthan\n- Longest River: Ganga\n- National Bird: Peacock\n- National Animal: Tiger\n- National Flower: Lotus\n- National Anthem: Jana Gana Mana (Tagore)\n\n**World Facts:**\n- Largest Continent: Asia\n- Smallest Continent: Australia\n- Largest Ocean: Pacific\n- Tallest Mountain: Mount Everest (8,848m)\n- Longest River: Nile\n- Largest Country (area): Russia\n\n**Science GK:**\n- Speed of Light: 3 × 10⁸ m/s\n- Speed of Sound: 343 m/s\n- Hardest substance: Diamond\n- Universal donor blood group: O-\n- Universal acceptor blood group: AB+`,
    videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc",
    flashcards: [
      { front: "National Animal of India?", back: "Bengal Tiger" },
      { front: "Largest ocean?", back: "Pacific Ocean" },
      { front: "Speed of light?", back: "3 × 10⁸ m/s" }
    ]
  },
  {
    id: "n13", title: "Reasoning Tips & Tricks", subject: "Reasoning", category: "notes",
    content: `## Reasoning Quick Tips\n\n**Number Series Patterns:**\n- Check differences between terms\n- Look for ×2, ×3, ÷2 patterns\n- Fibonacci: each term = sum of previous two\n- Square series: 1,4,9,16,25...\n\n**Coding-Decoding Tips:**\n- A=1, B=2... Z=26\n- Reverse alphabet: A=26, Z=1\n- Next letter: +1 shift each\n- Check if letters are shifted by fixed value\n\n**Logical Reasoning:**\n- All A are B + All B are C → All A are C\n- Some A are B (not reversible to All A)\n- No A is B = No B is A (reversible)\n\n**Blood Relations:**\n- Son of my father = Brother\n- Father of my father = Grandfather\n- Sister of my mother = Aunt\n- Son of my uncle = Cousin`,
    videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs",
    flashcards: [
      { front: "A=1, B=2... What is Z?", back: "Z = 26" },
      { front: "Fibonacci series rule?", back: "Each term = sum of previous two terms" },
      { front: "'All A are B, All B are C' conclusion?", back: "All A are C (transitive)" }
    ]
  },
  {
    id: "n14", title: "Quantitative Aptitude Shortcuts", subject: "Quantitative Aptitude", category: "formulas",
    content: `## Quant Shortcut Formulas\n\n**Percentage:**\n- x% of y = (x × y) / 100\n- % increase = (increase/original) × 100\n\n**Profit & Loss:**\n- Profit% = (Profit/CP) × 100\n- SP = CP × (100 + P%) / 100\n- CP = SP × 100 / (100 + P%)\n\n**Simple & Compound Interest:**\n- SI = PNR/100\n- CI = P(1 + R/100)ⁿ - P\n\n**Time & Work:**\n- If A does in 'a' days, rate = 1/a per day\n- Together rate = 1/a + 1/b\n- Days together = ab/(a+b)\n\n**Time, Speed & Distance:**\n- D = S × T\n- Upstream speed = Boat - Current\n- Downstream speed = Boat + Current\n\n**Averages:**\n- Average = Sum / Number of items`,
    videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk",
    flashcards: [
      { front: "Simple Interest formula?", back: "SI = PNR/100" },
      { front: "A does in 10 days, B in 15 days. Together in?", back: "ab/(a+b) = 150/25 = 6 days" },
      { front: "Downstream speed formula?", back: "Boat speed + Current speed" }
    ]
  },
  {
    id: "n15", title: "Current Affairs & Government Schemes", subject: "Current Affairs", category: "notes",
    content: `## Key Government Schemes & Current Affairs\n\n**Major Government Schemes:**\n- PM Jan Dhan Yojana: Financial inclusion\n- Swachh Bharat Mission: Clean India\n- Ayushman Bharat: Health insurance ₹5L\n- PM Kisan Samman: ₹6000/year to farmers\n- Beti Bachao Beti Padhao: Girl child welfare\n- Digital India: Connectivity & digitization\n- Make in India: Manufacturing boost\n- Smart Cities Mission: Urban development\n\n**Important International Bodies:**\n- UN: United Nations (Founded 1945)\n- WHO: World Health Organization\n- IMF: International Monetary Fund\n- WTO: World Trade Organization\n- UNESCO: Education, Science, Culture\n\n**India's Space Milestones:**\n- Chandrayaan-3: Soft landed on Moon (2023)\n- Aditya-L1: Solar mission (2023)\n- Gaganyaan: India's human spaceflight mission`,
    videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU",
    flashcards: [
      { front: "Ayushman Bharat covers up to?", back: "₹5 Lakh health insurance per family" },
      { front: "Chandrayaan-3 achievement?", back: "India's first successful soft landing near Moon's south pole (2023)" },
      { front: "PM Kisan Samman benefit?", back: "₹6000 per year in 3 installments to farmers" }
    ]
  },
  {
    id: "n16", title: "English Grammar Advanced", subject: "English Grammar", category: "formulas",
    content: `## English Grammar - Advanced Reference\n\n**Parts of Speech:**\n- Noun: Name of person/place/thing\n- Pronoun: Replaces noun (he, she, it)\n- Verb: Action word (run, write)\n- Adjective: Describes noun (beautiful)\n- Adverb: Describes verb (quickly)\n- Preposition: Shows relation (in, on, at)\n- Conjunction: Joins clauses (and, but, or)\n- Interjection: Expresses emotion (Oh! Wow!)\n\n**Sentence Types:**\n- Simple: One independent clause\n- Compound: Two independent clauses joined\n- Complex: Independent + dependent clause\n\n**Common Error Types:**\n- Subject-Verb Agreement: He goes (not go)\n- Misplaced Modifier\n- Dangling Participle\n- Run-on Sentence`,
    videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU",
    flashcards: [
      { front: "What is an adverb?", back: "A word that modifies a verb, adjective, or another adverb" },
      { front: "Subject-verb agreement example?", back: "She runs (singular), They run (plural)" },
      { front: "Compound sentence?", back: "Two independent clauses joined by conjunction: I went home AND she stayed." }
    ]
  }
];


const LOCAL_COURSES = [
  { id: "c1", type: "Entrance Exams", exam: "KCET", subject: "Physics", difficulty: "Hard" },
  { id: "c2", type: "Entrance Exams", exam: "KCET", subject: "Mathematics", difficulty: "Medium" },
  { id: "c3", type: "Entrance Exams", exam: "KCET", subject: "Chemistry", difficulty: "Medium" },
  { id: "c4", type: "Entrance Exams", exam: "KCET", subject: "Biology", difficulty: "Easy" },
  { id: "c5", type: "Entrance Exams", exam: "NEET", subject: "Biology", difficulty: "Hard" },
  { id: "c6", type: "Entrance Exams", exam: "NEET", subject: "Physics", difficulty: "Hard" },
  { id: "c7", type: "Entrance Exams", exam: "NEET", subject: "Chemistry", difficulty: "Medium" },
  { id: "c8", type: "Entrance Exams", exam: "JEE", subject: "Mathematics", difficulty: "Hard" },
  { id: "c9", type: "Entrance Exams", exam: "JEE", subject: "Physics", difficulty: "Hard" },
  { id: "c10", type: "Entrance Exams", exam: "JEE", subject: "Chemistry", difficulty: "Hard" },
  { id: "c11", type: "Government Exams", exam: "UPSC", subject: "Current Affairs", difficulty: "Hard" },
  { id: "c12", type: "Government Exams", exam: "UPSC", subject: "History", difficulty: "Medium" },
  { id: "c13", type: "Government Exams", exam: "UPSC", subject: "Indian Polity", difficulty: "Hard" },
  { id: "c14", type: "Government Exams", exam: "SSC", subject: "Quantitative Aptitude", difficulty: "Medium" },
  { id: "c15", type: "Government Exams", exam: "SSC", subject: "Reasoning", difficulty: "Medium" },
  { id: "c16", type: "Government Exams", exam: "SSC", subject: "English", difficulty: "Easy" }
];

const LOCAL_LIVE_CLASSES = [
  { id: "lc1", title: "KCET Physics 1-Shot", instructor: "Prof. Kiran", scheduledAt: "2026-05-20T10:00:00Z", status: "Upcoming", batch: "KCET Batch", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE?autoplay=1&mute=1" },
  { id: "lc2", title: "NEET Bio Masterclass", instructor: "Dr. Anjali", scheduledAt: "2026-05-19T09:00:00Z", status: "Ongoing", batch: "NEET Batch", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc?autoplay=1&mute=1" },
  { id: "lc3", title: "JEE Math Integration Sprint", instructor: "Dr. Dev", scheduledAt: "2026-05-20T14:00:00Z", status: "Upcoming", batch: "JEE Batch", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs?autoplay=1&mute=1" },
  { id: "lc4", title: "UPSC Indian Polity Masterclass", instructor: "Manoj Sir", scheduledAt: "2026-05-21T11:00:00Z", status: "Upcoming", batch: "UPSC Batch", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU?autoplay=1&mute=1" },
  { id: "lc5", title: "CBSE Class 10 Chemistry Balancing", instructor: "Ms. Divya", scheduledAt: "2026-05-19T18:00:00Z", status: "Ongoing", batch: "Class 10 CBSE", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI?autoplay=1&mute=1" },
  { id: "lc6", title: "General English & Grammar Hacks", instructor: "Prof. Sarah", scheduledAt: "2026-05-22T15:00:00Z", status: "Upcoming", batch: "General English Batch", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU?autoplay=1&mute=1" },
  { id: "lc7", title: "Banking QA & Reasoning Trick", instructor: "Mr. Ramesh", scheduledAt: "2026-05-21T16:00:00Z", status: "Upcoming", batch: "Banking PO Batch", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk?autoplay=1&mute=1" },
  { id: "lc8", title: "Modern Indian History Fast-Track", instructor: "Dr. Meera", scheduledAt: "2026-05-23T10:00:00Z", status: "Upcoming", batch: "SSC Batch", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU?autoplay=1&mute=1" },
  { id: "lc9", title: "PUC 2 Accountancy Partnership Accounts", instructor: "Mr. CA Anand", scheduledAt: "2026-05-20T17:00:00Z", status: "Upcoming", batch: "Commerce PU2", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs?autoplay=1&mute=1" },
  { id: "lc10", title: "Kannada Language Poetry Breakdown", instructor: "Mrs. Shweta", scheduledAt: "2026-05-24T14:00:00Z", status: "Upcoming", batch: "State Board Batch", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU?autoplay=1&mute=1" }
];

const LOCAL_VIDEO_LECTURES = [
  { id: "vl1", title: "Introduction to Physics Part 1", subject: "Physics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl2", title: "Advanced Physics Part 2", subject: "Physics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl3", title: "Masterclass on Physics Part 3", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl4", title: "Fundamentals of Physics Part 4", subject: "Physics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl5", title: "Crash Course: Physics Part 5", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl6", title: "Deep Dive into Physics Part 6", subject: "Physics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl7", title: "Understanding Physics Part 7", subject: "Physics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl8", title: "Basics of Physics Part 8", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl9", title: "Important Concepts in Physics Part 9", subject: "Physics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl10", title: "Quick Revision: Physics Part 10", subject: "Physics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl11", title: "Key Theories of Physics Part 11", subject: "Physics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl12", title: "Practical Applications of Physics Part 12", subject: "Physics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl13", title: "Problem Solving: Physics Part 13", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl14", title: "Conceptual Clarity: Physics Part 14", subject: "Physics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl15", title: "Most Expected Questions in Physics Part 15", subject: "Physics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl16", title: "Summary of Physics Part 16", subject: "Physics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl17", title: "Everything you need to know about Physics Part 17", subject: "Physics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl18", title: "A-Z of Physics Part 18", subject: "Physics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl19", title: "Complete Guide to Physics Part 19", subject: "Physics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl20", title: "Fast Track: Physics Part 20", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl21", title: "Pro Tips for Physics Part 21", subject: "Physics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl22", title: "Exam Strategies for Physics Part 22", subject: "Physics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl23", title: "Past Year Questions on Physics Part 23", subject: "Physics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl24", title: "Top Tricks for Physics Part 24", subject: "Physics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl25", title: "Expert Analysis of Physics Part 25", subject: "Physics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl26", title: "Simplified: Physics Part 26", subject: "Physics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl27", title: "Beginner's Guide to Physics Part 27", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl28", title: "Core Principles of Physics Part 28", subject: "Physics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl29", title: "Final Revision for Physics Part 29", subject: "Physics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl30", title: "Ultimate Masterclass on Physics Part 30", subject: "Physics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl31", title: "Introduction to Chemistry Part 1", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl32", title: "Advanced Chemistry Part 2", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl33", title: "Masterclass on Chemistry Part 3", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl34", title: "Fundamentals of Chemistry Part 4", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl35", title: "Crash Course: Chemistry Part 5", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl36", title: "Deep Dive into Chemistry Part 6", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl37", title: "Understanding Chemistry Part 7", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl38", title: "Basics of Chemistry Part 8", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl39", title: "Important Concepts in Chemistry Part 9", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl40", title: "Quick Revision: Chemistry Part 10", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl41", title: "Key Theories of Chemistry Part 11", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl42", title: "Practical Applications of Chemistry Part 12", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl43", title: "Problem Solving: Chemistry Part 13", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl44", title: "Conceptual Clarity: Chemistry Part 14", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl45", title: "Most Expected Questions in Chemistry Part 15", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl46", title: "Summary of Chemistry Part 16", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl47", title: "Everything you need to know about Chemistry Part 17", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl48", title: "A-Z of Chemistry Part 18", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl49", title: "Complete Guide to Chemistry Part 19", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl50", title: "Fast Track: Chemistry Part 20", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl51", title: "Pro Tips for Chemistry Part 21", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl52", title: "Exam Strategies for Chemistry Part 22", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl53", title: "Past Year Questions on Chemistry Part 23", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl54", title: "Top Tricks for Chemistry Part 24", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl55", title: "Expert Analysis of Chemistry Part 25", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl56", title: "Simplified: Chemistry Part 26", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl57", title: "Beginner's Guide to Chemistry Part 27", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl58", title: "Core Principles of Chemistry Part 28", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl59", title: "Final Revision for Chemistry Part 29", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl60", title: "Ultimate Masterclass on Chemistry Part 30", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl61", title: "Introduction to Mathematics Part 1", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl62", title: "Advanced Mathematics Part 2", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl63", title: "Masterclass on Mathematics Part 3", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl64", title: "Fundamentals of Mathematics Part 4", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl65", title: "Crash Course: Mathematics Part 5", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl66", title: "Deep Dive into Mathematics Part 6", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl67", title: "Understanding Mathematics Part 7", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl68", title: "Basics of Mathematics Part 8", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl69", title: "Important Concepts in Mathematics Part 9", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl70", title: "Quick Revision: Mathematics Part 10", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl71", title: "Key Theories of Mathematics Part 11", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl72", title: "Practical Applications of Mathematics Part 12", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl73", title: "Problem Solving: Mathematics Part 13", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl74", title: "Conceptual Clarity: Mathematics Part 14", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl75", title: "Most Expected Questions in Mathematics Part 15", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl76", title: "Summary of Mathematics Part 16", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl77", title: "Everything you need to know about Mathematics Part 17", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl78", title: "A-Z of Mathematics Part 18", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl79", title: "Complete Guide to Mathematics Part 19", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl80", title: "Fast Track: Mathematics Part 20", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl81", title: "Pro Tips for Mathematics Part 21", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl82", title: "Exam Strategies for Mathematics Part 22", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl83", title: "Past Year Questions on Mathematics Part 23", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl84", title: "Top Tricks for Mathematics Part 24", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl85", title: "Expert Analysis of Mathematics Part 25", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl86", title: "Simplified: Mathematics Part 26", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl87", title: "Beginner's Guide to Mathematics Part 27", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl88", title: "Core Principles of Mathematics Part 28", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl89", title: "Final Revision for Mathematics Part 29", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl90", title: "Ultimate Masterclass on Mathematics Part 30", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl91", title: "Introduction to Biology Part 1", subject: "Biology", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl92", title: "Advanced Biology Part 2", subject: "Biology", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl93", title: "Masterclass on Biology Part 3", subject: "Biology", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl94", title: "Fundamentals of Biology Part 4", subject: "Biology", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl95", title: "Crash Course: Biology Part 5", subject: "Biology", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl96", title: "Deep Dive into Biology Part 6", subject: "Biology", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl97", title: "Understanding Biology Part 7", subject: "Biology", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl98", title: "Basics of Biology Part 8", subject: "Biology", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl99", title: "Important Concepts in Biology Part 9", subject: "Biology", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl100", title: "Quick Revision: Biology Part 10", subject: "Biology", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl101", title: "Key Theories of Biology Part 11", subject: "Biology", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl102", title: "Practical Applications of Biology Part 12", subject: "Biology", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl103", title: "Problem Solving: Biology Part 13", subject: "Biology", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl104", title: "Conceptual Clarity: Biology Part 14", subject: "Biology", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl105", title: "Most Expected Questions in Biology Part 15", subject: "Biology", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl106", title: "Summary of Biology Part 16", subject: "Biology", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl107", title: "Everything you need to know about Biology Part 17", subject: "Biology", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl108", title: "A-Z of Biology Part 18", subject: "Biology", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl109", title: "Complete Guide to Biology Part 19", subject: "Biology", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl110", title: "Fast Track: Biology Part 20", subject: "Biology", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl111", title: "Pro Tips for Biology Part 21", subject: "Biology", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl112", title: "Exam Strategies for Biology Part 22", subject: "Biology", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl113", title: "Past Year Questions on Biology Part 23", subject: "Biology", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl114", title: "Top Tricks for Biology Part 24", subject: "Biology", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl115", title: "Expert Analysis of Biology Part 25", subject: "Biology", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl116", title: "Simplified: Biology Part 26", subject: "Biology", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl117", title: "Beginner's Guide to Biology Part 27", subject: "Biology", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl118", title: "Core Principles of Biology Part 28", subject: "Biology", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl119", title: "Final Revision for Biology Part 29", subject: "Biology", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl120", title: "Ultimate Masterclass on Biology Part 30", subject: "Biology", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl121", title: "Introduction to Computer Science Part 1", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl122", title: "Advanced Computer Science Part 2", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl123", title: "Masterclass on Computer Science Part 3", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl124", title: "Fundamentals of Computer Science Part 4", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl125", title: "Crash Course: Computer Science Part 5", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl126", title: "Deep Dive into Computer Science Part 6", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl127", title: "Understanding Computer Science Part 7", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl128", title: "Basics of Computer Science Part 8", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl129", title: "Important Concepts in Computer Science Part 9", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl130", title: "Quick Revision: Computer Science Part 10", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl131", title: "Key Theories of Computer Science Part 11", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl132", title: "Practical Applications of Computer Science Part 12", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl133", title: "Problem Solving: Computer Science Part 13", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl134", title: "Conceptual Clarity: Computer Science Part 14", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl135", title: "Most Expected Questions in Computer Science Part 15", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl136", title: "Summary of Computer Science Part 16", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl137", title: "Everything you need to know about Computer Science Part 17", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl138", title: "A-Z of Computer Science Part 18", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl139", title: "Complete Guide to Computer Science Part 19", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl140", title: "Fast Track: Computer Science Part 20", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl141", title: "Pro Tips for Computer Science Part 21", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl142", title: "Exam Strategies for Computer Science Part 22", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl143", title: "Past Year Questions on Computer Science Part 23", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl144", title: "Top Tricks for Computer Science Part 24", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl145", title: "Expert Analysis of Computer Science Part 25", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl146", title: "Simplified: Computer Science Part 26", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl147", title: "Beginner's Guide to Computer Science Part 27", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl148", title: "Core Principles of Computer Science Part 28", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl149", title: "Final Revision for Computer Science Part 29", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl150", title: "Ultimate Masterclass on Computer Science Part 30", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl151", title: "Introduction to English Part 1", subject: "English", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl152", title: "Advanced English Part 2", subject: "English", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl153", title: "Masterclass on English Part 3", subject: "English", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl154", title: "Fundamentals of English Part 4", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl155", title: "Crash Course: English Part 5", subject: "English", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl156", title: "Deep Dive into English Part 6", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl157", title: "Understanding English Part 7", subject: "English", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl158", title: "Basics of English Part 8", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl159", title: "Important Concepts in English Part 9", subject: "English", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl160", title: "Quick Revision: English Part 10", subject: "English", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl161", title: "Key Theories of English Part 11", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl162", title: "Practical Applications of English Part 12", subject: "English", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl163", title: "Problem Solving: English Part 13", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl164", title: "Conceptual Clarity: English Part 14", subject: "English", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl165", title: "Most Expected Questions in English Part 15", subject: "English", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl166", title: "Summary of English Part 16", subject: "English", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl167", title: "Everything you need to know about English Part 17", subject: "English", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl168", title: "A-Z of English Part 18", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl169", title: "Complete Guide to English Part 19", subject: "English", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl170", title: "Fast Track: English Part 20", subject: "English", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl171", title: "Pro Tips for English Part 21", subject: "English", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl172", title: "Exam Strategies for English Part 22", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl173", title: "Past Year Questions on English Part 23", subject: "English", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl174", title: "Top Tricks for English Part 24", subject: "English", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl175", title: "Expert Analysis of English Part 25", subject: "English", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl176", title: "Simplified: English Part 26", subject: "English", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl177", title: "Beginner's Guide to English Part 27", subject: "English", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl178", title: "Core Principles of English Part 28", subject: "English", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl179", title: "Final Revision for English Part 29", subject: "English", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl180", title: "Ultimate Masterclass on English Part 30", subject: "English", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl181", title: "Introduction to Kannada Part 1", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl182", title: "Advanced Kannada Part 2", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl183", title: "Masterclass on Kannada Part 3", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl184", title: "Fundamentals of Kannada Part 4", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl185", title: "Crash Course: Kannada Part 5", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl186", title: "Deep Dive into Kannada Part 6", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl187", title: "Understanding Kannada Part 7", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl188", title: "Basics of Kannada Part 8", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl189", title: "Important Concepts in Kannada Part 9", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl190", title: "Quick Revision: Kannada Part 10", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl191", title: "Key Theories of Kannada Part 11", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl192", title: "Practical Applications of Kannada Part 12", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl193", title: "Problem Solving: Kannada Part 13", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl194", title: "Conceptual Clarity: Kannada Part 14", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl195", title: "Most Expected Questions in Kannada Part 15", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl196", title: "Summary of Kannada Part 16", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl197", title: "Everything you need to know about Kannada Part 17", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl198", title: "A-Z of Kannada Part 18", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl199", title: "Complete Guide to Kannada Part 19", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl200", title: "Fast Track: Kannada Part 20", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl201", title: "Pro Tips for Kannada Part 21", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl202", title: "Exam Strategies for Kannada Part 22", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl203", title: "Past Year Questions on Kannada Part 23", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl204", title: "Top Tricks for Kannada Part 24", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl205", title: "Expert Analysis of Kannada Part 25", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl206", title: "Simplified: Kannada Part 26", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl207", title: "Beginner's Guide to Kannada Part 27", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl208", title: "Core Principles of Kannada Part 28", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl209", title: "Final Revision for Kannada Part 29", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl210", title: "Ultimate Masterclass on Kannada Part 30", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl211", title: "Introduction to Economics Part 1", subject: "Economics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl212", title: "Advanced Economics Part 2", subject: "Economics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl213", title: "Masterclass on Economics Part 3", subject: "Economics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl214", title: "Fundamentals of Economics Part 4", subject: "Economics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl215", title: "Crash Course: Economics Part 5", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl216", title: "Deep Dive into Economics Part 6", subject: "Economics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl217", title: "Understanding Economics Part 7", subject: "Economics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl218", title: "Basics of Economics Part 8", subject: "Economics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl219", title: "Important Concepts in Economics Part 9", subject: "Economics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl220", title: "Quick Revision: Economics Part 10", subject: "Economics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl221", title: "Key Theories of Economics Part 11", subject: "Economics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl222", title: "Practical Applications of Economics Part 12", subject: "Economics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl223", title: "Problem Solving: Economics Part 13", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl224", title: "Conceptual Clarity: Economics Part 14", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl225", title: "Most Expected Questions in Economics Part 15", subject: "Economics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl226", title: "Summary of Economics Part 16", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl227", title: "Everything you need to know about Economics Part 17", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl228", title: "A-Z of Economics Part 18", subject: "Economics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl229", title: "Complete Guide to Economics Part 19", subject: "Economics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl230", title: "Fast Track: Economics Part 20", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl231", title: "Pro Tips for Economics Part 21", subject: "Economics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl232", title: "Exam Strategies for Economics Part 22", subject: "Economics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl233", title: "Past Year Questions on Economics Part 23", subject: "Economics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl234", title: "Top Tricks for Economics Part 24", subject: "Economics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl235", title: "Expert Analysis of Economics Part 25", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl236", title: "Simplified: Economics Part 26", subject: "Economics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl237", title: "Beginner's Guide to Economics Part 27", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl238", title: "Core Principles of Economics Part 28", subject: "Economics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl239", title: "Final Revision for Economics Part 29", subject: "Economics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl240", title: "Ultimate Masterclass on Economics Part 30", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl241", title: "Introduction to Accountancy Part 1", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl242", title: "Advanced Accountancy Part 2", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl243", title: "Masterclass on Accountancy Part 3", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl244", title: "Fundamentals of Accountancy Part 4", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl245", title: "Crash Course: Accountancy Part 5", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl246", title: "Deep Dive into Accountancy Part 6", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl247", title: "Understanding Accountancy Part 7", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl248", title: "Basics of Accountancy Part 8", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl249", title: "Important Concepts in Accountancy Part 9", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl250", title: "Quick Revision: Accountancy Part 10", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl251", title: "Key Theories of Accountancy Part 11", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl252", title: "Practical Applications of Accountancy Part 12", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl253", title: "Problem Solving: Accountancy Part 13", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl254", title: "Conceptual Clarity: Accountancy Part 14", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl255", title: "Most Expected Questions in Accountancy Part 15", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl256", title: "Summary of Accountancy Part 16", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl257", title: "Everything you need to know about Accountancy Part 17", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl258", title: "A-Z of Accountancy Part 18", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl259", title: "Complete Guide to Accountancy Part 19", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl260", title: "Fast Track: Accountancy Part 20", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl261", title: "Pro Tips for Accountancy Part 21", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl262", title: "Exam Strategies for Accountancy Part 22", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl263", title: "Past Year Questions on Accountancy Part 23", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl264", title: "Top Tricks for Accountancy Part 24", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl265", title: "Expert Analysis of Accountancy Part 25", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl266", title: "Simplified: Accountancy Part 26", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl267", title: "Beginner's Guide to Accountancy Part 27", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl268", title: "Core Principles of Accountancy Part 28", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl269", title: "Final Revision for Accountancy Part 29", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl270", title: "Ultimate Masterclass on Accountancy Part 30", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl271", title: "Introduction to General Knowledge Part 1", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl272", title: "Advanced General Knowledge Part 2", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl273", title: "Masterclass on General Knowledge Part 3", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl274", title: "Fundamentals of General Knowledge Part 4", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl275", title: "Crash Course: General Knowledge Part 5", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl276", title: "Deep Dive into General Knowledge Part 6", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl277", title: "Understanding General Knowledge Part 7", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl278", title: "Basics of General Knowledge Part 8", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl279", title: "Important Concepts in General Knowledge Part 9", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl280", title: "Quick Revision: General Knowledge Part 10", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl281", title: "Key Theories of General Knowledge Part 11", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl282", title: "Practical Applications of General Knowledge Part 12", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl283", title: "Problem Solving: General Knowledge Part 13", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl284", title: "Conceptual Clarity: General Knowledge Part 14", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl285", title: "Most Expected Questions in General Knowledge Part 15", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl286", title: "Summary of General Knowledge Part 16", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl287", title: "Everything you need to know about General Knowledge Part 17", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl288", title: "A-Z of General Knowledge Part 18", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl289", title: "Complete Guide to General Knowledge Part 19", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl290", title: "Fast Track: General Knowledge Part 20", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl291", title: "Pro Tips for General Knowledge Part 21", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl292", title: "Exam Strategies for General Knowledge Part 22", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl293", title: "Past Year Questions on General Knowledge Part 23", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl294", title: "Top Tricks for General Knowledge Part 24", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl295", title: "Expert Analysis of General Knowledge Part 25", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl296", title: "Simplified: General Knowledge Part 26", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl297", title: "Beginner's Guide to General Knowledge Part 27", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl298", title: "Core Principles of General Knowledge Part 28", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl299", title: "Final Revision for General Knowledge Part 29", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl300", title: "Ultimate Masterclass on General Knowledge Part 30", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl301", title: "Introduction to Current Affairs Part 1", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl302", title: "Advanced Current Affairs Part 2", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl303", title: "Masterclass on Current Affairs Part 3", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl304", title: "Fundamentals of Current Affairs Part 4", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl305", title: "Crash Course: Current Affairs Part 5", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl306", title: "Deep Dive into Current Affairs Part 6", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl307", title: "Understanding Current Affairs Part 7", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl308", title: "Basics of Current Affairs Part 8", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl309", title: "Important Concepts in Current Affairs Part 9", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl310", title: "Quick Revision: Current Affairs Part 10", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl311", title: "Key Theories of Current Affairs Part 11", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl312", title: "Practical Applications of Current Affairs Part 12", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl313", title: "Problem Solving: Current Affairs Part 13", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl314", title: "Conceptual Clarity: Current Affairs Part 14", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl315", title: "Most Expected Questions in Current Affairs Part 15", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl316", title: "Summary of Current Affairs Part 16", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl317", title: "Everything you need to know about Current Affairs Part 17", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl318", title: "A-Z of Current Affairs Part 18", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl319", title: "Complete Guide to Current Affairs Part 19", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl320", title: "Fast Track: Current Affairs Part 20", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl321", title: "Pro Tips for Current Affairs Part 21", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl322", title: "Exam Strategies for Current Affairs Part 22", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl323", title: "Past Year Questions on Current Affairs Part 23", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl324", title: "Top Tricks for Current Affairs Part 24", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl325", title: "Expert Analysis of Current Affairs Part 25", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl326", title: "Simplified: Current Affairs Part 26", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl327", title: "Beginner's Guide to Current Affairs Part 27", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl328", title: "Core Principles of Current Affairs Part 28", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl329", title: "Final Revision for Current Affairs Part 29", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl330", title: "Ultimate Masterclass on Current Affairs Part 30", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl331", title: "Introduction to Reasoning Part 1", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl332", title: "Advanced Reasoning Part 2", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl333", title: "Masterclass on Reasoning Part 3", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl334", title: "Fundamentals of Reasoning Part 4", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl335", title: "Crash Course: Reasoning Part 5", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl336", title: "Deep Dive into Reasoning Part 6", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl337", title: "Understanding Reasoning Part 7", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl338", title: "Basics of Reasoning Part 8", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl339", title: "Important Concepts in Reasoning Part 9", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl340", title: "Quick Revision: Reasoning Part 10", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl341", title: "Key Theories of Reasoning Part 11", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl342", title: "Practical Applications of Reasoning Part 12", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl343", title: "Problem Solving: Reasoning Part 13", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl344", title: "Conceptual Clarity: Reasoning Part 14", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl345", title: "Most Expected Questions in Reasoning Part 15", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl346", title: "Summary of Reasoning Part 16", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl347", title: "Everything you need to know about Reasoning Part 17", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl348", title: "A-Z of Reasoning Part 18", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl349", title: "Complete Guide to Reasoning Part 19", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl350", title: "Fast Track: Reasoning Part 20", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl351", title: "Pro Tips for Reasoning Part 21", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl352", title: "Exam Strategies for Reasoning Part 22", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl353", title: "Past Year Questions on Reasoning Part 23", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl354", title: "Top Tricks for Reasoning Part 24", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl355", title: "Expert Analysis of Reasoning Part 25", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl356", title: "Simplified: Reasoning Part 26", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl357", title: "Beginner's Guide to Reasoning Part 27", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl358", title: "Core Principles of Reasoning Part 28", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl359", title: "Final Revision for Reasoning Part 29", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl360", title: "Ultimate Masterclass on Reasoning Part 30", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl361", title: "Introduction to Quantitative Aptitude Part 1", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl362", title: "Advanced Quantitative Aptitude Part 2", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl363", title: "Masterclass on Quantitative Aptitude Part 3", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl364", title: "Fundamentals of Quantitative Aptitude Part 4", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl365", title: "Crash Course: Quantitative Aptitude Part 5", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl366", title: "Deep Dive into Quantitative Aptitude Part 6", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl367", title: "Understanding Quantitative Aptitude Part 7", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl368", title: "Basics of Quantitative Aptitude Part 8", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl369", title: "Important Concepts in Quantitative Aptitude Part 9", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl370", title: "Quick Revision: Quantitative Aptitude Part 10", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl371", title: "Key Theories of Quantitative Aptitude Part 11", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl372", title: "Practical Applications of Quantitative Aptitude Part 12", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl373", title: "Problem Solving: Quantitative Aptitude Part 13", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl374", title: "Conceptual Clarity: Quantitative Aptitude Part 14", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl375", title: "Most Expected Questions in Quantitative Aptitude Part 15", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl376", title: "Summary of Quantitative Aptitude Part 16", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl377", title: "Everything you need to know about Quantitative Aptitude Part 17", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl378", title: "A-Z of Quantitative Aptitude Part 18", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl379", title: "Complete Guide to Quantitative Aptitude Part 19", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl380", title: "Fast Track: Quantitative Aptitude Part 20", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl381", title: "Pro Tips for Quantitative Aptitude Part 21", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl382", title: "Exam Strategies for Quantitative Aptitude Part 22", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl383", title: "Past Year Questions on Quantitative Aptitude Part 23", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl384", title: "Top Tricks for Quantitative Aptitude Part 24", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl385", title: "Expert Analysis of Quantitative Aptitude Part 25", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl386", title: "Simplified: Quantitative Aptitude Part 26", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl387", title: "Beginner's Guide to Quantitative Aptitude Part 27", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl388", title: "Core Principles of Quantitative Aptitude Part 28", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl389", title: "Final Revision for Quantitative Aptitude Part 29", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl390", title: "Ultimate Masterclass on Quantitative Aptitude Part 30", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl391", title: "Introduction to English Grammar Part 1", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl392", title: "Advanced English Grammar Part 2", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl393", title: "Masterclass on English Grammar Part 3", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl394", title: "Fundamentals of English Grammar Part 4", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl395", title: "Crash Course: English Grammar Part 5", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl396", title: "Deep Dive into English Grammar Part 6", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl397", title: "Understanding English Grammar Part 7", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl398", title: "Basics of English Grammar Part 8", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl399", title: "Important Concepts in English Grammar Part 9", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl400", title: "Quick Revision: English Grammar Part 10", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl401", title: "Key Theories of English Grammar Part 11", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl402", title: "Practical Applications of English Grammar Part 12", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl403", title: "Problem Solving: English Grammar Part 13", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl404", title: "Conceptual Clarity: English Grammar Part 14", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl405", title: "Most Expected Questions in English Grammar Part 15", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl406", title: "Summary of English Grammar Part 16", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl407", title: "Everything you need to know about English Grammar Part 17", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl408", title: "A-Z of English Grammar Part 18", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl409", title: "Complete Guide to English Grammar Part 19", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl410", title: "Fast Track: English Grammar Part 20", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl411", title: "Pro Tips for English Grammar Part 21", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl412", title: "Exam Strategies for English Grammar Part 22", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl413", title: "Past Year Questions on English Grammar Part 23", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl414", title: "Top Tricks for English Grammar Part 24", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl415", title: "Expert Analysis of English Grammar Part 25", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl416", title: "Simplified: English Grammar Part 26", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl417", title: "Beginner's Guide to English Grammar Part 27", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl418", title: "Core Principles of English Grammar Part 28", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl419", title: "Final Revision for English Grammar Part 29", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl420", title: "Ultimate Masterclass on English Grammar Part 30", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl421", title: "Introduction to Indian Polity Part 1", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl422", title: "Advanced Indian Polity Part 2", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl423", title: "Masterclass on Indian Polity Part 3", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl424", title: "Fundamentals of Indian Polity Part 4", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl425", title: "Crash Course: Indian Polity Part 5", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl426", title: "Deep Dive into Indian Polity Part 6", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl427", title: "Understanding Indian Polity Part 7", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl428", title: "Basics of Indian Polity Part 8", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl429", title: "Important Concepts in Indian Polity Part 9", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl430", title: "Quick Revision: Indian Polity Part 10", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl431", title: "Key Theories of Indian Polity Part 11", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl432", title: "Practical Applications of Indian Polity Part 12", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl433", title: "Problem Solving: Indian Polity Part 13", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl434", title: "Conceptual Clarity: Indian Polity Part 14", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl435", title: "Most Expected Questions in Indian Polity Part 15", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl436", title: "Summary of Indian Polity Part 16", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl437", title: "Everything you need to know about Indian Polity Part 17", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl438", title: "A-Z of Indian Polity Part 18", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl439", title: "Complete Guide to Indian Polity Part 19", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl440", title: "Fast Track: Indian Polity Part 20", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl441", title: "Pro Tips for Indian Polity Part 21", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl442", title: "Exam Strategies for Indian Polity Part 22", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl443", title: "Past Year Questions on Indian Polity Part 23", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl444", title: "Top Tricks for Indian Polity Part 24", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl445", title: "Expert Analysis of Indian Polity Part 25", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl446", title: "Simplified: Indian Polity Part 26", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl447", title: "Beginner's Guide to Indian Polity Part 27", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl448", title: "Core Principles of Indian Polity Part 28", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl449", title: "Final Revision for Indian Polity Part 29", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl450", title: "Ultimate Masterclass on Indian Polity Part 30", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl451", title: "Introduction to History Part 1", subject: "History", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl452", title: "Advanced History Part 2", subject: "History", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl453", title: "Masterclass on History Part 3", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl454", title: "Fundamentals of History Part 4", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl455", title: "Crash Course: History Part 5", subject: "History", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl456", title: "Deep Dive into History Part 6", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl457", title: "Understanding History Part 7", subject: "History", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl458", title: "Basics of History Part 8", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl459", title: "Important Concepts in History Part 9", subject: "History", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl460", title: "Quick Revision: History Part 10", subject: "History", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl461", title: "Key Theories of History Part 11", subject: "History", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl462", title: "Practical Applications of History Part 12", subject: "History", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl463", title: "Problem Solving: History Part 13", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl464", title: "Conceptual Clarity: History Part 14", subject: "History", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl465", title: "Most Expected Questions in History Part 15", subject: "History", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl466", title: "Summary of History Part 16", subject: "History", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl467", title: "Everything you need to know about History Part 17", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl468", title: "A-Z of History Part 18", subject: "History", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl469", title: "Complete Guide to History Part 19", subject: "History", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl470", title: "Fast Track: History Part 20", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl471", title: "Pro Tips for History Part 21", subject: "History", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl472", title: "Exam Strategies for History Part 22", subject: "History", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl473", title: "Past Year Questions on History Part 23", subject: "History", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl474", title: "Top Tricks for History Part 24", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl475", title: "Expert Analysis of History Part 25", subject: "History", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl476", title: "Simplified: History Part 26", subject: "History", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl477", title: "Beginner's Guide to History Part 27", subject: "History", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl478", title: "Core Principles of History Part 28", subject: "History", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl479", title: "Final Revision for History Part 29", subject: "History", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl480", title: "Ultimate Masterclass on History Part 30", subject: "History", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" }
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
