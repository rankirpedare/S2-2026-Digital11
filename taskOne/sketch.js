// ===================================================
// STUDENT TASK: Build a graphical dashboard for Seneye
// ===================================================

const PROXY_URL = "https://seneye-proxy.ezankov.workers.dev/";
const USE_OFFLINE_MOCK = false;

let aquariumData = null;
let lastUpdated = "";

// Flashing alert state variables
let flashCounter = 0;
let isFlashing = false;

// Array tracking 3 temperature readings throughout the day
// (Morning, Afternoon, and Evening/Current)
let tempLogs = [
  { time: "8:00 AM", temp: 19.8 },
  { time: "1:00 PM", temp: 22.5 },
  { time: "7:00 PM", temp: 21.375 }
];

function preload() {
  let endpoint = USE_OFFLINE_MOCK ? "sample-data.json" : PROXY_URL;
  aquariumData = loadJSON(endpoint, onDataLoaded, onError);
}

function setup() {
  createCanvas(800, 680); // Height expanded to accommodate the timeline logger
  
  if (!USE_OFFLINE_MOCK) {
    setInterval(() => {
      loadJSON(PROXY_URL, onDataLoaded, onError);
    }, 300000);
  }
}

function onDataLoaded(data) {
  aquariumData = data;
  lastUpdated = new Date().toLocaleTimeString();

  let ph = 0;
  if (Array.isArray(data) && data[0]?.exps?.ph?.curr !== undefined) {
    ph = data[0].exps.ph.curr;
  } else if (data?.exps?.ph?.curr !== undefined) {
    ph = data.exps.ph.curr;
  }

  // Update the latest (3rd) log entry with live temperature data
  let currentTemp = Array.isArray(data) ? data[0]?.exps?.temperature?.curr : data?.exps?.temperature?.curr;
  if (currentTemp !== undefined && typeof currentTemp === "number") {
    tempLogs[2].temp = currentTemp;
  }

  if (ph > 8.0) {
    flashCounter = 0;
    isFlashing = true;
  } else {
    isFlashing = false;
  }
}

function onError(err) {
  console.error("Failed to load aquarium data.", err);
}

function draw() {
  background(20, 30, 45); // Dark blue aquarium background

  // 1. Header
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Fish Environment Dashboard", 30, 30);

  textSize(12);
  fill(150, 200, 255);
  text("Last updated: " + (lastUpdated || "Loading..."), 30, 65);

  // 2. Main Dashboard Cards
  if (aquariumData) {
    let dataObj = Array.isArray(aquariumData) ? aquariumData[0] : aquariumData;
    let temp = dataObj?.exps?.temperature?.curr ?? "N/A";
    let ph = dataObj?.exps?.ph?.curr ?? "N/A";
    let nh3 = dataObj?.exps?.nh3?.curr ?? "N/A";
    let nh4 = dataObj?.exps?.nh4?.curr ?? "N/A";
    let o2 = dataObj?.exps?.o2?.curr ?? "N/A";
    let lux = dataObj?.exps?.lux?.curr ?? "N/A";

    // --- Dynamic Alert Flashing Logic ---
    let phStrokeColor = color(60, 80, 110);
    let phStrokeWeight = 1;

    if (isFlashing) {
      let currentCycle = floor(frameCount / 15);
      if (currentCycle - (window.startCycle || 0) >= 20) {
        isFlashing = false;
      } else {
        if (window.startCycle === undefined) window.startCycle = currentCycle;
        if ((currentCycle % 2) === 0) {
          phStrokeColor = color(255, 50, 50);
          phStrokeWeight = 6;
        }
      }
    } else {
      delete window.startCycle;
    }

    // Top & Middle Row Cards
    drawTempWidget(50, 120, temp);
    drawGaugeWidget(300, 120, "pH Level", ph, 6.0, 8.5, phStrokeColor, phStrokeWeight);
    drawGaugeWidget(550, 120, "Ammonia (NH3)", nh3, 0.0, 0.05);
    drawGaugeWidget(50, 300, "Ammonium (NH4)", nh4, 0.0, 0.5);
    drawGaugeWidget(300, 300, "Dissolved O2", o2, 0.0, 10.0);
    drawGaugeWidget(550, 300, "Light (Lux)", lux, 0, 10000);

    // 3. Daily Temperature Log (Rendered with basic shapes)
    drawDailyTempLogger(50, 480, 700, 160);

  } else {
    fill(255, 100, 100);
    textSize(18);
    text("Connecting to sensor stream...", 30, 120);
  }
}

// Temperature Card
function drawTempWidget(x, y, tempVal) {
  fill(35, 48, 68);
  stroke(60, 80, 110);
  strokeWeight(1);
  rect(x, y, 200, 150, 10);

  noStroke();
  fill(180, 200, 220);
  textSize(14);
  text("Water Temp", x + 15, y + 15);

  fill(100, 220, 255);
  textSize(36);
  text(tempVal + "°C", x + 15, y + 50);
}

// Standard Card Widget
function drawGaugeWidget(x, y, label, val, minVal, maxVal, customStroke, customWeight) {
  fill(35, 48, 68);
  stroke(customStroke || color(60, 80, 110));
  strokeWeight(customWeight || 1);
  rect(x, y, 200, 150, 10);

  noStroke();
  fill(180, 200, 220);
  textSize(14);
  text(label, x + 15, y + 15);

  fill(255);
  textSize(28);
  text(val, x + 15, y + 50);
}

// --- Daily Temperature Logger Widget using Basic p5.js Shapes ---
function drawDailyTempLogger(x, y, w, h) {
  // Container Box (rect)
  fill(35, 48, 68);
  stroke(60, 80, 110);
  strokeWeight(1);
  rect(x, y, w, h, 10);

  // Widget Header
  noStroke();
  fill(180, 200, 220);
  textSize(14);
  textAlign(LEFT, TOP);
  text("Daily Temperature Log (3 Time Points)", x + 20, y + 15);

  // Axis bounds for mapping
  const minTemp = 18;
  const maxTemp = 25;
  const plotY = y + 50;
  const plotH = h - 80;

  // Calculate coordinates for the 3 log points
  let points = [];
  for (let i = 0; i < tempLogs.length; i++) {
    let px = map(i, 0, tempLogs.length - 1, x + 120, x + w - 120);
    let py = map(tempLogs[i].temp, minTemp, maxTemp, plotY + plotH, plotY);
    points.push({ x: px, y: py, label: tempLogs[i].time, temp: tempLogs[i].temp });
  }

  // Draw Trend Lines between nodes (line)
  stroke(100, 220, 255);
  strokeWeight(2);
  for (let i = 0; i < points.length - 1; i++) {
    line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
  }

  // Draw Data Nodes & Badges (ellipse & rect)
  for (let p of points) {
    // Outer Node Ring (ellipse)
    fill(20, 30, 45);
    stroke(100, 220, 255);
    strokeWeight(2);
    ellipse(p.x, p.y, 16, 16);

    // Inner Node Dot (ellipse)
    fill(100, 220, 255);
    noStroke();
    ellipse(p.x, p.y, 8, 8);

    // Temp Value Badge (rect)
    fill(25, 35, 50);
    stroke(60, 80, 110);
    strokeWeight(1);
    rect(p.x - 35, p.y - 35, 70, 22, 5);

    // Value Text
    noStroke();
    fill(255);
    textSize(11);
    textAlign(CENTER, CENTER);
    text(p.temp + "°C", p.x, p.y - 24);

    // Time Label
    fill(150, 180, 210);
    textSize(12);
    text(p.label, p.x, plotY + plotH + 15);
  }
}