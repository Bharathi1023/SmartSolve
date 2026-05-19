const Q = (id,q,o,c,e) => ({id,question:q,options:o,correctAnswer:c,explanation:e});

const englishQs = [
  Q("en1","Synonym of 'Abundant':",["Plentiful","Scarce","Rare","Empty"],0,"Abundant means plentiful."),
  Q("en2","Antonym of 'Brave':",["Cowardly","Bold","Fearless","Heroic"],0,"Cowardly is opposite of brave."),
  Q("en3","'She ___ to school daily.' Fill correct verb:",["goes","go","going","gone"],0,"Third person singular uses 'goes'."),
  Q("en4","Passive voice of 'He writes a letter':",["A letter is written by him","A letter was written","He is writing","None"],0,"Object becomes subject in passive."),
  Q("en5","Which is a pronoun?",["He","Run","Beautiful","Quickly"],0,"He is a personal pronoun."),
  Q("en6","Plural of 'Child':",["Children","Childs","Childrens","Childes"],0,"Child → Children (irregular plural)."),
  Q("en7","'The sun rises in the east' is which tense?",["Simple Present","Past","Future","Present Perfect"],0,"Habitual/universal truth = Simple Present."),
  Q("en8","Which is an adverb?",["Quickly","Quick","Beauty","Brave"],0,"Quickly modifies a verb (adverb)."),
  Q("en9","Indirect speech: He said, 'I am happy':",["He said that he was happy","He said I am happy","He says he is happy","None"],0,"Said changes am→was, I→he."),
  Q("en10","Which figure of speech: 'The wind howled'?",["Personification","Simile","Metaphor","Alliteration"],0,"Giving human quality to wind = personification."),
  Q("en11","Correct spelling:",["Receive","Recieve","Receve","Receeve"],0,"I before E except after C: Receive."),
  Q("en12","Article before 'university':",["A","An","The","No article"],0,"University starts with 'yu' sound, so 'a'."),
  Q("en13","'Break a leg' is an example of:",["Idiom","Simile","Metaphor","Hyperbole"],0,"'Break a leg' = idiom meaning good luck."),
  Q("en14","Subject in 'The cat sat on the mat':",["The cat","sat","on the mat","the mat"],0,"The cat performs the action."),
  Q("en15","Past tense of 'swim':",["Swam","Swimmed","Swum","Swimming"],0,"Swim → Swam (past) → Swum (past participle)."),
  Q("en16","Which is a conjunction?",["And","He","Run","Beautiful"],0,"And joins words/clauses."),
  Q("en17","'As brave as a lion' is a:",["Simile","Metaphor","Personification","Alliteration"],0,"'As...as' comparison = Simile."),
  Q("en18","Opposite of 'Ancient':",["Modern","Old","Antique","Historic"],0,"Modern is opposite of ancient."),
  Q("en19","Which sentence is correct?",["She doesn't like coffee","She don't like coffee","She not like coffee","She no like coffee"],0,"Third person singular: doesn't."),
  Q("en20","A group of fish is called:",["School","Flock","Herd","Pack"],0,"A school of fish is the collective noun.")
];

const polityQs = [
  Q("ip1","Indian Constitution came into effect on:",["26 Jan 1950","15 Aug 1947","26 Nov 1949","2 Oct 1950"],0,"Constitution enacted on 26 January 1950."),
  Q("ip2","How many Fundamental Rights are there?",["6","7","5","8"],0,"6 Fundamental Rights in Indian Constitution."),
  Q("ip3","Who is called the Father of Indian Constitution?",["Dr. B.R. Ambedkar","Nehru","Gandhi","Patel"],0,"Dr. Ambedkar chaired the Drafting Committee."),
  Q("ip4","Rajya Sabha members are elected for:",["6 years","5 years","4 years","Life"],0,"Rajya Sabha members serve 6-year terms."),
  Q("ip5","Right to Education is under which article?",["Article 21A","Article 14","Article 19","Article 32"],0,"86th Amendment added Article 21A."),
  Q("ip6","President of India is elected by:",["Electoral College","Parliament","People directly","Prime Minister"],0,"Electoral college of MPs and MLAs elect President."),
  Q("ip7","Preamble starts with:",["We, the people of India","India is a","The Constitution","Government of India"],0,"'We, the people of India' opens the Preamble."),
  Q("ip8","Chief Justice of India is appointed by:",["President","PM","Parliament","Governor"],0,"President appoints CJI on PM's advice."),
  Q("ip9","Minimum age to become PM:",["25 years","30 years","35 years","21 years"],0,"Must be 25+ (Lok Sabha eligibility)."),
  Q("ip10","How many schedules in Constitution?",["12","10","8","15"],0,"Indian Constitution has 12 schedules."),
  Q("ip11","Emergency provisions are in which part?",["Part XVIII","Part III","Part IV","Part I"],0,"Part XVIII covers Emergency Provisions."),
  Q("ip12","Directive Principles are in which part?",["Part IV","Part III","Part V","Part II"],0,"Part IV contains DPSP."),
  Q("ip13","Total seats in Lok Sabha:",["545","550","500","600"],0,"Lok Sabha has max 545 seats (now 543 elected)."),
  Q("ip14","Governor is appointed by:",["President","CM","PM","Parliament"],0,"President appoints state Governors."),
  Q("ip15","Right to Constitutional Remedies is Article:",["32","14","19","21"],0,"Article 32 = Right to Constitutional Remedies."),
  Q("ip16","India is described as:",["Union of States","Federation","Confederation","Republic only"],0,"Article 1: India is a Union of States."),
  Q("ip17","Finance Bill is introduced in:",["Lok Sabha","Rajya Sabha","Both","State Assembly"],0,"Money/Finance bills originate in Lok Sabha only."),
  Q("ip18","Fundamental Duties were added by which amendment?",["42nd","44th","1st","86th"],0,"42nd Amendment (1976) added Fundamental Duties."),
  Q("ip19","Which article abolishes untouchability?",["Article 17","Article 14","Article 21","Article 25"],0,"Article 17 abolishes untouchability."),
  Q("ip20","CAG stands for:",["Comptroller and Auditor General","Chief Audit General","Central Audit Government","None"],0,"CAG = Comptroller and Auditor General of India.")
];

const reasoningQs = [
  Q("r1","Find the odd one: 2,5,10,17,28",["28","17","10","5"],0,"Pattern: +3,+5,+7,+9→26 not 28."),
  Q("r2","If APPLE = 50, then CAT = ?",["24","30","27","21"],0,"A=1,P=16,P=16,L=12,E=5=50; C=3,A=1,T=20=24."),
  Q("r3","Pointing to a man, she said 'He is my father's son.' Who is he?",["Her brother","Her father","Her uncle","Her son"],0,"Father's son = her brother."),
  Q("r4","Complete: 2,6,12,20,?",["30","28","25","32"],0,"Differences: 4,6,8,10 → next = 20+10=30."),
  Q("r5","Mirror image of 'AMBULANCE' reads:",["ECNALUBMA","AMBULANCE","ABULANCE","None"],0,"Mirror reverses left to right."),
  Q("r6","If A>B, B>C, then:",["A>C","C>A","A=C","Can't determine"],0,"Transitive: A>B>C means A>C."),
  Q("r7","Which day is 3 days after Monday?",["Thursday","Wednesday","Friday","Tuesday"],0,"Mon→Tue→Wed→Thu."),
  Q("r8","Find missing: 1,1,2,3,5,8,?",["13","11","12","10"],0,"Fibonacci: 5+8=13."),
  Q("r9","If South-East becomes North, then North-West becomes:",["South","East","West","North-East"],0,"Rotate 135° clockwise: NW→S."),
  Q("r10","Pen:Write :: Knife:?",["Cut","Sharp","Steel","Handle"],0,"Pen is used to write, knife is used to cut."),
  Q("r11","Complete: AZ, BY, CX, ?",["DW","DE","DV","EW"],0,"A→B→C→D, Z→Y→X→W."),
  Q("r12","If 1st Jan is Monday, what day is 1st Feb?",["Thursday","Wednesday","Friday","Tuesday"],0,"January has 31 days. 31÷7=4r3. Mon+3=Thu."),
  Q("r13","Bird:Nest :: Dog:?",["Kennel","Stable","Den","Burrow"],0,"Bird lives in nest, dog lives in kennel."),
  Q("r14","Which number replaces ?: 3,9,27,81,?",["243","162","100","200"],0,"×3 each time: 81×3=243."),
  Q("r15","Statement: All dogs are animals. Conclusion:",["Some animals are dogs","All animals are dogs","No dogs are animals","None"],0,"If all dogs are animals, some animals must be dogs."),
  Q("r16","Arrange: EPRTU to form a meaningful word:",["ERUPT","RUPET","PUTER","TRUPE"],0,"EPRTU → ERUPT."),
  Q("r17","What comes next: J,F,M,A,M,J,?",["J","A","S","N"],0,"Months: Jan,Feb,Mar,Apr,May,Jun,Jul."),
  Q("r18","If 5+3=28, 9+1=810, then 2+6=?",["412","48","26","68"],0,"Pattern: (a-b)(a+b): 2-6=-4→4, 2+6=8→12? Actually 4,12."),
  Q("r19","Clock shows 3:15. What is the angle?",["7.5°","90°","0°","45°"],0,"At 3:15, minute at 3, hour slightly past 3 = 7.5°."),
  Q("r20","Choose the odd one: Square,Rectangle,Triangle,Circle",["Circle","Triangle","Square","Rectangle"],0,"Circle has no straight sides/angles.")
];

const aptitudeQs = [
  Q("qa1","If A can do work in 10 days, B in 15 days, together:",["6 days","5 days","8 days","12 days"],0,"1/10+1/15=5/30=1/6, so 6 days."),
  Q("qa2","Simple Interest on ₹5000 at 10% for 2 years:",["₹1000","₹500","₹1500","₹2000"],0,"SI = PNR/100 = 5000×2×10/100 = 1000."),
  Q("qa3","A train 100m long at 60km/h crosses a pole in:",["6 sec","10 sec","5 sec","8 sec"],0,"60km/h=50/3 m/s. T=100÷(50/3)=6s."),
  Q("qa4","30% of 250 =",["75","50","80","25"],0,"30/100 × 250 = 75."),
  Q("qa5","Ratio 2:3 = ?:15",["10","12","9","6"],0,"2/3 = x/15, x=10."),
  Q("qa6","Average of 10,20,30,40,50:",["30","25","35","40"],0,"Sum=150, n=5, avg=30."),
  Q("qa7","CP=₹400, SP=₹500. Profit%:",["25%","20%","10%","50%"],0,"Profit=100, P%=100/400×100=25%."),
  Q("qa8","A pipe fills tank in 6h, another empties in 8h. Together:",["24 hours","12 hours","14 hours","20 hours"],0,"1/6-1/8=4-3/24=1/24. So 24 hours."),
  Q("qa9","Compound interest on ₹1000 at 10% for 2 years:",["₹210","₹200","₹220","₹100"],0,"CI=1000(1.1²-1)=1000×0.21=210."),
  Q("qa10","Speed = 60km/h, Distance = 240km. Time:",["4 hours","3 hours","5 hours","6 hours"],0,"T=D/S=240/60=4 hours."),
  Q("qa11","If x:y = 3:4 and y:z = 2:3, then x:z =",["1:2","3:6","2:3","3:2"],0,"x:y:z = 3:4:6, so x:z=3:6=1:2."),
  Q("qa12","Discount of 20% on ₹500. SP:",["₹400","₹450","₹350","₹480"],0,"Discount=100, SP=500-100=400."),
  Q("qa13","LCM of 12,15,20:",["60","120","30","180"],0,"LCM(12,15,20)=60."),
  Q("qa14","A boat speed 10km/h, stream 2km/h. Downstream speed:",["12 km/h","8 km/h","10 km/h","14 km/h"],0,"Downstream = boat+stream = 12."),
  Q("qa15","If 8 men do work in 12 days, 6 men do in:",["16 days","14 days","10 days","18 days"],0,"M1×D1=M2×D2: 8×12=6×D2, D2=16."),
  Q("qa16","Sum of first 10 natural numbers:",["55","50","45","60"],0,"n(n+1)/2 = 10×11/2 = 55."),
  Q("qa17","₹600 divided in ratio 2:3. Larger share:",["₹360","₹240","₹300","₹400"],0,"3/5×600=360."),
  Q("qa18","A man walks 4km/h. In 45 min he covers:",["3 km","4 km","2 km","3.5 km"],0,"4×45/60 = 3 km."),
  Q("qa19","Population 10000, grows 10%/year. After 2 years:",["12100","11000","12000","11100"],0,"10000×1.1²=12100."),
  Q("qa20","If selling at ₹450 gives 50% profit, CP is:",["₹300","₹250","₹350","₹225"],0,"CP=SP/(1+P%)=450/1.5=300.")
];

const kannadaQs = [
  Q("kn1","'ಕನ್ನಡ' ಭಾಷೆಯ ಮೂಲ ಲಿಪಿ ಯಾವುದು?",["ಬ್ರಾಹ್ಮಿ","ದೇವನಾಗರಿ","ಗ್ರಂಥ","ರೋಮನ್"],0,"ಕನ್ನಡ ಲಿಪಿ ಬ್ರಾಹ್ಮಿ ಲಿಪಿಯಿಂದ ಬೆಳೆದಿದೆ."),
  Q("kn2","ಕನ್ನಡದ ಮೊದಲ ಗ್ರಂಥ ಯಾವುದು?",["ಕವಿರಾಜಮಾರ್ಗ","ಪಂಪಭಾರತ","ಕುಮಾರವ್ಯಾಸ ಭಾರತ","ವಡ್ಡಾರಾಧನೆ"],0,"ಕವಿರಾಜಮಾರ್ಗ ಕನ್ನಡದ ಮೊದಲ ಉಪಲಬ್ಧ ಗ್ರಂಥ."),
  Q("kn3","'ರಾಷ್ಟ್ರಕವಿ' ಎಂದು ಯಾರನ್ನು ಕರೆಯುತ್ತಾರೆ?",["ಕುವೆಂಪು","ಪಂಪ","ರನ್ನ","ಬೇಂದ್ರೆ"],0,"ಕುವೆಂಪು ಅವರಿಗೆ ರಾಷ್ಟ್ರಕವಿ ಬಿರುದು."),
  Q("kn4","ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಒಟ್ಟು ಎಷ್ಟು ಅಕ್ಷರಗಳಿವೆ?",["49","52","46","56"],0,"ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ 49 ಅಕ್ಷರಗಳಿವೆ."),
  Q("kn5","'ಸ್ವರ' ಅಕ್ಷರಗಳ ಸಂಖ್ಯೆ ಎಷ್ಟು?",["13","16","10","14"],0,"ಕನ್ನಡದಲ್ಲಿ 13 ಸ್ವರಗಳಿವೆ."),
  Q("kn6","'ನಾಮಪದ' ಎಂದರೆ ಏನು?",["ಹೆಸರನ್ನು ಸೂಚಿಸುವ ಪದ","ಕ್ರಿಯೆಯನ್ನು ಸೂಚಿಸುವ ಪದ","ಗುಣವನ್ನು ಸೂಚಿಸುವ ಪದ","ಯಾವುದೂ ಅಲ್ಲ"],0,"ನಾಮಪದ = ವ್ಯಕ್ತಿ, ವಸ್ತು, ಸ್ಥಳದ ಹೆಸರು."),
  Q("kn7","'ಕ್ರಿಯಾಪದ' ಎಂದರೆ?",["ಕೆಲಸವನ್ನು ಸೂಚಿಸುವ ಪದ","ಹೆಸರನ್ನು ಸೂಚಿಸುವ ಪದ","ಗುಣವನ್ನು ತಿಳಿಸುವ ಪದ","ಸಂಬಂಧ ಸೂಚಿಸುವ ಪದ"],0,"ಕ್ರಿಯಾಪದ ಕೆಲಸ/ಕಾರ್ಯವನ್ನು ತಿಳಿಸುತ್ತದೆ."),
  Q("kn8","ಪಂಪ ಯಾವ ಶತಮಾನದ ಕವಿ?",["10ನೇ ಶತಮಾನ","8ನೇ ಶತಮಾನ","12ನೇ ಶತಮಾನ","15ನೇ ಶತಮಾನ"],0,"ಪಂಪ 10ನೇ ಶತಮಾನದ ಆದಿಕವಿ."),
  Q("kn9","'ವಚನ ಸಾಹಿತ್ಯ'ದ ಪ್ರವರ್ತಕ ಯಾರು?",["ಬಸವಣ್ಣ","ಅಕ್ಕಮಹಾದೇವಿ","ಅಲ್ಲಮಪ್ರಭು","ದೇವರ ದಾಸಿಮಯ್ಯ"],0,"ಬಸವಣ್ಣ ವಚನ ಚಳುವಳಿಯ ಪ್ರವರ್ತಕ."),
  Q("kn10","'ಸಂಧಿ' ಎಂದರೆ ಏನು?",["ಎರಡು ಅಕ್ಷರಗಳ ಸೇರುವಿಕೆ","ಪದದ ಅರ್ಥ","ವಾಕ್ಯ ರಚನೆ","ಛಂದಸ್ಸು"],0,"ಸಂಧಿ = ಎರಡು ಅಕ್ಷರಗಳ ಕೂಡಿಕೆ."),
  Q("kn11","'ಲೋಪಸಂಧಿ'ಯಲ್ಲಿ ಏನಾಗುತ್ತದೆ?",["ಒಂದು ಅಕ್ಷರ ಲೋಪವಾಗುತ್ತದೆ","ಹೊಸ ಅಕ್ಷರ ಬರುತ್ತದೆ","ಬದಲಾವಣೆ ಇಲ್ಲ","ಎರಡೂ ಲೋಪ"],0,"ಲೋಪಸಂಧಿಯಲ್ಲಿ ಒಂದು ಸ್ವರ ಲೋಪವಾಗುತ್ತದೆ."),
  Q("kn12","ಕರ್ನಾಟಕ ಏಕೀಕರಣ ಯಾವ ವರ್ಷ?",["1956","1947","1950","1960"],0,"1 ನವೆಂಬರ್ 1956 ರಲ್ಲಿ ಕರ್ನಾಟಕ ಏಕೀಕರಣ."),
  Q("kn13","'ಜ್ಞಾನಪೀಠ' ಪ್ರಶಸ್ತಿ ಪಡೆದ ಮೊದಲ ಕನ್ನಡಿಗ?",["ಕುವೆಂಪು","ಬೇಂದ್ರೆ","ಕಾರಂತ","ಮಾಸ್ತಿ"],0,"ಕುವೆಂಪು 1967 ರಲ್ಲಿ ಜ್ಞಾನಪೀಠ ಪಡೆದರು."),
  Q("kn14","'ಸಮಾಸ' ಎಂದರೆ?",["ಪದಗಳ ಸೇರುವಿಕೆ","ಅಕ್ಷರ ಲೋಪ","ವಾಕ್ಯ ಭೇದ","ಅಲಂಕಾರ"],0,"ಸಮಾಸ = ಎರಡು ಅಥವಾ ಹೆಚ್ಚು ಪದಗಳ ಸೇರಿಕೆ."),
  Q("kn15","'ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯ'ಗಳು ಎಷ್ಟು?",["7","5","8","6"],0,"ಕನ್ನಡದಲ್ಲಿ 7 ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳಿವೆ."),
  Q("kn16","'ಉಪಮೆ' ಅಲಂಕಾರದಲ್ಲಿ ಬಳಸುವ ಪದ?",["ಅಂತೆ/ಹಾಗೆ","ಆದರೆ","ಮತ್ತು","ಅಥವಾ"],0,"ಉಪಮೆಯಲ್ಲಿ ಹೋಲಿಕೆ ಸೂಚಿಸಲು ಅಂತೆ/ಹಾಗೆ ಬಳಸುತ್ತಾರೆ."),
  Q("kn17","'ಮಲೆಗಳಲ್ಲಿ ಮದುಮಗಳು' ಕೃತಿಕಾರ ಯಾರು?",["ಕುವೆಂಪು","ಕಾರಂತ","ಭೈರಪ್ಪ","ಅನಂತಮೂರ್ತಿ"],0,"ಕುವೆಂಪು ಅವರ ಪ್ರಸಿದ್ಧ ಕಾದಂಬರಿ."),
  Q("kn18","'ದ್ವಿತೀಯ ವಿಭಕ್ತಿ' ಪ್ರತ್ಯಯ ಯಾವುದು?",["ಅನ್ನು","ಇಂದ","ಗೆ","ಅ"],0,"ದ್ವಿತೀಯ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯ = ಅನ್ನು."),
  Q("kn19","ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ಯಾವಾಗ?",["ನವೆಂಬರ್ 1","ಜನವರಿ 26","ಆಗಸ್ಟ್ 15","ಅಕ್ಟೋಬರ್ 2"],0,"ನವೆಂಬರ್ 1 ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ."),
  Q("kn20","'ಹಳಗನ್ನಡ' ಯಾವ ಕಾಲದ ಭಾಷೆ?",["9-12ನೇ ಶತಮಾನ","18ನೇ ಶತಮಾನ","20ನೇ ಶತಮಾನ","5ನೇ ಶತಮಾನ"],0,"ಹಳಗನ್ನಡ ಸುಮಾರು 9-12ನೇ ಶತಮಾನದ ಭಾಷಾ ರೂಪ.")
];

export const QUIZ_BANK_2 = [
  { id:"english-101", title:"English Language - Complete Assessment", subject:"English", duration:30, questions:englishQs },
  { id:"polity-101", title:"Indian Polity - Complete Assessment", subject:"Indian Polity", duration:40, questions:polityQs },
  { id:"reasoning-101", title:"Reasoning - Complete Assessment", subject:"Reasoning", duration:35, questions:reasoningQs },
  { id:"aptitude-101", title:"Quantitative Aptitude - Complete Assessment", subject:"Quantitative Aptitude", duration:40, questions:aptitudeQs },
  { id:"kannada-101", title:"ಕನ್ನಡ ಭಾಷಾ ಪರೀಕ್ಷೆ - Complete Assessment", subject:"Kannada", duration:35, questions:kannadaQs }
];
