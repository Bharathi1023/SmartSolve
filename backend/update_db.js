import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database', 'smartsolve_db.json');

try {
  const fileContent = fs.readFileSync(DB_FILE, 'utf8');
  const data = JSON.parse(fileContent);

  // New Exams to add
  const newTests = [
    {
      id: "neet-bio-01",
      title: "NEET UG - Human Physiology & Biology",
      subject: "Science (Biology)",
      duration: 45,
      questions: [
        {
          id: "nq1",
          question: "Which of the following is responsible for the transport of oxygen in the blood?",
          options: ["White Blood Cells", "Platelets", "Hemoglobin", "Plasma"],
          correctAnswer: 2,
          explanation: "Hemoglobin is an iron-containing protein in red blood cells that reversibly binds oxygen."
        },
        {
          id: "nq2",
          question: "The basic functional unit of the human kidney is:",
          options: ["Nephron", "Neuron", "Alveoli", "Villi"],
          correctAnswer: 0,
          explanation: "The nephron is the microscopic structural and functional unit of the kidney."
        },
        {
          id: "nq3",
          question: "In photosynthesis, light-independent reactions (Calvin cycle) take place in:",
          options: ["Thylakoid lumen", "Stroma of chloroplast", "Inner mitochondrial membrane", "Cytoplasm"],
          correctAnswer: 1,
          explanation: "The Calvin cycle takes place in the stroma, the fluid-filled area of a chloroplast outside the thylakoid membranes."
        }
      ]
    },
    {
      id: "kcet-phy-01",
      title: "KCET Physics - Mechanics & Electromagnetism",
      subject: "Science (Physics)",
      duration: 60,
      questions: [
        {
          id: "kq1",
          question: "A particle moves in a circular path of radius r with constant speed v. The work done by the centripetal force in one half revolution is:",
          options: ["Zero", "mv²/r * πr", "mv²/r * 2πr", "None of the above"],
          correctAnswer: 0,
          explanation: "Centripetal force is always perpendicular to the displacement. Work done W = F·d = F d cos(90°) = 0."
        },
        {
          id: "kq2",
          question: "If the length of a wire is doubled and its radius is halved, its electrical resistance will become:",
          options: ["Twice", "Four times", "Eight times", "Sixteen times"],
          correctAnswer: 2,
          explanation: "Resistance R = ρL/A = ρL/(πr²). If L' = 2L and r' = r/2, then R' = ρ(2L)/(π(r/2)²) = ρ(2L)/(πr²/4) = 8 * (ρL/πr²) = 8R."
        }
      ]
    }
  ];

  // Merge new tests if they don't exist
  newTests.forEach(test => {
    if (!data.mockTests.find(t => t.id === test.id)) {
      data.mockTests.push(test);
    }
  });

  // New Study Materials
  const newNotes = [
    {
      id: "note-neet-1",
      title: "NEET Biology Masterclass: Human Physiology",
      subject: "Science (Biology)",
      category: "notes",
      content: "### Human Respiratory System\n\nThe human respiratory system consists of a pair of lungs and a series of air passages. The primary function is the exchange of gases (oxygen and carbon dioxide).\n\n#### Key Organs:\n- Trachea (Windpipe)\n- Bronchi\n- Bronchioles\n- Alveoli (Site of actual gas exchange)\n\n#### Transport of Gases:\nO2 is transported primarily by Hemoglobin (Hb) as Oxyhemoglobin. CO2 is transported dissolved in plasma, as carbaminohemoglobin, and mainly as bicarbonate ions.",
      videoUrl: "https://www.youtube.com/embed/S2H_xJksKgs", // Educational placeholder
      flashcards: [
        { front: "What is the site of gas exchange in lungs?", back: "Alveoli" },
        { front: "How is majority of CO2 transported in blood?", back: "As Bicarbonate ions (HCO3-)" }
      ]
    },
    {
      id: "note-kcet-1",
      title: "KCET Physics Formula Sheet: Mechanics",
      subject: "Science (Physics)",
      category: "formulas",
      content: "### Essential Mechanics Formulas\n\n#### Kinematics\n- $v = u + at$\n- $s = ut + \\frac{1}{2}at^2$\n- $v^2 - u^2 = 2as$\n\n#### Dynamics\n- Force: $F = ma$\n- Momentum: $p = mv$\n- Work Done: $W = F \\cdot d \\cdot \\cos(\\theta)$\n\n#### Circular Motion\n- Centripetal Acceleration: $a_c = \\frac{v^2}{r}$",
      videoUrl: "https://www.youtube.com/embed/5iMxs2F8pBQ", // Educational placeholder
      flashcards: [
        { front: "Formula for Centripetal Force?", back: "F = mv²/r" },
        { front: "Work-Energy Theorem?", back: "Work done by net force equals change in Kinetic Energy." }
      ]
    }
  ];

  newNotes.forEach(note => {
    if (!data.notes.find(n => n.id === note.id)) {
      data.notes.push(note);
    }
  });

  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log('Database seeded with KCET and NEET content successfully.');
} catch (e) {
  console.error('Error updating DB:', e);
}
