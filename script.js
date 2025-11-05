/* =========================================================
   Idle Insect — Main Game Script (Final Organized Edition)
   ========================================================= */

/* ---------------------------------------------------------
   SECTION 1: GLOBAL GAME STATE
--------------------------------------------------------- */
let food = 50, soil = 0, minerals = 0, research = 0;
let summaryUnlocked = false;
let efficiencyMultiplier = 1;
let queenMultiplier = 1;
let rebirthPoints = 0;
let larvaBoost = 1;
let antBoost = 1;
let droneCount = 0;
let droneUnlocked = false;


// Global cheat mode flag (toggled via dev.js)
window.buyFreeUnits = false;

/* ---------------------------------------------------------
   SECTION 2: UNIT DEFINITIONS
--------------------------------------------------------- */
const units = {
  larva: { count: 0, cost: 10, production: 0.5 },
  ant: { count: 0, cost: 150, production: 1 },
  forager: { count: 0, cost: 500, production: 5 },
  worker: { count: 0, cost: 200, production: 1 },
  queen: { count: 0, cost: 1000 },
  digger: { count: 0, cost: 800, production: 1 },
  scientist: { count: 0, costFood: 400, costMineral: 400, production: 1 },
};

/* ---------------------------------------------------------
   SECTION 3: UI UPDATES
--------------------------------------------------------- */
function updateUI() {
  document.getElementById("food").textContent = food.toFixed(1);
  document.getElementById("soil").textContent = soil.toFixed(1);
  document.getElementById("minerals").textContent = minerals.toFixed(1);
  document.getElementById("research").textContent = research.toFixed(1);

  for (const key in units) {
    const countEl = document.getElementById(`${key}-count`);
    if (countEl) countEl.textContent = units[key].count;
    const costEl = document.getElementById(`${key}-cost`);
    if (costEl && units[key].cost)
      costEl.textContent = units[key].cost.toFixed(0);
  }

if (research >= 1) {
  const skillsButton = document.getElementById("skills-tab-button");
  if (skillsButton) skillsButton.classList.remove("hidden");
  // Keep the Skills tab hidden until clicked
} else {
  const skillsTab = document.getElementById("skills-tab");
  if (skillsTab) skillsTab.classList.add("hidden");
}



  updateUnitStatus();
}

function updateUnitStatus() {
  const statusMap = {
    larva: { check: food >= units.larva.cost, need: `Cost: ${units.larva.cost.toFixed(0)} Food` },
    ant: { check: food >= units.ant.cost && units.larva.count >= 1, need: `Cost: ${units.ant.cost.toFixed(0)} Food + 1 Larva` },
    forager: { check: food >= units.forager.cost && units.ant.count >= 1, need: `Cost: ${units.forager.cost.toFixed(0)} Food + 1 Ant` },
    worker: { check: food >= units.worker.cost && units.ant.count >= 1, need: `Cost: ${units.worker.cost.toFixed(0)} Food + 1 Ant` },
    queen: { check: food >= units.queen.cost && units.ant.count >= 50, need: `Cost: ${units.queen.cost.toFixed(0)} Food + 50 Ants` },
    digger: { check: food >= units.digger.cost && units.ant.count >= 1, need: `Cost: ${units.digger.cost.toFixed(0)} Food + 1 Ant` },
    scientist: { check: food >= units.scientist.costFood && minerals >= units.scientist.costMineral && units.ant.count >= 1, need: `Cost: ${units.scientist.costFood.toFixed(0)} Food + ${units.scientist.costMineral.toFixed(0)} Minerals + 1 Ant` },
  };

  for (const key in statusMap) {
    const el = document.getElementById(`${key}-status`);
    if (!el) continue;
    const { check, need } = statusMap[key];
    el.textContent = check ? `✅ Enough resources (${need})` : `❌ Not enough resources (${need})`;
    el.style.color = check ? "green" : "red";
  }
}

/* ---------------------------------------------------------
   SECTION 4: UI INTERACTIONS (Tabs, Dropdowns, Modals, Theme)
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {

  
  /* ---------- DROPDOWNS ---------- */
  document.querySelectorAll(".dropdown-header").forEach(header => {
    header.addEventListener("click", () => {
      const target = document.getElementById(header.dataset.target);
      const arrow = header.querySelector(".arrow");
      const isOpen = target.classList.toggle("open");
      header.classList.toggle("collapsed", !isOpen);
      if (arrow) arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(-90deg)";
    });
  });

// --- Top-level navigation tabs (Main / Skills / Ascension / Cheats) ---
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    const tabId = button.dataset.tab;

    // hide all tabs
    document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
    // deactivate all buttons
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));

    // show selected tab + activate button
    const tabEl = document.getElementById(tabId);
    if (tabEl) tabEl.classList.remove("hidden");
    button.classList.add("active");
  });
});


/* ---------- DROPDOWN BEHAVIOR TOGGLE ---------- */
const dropdownToggleBtn = document.getElementById("dropdown-toggle-mode");
const dropdownModeLabel = document.getElementById("dropdown-mode-label");
let dropdownPref = localStorage.getItem("idleinsect-dropdown-pref") || "auto";

function updateDropdownLabel() {
  dropdownModeLabel.textContent = dropdownPref === "auto" ? "Auto-Open" : "Keep Closed";
}

updateDropdownLabel();

dropdownToggleBtn.addEventListener("click", () => {
  dropdownPref = dropdownPref === "auto" ? "closed" : "auto";
  localStorage.setItem("idleinsect-dropdown-pref", dropdownPref);
  updateDropdownLabel();
  alert(`Dropdowns will now ${dropdownPref === "auto" ? "auto-open" : "stay closed"} on reload.`);
});


  /* ---------- SETTINGS MODAL ---------- */
  const settingsBtn = document.getElementById("settings-button");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettings = document.getElementById("close-settings");

  settingsBtn.addEventListener("click", () => settingsModal.classList.remove("hidden"));
  closeSettings.addEventListener("click", () => settingsModal.classList.add("hidden"));
  window.addEventListener("click", e => {
    if (e.target === settingsModal) settingsModal.classList.add("hidden");
  });

  /* ---------- SETTINGS TABS ---------- */
  const settingsTabs = document.querySelectorAll(".settings-tab-button");
  const tabSections = document.querySelectorAll(".settings-tab");
  settingsTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      settingsTabs.forEach(t => t.classList.remove("active"));
      tabSections.forEach(s => s.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  /* ---------- DARK MODE ---------- */
  const toggleBtn = document.getElementById("dark-mode-toggle");
  const savedTheme = localStorage.getItem("idleinsect-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("idleinsect-theme",
      document.body.classList.contains("dark") ? "dark" : "light");
  });

  /* ---------- UNIT BUY BUTTONS ---------- */
  ["larva", "ant", "forager", "worker", "queen", "digger", "scientist"].forEach(u => {
    const btn = document.getElementById(`buy-${u}`);
    if (btn) btn.addEventListener("click", () => buyUnit(u));
  });

  /* ---------- INITIAL UI UPDATE ---------- */
  updateUI();
  updateUnitStatus();
});

/* ---------------------------------------------------------
   SECTION 5: UNIT PURCHASE LOGIC
--------------------------------------------------------- */
const COST_MULTIPLIER = 1.15; // 15% increase per purchase

function buyUnit(unit) {
  if (window.buyFreeUnits) {
    units[unit].count++;
    unlockDependencies(unit);
    updateUI();
    return;
  }

  switch (unit) {
    case 'larva':
      if (food >= units.larva.cost) {
        food -= units.larva.cost;
        units.larva.count++;
        units.larva.cost = Math.ceil(units.larva.cost * COST_MULTIPLIER);
        unlockDependencies(unit);
      }
      break;
    case 'ant':
      if (food >= units.ant.cost && units.larva.count >= 1) {
        food -= units.ant.cost;
        units.larva.count--;
        units.ant.count++;
        units.ant.cost = Math.ceil(units.ant.cost * COST_MULTIPLIER);
        unlockDependencies(unit);
      }
      break;
    case 'forager':
      if (food >= units.forager.cost && units.ant.count >= 1) {
        food -= units.forager.cost;
        units.ant.count--;
        units.forager.count++;
        units.forager.cost = Math.ceil(units.forager.cost * COST_MULTIPLIER);
      }
      break;
    case 'worker':
      if (food >= units.worker.cost && units.ant.count >= 1) {
        food -= units.worker.cost;
        units.ant.count--;
        units.worker.count++;
        units.worker.cost = Math.ceil(units.worker.cost * COST_MULTIPLIER);
        unlockDependencies(unit);
      }
      break;
    case 'queen':
      if (food >= units.queen.cost && units.ant.count >= 50) {
        food -= units.queen.cost;
        units.ant.count -= 50;
        units.queen.count++;
        units.queen.cost = Math.ceil(units.queen.cost * COST_MULTIPLIER);
      }
      break;
    case 'digger':
      if (food >= units.digger.cost && units.ant.count >= 1) {
        food -= units.digger.cost;
        units.ant.count--;
        units.digger.count++;
        units.digger.cost = Math.ceil(units.digger.cost * COST_MULTIPLIER);
        unlockDependencies(unit);
      }
      break;
    case 'scientist':
      if (food >= units.scientist.costFood && minerals >= units.scientist.costMineral && units.ant.count >= 1) {
        food -= units.scientist.costFood;
        minerals -= units.scientist.costMineral;
        units.ant.count--;
        units.scientist.count++;
        units.scientist.costFood = Math.ceil(units.scientist.costFood * COST_MULTIPLIER);
        units.scientist.costMineral = Math.ceil(units.scientist.costMineral * COST_MULTIPLIER);
      }
      break;
  }
  // === Unlock Scientist when Minerals are gained ===
if (minerals > 0) {
  const sciUnit = document.getElementById("scientist-unit");
  const sciTab = document.querySelector(".dropdown-header[data-target='science-group']");
  if (sciUnit) sciUnit.classList.remove("hidden");
  if (sciTab) sciTab.parentElement.classList.remove("hidden");
  document.getElementById("mineral-container").classList.remove("hidden");
}

  updateUI();
}

function unlockDependencies(unit) {
  switch (unit) {
    case 'larva':
      document.getElementById('ant-unit').classList.remove('hidden');
      break;
    case 'ant':
      ['forager-unit', 'worker-unit', 'queen-unit'].forEach(id =>
        document.getElementById(id).classList.remove('hidden')
      );
      break;
    case 'worker':
      document.getElementById('soil-container').classList.remove('hidden');
      document.getElementById('digger-unit').classList.remove('hidden');
      break;
    case 'digger':
      document.getElementById('mineral-container').classList.remove('hidden');
      document.getElementById('scientist-unit').classList.remove('hidden');
      break;
    case 'scientist':
      document.getElementById('research-container').classList.remove('hidden');
      break;
  }
}



/* ---------------------------------------------------------
   SECTION 6: GAME LOOP
--------------------------------------------------------- */
let lastFrame = performance.now();
function gameLoop(now) {
  const delta = (now - lastFrame) / 1000;
  lastFrame = now;

  const foodPerSec =
    (units.larva.count * 0.5 * larvaBoost +
     units.ant.count * 1 * antBoost +
     units.forager.count * 5) * efficiencyMultiplier;
  const soilPerSec = units.worker.count * efficiencyMultiplier;
  const mineralPerSec = units.digger.count * efficiencyMultiplier;
  const researchPerSec = units.scientist.count * efficiencyMultiplier;

  food += foodPerSec * delta;
  soil += soilPerSec * delta;
  minerals += mineralPerSec * delta;
  research += researchPerSec * delta;

  units.larva.count += units.queen.count * 2 * queenMultiplier * delta;
  units.ant.count += units.queen.count * 0.1 * queenMultiplier * delta;

  document.getElementById("food").textContent = food.toFixed(2);
  document.getElementById("soil").textContent = soil.toFixed(2);
  document.getElementById("minerals").textContent = minerals.toFixed(2);
  document.getElementById("research").textContent = research.toFixed(2);

  document.getElementById("food-rate-text").textContent = `Food per sec: ${foodPerSec.toFixed(2)}`;
  document.getElementById("soil-rate-text").textContent = `Soil per sec: ${soilPerSec.toFixed(2)}`;
  document.getElementById("mineral-rate-text").textContent = `Minerals per sec: ${mineralPerSec.toFixed(2)}`;
  document.getElementById("research-rate-text").textContent = `Research per sec: ${researchPerSec.toFixed(2)}`;

  updateUnitStatus();
  requestAnimationFrame(gameLoop);
}
  // Ensure Skills tab unlocks dynamically
  if (research >= 1) {
    const skillsTab = document.getElementById("skills-tab-button");
    if (skillsTab && skillsTab.classList.contains("hidden")) {
      skillsTab.classList.remove("hidden");
    }
  }

requestAnimationFrame(gameLoop);

/* ---------------------------------------------------------
   SECTION 7: SKILLS & UPGRADES
--------------------------------------------------------- */
document.getElementById("buy-summary-upgrade").addEventListener("click", () => {
  if (research >= 2000 && !summaryUnlocked) {
    research -= 2000;
    summaryUnlocked = true;
    document.getElementById("production-summary").classList.remove("hidden");
    const btn = document.getElementById("buy-summary-upgrade");
    btn.textContent = "Unlocked!";
    btn.disabled = true;
  }
  updateUI();
});
document.getElementById("buy-efficiency").addEventListener("click", () => {
  if (research >= 5000) {
    research -= 5000;
    efficiencyMultiplier *= 1.1;
    const btn = document.getElementById("buy-efficiency");
    btn.textContent = "Unlocked!";
    btn.disabled = true;
    updateUI();
  }
});
document.getElementById("buy-drone").addEventListener("click", () => {
  if (food >= 1000 && units.ant.count >= 1) {
    food -= 1000;
    units.ant.count -= 1;
    droneCount++;
    queenMultiplier *= 1.01; // +1% queen production
    document.getElementById("drone-count").textContent = droneCount;
    updateUI();
  } else {
    alert("❌ Not enough Food or Ants to train a Drone!");
  }
});
// --- DRONE UPGRADE UNLOCK ---
document.getElementById("buy-drone-upgrade").addEventListener("click", () => {
  if (research >= 10000 && !droneUnlocked) {
    research -= 10000;
    droneUnlocked = true;
    document.getElementById("buy-drone-upgrade").textContent = "Unlocked!";
    document.getElementById("buy-drone-upgrade").disabled = true;
    document.getElementById("drone-training").classList.remove("hidden");
    updateUI();
  } else if (!droneUnlocked) {
    alert("❌ Not enough Research to unlock Drone Training!");
  }
});

// --- DRONE TRAINING ---
document.getElementById("buy-drone").addEventListener("click", () => {
  if (!droneUnlocked) return alert("You must unlock Drone Training first!");
  if (food >= 1000 && units.ant.count >= 1) {
    food -= 1000;
    units.ant.count -= 1;
    droneCount++;
    queenMultiplier *= 1.01; // +1% per Drone
    document.getElementById("drone-count").textContent = droneCount;
    updateUI();
  } else {
    alert("❌ Not enough Food or Ants to train a Drone!");
  }
});

document.getElementById("buy-queen-upgrade").addEventListener("click", () => {
  if (research >= 50000) {
    research -= 50000;
    queenMultiplier *= 2;
    const btn = document.getElementById("buy-queen-upgrade");
    btn.textContent = "Unlocked!";
    btn.disabled = true;
    updateUI();
  }
});
document.getElementById("buy-rebirth").addEventListener("click", () => {
  if (research >= 1e10) {
    research = 0; food = 50; soil = 0; minerals = 0;
    rebirthPoints++;
    document.getElementById("rebirth-points").textContent = rebirthPoints;
    document.getElementById("ascension-tab-button").classList.remove("hidden");
    const btn = document.getElementById("buy-rebirth");
    btn.textContent = "Ascended!"; btn.disabled = true;
    updateUI();
  }
});

/* ---------------------------------------------------------
   SECTION 8: ASCENSION
--------------------------------------------------------- */
document.getElementById("boost-larva").addEventListener("click", () => {
  if (rebirthPoints >= 1) { rebirthPoints--; larvaBoost *= 1.1;
    document.getElementById("rebirth-points").textContent = rebirthPoints; }
});
document.getElementById("boost-ant").addEventListener("click", () => {
  if (rebirthPoints >= 1) { rebirthPoints--; antBoost *= 1.1;
    document.getElementById("rebirth-points").textContent = rebirthPoints; }
});

/* ---------------------------------------------------------
   SECTION 9: SAVE / LOAD / IMPORT / EXPORT
--------------------------------------------------------- */
function showSaveNotification() {
  let notif = document.getElementById("save-notif");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "save-notif";
    notif.textContent = "💾 Game Saved!";
    Object.assign(notif.style, {
      position: "fixed",
      top: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(80, 160, 80, 0.9)",
      color: "white",
      padding: "8px 16px",
      borderRadius: "8px",
      fontWeight: "bold",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      zIndex: "9999",
      opacity: "0",
      transition: "opacity 0.4s ease",
    });
    document.body.appendChild(notif);
  }
  notif.style.opacity = "1";
  setTimeout(() => (notif.style.opacity = "0"), 1500);
}

function saveGame() {
  const data = {
    food, soil, minerals, research, rebirthPoints,
    larvaBoost, antBoost, summaryUnlocked,
    efficiencyMultiplier, queenMultiplier, units,
    droneUnlocked, droneCount
  };
  localStorage.setItem("idleInsectSave", JSON.stringify(data));
  localStorage.setItem("idleInsectSaveTime", Date.now());
  console.log("💾 Game autosaved!");
  showSaveNotification();
}

function loadGame() {
  const saved = localStorage.getItem("idleInsectSave");
  if (!saved) return;
  try {
    const data = JSON.parse(saved);
    food = data.food || 50;
    soil = data.soil || 0;
    minerals = data.minerals || 0;
    research = data.research || 0;
    rebirthPoints = data.rebirthPoints || 0;
    larvaBoost = data.larvaBoost || 1;
    antBoost = data.antBoost || 1;
    summaryUnlocked = data.summaryUnlocked || false;
    efficiencyMultiplier = data.efficiencyMultiplier || 1;
   droneUnlocked = data.droneUnlocked || false;
droneCount = data.droneCount || 0;
document.getElementById("drone-count").textContent = droneCount;

if (droneUnlocked) {
  document.getElementById("buy-drone-upgrade").textContent = "Unlocked!";
  document.getElementById("buy-drone-upgrade").disabled = true;
  document.getElementById("drone-training").classList.remove("hidden");
}

    queenMultiplier = data.queenMultiplier || 1;

    // Restore unit data
    for (const key in units) {
      if (data.units[key]) Object.assign(units[key], data.units[key]);
    }

// -----------------------------------------------------
// Restore unlocked unit visibility + auto-open dropdowns
// -----------------------------------------------------
let insectUnlocked = false;
let jobsUnlocked = false;
let scienceUnlocked = false;

// ---------- Insect Units ----------
if (units.ant.count > 0) {
  document.getElementById("ant-unit").classList.remove("hidden");
  insectUnlocked = true;
}
if (units.queen.count > 0) {
  document.getElementById("queen-unit").classList.remove("hidden");
  insectUnlocked = true;
}

// ---------- Job Units ----------
if (units.forager.count > 0) {
  document.getElementById("forager-unit").classList.remove("hidden");
  jobsUnlocked = true;
}
if (units.worker.count > 0) {
  document.getElementById("worker-unit").classList.remove("hidden");
  document.getElementById("soil-container").classList.remove("hidden");
  jobsUnlocked = true;
}
if (units.digger.count > 0) {
  document.getElementById("digger-unit").classList.remove("hidden");
  document.getElementById("mineral-container").classList.remove("hidden");
  jobsUnlocked = true;
}

// ---------- Science Unit ----------
if (units.scientist.count > 0) {
  document.getElementById("scientist-unit").classList.remove("hidden");
  document.getElementById("mineral-container").classList.remove("hidden");
  document.getElementById("research-container").classList.remove("hidden");
  const sciDropdown = document.getElementById("science-dropdown");
  if (sciDropdown) sciDropdown.classList.remove("hidden");

  scienceUnlocked = true;
}


// ---------- Auto-expand dropdowns ----------
function openDropdown(targetId) {
  const group = document.getElementById(targetId);
  const header = document.querySelector(`[data-target="${targetId}"]`);
  if (group && header) {
    group.classList.add("open");
    header.classList.remove("collapsed");
    const arrow = header.querySelector(".arrow");
    if (arrow) arrow.style.transform = "rotate(0deg)";
  }
}

// Apply dropdown preference
const dropdownPref = localStorage.getItem("idleinsect-dropdown-pref") || "auto";

if (dropdownPref === "auto") {
  if (insectUnlocked) openDropdown("insect-group");
  if (jobsUnlocked) openDropdown("jobs-group");
  if (scienceUnlocked) openDropdown("science-group");
} else {
  // Ensure all dropdowns start closed
  document.querySelectorAll(".dropdown-content").forEach(group => group.classList.remove("open"));
  document.querySelectorAll(".dropdown-header").forEach(header => {
    header.classList.add("collapsed");
    const arrow = header.querySelector(".arrow");
    if (arrow) arrow.style.transform = "rotate(-90deg)";
  });
}

// Restore unlocked tabs/features
if (summaryUnlocked)
  document.getElementById("production-summary").classList.remove("hidden");

if (research >= 1) {
  const skillsButton = document.getElementById("skills-tab-button");
  const skillsTab = document.getElementById("skills-tab");
  if (skillsButton) skillsButton.classList.remove("hidden");
  if (skillsTab) skillsTab.classList.remove("hidden");
} else {
  document.getElementById("skills-tab-button").classList.add("hidden");
  const skillsTab = document.getElementById("skills-tab");
  if (skillsTab) skillsTab.classList.add("hidden");
}

if (rebirthPoints >= 1)
  document.getElementById("ascension-tab-button").classList.remove("hidden");

updateUI();

// --- Ensure only Main tab shows on initial load ---
document.querySelectorAll(".tab").forEach(tab => tab.classList.add("hidden"));
const mainTab = document.getElementById("main-tab");
if (mainTab) mainTab.classList.remove("hidden");

// Reset tab button states
document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
const mainBtn = document.querySelector('[data-tab="main-tab"]');
if (mainBtn) mainBtn.classList.add("active");


    
  } catch (e) {
    console.error("❌ Error loading save:", e);
  }
}

function clearSave() {
  localStorage.removeItem("idleInsectSave");
  localStorage.removeItem("idleInsectSaveTime");
  console.log("🗑️ Save data cleared!");
}

/* ---------- MANUAL SAVE / LOAD / IMPORT / EXPORT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("manual-save");
  const loadBtn = document.getElementById("manual-load");
  const clearBtn = document.getElementById("manual-clear");
  const exportBtn = document.getElementById("export-save");
  const importBtn = document.getElementById("import-save");

  if (saveBtn) saveBtn.addEventListener("click", () => {
    saveGame();
  });

  if (loadBtn) loadBtn.addEventListener("click", () => {
    loadGame();
    alert("✅ Game loaded!");
  });

  if (clearBtn) clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your save?")) {
      clearSave();
      alert("🗑️ Save data cleared!");
      location.reload();
    }
  });

  if (exportBtn) exportBtn.addEventListener("click", () => {
    const data = localStorage.getItem("idleInsectSave");
    if (!data) return alert("No save data to export!");
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "IdleInsectSave.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  if (importBtn) importBtn.addEventListener("click", async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async e => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        JSON.parse(text); // validation
        localStorage.setItem("idleInsectSave", text);
        alert("✅ Save imported! Reloading game...");
        location.reload();
      } catch {
        alert("❌ Invalid save file.");
      }
    };
    input.click();
  });
});

window.addEventListener("load", loadGame);
setInterval(saveGame, 10000);

/* ---------------------------------------------------------
   SECTION 10: INITIALIZE
--------------------------------------------------------- */
window.addEventListener("load", () => {
  updateUI();
  updateUnitStatus();
});