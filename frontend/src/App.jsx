import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, UploadCloud, Camera, Brain, Clock, Trophy, BarChart3, Users, 
  Volume2, Settings, Mic, Send, CheckCircle, XCircle, Plus, Trash2, 
  Play, Sparkles, ChevronRight, Languages, Sun, Moon, RefreshCw, 
  AlertTriangle, Smile, Info, BookMarked, HelpCircle, Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import API from './services/api';

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'solver' | 'tests' | 'notes' | 'analytics' | 'social'
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Solver Panel States
  const [doubtText, setDoubtText] = useState('');
  const [solverLanguage, setSolverLanguage] = useState('english'); // 'english' | 'kannada'
  const [explainMode, setExplainMode] = useState('standard'); // 'standard' | 'teacher'
  const [lengthMode, setLengthMode] = useState('standard'); // 'standard' | '2-mark' | '10-mark'
  const [isLoadingSolver, setIsLoadingSolver] = useState(false);
  const [solveResult, setSolveResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState('');
  
  // Subject Explorer state
  const [activeSubjectView, setActiveSubjectView] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  
  // Mock Test Panel States
  const [mockTests, setMockTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null); // test object currently being taken
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: optionIndex }
  const [testTimeLeft, setTestTimeLeft] = useState(0);
  const [testResult, setTestResult] = useState(null); // submission response
  const [testTimeSpent, setTestTimeSpent] = useState(0);
  const testTimerRef = useRef(null);
  
  // Notes / Study Center States
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeNoteTab, setActiveNoteTab] = useState('formulas'); // 'formulas' | 'notes' | 'flashcards' | 'stress'
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  // Custom notes form
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('Mathematics');
  const [newNoteContent, setNewNoteContent] = useState('');
  
  // Analytics States
  const [analyticsData, setAnalyticsData] = useState({
    marksHistory: [],
    weakTopics: [],
    subjectAccuracy: []
  });

  // New Feature States
  const [coursesList, setCoursesList] = useState([]);
  const [liveClassesList, setLiveClassesList] = useState([]);
  const [videoLecturesList, setVideoLecturesList] = useState([]);
  const [fullHistory, setFullHistory] = useState([]);
  
  // Course Selection UI state
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');

  // Social / Study Lounge States
  const [leaderboard, setLeaderboard] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostSubject, setNewPostSubject] = useState('Mathematics');
  const [replyInputs, setReplyInputs] = useState({}); // { [postId]: text }
  const [studyRooms, setStudyRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  
  // Pomodoro States
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoIsActive, setPomoIsActive] = useState(false);
  const [pomoMode, setPomoMode] = useState('focus'); // 'focus' | 'break'
  const pomoTimerRef = useRef(null);

  // Daily Streak / rewards state
  const [streakEarnedAlert, setStreakEarnedAlert] = useState(false);
  const [newBadgeAlert, setNewBadgeAlert] = useState('');

  // Audio speech synthesis helper
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  // 1. Initial Load & Auth check
  useEffect(() => {
    const cachedUser = localStorage.getItem('ss_current_user');
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      setCurrentUser(parsed);
      loadUserData(parsed.id);
    }
  }, []);

  // Sync dark theme class with html body
  useEffect(() => {
    const bodyClass = document.body.classList;
    if (isDarkMode) {
      bodyClass.remove('light-theme');
    } else {
      bodyClass.add('light-theme');
    }
  }, [isDarkMode]);

  // Load all user related workspace state
  const loadUserData = async (userId) => {
    try {
      const profile = await API.getProfile(userId);
      if (profile) setCurrentUser(profile);

      // Load History
      const hist = await API.getHistory(userId);
      setHistory(hist);

      // Load Mock Tests
      const tests = await API.getMockTests();
      setMockTests(tests);

      // Load Notes
      const notesList = await API.getNotes();
      setNotes(notesList);

      // Load Forum & Chat Rooms
      const forums = await API.getForumPosts();
      setForumPosts(forums);

      const rooms = await API.getStudyRooms();
      setStudyRooms(rooms);
      if (rooms.length > 0) setSelectedRoom(rooms[0]);

      // Load Leaderboards
      const lead = await API.getLeaderboard();
      setLeaderboard(lead);

      // Load New Features
      const courses = await API.getCourses();
      setCoursesList(courses);
      const liveC = await API.getLiveClasses();
      setLiveClassesList(liveC);
      const vids = await API.getVideoLectures();
      setVideoLecturesList(vids);
      
      // Compute Full History (combining papers, mock tests, etc.)
      const testsHist = await API.getTestHistory(userId);
      setFullHistory({
        scans: hist,
        tests: testsHist,
        videosWatched: [
          { id: "vw1", title: "Motion in 1D", date: new Date().toISOString() }
        ]
      });

      // Load past test scores for analytics
      buildAnalytics(testsHist, hist);

    } catch (err) {
      console.error("Failed to load user workspace data:", err);
    }
  };

  // Build high-fidelity analytical charts from data history
  const buildAnalytics = (testHistory, solveHistory) => {
    // 1. Marks progress over time
    const marks = testHistory.map((item, idx) => ({
      name: `Test ${idx + 1}`,
      score: item.score,
      duration: Math.round(item.timeSpentSeconds / 60)
    })).reverse();

    // Default mock data if no tests taken yet, to ensure breathtaking aesthetic immediately
    const marksData = marks.length > 0 ? marks : [
      { name: "Test 1", score: 65, duration: 15 },
      { name: "Test 2", score: 80, duration: 25 },
      { name: "Test 3", score: 75, duration: 18 }
    ];

    // 2. Weak topics accumulator
    const weakSet = new Set();
    testHistory.forEach(item => {
      if (item.score < 85) {
        if (item.subject === 'Mathematics') weakSet.add('Quadratic formula plotting');
        else weakSet.add('Chemical reaction products');
      }
    });

    const weakList = Array.from(weakSet).map(topic => ({
      name: topic,
      level: Math.floor(Math.random() * 40) + 30 // percent deficiency
    }));

    const weakTopicsData = weakList.length > 0 ? weakList : [
      { name: "Discriminant Nature of Roots", level: 65 },
      { name: "Balancing Displacement Equations", level: 45 },
      { name: "Speed & Velocity Vectors", level: 30 }
    ];

    // 3. Subject-wise accuracy percentages
    const subjectStats = {};
    testHistory.forEach(item => {
      if (!subjectStats[item.subject]) {
        subjectStats[item.subject] = { correct: 0, total: 0 };
      }
      subjectStats[item.subject].correct += item.correctCount;
      subjectStats[item.subject].total += item.totalQuestions;
    });

    const accuracyList = Object.keys(subjectStats).map(subj => ({
      subject: subj,
      accuracy: Math.round((subjectStats[subj].correct / subjectStats[subj].total) * 100)
    }));

    const accuracyData = accuracyList.length > 0 ? accuracyList : [
      { subject: "Mathematics", accuracy: 82 },
      { subject: "Science (Chemistry)", accuracy: 74 },
      { subject: "Science (Physics)", accuracy: 68 }
    ];

    setAnalyticsData({
      marksHistory: marksData,
      weakTopics: weakTopicsData,
      subjectAccuracy: accuracyData
    });
  };

  // 2. Authentication handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) return;

    try {
      if (authMode === 'login') {
        const data = await API.login(usernameInput, passwordInput);
        setCurrentUser(data.user);
        localStorage.setItem('ss_current_user', JSON.stringify(data.user));
        
        if (data.streakEarned) setStreakEarnedAlert(true);
        if (data.earnedBadge) setNewBadgeAlert(data.earnedBadge);

        loadUserData(data.user.id);
      } else {
        const user = await API.register(usernameInput, passwordInput);
        setCurrentUser(user);
        localStorage.setItem('ss_current_user', JSON.stringify(user));
        loadUserData(user.id);
      }
    } catch (err) {
      alert(err.message || "Authentication error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ss_current_user');
    setCurrentUser(null);
    setDoubtText('');
    setSolveResult(null);
  };

  // 3. AI Solver & OCR uploads
  const handleSolve = async (textToSolve) => {
    const text = textToSolve || doubtText;
    if (!text.trim()) return;

    setIsLoadingSolver(true);
    try {
      const solution = await API.solve(
        text, 
        currentUser.id, 
        explainMode, 
        lengthMode, 
        solverLanguage
      );
      setSolveResult(solution);
      setDoubtText('');
      
      // Reload stats/history
      loadUserData(currentUser.id);
    } catch (err) {
      alert("Failed to solve question. Try again.");
    } finally {
      setIsLoadingSolver(false);
    }
  };

  // Simulate voice recorder speech-to-text
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback if browser doesn't support it: type dummy quadratic text
      setIsRecording(true);
      setTimeout(() => {
        setDoubtText("Solve the quadratic equation x² - 5x + 6 = 0");
        setIsRecording(false);
      }, 2500);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = solverLanguage === 'kannada' ? 'kn-IN' : 'en-US';

    rec.onstart = () => setIsRecording(true);
    rec.onend = () => setIsRecording(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDoubtText(transcript);
    };
    rec.start();
  };

  // Text to Speech voice synthesis read-aloud
  const speakText = (text) => {
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner speech synthesis
    const cleanText = text.replace(/[*#`$\\]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = solverLanguage === 'kannada' ? 'kn-IN' : 'en-US';
    
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    synthRef.current.speak(utter);
  };

  // Scan paper image file upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoadingSolver(true);
    try {
      const res = await API.uploadPaper(
        file, 
        currentUser.id, 
        explainMode, 
        lengthMode, 
        solverLanguage
      );
      setOcrSuccessMsg(`Successfully scanned "${res.fileName}". Extracted text: "${res.ocrText}"`);
      setSolveResult(res.solution);
      setActiveTab('solver');
      
      setTimeout(() => setOcrSuccessMsg(''), 6000);
      loadUserData(currentUser.id);
    } catch (err) {
      alert("Failed to balance equation or read document OCR.");
    } finally {
      setIsLoadingSolver(false);
    }
  };

  // Simulate scanning via Camera webcam feeds!
  const triggerCameraScan = () => {
    setCameraMode(true);
    setTimeout(async () => {
      // Simulate taking snapshot, running OCR & AI solver
      setIsLoadingSolver(true);
      setCameraMode(false);
      try {
        const dummyFile = new File(["dummy"], "math_paper_scan.png");
        const res = await API.uploadPaper(dummyFile, currentUser.id, explainMode, lengthMode, solverLanguage);
        setOcrSuccessMsg("Scan Successful! Extracted Quadratic Equation");
        setSolveResult(res.solution);
        setTimeout(() => setOcrSuccessMsg(''), 5000);
        loadUserData(currentUser.id);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingSolver(false);
      }
    }, 3000);
  };

  const deleteHistoryItem = async (histId) => {
    try {
      await API.deleteHistory(histId);
      loadUserData(currentUser.id);
      if (solveResult && solveResult.historyId === histId) {
        setSolveResult(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Mock test OMR simulator handlers
  const startTest = (test) => {
    setActiveTest(test);
    setUserAnswers({});
    setTestResult(null);
    setTestTimeLeft(test.duration * 60);
    setTestTimeSpent(0);

    // Launch interval timer
    if (testTimerRef.current) clearInterval(testTimerRef.current);
    testTimerRef.current = setInterval(() => {
      setTestTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(testTimerRef.current);
          submitAnswersAuto();
          return 0;
        }
        setTestTimeSpent(s => s + 1);
        return prev - 1;
      });
    }, 1000);
  };

  const handleSelectOption = (qId, optionIdx) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const submitAnswersAuto = () => {
    // Collect answers and trigger submission
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (testTimerRef.current) clearInterval(testTimerRef.current);
    
    try {
      const evaluation = await API.submitTest(
        currentUser.id, 
        activeTest.id, 
        userAnswers, 
        testTimeSpent || 5
      );
      setTestResult(evaluation);
      loadUserData(currentUser.id);
    } catch (err) {
      console.error(err);
      alert("Failed to grade test.");
    }
  };

  // 5. Notes, shared study formulas and flashcards
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteTitle || !newNoteContent) return;

    try {
      await API.createNote(
        newNoteTitle,
        newNoteSubject,
        'notes',
        newNoteContent,
        [
          { front: `What is the core theme of ${newNoteTitle}?`, back: newNoteContent.substring(0, 100) }
        ],
        '',
        currentUser.id
      );
      setNewNoteTitle('');
      setNewNoteContent('');
      loadUserData(currentUser.id);
      alert("Study note added successfully and shared with classmates! Earned +15 Study Coins! 🪙");
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Forums & peer-chat study lounge
  const handleCreateForumPost = async (e) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) return;

    try {
      await API.createForumPost(
        newPostTitle, 
        newPostContent, 
        currentUser.username, 
        newPostSubject, 
        currentUser.id
      );
      setNewPostTitle('');
      setNewPostContent('');
      loadUserData(currentUser.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplyForumPost = async (postId) => {
    const txt = replyInputs[postId];
    if (!txt || !txt.trim()) return;

    try {
      await API.replyToForumPost(postId, currentUser.username, txt, currentUser.id);
      setReplyInputs(prev => ({ ...prev, [postId]: '' }));
      loadUserData(currentUser.id);
    } catch (err) {
      console.error(err);
    }
  };

  const sendRoomMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const data = await API.sendRoomMessage(selectedRoom.id, currentUser.username, chatMessage);
      setChatMessage('');
      
      // Update selected room messages in UI instantly
      setSelectedRoom(data.updatedRoom);
      
      // Refresh global rooms
      const roomsList = await API.getStudyRooms();
      setStudyRooms(roomsList);
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Pomodoro focus study assistant
  const togglePomoTimer = () => {
    if (pomoIsActive) {
      clearInterval(pomoTimerRef.current);
      setPomoIsActive(false);
    } else {
      setPomoIsActive(true);
      pomoTimerRef.current = setInterval(() => {
        setPomoSeconds(sec => {
          if (sec === 0) {
            setPomoMinutes(min => {
              if (min === 0) {
                // Focus time ended! Toggle Mode
                const nextMode = pomoMode === 'focus' ? 'break' : 'focus';
                setPomoMode(nextMode);
                const nextDuration = nextMode === 'focus' ? 25 : 5;
                setPomoMinutes(nextDuration);
                
                // Reward study coin + update active focus minutes
                if (pomoMode === 'focus') {
                  API.updatePreferences(currentUser.id, { studyTimeMinutes: 25, coins: 10 })
                    .then(prof => {
                      setCurrentUser(prof);
                      alert("⏰ Pomodoro Finished! Fantastic Focus Session! Earned +10 Study Coins! 🪙");
                    });
                }
                
                return nextDuration;
              }
              return min - 1;
            });
            return 59;
          }
          return sec - 1;
        });
      }, 1000);
    }
  };

  const resetPomoTimer = () => {
    clearInterval(pomoTimerRef.current);
    setPomoIsActive(false);
    setPomoMode('focus');
    setPomoMinutes(25);
    setPomoSeconds(0);
  };

  // Formatting utility for time
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Login page if not authenticated
  if (!currentUser) {
    return (
      <div className="auth-container animate-fade" style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        minHeight: '100vh', background: 'radial-gradient(circle at top right, #1e1b4b 0%, #090d16 100%)',
        padding: '20px'
      }}>
        <div className="glass-card" style={{ maxWidth: '440px', width: '100%', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              display: 'inline-flex', padding: '12px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.2) 100%)',
              marginBottom: '15px'
            }}>
              <Brain size={40} className="animate-float" style={{ color: '#06b6d4' }} />
            </div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SmartSolve
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Your Premium AI Board Exam Preparation Companion
            </p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                USERNAME
              </label>
              <input 
                type="text" 
                placeholder="e.g. board_topper" 
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: 'var(--border-glass)',
                  background: 'rgba(30, 41, 59, 0.5)', color: 'white', fontSize: '14px', outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                PASSWORD
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: 'var(--border-glass)',
                  background: 'rgba(30, 41, 59, 0.5)', color: 'white', fontSize: '14px', outline: 'none'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>
              {authMode === 'login' ? 'Sign In to Dashboard' : 'Create Free Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {authMode === 'login' ? (
              <>
                New student?{' '}
                <span onClick={() => setAuthMode('register')} style={{ color: '#06b6d4', cursor: 'pointer', fontWeight: 600 }}>
                  Create an account
                </span>
              </>
            ) : (
              <>
                Already registered?{' '}
                <span onClick={() => setAuthMode('login')} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>
                  Sign in instead
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Master UI View
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* SIDEBAR PANEL */}
      <aside style={{
        width: '280px', borderRight: 'var(--border-glass)', backgroundColor: 'var(--bg-secondary)',
        display: 'flex', flexDirection: 'column', padding: '24px', flexShrink: 0
      }}>
        {/* Branding header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            background: 'var(--accent-gradient)', padding: '8px', borderRadius: '8px', display: 'flex'
          }}>
            <Brain size={24} style={{ color: 'white' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-heading)', tracking: '-0.02em' }}>
            SmartSolve
          </span>
        </div>

        {/* User Card widgets */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
              {currentUser.username[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.username}
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                {currentUser.rankPrediction}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge-streak" style={{ fontSize: '11px', padding: '4px 8px' }}>
              <Flame size={12} /> {currentUser.streak} Day Streak
            </span>
            <span className="badge-coin" style={{ fontSize: '11px', padding: '4px 8px' }}>
              🪙 {currentUser.coins}
            </span>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          {[
            { id: 'home', label: 'Dashboard', icon: Trophy },
            { id: 'subject_explorer', label: 'Subject Explorer', icon: BookOpen },
            { id: 'courses', label: 'Courses & Selection', icon: BookOpen },
            { id: 'live', label: 'Live Classes & Video', icon: Play },
            { id: 'practice_mode', label: 'Smart Practice Mode', icon: Brain },
            { id: 'solver', label: 'AI Doubt Solver', icon: Sparkles },
            { id: 'tests', label: 'Smart Mock Tests', icon: BookMarked },
            { id: 'revision_hub', label: 'Revision Hub', icon: RefreshCw },
            { id: 'papers', label: 'Previous Year Papers', icon: RefreshCw },
            { id: 'notes', label: 'NCERT & PU Notes', icon: BookOpen },
            { id: 'planner', label: 'Study Planner', icon: Clock },
            { id: 'current_affairs', label: 'Current Affairs', icon: Volume2 },
            { id: 'career_guidance', label: 'AI Career Guidance', icon: Trophy },
            { id: 'interview', label: 'AI Interview Prep', icon: Mic },
            { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
            { id: 'history', label: 'Complete History', icon: CheckCircle },
            { id: 'social', label: 'Community & Lounge', icon: Users },
            { id: 'admin', label: 'Admin Panel', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            const isSel = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSolveResult(null);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '12px 16px', borderRadius: '8px', border: 'none',
                  background: isSel ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isSel ? 'white' : 'var(--text-secondary)',
                  fontWeight: isSel ? 700 : 500, fontSize: '14px', textAlign: 'left', cursor: 'pointer'
                }}
              >
                <Icon size={18} style={{ color: isSel ? '#06b6d4' : 'inherit' }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Preferences / Log Out footer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: 'var(--border-glass)', paddingTop: '16px' }}>
          {/* Quick theme & lang selector widget */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              style={{
                background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
              }}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Languages size={12} /> Kannada + English Ready
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '10px 16px', background: 'transparent', border: 'var(--border-glass)',
              borderRadius: '8px', color: 'var(--accent-danger)', fontWeight: 600, fontSize: '13px', cursor: 'pointer'
            }}
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT DISPLAY GRID */}
      <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto', maxHeight: '100vh' }}>
        
        {/* Streak Earned Alert Overlay Modal */}
        {streakEarnedAlert && (
          <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 100, 
            background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '16px 24px',
            borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <Flame size={24} />
            <div>
              <div style={{ fontWeight: 'bold' }}>Daily Streak Extended!</div>
              <div style={{ fontSize: '12px' }}>Streak: {currentUser.streak} days. Earned +10 Study Coins! 🪙</div>
            </div>
            <button onClick={() => setStreakEarnedAlert(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Badge unlock reward modal */}
        {newBadgeAlert && (
          <div style={{
            position: 'fixed', top: '90px', right: '24px', zIndex: 100, 
            background: 'rgba(245, 158, 11, 0.95)', color: 'white', padding: '16px 24px',
            borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <Trophy size={24} />
            <div>
              <div style={{ fontWeight: 'bold' }}>New Achievement Unlocked! 🏅</div>
              <div style={{ fontSize: '12px' }}>Earned: "{newBadgeAlert}" Badge!</div>
            </div>
            <button onClick={() => setNewBadgeAlert('')} style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* ========================================================
            TAB 1: HOME DASHBOARD
            ======================================================== */}
        {activeTab === 'home' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Top Welcome Title Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
                  Hello, {currentUser.username}! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Ready for today's practice? Check your dashboard to see your exam readiness.
                </p>
              </div>

              {/* Pomodoro quick sidebar launcher */}
              <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                <Clock size={20} style={{ color: '#06b6d4' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>POMODORO TIMER</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {pomoMinutes}:{pomoSeconds.toString().padStart(2, '0')}
                  </div>
                </div>
                <button 
                  onClick={togglePomoTimer}
                  className="btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '12px', boxShadow: 'none' }}
                >
                  {pomoIsActive ? 'Pause' : 'Start'}
                </button>
              </div>
            </div>

            {/* Overall stats list widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                  <Brain size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Doubts Solved</div>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>{currentUser.solvedCount || 0}</div>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <BookMarked size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mock Exams Taken</div>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>{currentUser.testsTaken || 0}</div>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Focus Study</div>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>{currentUser.studyTimeMinutes || 0} min</div>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <Trophy size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Exam Rank Grade</div>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>{currentUser.rankPrediction}</div>
                </div>
              </div>
            </div>

            {/* Quick Upload action & Daily Practice card grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              
              {/* Quick Paper OCR Scanner area */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px' }}>📝 Scan & Solve Board Question Paper</h3>
                
                <div style={{
                  border: '2px dashed rgba(99, 102, 241, 0.4)', borderRadius: '12px',
                  padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '16px', background: 'rgba(30, 41, 59, 0.2)', position: 'relative'
                }}>
                  <UploadCloud size={48} style={{ color: '#6366f1' }} />
                  <div>
                    <span style={{ fontWeight: 600 }}>Drag and drop</span> question paper photo, or{' '}
                    <label htmlFor="dashboard-file" style={{ color: '#06b6d4', cursor: 'pointer', fontWeight: 600 }}>browse</label>
                    <input 
                      id="dashboard-file" 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supports JPG, PNG, PDF formats</div>

                  {cameraMode && (
                    <div style={{
                      position: 'absolute', inset: 0, background: '#090d16', borderRadius: '12px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px'
                    }}>
                      <div className="spinner" />
                      <div>Initializing Scan Stream... Please hold question paper flat</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={triggerCameraScan} className="btn-secondary" style={{ flexGrow: 1, justifyContent: 'center' }}>
                    <Camera size={18} /> Camera Scan Paper
                  </button>
                  
                  <button 
                    onClick={() => {
                      setActiveTab('solver');
                      setDoubtText("Solve the quadratic equation x^2 - 6x + 9 = 0");
                    }} 
                    className="btn-primary" 
                    style={{ flexGrow: 1, justifyContent: 'center' }}
                  >
                    Type Doubt Manually <ChevronRight size={16} />
                  </button>
                </div>

                {ocrSuccessMsg && (
                  <div style={{
                    padding: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981', borderRadius: '8px', fontSize: '13px'
                  }}>
                    {ocrSuccessMsg}
                  </div>
                )}
              </div>

              {/* Daily quiz challenge card */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px' }}>🎯 Daily Challenge</h3>
                  <span className="badge-coin" style={{ fontSize: '11px', padding: '2px 8px' }}>+10 🪙</span>
                </div>
                
                <div style={{ fontSize: '13px', background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '8px', minHeight: '130px' }}>
                  <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '6px' }}>MATHEMATICS - CBSE</div>
                  <p style={{ lineHeight: 1.6 }}>
                    What is the discriminant of the quadratic equation 3x² - 2x + 5 = 0, and what does it tell you about the nature of its roots?
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setActiveTab('solver');
                    setDoubtText("Solve the quadratic equation 3x² - 2x + 5 = 0 and explain the nature of roots.");
                  }}
                  className="btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
                >
                  Attempt Challenge
                </button>
              </div>

            </div>

            {/* Recent Scans paper list */}
            <div className="glass-card">
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>📂 Recent Scanned & Solved Papers</h3>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No solved questions yet. Upload your first question paper to see it listed here!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {history.map(item => (
                    <div 
                      key={item.id} 
                      className="glass-card" 
                      style={{ 
                        background: 'rgba(30, 41, 59, 0.3)', padding: '16px', borderRadius: '10px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' 
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '10px', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.subject}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px' }}>
                          {item.title}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button 
                          onClick={() => {
                            setSolveResult({
                              subject: item.subject,
                              answer: item.solution,
                              steps: item.steps || [],
                              diagram: item.diagram,
                              mathSolved: item.mathSolved,
                              mathData: item.mathData
                            });
                            setActiveTab('solver');
                          }} 
                          style={{
                            background: 'transparent', border: 'none', color: '#6366f1',
                            fontWeight: 700, fontSize: '12px', cursor: 'pointer', padding: 0
                          }}
                        >
                          View Full Solution →
                        </button>
                        
                        <button 
                          onClick={() => deleteHistoryItem(item.id)} 
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements & badges gallery footer */}
            <div className="glass-card">
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>🏅 Your Study Badge Showcase</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {(currentUser.badges || []).map((badge, idx) => {
                  let badgeColors = ['rgba(99, 102, 241, 0.1)', '#6366f1'];
                  if (badge.includes('Gladiator') || badge.includes('Master')) {
                    badgeColors = ['rgba(239, 68, 68, 0.1)', '#ef4444'];
                  } else if (badge.includes('Pro') || badge.includes('Performer')) {
                    badgeColors = ['rgba(245, 158, 11, 0.1)', '#f59e0b'];
                  }
                  return (
                    <div 
                      key={idx} 
                      style={{
                        padding: '12px 18px', borderRadius: '50px', background: badgeColors[0],
                        border: `1px solid ${badgeColors[1]}`, color: 'white', display: 'flex', 
                        alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600
                      }}
                    >
                      <Trophy size={16} style={{ color: badgeColors[1] }} />
                      {badge}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: AI QUESTION SOLVER MODULE
            ======================================================== */}
        {activeTab === 'solver' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🤖 Premium AI Question Solver</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Solve complex equations, chemistry balance papers, essay boards, and listen to spoken derivations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Column: Ask inputs */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px' }}>Enter Exam Question</h3>

                {/* Input Text Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea 
                    value={doubtText}
                    onChange={e => setDoubtText(e.target.value)}
                    placeholder="Type a math question (e.g. 2x² - 5x + 3 = 0), biological cycle, chemical equation reaction, or click voice microphone..."
                    style={{
                      height: '140px', padding: '16px', borderRadius: '8px', border: 'var(--border-glass)',
                      background: 'rgba(30, 41, 59, 0.5)', color: 'white', fontSize: '14px', outline: 'none', resize: 'none',
                      lineHeight: '1.6'
                    }}
                  />
                  
                  {/* Voice Speak and speech-to-text control buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      onClick={toggleSpeechRecognition}
                      className={isRecording ? 'btn-primary' : 'btn-secondary'}
                      style={{ 
                        padding: '6px 12px', fontSize: '12px', gap: '6px', 
                        background: isRecording ? '#ef4444' : undefined,
                        boxShadow: isRecording ? '0 0 10px rgba(239, 68, 68, 0.4)' : undefined
                      }}
                    >
                      <Mic size={14} /> {isRecording ? 'Listening (Speak)...' : 'Ask with Voice'}
                    </button>
                    
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Supports Kannada + English queries
                    </span>
                  </div>
                </div>

                {/* AI Configuration Options */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      KANNADA + ENGLISH TRANSLATION
                    </label>
                    <select
                      value={solverLanguage}
                      onChange={e => setSolverLanguage(e.target.value)}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '6px', border: 'var(--border-glass)',
                        background: 'var(--bg-tertiary)', color: 'white', outline: 'none', fontSize: '13px'
                      }}
                    >
                      <option value="english">English ONLY</option>
                      <option value="kannada">Kannada + English (ಕನ್ನಡ)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      TEACHING MODE
                    </label>
                    <select
                      value={explainMode}
                      onChange={e => setExplainMode(e.target.value)}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '6px', border: 'var(--border-glass)',
                        background: 'var(--bg-tertiary)', color: 'white', outline: 'none', fontSize: '13px'
                      }}
                    >
                      <option value="standard">Standard Explanation</option>
                      <option value="teacher">🧑‍🏫 Explain like Teacher (Simple)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      EXAM GRADING FORMAT MODE
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['standard', '2-mark', '10-mark'].map(lMode => (
                        <button
                          key={lMode}
                          onClick={() => setLengthMode(lMode)}
                          style={{
                            flexGrow: 1, padding: '8px', borderRadius: '6px', border: 'var(--border-glass)',
                            background: lengthMode === lMode ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                            color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                          }}
                        >
                          {lMode === 'standard' && 'Standard'}
                          {lMode === '2-mark' && '2-Mark Answer'}
                          {lMode === '10-mark' && '10-Mark (Essay)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleSolve()} 
                  disabled={isLoadingSolver}
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                >
                  {isLoadingSolver ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px' }} />
                      AI Solver Calculating Solution...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Solve with AI Tutor
                    </>
                  )}
                </button>

                <div style={{
                  borderTop: 'var(--border-glass)', paddingTop: '20px',
                  display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Scan & Solve from File</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="file" 
                      id="solver-uploader" 
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="solver-uploader" className="btn-secondary" style={{ flexGrow: 1, justifyContent: 'center', cursor: 'pointer' }}>
                      <UploadCloud size={16} /> Choose Paper File
                    </label>
                    
                    <button onClick={triggerCameraScan} className="btn-secondary" style={{ flexGrow: 1, justifyContent: 'center' }}>
                      <Camera size={16} /> Scan Camera
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Answer Solution panel */}
              <div className="glass-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'var(--border-glass)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} style={{ color: '#06b6d4' }} /> Smart Solution Board
                  </h3>
                  
                  {solveResult && (
                    <button 
                      onClick={() => speakText(solveResult.answer)}
                      className={isSpeaking ? 'btn-primary' : 'btn-secondary'}
                      style={{ 
                        padding: '6px 12px', fontSize: '11px', gap: '6px',
                        background: isSpeaking ? '#ef4444' : undefined 
                      }}
                    >
                      <Volume2 size={14} /> {isSpeaking ? 'Stop Reader' : 'Voice Aloud'}
                    </button>
                  )}
                </div>

                {!solveResult ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    flexGrow: 1, gap: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px'
                  }}>
                    <Brain size={48} className="animate-float" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <h4 style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Awaiting Board Question</h4>
                      <p style={{ fontSize: '13px' }}>Type a math quadratic problem, chemistry paper displacement reaction, or scan an image file to trigger step-by-step solutions!</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Subject badge info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '50px', background: 'rgba(6,182,212,0.15)',
                        color: '#06b6d4', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(6,182,212,0.3)'
                      }}>
                        {solveResult.subject}
                      </span>
                    </div>

                    {/* Rich text Markdown solution */}
                    <div style={{
                      lineHeight: '1.7', fontSize: '14px', color: 'var(--text-primary)',
                      background: 'rgba(30, 41, 59, 0.2)', padding: '16px', borderRadius: '8px',
                      border: 'var(--border-glass)', whiteSpace: 'pre-wrap'
                    }}>
                      {solveResult.answer}
                    </div>

                    {/* Step-by-Step explanation details */}
                    {solveResult.steps && solveResult.steps.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={16} style={{ color: '#10b981' }} /> Step-by-Step Mathematical Derivations:
                        </h4>
                        <div className="step-container">
                          {solveResult.steps.map((step, idx) => (
                            <div key={idx} className="step-card">
                              <div className="step-number">{idx + 1}</div>
                              <div className="step-content">{step}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive diagram canvas (plots or chemistry experiments as SVGs) */}
                    {solveResult.diagram && (
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Info size={16} style={{ color: '#06b6d4' }} /> Equation Curve Plotting & Diagram:
                        </h4>
                        <div 
                          dangerouslySetInnerHTML={{ __html: solveResult.diagram }} 
                          style={{
                            maxWidth: '100%', display: 'flex', justifyContent: 'center',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        />
                      </div>
                    )}

                    {/* New: Video Explanation */}
                    {solveResult.videoExplanation && (
                      <div style={{ marginTop: '10px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Play size={16} style={{ color: '#ef4444' }} /> Concept Video Explanation:
                        </h4>
                        <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
                          <iframe 
                            width="100%" 
                            height="240" 
                            src={solveResult.videoExplanation} 
                            frameBorder="0" 
                            allowFullScreen 
                          />
                        </div>
                      </div>
                    )}

                    {/* New: Similar Questions */}
                    {solveResult.similarQuestions && solveResult.similarQuestions.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Brain size={16} style={{ color: '#8b5cf6' }} /> Similar Questions to Practice:
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {solveResult.similarQuestions.map((sq, idx) => (
                            <button 
                              key={idx} 
                              onClick={() => {
                                setDoubtText(sq);
                                handleSolve(sq);
                              }}
                              style={{ 
                                padding: '10px 16px', background: 'rgba(30, 41, 59, 0.4)', 
                                border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px',
                                color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Q: {sq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New: AI Document Analysis Report (One Click Smart Prep) */}
                    {solveResult.analysisReport && (
                      <div style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4' }}>
                          <BarChart3 size={20} /> AI Document Analysis & Optimization Report
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chapter / Topic</div>
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>{solveResult.analysisReport.chapter}</div>
                          </div>
                          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Difficulty Level</div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: solveResult.analysisReport.difficulty === 'Hard' ? '#ef4444' : '#f59e0b' }}>
                              {solveResult.analysisReport.difficulty}
                            </div>
                          </div>
                          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Predicted Exam Weightage</div>
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>{solveResult.analysisReport.examWeightage}</div>
                          </div>
                          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recommended Study Time</div>
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>{solveResult.analysisReport.studyTime}</div>
                          </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>📌 Important Topics Detected</h5>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {solveResult.analysisReport.importantTopics.map((topic, i) => (
                              <span key={i} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '50px', fontSize: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                ✔ {topic}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>📝 AI Generated Short Notes</h5>
                          <div style={{ background: 'rgba(30, 41, 59, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '13px', borderLeft: '3px solid #8b5cf6', lineHeight: '1.6' }}>
                            {solveResult.analysisReport.shortNotes}
                          </div>
                        </div>

                        <div>
                          <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>🎯 Auto-Generated Practice Quiz</h5>
                          {solveResult.analysisReport.generatedQuiz.map((q, i) => (
                            <div key={i} style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Q: {q.q}</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {q.options.map((opt, j) => (
                                  <div key={j} style={{ background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', border: '1px solid var(--border-glass)' }}>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            NEW TAB: COURSE SELECTION
            ======================================================== */}
        {activeTab === 'courses' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>📚 Course Selection & Difficulty</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Select your path to success. Choose exam, subject, and adapt difficulty dynamically!
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px', alignItems: 'start' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '18px' }}>Selection System</h3>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>EXAM TYPE</label>
                  <select 
                    value={selectedExamType} 
                    onChange={e => setSelectedExamType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'white', border: 'var(--border-glass)' }}
                  >
                    <option value="">-- All Exams --</option>
                    <option value="KCET">KCET</option>
                    <option value="NEET">NEET</option>
                    <option value="JEE">JEE</option>
                    <option value="UPSC">UPSC</option>
                    <option value="SSC">SSC</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>DIFFICULTY LEVEL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Easy', 'Medium', 'Hard'].map(diff => (
                      <button 
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        style={{
                          flex: 1, padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          background: selectedDifficulty === diff ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                          color: 'white', border: 'var(--border-glass)'
                        }}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {coursesList.filter(c => !selectedExamType || c.exam === selectedExamType).map(course => (
                    <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', background: 'rgba(99,102,241,0.2)', padding: '4px 8px', borderRadius: '4px', color: '#8b5cf6', fontWeight: 'bold' }}>{course.exam}</span>
                        <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.2)', padding: '4px 8px', borderRadius: '4px', color: '#10b981', fontWeight: 'bold' }}>{course.difficulty}</span>
                      </div>
                      <h4 style={{ fontSize: '18px', fontWeight: 600 }}>{course.subject} Module</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Interactive path specifically curated for {course.exam} with {selectedDifficulty} adaptability.</p>
                      <button className="btn-primary" style={{ marginTop: 'auto', justifyContent: 'center' }}>Enroll / Continue</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            NEW TAB: LIVE CLASSES & VIDEOS
            ======================================================== */}
        {activeTab === 'live' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🔴 Live Classes & Videos</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Attend live interactive sessions, engage in group discussions, and watch curated lectures.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {liveClassesList.map(lc => (
                <div key={lc.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: lc.status === 'Ongoing' ? '4px solid #ef4444' : '4px solid #06b6d4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lc.batch}</span>
                    {lc.status === 'Ongoing' ? (
                      <span className="badge-streak" style={{ fontSize: '10px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', display: 'inline-block' }} /> LIVE NOW
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: 600 }}>{new Date(lc.scheduledAt).toLocaleString()}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '18px' }}>{lc.title}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} /> By {lc.instructor}
                  </div>
                  <button className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>
                    {lc.status === 'Ongoing' ? 'Join Live Room' : 'Set Reminder'}
                  </button>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '20px', marginTop: '20px' }}>📺 Video Lectures</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {videoLecturesList.map(vl => (
                <div key={vl.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <iframe 
                    width="100%" 
                    height="180" 
                    src={vl.videoUrl} 
                    title={vl.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen 
                  />
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>{vl.subject}</div>
                    <h4 style={{ fontSize: '15px' }}>{vl.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            NEW TAB: COMPLETE HISTORY
            ======================================================== */}
        {activeTab === 'history' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🕰️ Complete Class History</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your complete learning timeline including videos watched, tests taken, and AI solver history.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Play size={18} /> Videos Watched</h3>
              {fullHistory.videosWatched && fullHistory.videosWatched.length > 0 ? (
                fullHistory.videosWatched.map(v => (
                  <div key={v.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px' }}>{v.title}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Watched on: {new Date(v.date).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No video history found.</div>
              )}

              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}><BookMarked size={18} /> Mock Test History</h3>
              {fullHistory.tests && fullHistory.tests.length > 0 ? (
                fullHistory.tests.map(t => (
                  <div key={t.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px' }}>{t.testTitle}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Score: {t.score}% | Date: {new Date(t.date).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No mock tests taken yet.</div>
              )}

              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}><Brain size={18} /> Solved Questions History</h3>
              {fullHistory.scans && fullHistory.scans.length > 0 ? (
                fullHistory.scans.map(s => (
                  <div key={s.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px' }}>{s.title}</h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Subject: {s.subject} | Date: {new Date(s.date).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No questions solved yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            NEW TAB: SUBJECT EXPLORER
            ======================================================== */}
        {activeTab === 'subject_explorer' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {!activeSubjectView ? (
              // ----------------------------------------------------
              // 1. ALL SUBJECTS LIST VIEW
              // ----------------------------------------------------
              <>
                <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
                  <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>📚 Subject Explorer</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Browse our complete library of subjects across School, Board, Government, and Entrance exams.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>School & PU Subjects</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Kannada', 'Economics', 'Accountancy'].map(sub => (
                        <div 
                          key={sub} 
                          onClick={() => setActiveSubjectView(sub)}
                          className="glass-card" 
                          style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <BookOpen size={20} style={{ color: '#06b6d4' }} /> <span style={{ fontWeight: 600 }}>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Government Exams (UPSC / SSC / Banking)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {['General Knowledge', 'Current Affairs', 'Reasoning', 'Quantitative Aptitude', 'English Grammar', 'Indian Polity', 'History'].map(sub => (
                        <div 
                          key={sub} 
                          onClick={() => setActiveSubjectView(sub)}
                          className="glass-card" 
                          style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <Users size={20} style={{ color: '#8b5cf6' }} /> <span style={{ fontWeight: 600 }}>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // ----------------------------------------------------
              // 2. DETAILED INDIVIDUAL SUBJECT DASHBOARD VIEW
              // ----------------------------------------------------
              <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Header Banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', border: '1px solid rgba(6,182,212,0.3)' }}>
                  <button 
                    onClick={() => setActiveSubjectView(null)}
                    style={{ background: 'rgba(30, 41, 59, 0.6)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    ← Back
                  </button>
                  <div style={{ flexGrow: 1 }}>
                    <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>{activeSubjectView} Masterclass</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Complete curriculum, notes, videos, and AI tutoring for {activeSubjectView}.</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completion</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>24%</div>
                  </div>
                </div>

                {/* AI Tutor Callout */}
                <div style={{ display: 'flex', gap: '16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '20px', borderRadius: '12px', alignItems: 'center' }}>
                  <div style={{ background: '#6366f1', padding: '12px', borderRadius: '50%' }}><Brain size={24} color="white" /></div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#818cf8', marginBottom: '4px' }}>AI Subject Tutor Message:</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {activeSubjectView === 'Physics' ? "I noticed your accuracy dropped in Kinematics. Let's revise Motion in 1D today." :
                       activeSubjectView === 'Mathematics' ? "Your weak topic is Definite Integrals. Try a quick 10-minute revision quiz!" :
                       activeSubjectView === 'Chemistry' ? "Great job on Organic Chemistry! Today, let's focus on balancing equations." :
                       `Welcome back to ${activeSubjectView}! Let's tackle your daily learning goals.`}
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('tests')} className="btn-primary" style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '13px' }}>Start Quiz</button>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {[
                    { label: 'Scan Question', icon: Camera, color: '#06b6d4', tab: 'solver' },
                    { label: 'Watch Videos', icon: Play, color: '#ef4444', tab: 'live' },
                    { label: 'Take Quiz', icon: BookMarked, color: '#10b981', tab: 'tests' },
                    { label: 'Open Notes', icon: BookOpen, color: '#f59e0b', tab: 'notes' },
                    { label: 'Ask AI Doubt', icon: Sparkles, color: '#8b5cf6', tab: 'solver' }
                  ].map((action, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveTab(action.tab)}
                      style={{ 
                      flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', 
                      background: 'rgba(30, 41, 59, 0.6)', border: `1px solid ${action.color}40`, 
                      padding: '12px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'transform 0.1s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <action.icon size={16} color={action.color} /> {action.label}
                    </button>
                  ))}
                </div>

                {/* Two Column Layout for Chapters & Progress */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                  
                  {/* Left Column: Chapters & Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>Curriculum Chapters</h3>
                    
                    {[
                      { id: 1, name: '1. Basics & Fundamentals', status: 'Completed', videos: 4, tests: 2 },
                      { id: 2, name: '2. Core Principles & Laws', status: 'In Progress', videos: 3, tests: 0 },
                      { id: 3, name: '3. Advanced Applications', status: 'Locked', videos: 5, tests: 1 },
                      { id: 4, name: '4. Expert Level Problems', status: 'Locked', videos: 2, tests: 3 }
                    ].map((chap, i) => (
                      <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: chap.status === 'Locked' ? 0.6 : 1 }}>
                        <div 
                          onClick={() => {
                            if (chap.status !== 'Locked') {
                              setExpandedChapter(expandedChapter === chap.id ? null : chap.id);
                            } else {
                              alert("This chapter is currently locked! Complete the previous modules first.");
                            }
                          }}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: chap.status === 'Locked' ? 'not-allowed' : 'pointer' }}
                        >
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, color: chap.status === 'Locked' ? 'var(--text-muted)' : 'white' }}>{chap.name}</h4>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                              <span>📺 {chap.videos} Videos</span>
                              <span>📝 {chap.tests} Mock Tests</span>
                              <span style={{ color: chap.status === 'Completed' ? '#10b981' : chap.status === 'In Progress' ? '#f59e0b' : 'var(--text-muted)' }}>
                                • {chap.status}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={20} style={{ color: 'var(--text-muted)', transform: expandedChapter === chap.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                        
                        {/* Expandable Learning Flow */}
                        {expandedChapter === chap.id && (
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <button onClick={() => setActiveTab('live')} style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <Play size={14} /> Watch Videos
                            </button>
                            <button onClick={() => setActiveTab('notes')} style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <BookOpen size={14} /> Read Notes
                            </button>
                            <button onClick={() => setActiveTab('tests')} style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <BookMarked size={14} /> Practice Quiz
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Right Column: AI Analytics & Progress Tracker */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card">
                      <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Performance Analytics</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Accuracy %</span>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>78%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Time Spent</span>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>12h 45m</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Chapters Completed</span>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>1 / 14</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#ef4444' }}>Weak Topics</h3>
                      <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>Complex Formulas</li>
                        <li>Theoretical Derivations</li>
                      </ul>
                    </div>

                    <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#10b981' }}>Strong Topics</h3>
                      <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>Basic Definitions</li>
                        <li>Multiple Choice Basics</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            NEW TAB: SMART PRACTICE MODE
            ======================================================== */}
        {activeTab === 'practice_mode' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🧠 Smart Practice Mode</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Customize your practice sessions. AI will generate tests tailored exactly to your parameters.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SELECT SUBJECT</label>
                <select style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'white', border: 'var(--border-glass)' }}>
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>General Knowledge</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>EXAM MODE</label>
                <select style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'white', border: 'var(--border-glass)' }}>
                  <option>KCET Mode</option>
                  <option>NEET Mode</option>
                  <option>UPSC Mode</option>
                  <option>Banking Mode</option>
                  <option>PU Board Mode</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>DIFFICULTY & TIME LIMIT</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <select style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'white', border: 'var(--border-glass)' }}>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Expert</option>
                  </select>
                  <select style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'white', border: 'var(--border-glass)' }}>
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>60 Minutes</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary" style={{ justifyContent: 'center', padding: '14px', marginTop: '10px' }}>
                Generate Custom AI Test
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            NEW TAB: REVISION HUB
            ======================================================== */}
        {activeTab === 'revision_hub' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>⚡ Revision Hub</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Quick notes, formula sheets, and flashcards to supercharge your final revisions.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Flashcards', desc: 'Memorize key definitions instantly.', icon: BookMarked, color: '#ef4444' },
                { title: 'Quick Notes', desc: 'Summary of chapters in 2 pages.', icon: BookOpen, color: '#f59e0b' },
                { title: 'Formula Sheets', desc: 'All Math & Physics formulas.', icon: Info, color: '#06b6d4' },
                { title: 'One-Shot Videos', desc: 'Revise entire chapters in 1 hour.', icon: Play, color: '#8b5cf6' },
                { title: 'Mind Maps', desc: 'Visual connections of concepts.', icon: Brain, color: '#10b981' }
              ].map(item => (
                <div key={item.title} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}>
                  <div style={{ background: `rgba(${parseInt(item.color.slice(1,3),16)}, ${parseInt(item.color.slice(3,5),16)}, ${parseInt(item.color.slice(5,7),16)}, 0.15)`, color: item.color, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                    <item.icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '18px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            NEW TAB: AI CAREER GUIDANCE
            ======================================================== */}
        {activeTab === 'career_guidance' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🎯 AI Career Guidance</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Get personalized college recommendations, rank predictions, and career roadmaps based on your performance.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Your Predicted Trajectory</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated KCET Rank</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>Top 5,000</div>
                  </div>
                  <Trophy size={32} style={{ color: '#10b981', opacity: 0.8 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated NEET Score</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>580 - 620</div>
                  </div>
                  <Brain size={32} style={{ color: '#06b6d4', opacity: 0.8 }} />
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Top College Recommendations</h3>
                {[
                  { name: 'RV College of Engineering', branch: 'Computer Science', chance: 'High' },
                  { name: 'BMS College of Engineering', branch: 'Information Science', chance: 'Very High' },
                  { name: 'Bangalore Medical College', branch: 'MBBS', chance: 'Moderate' },
                ].map((college, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{college.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{college.branch}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: college.chance === 'High' || college.chance === 'Very High' ? '#10b981' : '#f59e0b', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                      {college.chance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: MOCK TEST SECTION (OMR Sheet & Timed tests)
            ======================================================== */}
        {activeTab === 'tests' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>📝 Mock Test Section</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Take timed practice, evaluate instantly, predict your rank, and clear out weak topics.
              </p>
            </div>

            {/* Case 1: Taking live timed test */}
            {activeTest && !testResult && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'var(--border-glass)', paddingBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                      {activeTest.subject} EXAM IN PROGRESS
                    </span>
                    <h2 style={{ fontSize: '20px' }}>{activeTest.title}</h2>
                  </div>

                  {/* Timer widget */}
                  <div style={{
                    padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', borderRadius: '8px', fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold'
                  }}>
                    ⏱️ {formatTime(testTimeLeft)}
                  </div>
                </div>

                {/* List of MCQ questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {activeTest.questions.map((q, qIdx) => (
                    <div key={q.id} style={{ background: 'rgba(30, 41, 59, 0.2)', padding: '20px', borderRadius: '10px', border: 'var(--border-glass)' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '14px', lineHeight: 1.6 }}>
                        Q{qIdx + 1}. {q.question}
                      </h4>
                      
                      {/* Grid options selection */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {q.options.map((opt, optIdx) => {
                          const isSel = userAnswers[q.id] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              style={{
                                padding: '12px 16px', borderRadius: '8px', border: 'var(--border-glass)',
                                background: isSel ? 'var(--accent-gradient)' : 'rgba(30, 41, 59, 0.5)',
                                color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: '13px',
                                fontWeight: isSel ? 600 : 400, transition: 'all 0.15s ease'
                              }}
                            >
                              <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: 'var(--border-glass)', paddingTop: '20px' }}>
                  <button 
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel the exam? Progress will not be saved.")) {
                        setActiveTest(null);
                        clearInterval(testTimerRef.current);
                      }
                    }} 
                    className="btn-secondary"
                  >
                    Cancel Exam
                  </button>
                  <button onClick={handleSubmitTest} className="btn-primary">
                    Submit Answer OMR Sheet
                  </button>
                </div>
              </div>
            )}

            {/* Case 2: Post Exam Evaluation Result board */}
            {testResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '40px' }}>
                  
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%', background: testResult.score >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: testResult.score >= 70 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', fontWeight: 'bold', margin: '0 auto'
                  }}>
                    {testResult.score}%
                  </div>

                  <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>
                      {testResult.score >= 80 ? '🎉 Centum Level Performance!' : '👍 Good Attempt! Practice makes Perfect.'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Correct: **{testResult.correctCount} / {testResult.totalQuestions}** questions | Duration: **{Math.round(testResult.timeSpentSeconds)} seconds**
                    </p>
                  </div>

                  {testResult.weakTopics.length > 0 && (
                    <div style={{
                      maxWidth: '500px', margin: '0 auto', padding: '16px',
                      background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: '8px', color: 'var(--accent-warning)', fontSize: '13px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <AlertTriangle size={16} /> Flagged Weak Topics Detected:
                      </div>
                      <div>We recommend revising: {testResult.weakTopics.join(', ')} before your board exam!</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '10px' }}>
                    <button 
                      onClick={() => {
                        setActiveTest(null);
                        setTestResult(null);
                      }} 
                      className="btn-secondary"
                    >
                      Back to Exams Lobby
                    </button>
                    
                    <button 
                      onClick={() => {
                        setActiveTab('analytics');
                        setTestResult(null);
                        setActiveTest(null);
                      }} 
                      className="btn-primary"
                    >
                      Check Rank Progress <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Review detailed answers list */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>📋 Detailed OMR Question Audit Review</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {testResult.detailedResults.map((resItem, idx) => (
                      <div 
                        key={resItem.questionId} 
                        style={{
                          padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${resItem.isCorrect ? '#10b981' : '#ef4444'}`,
                          background: 'rgba(30, 41, 59, 0.2)'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                          {resItem.isCorrect ? <CheckCircle size={16} style={{ color: '#10b981' }} /> : <XCircle size={16} style={{ color: '#ef4444' }} />}
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>Question {idx + 1}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'white', marginBottom: '12px' }}>{resItem.question}</p>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', marginBottom: '12px' }}>
                          <div>Your Choice: <span style={{ fontWeight: 'bold', color: resItem.isCorrect ? '#10b981' : '#ef4444' }}>{resItem.userAnswer}</span></div>
                          <div>Correct Answer: <span style={{ fontWeight: 'bold', color: '#10b981' }}>{resItem.correctAnswer}</span></div>
                        </div>

                        <div style={{
                          padding: '10px 14px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '6px',
                          fontSize: '12px', color: 'var(--text-secondary)', border: 'var(--border-glass)'
                        }}>
                          <strong>Explanation:</strong> {resItem.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Case 3: Test selector lobby */}
            {!activeTest && !testResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '20px' }}>Select Timed Board Examination</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {mockTests.map(test => (
                    <div key={test.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '50px', background: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1', fontSize: '11px', fontWeight: 700, border: '1px solid rgba(99, 102, 241, 0.2)'
                          }}>
                            {test.subject}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {test.duration} min
                          </span>
                        </div>

                        <h3 style={{ fontSize: '16px', color: 'white', marginBottom: '8px' }}>{test.title}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          Total questions: **{test.questions.length}** | Formats: Multiple Choice Questions (MCQ) OMR grading.
                        </p>
                      </div>

                      <button onClick={() => startTest(test)} className="btn-primary" style={{ justifyContent: 'center' }}>
                        Launch Practice Test <Play size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 4: NOTES & STUDY MATERIALS (Flashcards + PDF notes)
            ======================================================== */}
        {activeTab === 'notes' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>📚 Study Center</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Master formulas, flip concepts flashcards, play embedded tutoring videos, and upload notes.
              </p>
            </div>

            {/* Note Sub-Categories Selection tabs */}
            <div style={{ display: 'flex', borderBottom: 'var(--border-glass)', gap: '16px' }}>
              {[
                { id: 'formulas', label: 'Important Formula Sheets' },
                { id: 'notes', label: 'Conceptual Summaries' },
                { id: 'flashcards', label: 'Interactive Flashcards' },
                { id: 'stress', label: 'Exam Stress Management Tips' },
              ].map(subT => (
                <button
                  key={subT.id}
                  onClick={() => {
                    setActiveNoteTab(subT.id);
                    setSelectedNote(null);
                  }}
                  style={{
                    padding: '12px 16px', background: 'transparent', border: 'none',
                    color: activeNoteTab === subT.id ? 'white' : 'var(--text-secondary)',
                    borderBottom: activeNoteTab === subT.id ? '2px solid #06b6d4' : 'none',
                    fontWeight: activeNoteTab === subT.id ? 700 : 500, cursor: 'pointer', fontSize: '14px'
                  }}
                >
                  {subT.label}
                </button>
              ))}
            </div>

            {/* Formula Sheets & Conceptual Notes rendering */}
            {(activeNoteTab === 'formulas' || activeNoteTab === 'notes') && !selectedNote && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {notes.filter(n => n.category === (activeNoteTab === 'formulas' ? 'formulas' : 'notes')).map(note => (
                  <div key={note.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ color: '#06b6d4', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                        {note.subject}
                      </div>
                      <h3 style={{ fontSize: '16px', color: 'white', marginBottom: '8px' }}>{note.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {note.content}
                      </p>
                    </div>

                    <button 
                      onClick={() => setSelectedNote(note)}
                      className="btn-secondary" 
                      style={{ justifyContent: 'center', fontSize: '13px' }}
                    >
                      Open Document Reader
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Opened study note reader */}
            {selectedNote && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'var(--border-glass)', paddingBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#06b6d4', fontWeight: 700 }}>
                      {selectedNote.subject} DOCUMENT READER
                    </span>
                    <h2 style={{ fontSize: '20px' }}>{selectedNote.title}</h2>
                  </div>
                  <button onClick={() => setSelectedNote(null)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Back to Catalog
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '30px' }}>
                  {/* Left: MD document */}
                  <div style={{
                    lineHeight: '1.8', fontSize: '14px', color: 'var(--text-primary)',
                    background: 'rgba(30, 41, 59, 0.4)', padding: '24px', borderRadius: '12px',
                    border: 'var(--border-glass)', whiteSpace: 'pre-wrap'
                  }}>
                    {selectedNote.content}
                  </div>

                  {/* Right: Embedded tutoring video frame */}
                  {selectedNote.videoUrl ? (
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600 }}>🎓 Conceptual Video Tutorial</h4>
                      <div style={{
                        position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0,
                        borderRadius: '8px', overflow: 'hidden', border: 'var(--border-glass)'
                      }}>
                        <iframe 
                          src={selectedNote.videoUrl} 
                          title={selectedNote.title} 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Classroom explainer by expert board educators.</div>
                    </div>
                  ) : (
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '30px' }}>
                      <Info size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No video uploaded for this note catalog yet.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Concept Flashcards Tab */}
            {activeNoteTab === 'flashcards' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', margin: '20px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>📚 Interactive Board Exam Flashcards</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Click on the card below to flip and see the formulas answers.</p>
                </div>

                {/* Animated flashcard 3D structure */}
                <div 
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  style={{
                    perspective: '1000px', cursor: 'pointer', width: '380px', height: '220px'
                  }}
                >
                  <div style={{
                    position: 'relative', width: '100%', height: '100%', textAlign: 'center',
                    transition: 'transform 0.6s', transformStyle: 'preserve-3d',
                    transform: flashcardFlipped ? 'rotateY(180deg)' : 'none'
                  }}>
                    
                    {/* Front side */}
                    <div style={{
                      position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '16px',
                      border: '1px solid rgba(99, 102, 241, 0.4)', padding: '24px', display: 'flex',
                      flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <Brain size={28} style={{ color: '#06b6d4' }} />
                      <h4 style={{ fontSize: '18px', color: 'white', lineHeight: '1.5' }}>
                        {flashcardIndex === 0 ? "What are the roots of y = x² - 4x + 4?" : 
                         flashcardIndex === 1 ? "Write the sum and product formulas of quadratic roots" :
                         "What represents a double displacement reaction?"}
                      </h4>
                      <span style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700 }}>CLICK TO REVEAL ANSWER</span>
                    </div>

                    {/* Back side */}
                    <div style={{
                      position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)', borderRadius: '16px',
                      border: '1px solid #10b981', padding: '24px', display: 'flex',
                      flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px',
                      boxShadow: 'var(--shadow-md)', transform: 'rotateY(180deg)'
                    }}>
                      <CheckCircle size={28} style={{ color: '#10b981' }} />
                      <h4 style={{ fontSize: '18px', color: 'white', lineHeight: '1.5' }}>
                        {flashcardIndex === 0 ? "x = 2 (Real and Equal roots)" :
                         flashcardIndex === 1 ? "Sum: α + β = -b/a | Product: α · β = c/a" :
                         "Exchange of ions, e.g., Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl"}
                      </h4>
                      <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>CORRECT ANSWER</span>
                    </div>

                  </div>
                </div>

                {/* Flip controllers */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => {
                      setFlashcardFlipped(false);
                      setFlashcardIndex(prev => Math.max(0, prev - 1));
                    }} 
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => {
                      setFlashcardFlipped(false);
                      setFlashcardIndex(prev => Math.min(2, prev + 1));
                    }} 
                    className="btn-secondary"
                  >
                    Next Card
                  </button>
                </div>
              </div>
            )}

            {/* Exam Stress Tips Tab */}
            {activeNoteTab === 'stress' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                  <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smile size={20} style={{ color: '#f59e0b' }} /> Stress Busting Tips for Board Exams
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    High academic pressure can trigger exam anxiety. Follow these quick methods designed by child psychologists to maintain focus and stay calm.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="glass-card">
                    <h4 style={{ color: 'white', fontSize: '15px', marginBottom: '8px' }}>⏰ 1. Use the Pomodoro Routine</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Don't study for 4 hours straight. Study for **25 minutes** using our Pomodoro tab, then take a **5-minute screen-free break** to stretch or drink water. This maintains peak neuro-retention!
                    </p>
                  </div>

                  <div className="glass-card">
                    <h4 style={{ color: 'white', fontSize: '15px', marginBottom: '8px' }}>🧘 2. Deep Square Breathing</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Before opening the question paper, inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, and pause for 4 seconds. This physically slows down stress adrenaline!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Note Contributor Box Form */}
            <div className="glass-card" style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} style={{ color: '#06b6d4' }} /> Share Your Short Notes with Classmates
              </h3>
              
              <form onSubmit={handleCreateNote} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      NOTE TITLE
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. CBSE Class 10 Balancing Chemical Equations" 
                      value={newNoteTitle}
                      onChange={e => setNewNoteTitle(e.target.value)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '8px', border: 'var(--border-glass)',
                        background: 'rgba(30, 41, 59, 0.5)', color: 'white', fontSize: '14px', outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      SUBJECT
                    </label>
                    <select
                      value={newNoteSubject}
                      onChange={e => setNewNoteSubject(e.target.value)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '8px', border: 'var(--border-glass)',
                        background: 'var(--bg-tertiary)', color: 'white', fontSize: '14px', outline: 'none'
                      }}
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science (Chemistry)">Science (Chemistry)</option>
                      <option value="Science (Physics)">Science (Physics)</option>
                      <option value="Science (Biology)">Science (Biology)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    NOTE CONTENT (Markdown Supported)
                  </label>
                  <textarea 
                    placeholder="Write formula derivations, summaries, or important tips..." 
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    style={{
                      width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: 'var(--border-glass)',
                      background: 'rgba(30, 41, 59, 0.5)', color: 'white', fontSize: '14px', outline: 'none', resize: 'none'
                    }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Publish & Share Note
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 5: PERFORMANCE ANALYTICS (Recharts visualization)
            ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>📊 Performance Analytics</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Track marks curves, check strengths accuracy, and visualize Pomodoro focus habits.
              </p>
            </div>

            {/* Top widgets layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
              
              {/* Area Chart: Score progress */}
              <div className="glass-card" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '16px' }}>📈 Board Mock Test Marks Progress</h3>
                
                <div style={{ width: '100%', height: '240px' }}>
                  <ResponsiveContainer>
                    <AreaChart data={analyticsData.marksHistory}>
                      <defs>
                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weak topics deficiency display */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '16px' }}>⚠️ Deficiency Levels in Weak Topics</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', flexGrow: 1 }}>
                  {analyticsData.weakTopics.map((topic, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span>{topic.name}</span>
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{topic.level}% deficiency</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '50px', overflow: 'hidden' }}>
                        <div style={{ width: `${topic.level}%`, height: '100%', background: '#ef4444', borderRadius: '50px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom charts layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              
              {/* Bar Chart: Subject Accuracy */}
              <div className="glass-card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '16px' }}>🎯 Average Accuracy by Subject</h3>
                
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer>
                    <BarChart data={analyticsData.subjectAccuracy}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="subject" stroke="#64748b" />
                      <YAxis stroke="#64748b" domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Bar dataKey="accuracy" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                        {analyticsData.subjectAccuracy.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#06b6d4'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic board rank progression tracking */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justify: 'space-between', gap: '16px' }}>
                <h3 style={{ fontSize: '16px' }}>🏆 predicted Board Rank Progress</h3>
                
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(30,41,59,0.3)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>CURRENT LEVEL RANK</div>
                  <div style={{ fontSize: '28px', color: '#f59e0b', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                    {currentUser.rankPrediction}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
                    Your rank is calculated using timed OMR score percentages and frequency. Reach **"Rank Holder (Legend)"** by taking at least 3 mock exams with score averages &gt; 85%!
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                    <span>Aspirant</span>
                    <span>Rising Star</span>
                    <span>Scholar (Distinction)</span>
                    <span>Legend</span>
                  </div>
                  
                  <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '50px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: currentUser.rankPrediction.includes('Legend') ? '100%' : 
                             currentUser.rankPrediction.includes('Scholar') ? '75%' : 
                             currentUser.rankPrediction.includes('Rising') ? '45%' : '15%', 
                      height: '100%', background: 'var(--accent-gradient)', borderRadius: '50px' 
                    }} />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            TAB 6: CLASSROOM LOUNGE (Live Forums, Peer Chat Rooms, Pomodoro Timer)
            ======================================================== */}
        {activeTab === 'social' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🏫 Classroom Lounge</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Chat in group study rooms, view friendly leaderboards, and ask doubts in discussion forums.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Left Column: Peer Leaderboard & Rooms list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                {/* 1. Global student leaderboard */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={18} style={{ color: '#f59e0b' }} /> Friend Leaderboard
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {leaderboard.map((student, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          display: 'flex', alignItems: 'center', justify: 'space-between',
                          padding: '10px 14px', borderRadius: '8px', background: student.username === currentUser.username ? 'rgba(99,102,241,0.15)' : 'rgba(30,41,59,0.3)',
                          border: student.username === currentUser.username ? '1px solid #6366f1' : 'var(--border-glass)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : '#b45309' }}>
                            #{idx + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{student.username}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{student.rankPrediction}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge-streak" style={{ fontSize: '9px', padding: '2px 6px' }}>🔥 {student.streak}</span>
                          <span className="badge-coin" style={{ fontSize: '9px', padding: '2px 6px' }}>🪙 {student.coins}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Group Study Rooms list */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🗣️ Group Study Rooms</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {studyRooms.map(room => {
                      const isSel = selectedRoom && selectedRoom.id === room.id;
                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          style={{
                            padding: '12px 16px', borderRadius: '8px', border: 'var(--border-glass)',
                            background: isSel ? 'rgba(6, 182, 212, 0.15)' : 'rgba(30,41,59,0.3)',
                            color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center', width: '100%'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{room.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Subject: {room.subject}</div>
                          </div>
                          <span style={{
                            padding: '2px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: '50px',
                            fontSize: '10px', color: '#06b6d4', fontWeight: 'bold'
                          }}>
                            ● {room.activeUsers} online
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Active forum discussion or Group room chat */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                {/* 1. Group Chat module panel */}
                {selectedRoom && (
                  <div className="glass-card" style={{ height: '420px', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                    <div style={{ borderBottom: 'var(--border-glass)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '15px', color: 'white' }}>💬 Live Chat: {selectedRoom.name}</h4>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Classmates Active</span>
                    </div>

                    {/* Chat Messages scroll area */}
                    <div style={{
                      flexGrow: 1, overflowY: 'auto', padding: '16px 0',
                      display: 'flex', flexDirection: 'column', gap: '12px'
                    }}>
                      {(selectedRoom.messages || []).map((msg, idx) => {
                        const isMe = msg.author === currentUser.username;
                        return (
                          <div 
                            key={idx} 
                            style={{
                              alignSelf: isMe ? 'flex-end' : 'flex-start',
                              maxWidth: '75%', display: 'flex', flexDirection: 'column',
                              alignItems: isMe ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                              {msg.author} • {msg.time}
                            </span>
                            <div style={{
                              padding: '10px 14px', borderRadius: '12px',
                              background: isMe ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                              color: 'white', fontSize: '13px', lineHeight: 1.5,
                              borderTopRightRadius: isMe ? '2px' : '12px',
                              borderTopLeftRadius: isMe ? '12px' : '2px'
                            }}>
                              {msg.content}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Text input form */}
                    <form onSubmit={sendRoomMessage} style={{ display: 'flex', gap: '10px', borderTop: 'var(--border-glass)', paddingTop: '12px' }}>
                      <input 
                        type="text" 
                        placeholder="Ask a classmate or say hello (e.g. hello, quadratic, stress)..." 
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        style={{
                          flexGrow: 1, padding: '10px 14px', borderRadius: '8px', border: 'var(--border-glass)',
                          background: 'rgba(30, 41, 59, 0.5)', color: 'white', fontSize: '13px', outline: 'none'
                        }}
                      />
                      <button type="submit" className="btn-primary" style={{ padding: '10px 18px', boxShadow: 'none' }}>
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}

                {/* 2. Discussion Forum board list */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={20} style={{ color: '#6366f1' }} /> Discussion Board Forum
                  </h3>

                  {/* Forum post creation form */}
                  <form onSubmit={handleCreateForumPost} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: 'var(--border-glass)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="What doubt are you having today?" 
                        value={newPostTitle}
                        onChange={e => setNewPostTitle(e.target.value)}
                        style={{
                          padding: '10px', borderRadius: '6px', border: 'var(--border-glass)',
                          background: 'rgba(30,41,59,0.3)', color: 'white', fontSize: '13px', outline: 'none'
                        }}
                      />
                      <select
                        value={newPostSubject}
                        onChange={e => setNewPostSubject(e.target.value)}
                        style={{
                          padding: '10px', borderRadius: '6px', border: 'var(--border-glass)',
                          background: 'var(--bg-tertiary)', color: 'white', fontSize: '13px', outline: 'none'
                        }}
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">General Study</option>
                      </select>
                    </div>

                    <textarea 
                      placeholder="Add detailed explanation of the question or doubt..." 
                      value={newPostContent}
                      onChange={e => setNewPostContent(e.target.value)}
                      style={{
                        height: '60px', padding: '10px', borderRadius: '6px', border: 'var(--border-glass)',
                        background: 'rgba(30,41,59,0.3)', color: 'white', fontSize: '13px', outline: 'none', resize: 'none'
                      }}
                    />

                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '12px' }}>
                      Publish Question doubt
                    </button>
                  </form>

                  {/* Thread list display */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {forumPosts.map(post => (
                      <div key={post.id} style={{ padding: '16px', borderRadius: '8px', background: 'rgba(30,41,59,0.2)', border: 'var(--border-glass)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700 }}>{post.subject}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>by {post.author}</span>
                        </div>

                        <h4 style={{ fontSize: '14px', color: 'white', marginBottom: '6px' }}>{post.title}</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
                          {post.content}
                        </p>

                        {/* Comment replies lists */}
                        {post.replies && post.replies.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px', borderLeft: '2px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
                            {post.replies.map((rep, rIdx) => (
                              <div key={rIdx} style={{ fontSize: '12px', background: 'rgba(30,41,59,0.5)', padding: '8px 12px', borderRadius: '6px' }}>
                                <span style={{ fontWeight: 'bold', color: '#06b6d4' }}>{rep.author}</span>: {rep.content}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add comment input */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            placeholder="Add helpful answer or reply..." 
                            value={replyInputs[post.id] || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setReplyInputs(prev => ({ ...prev, [post.id]: val }));
                            }}
                            style={{
                              flexGrow: 1, padding: '8px 12px', borderRadius: '6px', border: 'var(--border-glass)',
                              background: 'rgba(30,41,59,0.5)', color: 'white', fontSize: '12px', outline: 'none'
                            }}
                          />
                          <button 
                            onClick={() => handleReplyForumPost(post.id)}
                            className="btn-secondary" 
                            style={{ padding: '8px 12px', fontSize: '12px' }}
                          >
                            Reply
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            TAB: GOVERNMENT EXAMS (KCET, NEET, UPSC)
            ======================================================== */}
        {activeTab === 'exams' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ fontSize: '32px' }}>🏛️ Government Exams Prep</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '-20px' }}>Access specialized curriculum for competitive entrance and government recruitment exams.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {['KCET (Karnataka CET)', 'NEET UG', 'JEE Mains', 'UPSC Prelims', 'KPSC', 'SSC CGL', 'NDA / Defense'].map(exam => (
                <div key={exam} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
                    <BookOpen size={48} style={{ color: '#06b6d4' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', textAlign: 'center' }}>{exam}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Mock Tests: 15+</span>
                    <span>PYQs: 10 Years</span>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveTab('tests')}>
                    Start Preparation
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: AI INTERVIEW PREP
            ======================================================== */}
        {activeTab === 'interview' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ fontSize: '32px' }}>🎙️ AI Interview Simulator</h1>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '40px' }}>
              <div style={{ padding: '30px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', border: '2px dashed #6366f1' }}>
                <Mic size={64} style={{ color: '#6366f1' }} />
              </div>
              <h2 style={{ fontSize: '24px' }}>HR & Technical Interview Simulator</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '500px' }}>
                Practice for your SSC, UPSC, and NDA interviews. Our AI will speak questions to you and evaluate your spoken answers for confidence and accuracy.
              </p>
              <button className="btn-primary" style={{ padding: '12px 30px', fontSize: '16px' }}>Start Voice Simulation Room</button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: STUDY PLANNER
            ======================================================== */}
        {activeTab === 'planner' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ fontSize: '32px' }}>📅 AI Personalized Study Plan</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div className="glass-card">
                <h3>Today's Targets</h3>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <li style={{ display: 'flex', gap: '10px' }}><CheckCircle color="#10b981" /> Revise NEET Biology Chapter 4</li>
                  <li style={{ display: 'flex', gap: '10px' }}><Clock color="#f59e0b" /> Take KCET Physics Mock Test (60 mins)</li>
                  <li style={{ display: 'flex', gap: '10px' }}><Sparkles color="#6366f1" /> Practice 10 Quadratic Equations</li>
                </ul>
              </div>
              <div className="glass-card">
                <h3>Smart Revision Schedule</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Based on your analytics, our AI recommends you focus on <strong>Quadratic Formulas</strong> and <strong>Thermodynamics</strong> today.</p>
                <div style={{ marginTop: '20px', height: '200px', background: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>[Calendar Timeline View Integration]</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: CURRENT AFFAIRS
            ======================================================== */}
        {activeTab === 'current_affairs' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ fontSize: '32px' }}>📰 Current Affairs & GK Capsules</h1>
            <div className="glass-card">
              <h3>Today's UPSC/KPSC Highlights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <div style={{ padding: '15px', background: 'rgba(30,41,59,0.5)', borderRadius: '8px' }}>
                  <span style={{ color: '#06b6d4', fontSize: '12px', fontWeight: 'bold' }}>NATIONAL</span>
                  <h4 style={{ margin: '5px 0' }}>New Educational Policy Summit 2026</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>A major summit discussing the integration of AI tools in all government curriculum.</p>
                </div>
                <div style={{ padding: '15px', background: 'rgba(30,41,59,0.5)', borderRadius: '8px' }}>
                  <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>SCIENCE & TECH</span>
                  <h4 style={{ margin: '5px 0' }}>ISRO's latest lunar observation satellite successfully deployed</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>The satellite will assist in mapping lunar resources for upcoming missions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: PREVIOUS YEAR PAPERS
            ======================================================== */}
        {activeTab === 'papers' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ fontSize: '32px' }}>📜 Previous Year Question Papers (PYQs)</h1>
            <div className="glass-card" style={{ display: 'flex', gap: '15px' }}>
              <select style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'white', border: 'var(--border-glass)', outline: 'none' }}>
                <option>CBSE Class 10</option>
                <option>KCET Engineering</option>
                <option>NEET Medical</option>
                <option>UPSC Prelims</option>
              </select>
              <select style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'white', border: 'var(--border-glass)', outline: 'none' }}>
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
              <button className="btn-primary">Load Solved Papers</button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: ADMIN PANEL
            ======================================================== */}
        {activeTab === 'admin' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ fontSize: '32px' }}>⚙️ Super Admin Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="glass-card">
                <h3>Manage Mock Tests</h3>
                <button className="btn-secondary" style={{ marginTop: '15px' }}><Plus size={16} /> Upload New NEET/KCET Test</button>
              </div>
              <div className="glass-card">
                <h3>Student Analytics</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Total Registered Students: 1,245</p>
                <p style={{ color: 'var(--text-secondary)' }}>Active Today: 342</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

