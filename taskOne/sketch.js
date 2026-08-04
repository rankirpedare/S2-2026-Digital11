// ===================================================
// STUDENT TASK: Build a graphical dashboard for Seneye
// ===================================================

// Replace this with your teacher's Cloudflare Worker URL:
const PROXY_URL = "https://seneye-proxy.ezankov.workers.dev/";

// Toggle to true if you are working offline without network access
const USE_OFFLINE_MOCK = false;

let aquariumData = null;
let lastUpdated = "";

function preload() {
  // Load initial data before setup() runs
  let endpoint = USE_OFFLINE_MOCK ? "sample-data.json" : PROXY_URL;
  aquariumData = loadJSON(endpoint, onDataLoaded, onError);
}

function setup() {
  createCanvas(800, 500);
  
  // Refresh live data every 5 minutes (300,000 ms)
  if (!USE_OFFLINE_MOCK) {
    setInterval(() => {
      loadJSON(PROXY_URL, onDataLoaded, onError);
    }, 300000);
  }
}

function onDataLoaded(data) {
  aquariumData = data;
  lastUpdated = new Date().toLocaleTimeString();
  console.log("Data refreshed successfully:", data);
}

function onError(err) {
  console.error("Failed to load aquarium data. Check proxy URL or network.", err);
}

function draw() {
  background(20, 30, 45); // Dark blue aquarium background

  // 1. Draw Title Header
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Fish Environment Dashboard", 30, 30);

  // Display connection status
  textSize(12);
  fill(150, 200, 255);
  text("Last updated: " + (lastUpdated || "Loading..."), 30, 65);

  // 2. Render Dashboard Graphics
  if (aquariumData) {
    // NOTE: Update these keys based on your actual Seneye JSON response structure!
    // Example fields commonly found in sensor data:
    let temp = aquariumData[0].exps.temperature.curr
    let ph = aquariumData[0].exps.ph.curr
    let nh3 = aquariumData[0].exps.nh3.curr 
    let nh4 = aquariumData[0].exps.nh4.curr
    let o2 = aquariumData[0].exps.o2.curr
    let lux = aquariumData[0].exps.lux.curr

    // Call your custom graphic widgets
    drawTempWidget(50, 120, temp);
    drawGaugeWidget(300, 120, "pH Level", ph, 6.0, 8.5);
    drawGaugeWidget(550, 120, "Ammonia (NH3)", nh3, 0.0, 0.05);
    drawGaugeWidget(50, 300, "Ammonium (NH4)", nh4, 0.0, 0.5);
    drawGaugeWidget(300, 300, "Dissolved O2", o2, 0.0, 10.0);
    drawGaugeWidget(550, 300, "Light (Lux)", lux, 0, 10000);
    drawGaugeWidget(50, 450, "PAR", par, 0, 2000);
    drawGaugeWidget(300, 450, "Kelvin", kelvin, 2000, 10000);

  } else {
    // Loading State
    fill(255, 100, 100);
    textSize(18);
    text("Connecting to sensor stream...", 30, 120);
  }
}

// Example Widget Function: Temperature Card
function drawTempWidget(x, y, tempVal) {
  // Background Card
  fill(35, 48, 68);
  stroke(60, 80, 110);
  rect(x, y, 200, 150, 10);

  // Label
  noStroke();
  fill(180, 200, 220);
  textSize(14);
  text("Water Temp", x + 15, y + 15);

  // Value Display
  fill(100, 220, 255);
  textSize(36);
  text(tempVal + "°C", x + 15, y + 50);
}

// Example Widget Function: Simple Bar Gauge
function drawGaugeWidget(x, y, label, val, minVal, maxVal) {
  fill(35, 48, 68);
  stroke(60, 80, 110);
  rect(x, y, 200, 150, 10);

  noStroke();
  fill(180, 200, 220);
  textSize(14);
  text(label, x + 15, y + 15);

  fill(255);
  textSize(28);
  text(val, x + 15, y + 50);
}