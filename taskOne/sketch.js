const PROXY_URL = "https://seneye-proxy.ezankov.workers.dev/";
const USE_OFFLINE_MOCK = false;

let aquariumData = null;
let lastUpdated = "";

let flashCounter = 0;
let isFlashing = false;

let tempLogs = [];

const TEMP_STORAGE_KEY = "seneye_temperature_history";
const UPDATE_INTERVAL = 5 * 60 * 1000;

function preload() {
  if (USE_OFFLINE_MOCK) {
    aquariumData = loadJSON("sample-data.json", onDataLoaded, onError);
  }
}

function setup() {
  createCanvas(800, 680);

  loadTemperatureHistory();

  fetchSensorData();

  setInterval(() => {
    fetchSensorData();
  }, UPDATE_INTERVAL);
}

function fetchSensorData() {
  loadJSON(PROXY_URL, onDataLoaded, onError);
}

function onDataLoaded(data) {
  aquariumData = data;
  lastUpdated = new Date().toLocaleTimeString();

  let dataObj = Array.isArray(data) ? data[0] : data;

  if (!dataObj) {
    return;
  }

  let phValue = dataObj?.exps?.ph?.curr;

  let ph = Number(phValue);

  if (!isNaN(ph)) {
    if (ph > 8.0) {
      flashCounter = 0;
      isFlashing = true;
    } else {
      isFlashing = false;
    }
  }

  let temperatureValue = dataObj?.exps?.temperature?.curr;

  let currentTemp = Number(temperatureValue);

  if (!isNaN(currentTemp)) {
    recordTemperature(currentTemp);
  }
}

function recordTemperature(temp) {
  let now = Date.now();

  cleanTemperatureHistory();

  if (tempLogs.length > 0) {
    let lastReading = tempLogs[tempLogs.length - 1];

    if (
      Math.abs(lastReading.temp - temp) < 0.0001 &&
      now - lastReading.timestamp < UPDATE_INTERVAL
    ) {
      return;
    }
  }

  tempLogs.push({
    timestamp: now,
    temp: temp
  });

  saveTemperatureHistory();
}

function loadTemperatureHistory() {
  let storedData = localStorage.getItem(TEMP_STORAGE_KEY);

  if (!storedData) {
    tempLogs = [];
    return;
  }

  try {
    let parsedData = JSON.parse(storedData);

    if (Array.isArray(parsedData)) {
      tempLogs = parsedData;
    } else {
      tempLogs = [];
    }
  } catch (error) {
    console.error("Could not read temperature history.", error);
    tempLogs = [];
  }

  cleanTemperatureHistory();
}

function saveTemperatureHistory() {
  localStorage.setItem(
    TEMP_STORAGE_KEY,
    JSON.stringify(tempLogs)
  );
}

function cleanTemperatureHistory() {
  let now = new Date();

  let startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  ).getTime();

  tempLogs = tempLogs.filter(reading => {
    return reading.timestamp >= startOfToday;
  });

  saveTemperatureHistory();
}

function onError(err) {
  console.error("Failed to load aquarium data.", err);
}

function draw() {
  background(20, 30, 45);

  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Fish Environment Dashboard", 30, 30);

  textSize(12);
  fill(150, 200, 255);
  text("Last updated: " + (lastUpdated || "Loading..."), 30, 65);

  if (aquariumData) {
    let dataObj = Array.isArray(aquariumData)
      ? aquariumData[0]
      : aquariumData;

    let temp = dataObj?.exps?.temperature?.curr ?? "N/A";
    let ph = dataObj?.exps?.ph?.curr ?? "N/A";
    let nh3 = dataObj?.exps?.nh3?.curr ?? "N/A";
    let nh4 = dataObj?.exps?.nh4?.curr ?? "N/A";
    let o2 = dataObj?.exps?.o2?.curr ?? "N/A";
    let lux = dataObj?.exps?.lux?.curr ?? "N/A";

    let phStrokeColor = color(60, 80, 110);
    let phStrokeWeight = 1;

    if (isFlashing) {
      let currentCycle = floor(frameCount / 15);

      if (currentCycle - (window.startCycle || 0) >= 20) {
        isFlashing = false;
      } else {
        if (window.startCycle === undefined) {
          window.startCycle = currentCycle;
        }

        if (currentCycle % 2 === 0) {
          phStrokeColor = color(255, 50, 50);
          phStrokeWeight = 6;
        }
      }
    } else {
      delete window.startCycle;
    }

    drawTempWidget(50, 120, temp);

    drawGaugeWidget(
      300,
      120,
      "pH Level",
      ph,
      6.0,
      8.5,
      phStrokeColor,
      phStrokeWeight
    );

    drawGaugeWidget(
      550,
      120,
      "Ammonia (NH3)",
      nh3,
      0.0,
      0.05
    );

    drawGaugeWidget(
      50,
      300,
      "Ammonium (NH4)",
      nh4,
      0.0,
      0.5
    );

    drawGaugeWidget(
      300,
      300,
      "Dissolved O2",
      o2,
      0.0,
      10.0
    );

    drawGaugeWidget(
      550,
      300,
      "Light (Lux)",
      lux,
      0,
      10000
    );

    drawDailyTempLogger(
      50,
      480,
      700,
      160
    );
  } else {
    fill(255, 100, 100);
    textSize(18);
    text("Connecting to sensor stream...", 30, 120);
  }
}

function drawTempWidget(x, y, tempVal) {
  fill(35, 48, 68);
  stroke(60, 80, 110);
  strokeWeight(1);
  rect(x, y, 200, 150, 10);

  noStroke();

  fill(180, 200, 220);
  textSize(14);
  textAlign(LEFT, TOP);
  text("Water Temp", x + 15, y + 15);

  fill(100, 220, 255);
  textSize(36);

  let displayTemp = Number(tempVal);

  if (!isNaN(displayTemp)) {
    text(displayTemp + "°C", x + 15, y + 50);
  } else {
    text("N/A", x + 15, y + 50);
  }
}

function drawGaugeWidget(
  x,
  y,
  label,
  val,
  minVal,
  maxVal,
  customStroke,
  customWeight
) {
  fill(35, 48, 68);

  stroke(customStroke || color(60, 80, 110));
  strokeWeight(customWeight || 1);

  rect(x, y, 200, 150, 10);

  noStroke();

  fill(180, 200, 220);
  textSize(14);
  textAlign(LEFT, TOP);
  text(label, x + 15, y + 15);

  fill(255);
  textSize(28);
  text(val, x + 15, y + 50);
}

function drawDailyTempLogger(x, y, w, h) {
  fill(35, 48, 68);
  stroke(60, 80, 110);
  strokeWeight(1);
  rect(x, y, w, h, 10);

  noStroke();

  fill(180, 200, 220);
  textSize(14);
  textAlign(LEFT, TOP);

  text(
    "Daily Temperature Log",
    x + 20,
    y + 15
  );

  if (tempLogs.length === 0) {
    fill(130, 160, 180);
    textSize(12);
    textAlign(CENTER, CENTER);

    text(
      "Waiting for temperature readings...",
      x + w / 2,
      y + h / 2
    );

    return;
  }

  const temperatures = tempLogs.map(
    reading => reading.temp
  );

  let minTemp = Math.min(...temperatures);
  let maxTemp = Math.max(...temperatures);

  if (minTemp === maxTemp) {
    minTemp -= 1;
    maxTemp += 1;
  } else {
    minTemp -= 1;
    maxTemp += 1;
  }

  const plotY = y + 50;
  const plotH = h - 80;

  let points = [];

  for (let i = 0; i < tempLogs.length; i++) {
    let px;

    if (tempLogs.length === 1) {
      px = x + w / 2;
    } else {
      px = map(
        i,
        0,
        tempLogs.length - 1,
        x + 80,
        x + w - 80
      );
    }

    let py = map(
      tempLogs[i].temp,
      minTemp,
      maxTemp,
      plotY + plotH,
      plotY
    );

    points.push({
      x: px,
      y: py,
      temp: tempLogs[i].temp,
      timestamp: tempLogs[i].timestamp
    });
  }

  stroke(55, 75, 100);
  strokeWeight(1);

  for (let i = 0; i <= 3; i++) {
    let gridY = map(
      i,
      0,
      3,
      plotY,
      plotY + plotH
    );

    line(
      x + 50,
      gridY,
      x + w - 50,
      gridY
    );
  }

  stroke(100, 220, 255);
  strokeWeight(2);
  noFill();

  beginShape();

  for (let p of points) {
    vertex(p.x, p.y);
  }

  endShape();

  for (let p of points) {
    fill(20, 30, 45);
    stroke(100, 220, 255);
    strokeWeight(2);

    ellipse(
      p.x,
      p.y,
      16,
      16
    );

    fill(100, 220, 255);
    noStroke();

    ellipse(
      p.x,
      p.y,
      8,
      8
    );

    fill(25, 35, 50);
    stroke(60, 80, 110);
    strokeWeight(1);

    rect(
      p.x - 35,
      p.y - 35,
      70,
      22,
      5
    );

    noStroke();

    fill(255);
    textSize(11);
    textAlign(CENTER, CENTER);

    text(
      p.temp.toFixed(2) + "°C",
      p.x,
      p.y - 24
    );
  }

  let firstReading = tempLogs[0];
  let lastReading = tempLogs[tempLogs.length - 1];

  let firstTime = new Date(
    firstReading.timestamp
  );

  let lastTime = new Date(
    lastReading.timestamp
  );

  fill(150, 180, 210);
  textSize(12);
  textAlign(CENTER, TOP);

  text(
    firstTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    }),
    x + 80,
    plotY + plotH + 15
  );

  text(
    lastTime.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    }),
    x + w - 80,
    plotY + plotH + 15
  );
}