// =================== 基本變數 ===================
let letters = "";
let counter = 0;
let x = 0;
let y = 0;
let stepSize = 5;
let angleDistortion = 0;

let categoryChosen = false;
let overlay;
let backBtn;
let submissionOverlay = null;

// --- 勇氣系統 ---
let courage = 0;
let courageMax = 10;
let courageLevel = 1;
let courageDiv;
let toggleBtn;
let courageVisible = true;
let levelIcons = ["❤️‍🩹", "💖", "🔥💖", "🌈💖", "👑💖"];
let storyCompleted = false;

// --- 語音控制 ---
let speechQueue = [];
let speaking = false;
let currentUtterance; 
//夜間開放//
let libraryOpen = false;
let bgLayer;

function checkLibraryTime() {
  const now = new Date();
  const hour = now.getHours(); 
  libraryOpen = (hour >= 18 || hour < 6);
}

// --- Supabase 設定 ---
const SUPABASE_URL = "https://klqeceqwhnxpzdujonrl.supabase.co";
const SUPABASE_KEY = "sb_publishable_emeCCYsPI3pjoKvZYux2_g_O6sSrfgh";

// =================== p5.js setup ===================
function setup() {
  checkLibraryTime();
  createCanvas(windowWidth, windowHeight);
  document.body.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";
  background(0);
  bgLayer = createGraphics(windowWidth, windowHeight);
  drawLibraryWindows(bgLayer);
  image(bgLayer, 0, 0);

  textFont('Georgia');
  textAlign(LEFT);
  fill(255);

  showCategoryOverlay();

  let panelSize = min(windowWidth, windowHeight) * 0.35;
  courageDiv = createDiv('');
  courageDiv.style(`
    position: fixed;
    bottom: ${panelSize * 0.25}px;
    right: 20px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 12px;
    border-radius: 8px;
    font-size: ${panelSize * 0.08}px;
    width: ${panelSize}px;
    display: block;
    z-index:999;
  `);
  updateCourageBar();

  toggleBtn = createButton("❤️‍🩹");
  toggleBtn.style(`
    position: fixed; bottom: env(safe-area-inset-bottom, 20px); right: 20px;
    font-size: 22px; background: rgb(0,0,0);
    border: 2px solid white; border-radius: 8px; padding:5px 10px;
    cursor:pointer; z-index:999;
  `);
  toggleBtn.mousePressed(() => {
    courageVisible = !courageVisible;
    courageDiv.style("display", courageVisible ? "block" : "none");
  });

  backBtn = createButton("↩️");
  backBtn.style(`
    position: fixed; bottom: env(safe-area-inset-bottom, 20px); right: 80px;
    font-size:22px; background: rgb(0,0,0);
    border: 2px solid white; border-radius: 8px; padding:5px 10px;
    cursor:pointer; z-index:999;
  `);
  backBtn.mousePressed(() => resetToMainMenu());

  let uiSize = min(windowWidth, windowHeight) * 0.05;
  toggleBtn.style(`font-size:${uiSize}px;`);
  backBtn.style(`font-size:${uiSize}px;`);
  let gap = uiSize * 2.2;
  toggleBtn.style(`right:20px;`);
  backBtn.style(`right:${20 + gap}px;`);
}

function drawLibraryWindows(pg) {
  pg.clear();
  pg.noStroke();
  pg.fill(10, 10, 15);
  pg.rect(0, 0, pg.width, pg.height);
  let cols = floor(random(3, 6));
  let spacing = pg.width / (cols + 1);
  let y = pg.height * 0.25;
  for (let i = 1; i <= cols; i++) {
    let x = spacing * i;
    drawGothicWindow(pg, x, y, 120, 200);
  }
  pg.fill(255, 15);
  pg.rect(0, 0, pg.width, pg.height);
}

function drawGothicWindow(pg, x, y, w, h) {
  pg.push();
  pg.translate(x, y);
  pg.fill(30);
  pg.rectMode(CENTER);
  pg.rect(0, h / 2, w, h);
  pg.arc(0, 0, w, w * 1.3, PI, 0);
  let glow = map(courageLevel, 1, 5, 10, 80);
  for (let i = 0; i < 30; i++) {
    let alpha = random(glow * 0.3, glow);
    pg.fill(100, 140, 180, alpha);
    pg.ellipse(random(-w / 2, w / 2), random(0, h), random(10, 50));
  }
  pg.pop();
}

// =================== p5.js draw ===================
function draw() {
  if (!categoryChosen) return;
  let px = touches.length ? touches[0].x : mouseX;
  let py = touches.length ? touches[0].y : mouseY;

  if ((mouseIsPressed || touches.length > 0) && letters) {
    let d = dist(x, y, px, py);
    let currentChar = letters.charAt(counter);
    if (!currentChar) return;

    let baseSize = min(windowWidth, windowHeight) * 0.03;
    let size = baseSize + d * 0.5;
    textSize(size);

    stepSize = textWidth(currentChar);
    if (d > stepSize) {
      let angle = atan2(py - y, px - x);
      push();
      translate(x, y);
      rotate(angle + random(angleDistortion));
      text(currentChar, 0, 0);
      pop();

      counter++;
      x += cos(angle) * stepSize;
      y += sin(angle) * stepSize;
    }
  }
}

// =================== 主選單 Overlay ===================
function showCategoryOverlay() {
  checkLibraryTime();
  if (overlay) overlay.remove();
  overlay = createDiv('');
  const bgImg = "https://res.cloudinary.com/dsxqqe6na/image/upload/v1768706628/tlof_bg_s_01_twmlns.jpg";

  overlay.style('position', 'fixed');
  overlay.style('top', '0');
  overlay.style('left', '0');
  overlay.style('width', '100vw');
  overlay.style('height', '100vh');
  overlay.style('display', 'flex');
  overlay.style('flex-direction', 'column');
  overlay.style('justify-content', 'center');
  overlay.style('align-items', 'center');
  overlay.style('z-index', '1000');
  overlay.style('background-image', `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("${bgImg}")`);
  overlay.style('background-size', 'cover');
  overlay.style('background-position', 'center');
  overlay.style('background-repeat', 'no-repeat');
  overlay.style('backdrop-filter', 'blur(4px)');
  overlay.style('-webkit-backdrop-filter', 'blur(4px)');
  overlay.style('font-family', 'Georgia, serif');

  let titleText = libraryOpen ? '歡迎來到失敗圖書館' : '失敗圖書館只在夜間18:00 - 06:00間開放';
  let title = createP(titleText);
  title.style('color:white; font-size:28px; margin-bottom:30px; text-align:center; text-shadow:2px 2px 10px rgba(0,0,0,0.8); padding:0 20px;');
  overlay.child(title);

  let readBtn = createButton('朗讀');
  readBtn.style(buttonStyle());
  if (libraryOpen) {
    readBtn.mousePressed(() => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let wakeUp = new SpeechSynthesisUtterance("正在連結失敗圖書館資料庫"); 
        wakeUp.volume = 0.5; wakeUp.lang = "zh-TW"; wakeUp.rate = 1;
        window.speechSynthesis.speak(wakeUp);
      }
      fetchRandomStory();
    });
  } else {
    readBtn.attribute("disabled", "");
    readBtn.style("opacity", "0.3");
  }
  overlay.child(readBtn);

  let submitBtn = createButton('投稿');
  submitBtn.style(buttonStyle());
  if (libraryOpen) {
    submitBtn.mousePressed(() => showSubmissionForm());
  } else {
    submitBtn.attribute("disabled", "");
    submitBtn.style("opacity", "0.3");
  }
  overlay.child(submitBtn);

  let menuSize = min(windowWidth, windowHeight) * 0.035;
  readBtn.style(`font-size:${menuSize}px; padding:${menuSize * 0.6}px ${menuSize * 1.4}px;`);
  submitBtn.style(`font-size:${menuSize}px; padding:${menuSize * 0.6}px ${menuSize * 1.4}px;`);
}

// =================== Supabase 讀取故事 ===================
function fetchRandomStory() {
  fetch(`${SUPABASE_URL}/rest/v1/stories?select=text,score`, {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
  })
    .then(res => res.json())
    .then(rows => {
      if (rows.length === 0) {
        letters = "世界還沒有失敗，你是第一個。";
      } else {
        let r = random(rows);
        letters = r.text + " 失敗指數：" + r.score;
      }
      categoryChosen = true;
      counter = 0;
      x = width / 2;
      y = height / 2;
      overlay.remove();
      courageDiv.style("display", "block");
      startGlitchSpeech();
    });
}

// =================== 語音處理優化 (逐句 Glitch) ===================
function startGlitchSpeech() {
  // 使用 RegEx 按標點符號進行「逐句」拆分
  // 匹配：句號、問號、驚嘆號 (全形與半形)
  speechQueue = letters.split(/([。？！.?!])/).reduce((acc, curr, idx) => {
    if (idx % 2 === 0) {
      acc.push(curr);
    } else {
      // 將標點符號接回前一句
      if (acc.length > 0) acc[acc.length - 1] += curr;
    }
    return acc;
  }, []).filter(s => s.trim().length > 0);

  speakNextGlitchChar();
}

function speakNextGlitchChar() {
  if (speechQueue.length === 0) {
    if (!storyCompleted) {
      addCourage();
      storyCompleted = true;
    }
    return;
  }
  
  let sentenceToSpeak = speechQueue.shift();
  currentUtterance = new SpeechSynthesisUtterance(sentenceToSpeak);
  
  // 自動偵測該句語言
  if (/[a-zA-Z]/.test(sentenceToSpeak)) {
    currentUtterance.lang = "en-US";
  } else {
    currentUtterance.lang = "zh-TW";
  }

  // 即使是逐句，我們依然加入輕微的隨機性，營造「圖書館系統不穩定」的氛圍
  currentUtterance.rate = 1.0 + random(-0.5, 0.15);
  currentUtterance.pitch = 1.0 + random(-0.9, 0.1);
  currentUtterance.volume = 1;
  
  currentUtterance.onend = () => speakNextGlitchChar();
  
  window.speechSynthesis.speak(currentUtterance);
}

// =================== 其餘功能 (投稿、勇氣、重置) ===================
function showSubmissionForm() {
  if (submissionOverlay) return;
  submissionOverlay = createDiv('');
  let formOverlay = submissionOverlay;
  let formSize = min(windowWidth, windowHeight) * 0.05;

  formOverlay.style(`
    position: fixed; top: 50%; left: 50%; width: 80%; max-width: 800px; min-height: 300px;
    transform: translate(-50%, -50%); background: rgba(0,0,0,0.92); display: flex;
    flex-direction: column; justify-content: center; align-items: center;
    font-family: 'Georgia', serif; color: white; border: 1px solid rgba(255,255,255,0.25);
    border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.6); z-index: 1100;
  `);

  let closeBtn = createButton("×");
  closeBtn.style(`position:absolute; top:10px; right:10px; background:transparent; color:white; border:none; cursor:pointer; font-size:${formSize * 1.5}px; line-height:1;`);
  closeBtn.mousePressed(() => { formOverlay.remove(); submissionOverlay = null; });
  formOverlay.child(closeBtn);

  let textarea = createElement("textarea");
  textarea.attribute("placeholder", "你的失敗…");
  textarea.style(`width:80%; height:${formSize * 8}px; font-size:${formSize}px; margin-top:20px;`);
  formOverlay.child(textarea);

  let score = createInput();
  score.attribute("placeholder", "失敗指數 1–5");
  score.style(`width:80%; font-size:${formSize}px; margin-top:10px;`);
  formOverlay.child(score);

  let submit = createButton("送出");
  submit.style(`font-size:${formSize * 0.85}px; padding:${formSize * 0.5}px ${formSize * 1.2}px; margin-top:20px;`);
  submit.mousePressed(() => {
    let textVal = textarea.value();
    let scoreVal = parseFloat(score.value());
    if (!textVal || isNaN(scoreVal)) return;
    fetch(`${SUPABASE_URL}/rest/v1/stories`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text: textVal, score: scoreVal })
    }).then(() => closeSubmissionForm());
  });
  formOverlay.child(submit);
}

function closeSubmissionForm() {
  if (submissionOverlay) { submissionOverlay.remove(); submissionOverlay = null; }
}

function buttonStyle() {
  return `margin:10px; padding:12px 25px; font-size:18px; color:white; background: rgba(0,0,0,0.4); border:2px solid white; border-radius:5px; cursor:pointer; text-shadow: 1px 1px 3px rgba(0,0,0,0.5); transition: background 0.3s;`;
}

function addCourage() {
  courage++;
  if (courage >= courageMax) {
    courage = 0;
    courageLevel = min(courageLevel + 1, levelIcons.length);
    toggleBtn.html(levelIcons[courageLevel - 1]);
  }
  updateCourageBar();
}

function updateCourageBar() {
  let progress = (courage / courageMax) * 100;
  courageDiv.html(`
    <div style="margin-bottom:5px;">勇氣分數：${courage} / ${courageMax}</div>
    <div style="margin-bottom:5px;">等級：LV${courageLevel}</div>
    <div style="width:100%; height:15px; background:rgba(255,255,255,0.2); border-radius:5px; overflow:hidden;">
      <div style="width:${progress}%; height:100%; background:#ff4d6d; transition: width 0.5s; border-radius:5px;"></div>
    </div>
  `);
}

function resetToMainMenu() {
  if (submissionOverlay) { submissionOverlay.remove(); submissionOverlay = null; }
  if (overlay) { overlay.remove(); overlay = null; }
  speechSynthesis.cancel();
  categoryChosen = false;
  counter = 0;
  storyCompleted = false;
  speechQueue = [];
  showCategoryOverlay();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
