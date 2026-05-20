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
  { id: "vl1", title: "Motion in a Straight Line - KCET Physics", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl2", title: "Laws of Motion - Newton's Three Laws Explained", subject: "Physics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl3", title: "Work, Energy and Power - Full Chapter", subject: "Physics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl4", title: "Gravitation - Universal Law & Kepler's Laws", subject: "Physics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl5", title: "Light - Reflection and Refraction Concepts", subject: "Physics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl6", title: "Electricity - Current, Resistance & Ohm's Law", subject: "Physics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl7", title: "Magnetic Effects of Electric Current", subject: "Physics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl8", title: "Sound Waves - Frequency, Amplitude & Echo", subject: "Physics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl9", title: "Chemical Reactions & Equations - CBSE Class 10", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl10", title: "Acids, Bases and Salts - Full Chapter", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl11", title: "Metals and Non-metals - Properties & Reactions", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl12", title: "Carbon and Its Compounds - Organic Chemistry", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl13", title: "Periodic Classification of Elements", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl14", title: "Balancing Chemical Equations - Step by Step", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl15", title: "Displacement Reactions & Reactivity Series", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl16", title: "Electrolysis & Electrochemistry Basics", subject: "Chemistry", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl17", title: "Quadratic Equations - Formula & Factorisation", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl18", title: "Trigonometry - Sin, Cos, Tan Identities", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl19", title: "Probability - Basic Concepts & Problems", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl20", title: "Coordinate Geometry - Distance & Section Formula", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl21", title: "Arithmetic Progressions - nth Term & Sum", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl22", title: "Surface Areas & Volumes - 3D Shapes", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl23", title: "Statistics - Mean, Median & Mode", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl24", title: "Circles - Theorems and Tangent Properties", subject: "Mathematics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl25", title: "Life Processes - Nutrition, Respiration & Excretion", subject: "Biology", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl26", title: "Control & Coordination - Nervous System", subject: "Biology", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl27", title: "Heredity & Evolution - Mendel's Laws", subject: "Biology", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl28", title: "Human Reproduction - Complete Chapter", subject: "Biology", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl29", title: "Photosynthesis - Light & Dark Reactions", subject: "Biology", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl30", title: "Ecosystem & Food Chains - Environmental Science", subject: "Biology", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl31", title: "Cell - Structure, Organelles & Functions", subject: "Biology", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl32", title: "Blood & Circulatory System - Heart Functions", subject: "Biology", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl33", title: "Introduction to Python Programming", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl34", title: "Data Structures - Arrays, Stack and Queue", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl35", title: "Object-Oriented Programming Concepts", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl36", title: "Database Management - SQL Basics", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl37", title: "Networking - OSI Model & TCP/IP", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl38", title: "Algorithms - Sorting & Searching Techniques", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl39", title: "HTML, CSS & Web Development Basics", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl40", title: "Computer Architecture - CPU & Memory", subject: "Computer Science", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl41", title: "Grammar - Tenses & Subject-Verb Agreement", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl42", title: "Comprehension Skills - Reading Strategies", subject: "English", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl43", title: "Essay Writing - Structure & Tips", subject: "English", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl44", title: "Literature - Poetry Analysis & Figure of Speech", subject: "English", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl45", title: "Vocabulary - Synonyms, Antonyms & Idioms", subject: "English", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl46", title: "Letter Writing - Formal & Informal Formats", subject: "English", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl47", title: "Prepositions, Conjunctions & Articles", subject: "English", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl48", title: "Active & Passive Voice - Transformation Rules", subject: "English", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl49", title: "ಕನ್ನಡ ವ್ಯಾಕರಣ - ಸಂಧಿ ಮತ್ತು ಸಮಾಸ", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl50", title: "ಕನ್ನಡ ಕಾವ್ಯ - ಪಂಪ ಮತ್ತು ರನ್ನ ಕೃತಿಗಳು", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl51", title: "ಕನ್ನಡ ವಚನ ಸಾಹಿತ್ಯ - ಬಸವಣ್ಣ", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl52", title: "ಕನ್ನಡ ನಾಟಕ ಮತ್ತು ಗದ್ಯ ವಿಶ್ಲೇಷಣೆ", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl53", title: "ಕನ್ನಡ ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು - ಜೀವನ ಮತ್ತು ಕೃತಿಗಳು", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl54", title: "ಕನ್ನಡ ವರ್ಣಮಾಲೆ ಮತ್ತು ಲಿಪಿ ಇತಿಹಾಸ", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl55", title: "ಕನ್ನಡ ಭಾಷಾ ವಿಕಾಸ - ಹಳಗನ್ನಡದಿಂದ ಹೊಸಗನ್ನಡ", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl56", title: "ಕರ್ನಾಟಕ ಏಕೀಕರಣ ಮತ್ತು ರಾಜ್ಯೋತ್ಸವ", subject: "Kannada", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl57", title: "Introduction to Microeconomics - Demand & Supply", subject: "Economics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl58", title: "National Income - GDP, GNP & NNP Concepts", subject: "Economics", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl59", title: "Money & Banking - RBI Functions & Credit Creation", subject: "Economics", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl60", title: "Indian Economy - Planning & Economic Growth", subject: "Economics", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl61", title: "Inflation - Types, Causes & Effects", subject: "Economics", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl62", title: "International Trade - Balance of Payments", subject: "Economics", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl63", title: "Market Structure - Monopoly & Perfect Competition", subject: "Economics", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl64", title: "Indian Budget - Revenue & Capital Expenditure", subject: "Economics", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl65", title: "Journal Entries & Ledger - Basic Accounting", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl66", title: "Trial Balance & Financial Statements", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl67", title: "Partnership Accounts - Admission & Retirement", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl68", title: "Depreciation - Methods & Calculations", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl69", title: "Cash Flow Statement - Direct & Indirect Method", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl70", title: "Ratio Analysis - Liquidity & Profitability Ratios", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl71", title: "Company Accounts - Share Capital & Debentures", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl72", title: "Bank Reconciliation Statement Explained", subject: "Accountancy", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl73", title: "World Geography - Countries, Capitals & Maps", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl74", title: "Science & Technology - Important Inventions", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl75", title: "Indian Constitution - Key Articles & Amendments", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl76", title: "Famous Personalities - Awards & Achievements", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl77", title: "Sports GK - Olympics, Trophies & Records", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl78", title: "National Symbols of India - Facts & Significance", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl79", title: "Important Days - National & International Events", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl80", title: "Environment & Ecology - Conservation Facts", subject: "General Knowledge", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl81", title: "Monthly Current Affairs - India & World 2026", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl82", title: "Government Schemes & Policies 2025-2026", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl83", title: "International Relations - G20, UN & NATO Updates", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl84", title: "Economy & Finance - RBI Policy & Union Budget", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl85", title: "Science & Space - ISRO & NASA Missions 2026", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl86", title: "Sports Current Affairs - Cricket, Football & Olympics", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl87", title: "Environmental Current Affairs - Climate & COP", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl88", title: "State Current Affairs - Karnataka Focus 2026", subject: "Current Affairs", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl89", title: "Blood Relations - Shortcut Tricks Explained", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl90", title: "Seating Arrangement - Circular & Linear", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl91", title: "Coding-Decoding - Pattern Recognition Tricks", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl92", title: "Syllogisms - All Possible Cases Covered", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl93", title: "Direction Sense & Distance Problems", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl94", title: "Number Series - Patterns & Missing Terms", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl95", title: "Analogy & Classification - Concept & Practice", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl96", title: "Logical Reasoning - Statement & Conclusions", subject: "Reasoning", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl97", title: "Percentage - Tricks & Fast Calculations", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl98", title: "Time & Work - Pipe, Cistern Problems", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl99", title: "Profit & Loss - CP, SP & Discount", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl100", title: "Simple & Compound Interest - Formulas", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl101", title: "Speed, Distance & Time - Train Problems", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl102", title: "Ratio & Proportion - Partnership Problems", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl103", title: "Averages, Mixtures & Alligation", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl104", title: "Number System - HCF, LCM & Divisibility", subject: "Quantitative Aptitude", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl105", title: "Tenses - All 12 Tenses with Examples", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl106", title: "Active & Passive Voice - All Tense Rules", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl107", title: "Reported Speech - Direct & Indirect Narration", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl108", title: "Articles - A, An, The Usage Rules", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl109", title: "Prepositions - In, On, At & Common Errors", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl110", title: "Subject-Verb Agreement - Common Mistakes", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl111", title: "Spotting Errors - Bank PO & SSC Questions", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl112", title: "One Word Substitution & Idioms - SSC/UPSC", subject: "English Grammar", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl113", title: "Indian Constitution - Preamble, Parts & Schedules", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl114", title: "Fundamental Rights - Articles 12 to 35", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl115", title: "Directive Principles & Fundamental Duties", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl116", title: "Parliament - Lok Sabha & Rajya Sabha", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl117", title: "President & Vice President - Powers & Functions", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl118", title: "Judiciary - Supreme Court & High Courts", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl119", title: "State Government - CM, Governor & Legislature", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl120", title: "Constitutional Amendments - Important Ones", subject: "Indian Polity", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl121", title: "Ancient India - Indus Valley & Vedic Civilization", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" },
  { id: "vl122", title: "Medieval India - Delhi Sultanate & Mughal Empire", subject: "History", videoUrl: "https://www.youtube.com/embed/MR07YxA8AHs" },
  { id: "vl123", title: "Modern India - British Rule & Freedom Struggle", subject: "History", videoUrl: "https://www.youtube.com/embed/FSyAehMdpyI" },
  { id: "vl124", title: "Indian National Congress - Formation & Movements", subject: "History", videoUrl: "https://www.youtube.com/embed/ZM8ECpBuQYE" },
  { id: "vl125", title: "World War I & II - Causes, Events & Effects", subject: "History", videoUrl: "https://www.youtube.com/embed/uAxyI_XfqXk" },
  { id: "vl126", title: "Social Reformers - Raja Ram Mohan Roy & Others", subject: "History", videoUrl: "https://www.youtube.com/embed/B10pc0Kizsc" },
  { id: "vl127", title: "Revolt of 1857 - Causes & Consequences", subject: "History", videoUrl: "https://www.youtube.com/embed/fo46yFWIJzU" },
  { id: "vl128", title: "Post-Independence India - States & Constitution", subject: "History", videoUrl: "https://www.youtube.com/embed/HuFR5XBYLfU" }
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

  solve: async (text, userId, mode, lengthMode, language, subjectContext, chapterContext) => {
    const solution = localSolveQuestion(text, mode, lengthMode, language);
    
    if (subjectContext && !solution.subject.includes(subjectContext)) {
      solution.subject = subjectContext;
    }
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

  getMockTests: async (subject) => {
    if (subject) {
      return LOCAL_MOCK_TESTS.filter(t => t.subject.toLowerCase() === subject.toLowerCase());
    }
    return LOCAL_MOCK_TESTS;
  },

  generateSmartTest: async (subject, difficulty, mode, duration) => {
    // Generate a test using real MCQs from the matching subject
    let availableTests = LOCAL_MOCK_TESTS;
    if (subject) {
      availableTests = LOCAL_MOCK_TESTS.filter(t => t.subject.toLowerCase() === subject.toLowerCase());
    }
    
    let allQuestions = [];
    availableTests.forEach(t => {
      allQuestions = allQuestions.concat(t.questions || []);
    });

    // Shuffle questions
    allQuestions = allQuestions.sort(() => Math.random() - 0.5);

    // Select amount of questions based on duration (e.g. 1 question per minute)
    let qCount = duration;
    if (qCount > allQuestions.length) qCount = allQuestions.length;
    if (qCount < 5 && allQuestions.length >= 5) qCount = 5;
    if (qCount === 0) {
      // Fallback if we have no questions for that subject
      return {
        id: `smart_test_${Date.now()}`,
        title: `AI Generated ${mode} Test`,
        subject: subject,
        difficulty: difficulty,
        duration: duration,
        questions: [
          {
            id: 'q1',
            question: `What is the most fundamental concept in ${subject}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 1,
            explanation: 'This is a generated explanation.'
          }
        ]
      };
    }

    const selectedQuestions = allQuestions.slice(0, qCount).map((q, idx) => ({
      ...q,
      id: `ai_q_${Date.now()}_${idx}`
    }));

    return {
      id: `smart_test_${Date.now()}`,
      title: `AI Generated ${mode} Test (${difficulty})`,
      subject: subject || "General",
      difficulty: difficulty,
      duration: duration,
      questions: selectedQuestions
    };
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

  solve: async (text, userId, mode, lengthMode, language, subjectContext, chapterContext) => {
    const res = await API.request('/solver/solve', { method: 'POST', body: { text, userId, mode, lengthMode, language, subjectContext, chapterContext } });
    if (res) return res.solution;
    const local = await fallbackAPI.solve(text, userId, mode, lengthMode, language, subjectContext, chapterContext);
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

  getMockTests: async (subject) => {
    let endpoint = '/tests';
    if (subject) {
      endpoint += `?subject=${encodeURIComponent(subject)}`;
    }
    const res = await API.request(endpoint);
    if (res) return res;
    return fallbackAPI.getMockTests(subject);
  },

  generateSmartTest: async (subject, difficulty, mode, duration) => {
    const res = await API.request('/tests/generate', { method: 'POST', body: { subject, difficulty, mode, duration } });
    if (res) return res;
    return fallbackAPI.generateSmartTest(subject, difficulty, mode, duration);
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
