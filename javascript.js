/* =========================================================
   Idle Insect — Main Game Script (Organized Version)
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
  // Update main resource counters
  document.getElementById("food").textContent = food.toFixed(1);
  document.getElementById("soil").textContent = soil.toFixed(1);
  document.getElementById("minerals").textContent = minerals.toFixed(1);
  document.getElementById("research").textContent = research.toFixed(1);

  // Update each unit’s owned count and cost
  for (const key in units) {
    const countEl = document.getElementById(`${key}-count`);
    if (countEl) countEl.textContent = units[key].count;

    const costEl = document.getElementById(`${key}-cost`);
    if (costEl && units[key].cost)
      costEl.textContent = units[key].cost.toFixed(0);
  }

  // Unlock Skills tab once any research is earned
  if (research >= 1) {
    document.getElementById("skills-tab-button").classList.remove("hidden");
  }

  // Update purchase status each time UI refreshes
  updateUnitStatus();
}

function updateUnitStatus() {
  const statusMap = {
    larva: {
      check: food >= units.larva.cost,
      need: `Cost: ${units.larva.cost.toFixed(0)} Food`
    },
    ant: {
      check: food >= units.ant.cost && units.larva.count >= 1,
      need: `Cost: ${units.ant.cost.toFixed(0)} Food + 1 Larva`
    },
    forager: {
      check: food >= units.forager.cost && units.ant.count >= 1,
      need: `Cost: ${units.forager.cost.toFixed(0)} Food + 1 Ant`
    },
    worker: {
      check: food >= units.worker.cost && units.ant.count >= 1,
      need: `Cost: ${units.worker.cost.toFixed(0)} Food + 1 Ant`
    },
    queen: {
      check: food >= units.queen.cost && units.ant.count >= 50,
      need: `Cost: ${units.queen.cost.toFixed(0)} Food + 50 Ants`
    },
    digger: {
      check: food >= units.digger.cost && units.ant.count >= 1,
      need: `Cost: ${units.digger.cost.toFixed(0)} Food + 1 Ant`
    },
    scientist: {
      check:
        food >= units.scientist.costFood &&
        minerals >= units.scientist.costMineral &&
        units.ant.count >= 1,
      need: `Cost: ${units.scientist.costFood.toFixed(0)} Food + ${units.scientist.costMineral.toFixed(0)} Minerals + 1 Ant`
    },
  };

  for (const key in statusMap) {
    const el = document.getElementById(`${key}-status`);
    if (!el) continue;

    const { check, need } = statusMap[key];
    if (check) {
      el.textContent = `✅ Enough resources (${need})`;
      el.style.color = "green";
    } else {
      el.textContent = `❌ Not enough resources (${need})`;
      el.style.color = "red";
    }
  }
}


/* ---------------------------------------------------------
   SECTION 4: UNIT PURCHASE LOGIC
--------------------------------------------------------- */
function buyUnit(unit) {
  switch (unit) {
    case "larva":
      if (food >= units.larva.cost) {
        food -= units.larva.cost;
        units.larva.count++;
        units.larva.cost += 10;
        document.getElementById("ant-unit").classList.remove("hidden");
      }
      break;

    case "ant":
      if (food >= units.ant.cost && units.larva.count >= 1) {
        food -= units.ant.cost;
        units.larva.count--;
        units.ant.count++;
        units.ant.cost += 40;
        ["forager-unit", "worker-unit", "queen-unit"].forEach(id =>
          document.getElementById(id).classList.remove("hidden")
        );
      }
      break;

    case "forager":
      if (food >= units.forager.cost && units.ant.count >= 1) {
        food -= units.forager.cost;
        units.ant.count--;
        units.forager.count++;
        units.forager.cost += 100;
      }
      break;

    case "worker":
      if (food >= units.worker.cost && units.ant.count >= 1) {
        food -= units.worker.cost;
        units.ant.count--;
        units.worker.count++;
        document.getElementById("soil-container").classList.remove("hidden");
        document.getElementById("digger-unit").classList.remove("hidden");
      }
      break;

    case "queen":
      if (food >= units.queen.cost && units.ant.count >= 50) {
        food -= units.queen.cost;
        units.ant.count -= 50;
        units.queen.count++;
        units.queen.cost += 200;
      }
      break;

    case "digger":
      if (food >= units.digger.cost && units.ant.count >= 1) {
        food -= units.digger.cost;
        units.ant.count--;
        units.digger.count++;
        document.getElementById("mineral-container").classList.remove("hidden");
        document.getElementById("scientist-unit").classList.remove("hidden");
      }
      break;

    case "scientist":
      if (
        food >= units.scientist.costFood &&
        minerals >= units.scientist.costMineral &&
        units.ant.count >= 1
      ) {
        food -= units.scientist.costFood;
        minerals -= units.scientist.costMineral;
        units.ant.count--;
        units.scientist.count++;
        document.getElementById("research-container").classList.remove("hidden");
      }
      break;
  }
  updateUI();
}

["larva", "ant", "forager", "worker", "queen", "digger", "scientist"].forEach(u =>
  document.getElementById(`buy-${u}`).addEventListener("click", () => buyUnit(u))
);

/* ---------------------------------------------------------
   SECTION 5: GAME LOOP (Smooth Resource Generation)
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

  updateProgressBars();
  updateUnitStatus();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

/* ---------------------------------------------------------
   SECTION 6: SKILLS & UPGRADES
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
    research = 0;
    food = 50;
    soil = 0;
    minerals = 0;
    rebirthPoints++;
    document.getElementById("rebirth-points").textContent = rebirthPoints;
    document.getElementById("ascension-tab-button").classList.remove("hidden");
    const btn = document.getElementById("buy-rebirth");
    btn.textContent = "Ascended!";
    btn.disabled = true;
    updateUI();
  }
});

/* ---------------------------------------------------------
   SECTION 7: ASCENSION (RESETS & PERMANENT BOOSTS)
--------------------------------------------------------- */
document.getElementById("boost-larva").addEventListener("click", () => {
  if (rebirthPoints >= 1) {
    rebirthPoints--;
    larvaBoost *= 1.1;
    document.getElementById("rebirth-points").textContent = rebirthPoints;
  }
});

document.getElementById("boost-ant").addEventListener("click", () => {
  if (rebirthPoints >= 1) {
    rebirthPoints--;
    antBoost *= 1.1;
    document.getElementById("rebirth-points").textContent = rebirthPoints;
  }
});

/* ---------------------------------------------------------
   SECTION 8: DARK MODE (Persistent Theme)
--------------------------------------------------------- */
const toggleBtn = document.getElementById("dark-mode-toggle");
const savedTheme = localStorage.getItem("idleinsect-theme");
if (savedTheme === "dark") document.body.classList.add("dark");

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "idleinsect-theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

/* ---------------------------------------------------------
   SECTION 9: TAB SWITCHING
--------------------------------------------------------- */
const tabs = document.querySelectorAll(".tab-button");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.remove("hidden");
  });
});

/* ---------------------------------------------------------
   SECTION 10: PROGRESS BAR UPDATES
--------------------------------------------------------- */
function updateProgressBars() {
  const values = {
    larva: units.larva.count * 0.5 * larvaBoost * efficiencyMultiplier,
    ant: units.ant.count * 1 * antBoost * efficiencyMultiplier,
    forager: units.forager.count * 5 * efficiencyMultiplier,
    worker: units.worker.count * 1 * efficiencyMultiplier,
    digger: units.digger.count * 1 * efficiencyMultiplier,
    scientist: units.scientist.count * 1 * efficiencyMultiplier,
  };

  for (const key in values) setProgress(`${key}-progress`, values[key]);
}

function setProgress(id, value) {
  const bar = document.getElementById(id);
  if (!bar) return;

  let colorVar = "--bar-food";
  let tooltipText = "Generating Food";

  if (id.includes("worker")) {
    colorVar = "--bar-soil";
    tooltipText = "Generating Soil";
  } else if (id.includes("digger")) {
    colorVar = "--bar-mineral";
    tooltipText = "Generating Minerals";
  } else if (id.includes("scientist")) {
    colorVar = "--bar-research";
    tooltipText = "Generating Research";
  }

  bar.style.backgroundColor = `var(${colorVar})`;
  bar.title = tooltipText;

  const capped = Math.min(value * 10, 100);
  bar.style.width = `${capped}%`;
}
setInterval(updateProgressBars, 1000);

/* ---------------------------------------------------------
   SECTION 11: LORE BOXES (Dynamic for All Units)
--------------------------------------------------------- */
const unitLore = {
  larva: "Legless, worm-like creature that resembles a small white grub. Grows rapidly before transforming into an adult ant.",
  ant: "The tireless workers of the colony, gathering food and expanding tunnels for survival.",
  forager: "Bold explorers that venture far from the nest in search of new food sources.",
  worker: "Diligent builders shaping the colony’s structure, moving soil grain by grain.",
  queen: "The matriarch of the colony, birthing countless offspring and ensuring survival.",
  digger: "Hardy ants that carve deep into the earth, unearthing valuable minerals.",
  scientist: "Brilliant minds of the insect world, turning raw materials into knowledge and progress."
};

Object.keys(unitLore).forEach(unit => {
  const unitEl = document.getElementById(`${unit}-unit`);
  if (!unitEl) return;

  const btn = document.createElement("button");
  btn.className = "info-btn";
  btn.textContent = "About";
  unitEl.appendChild(btn);

  const box = document.createElement("div");
  box.className = "info-box hidden";
  box.innerHTML = `
    <div class="info-header">
      <span class="close-btn">&times;</span>
      <strong>${unit.charAt(0).toUpperCase() + unit.slice(1)}</strong>
    </div>
    <p>${unitLore[unit]}</p>`;
  document.body.appendChild(box);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const rect = btn.getBoundingClientRect();
    box.style.left = `${rect.right + 10}px`;
    box.style.top = `${rect.top - 10}px`;
    box.classList.remove("hidden");
  });

  box.querySelector(".close-btn").addEventListener("click", () => box.classList.add("hidden"));
  window.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== btn) box.classList.add("hidden");
  });
});

/* ---------------------------------------------------------
   SECTION 12: AUTOSAVE, LOAD & OFFLINE PROGRESS
--------------------------------------------------------- */

// Save the current game state periodically
function saveGame() {
  const data = {
    food,
    soil,
    minerals,
    research,
    rebirthPoints,
    larvaBoost,
    antBoost,
    summaryUnlocked,
    efficiencyMultiplier,
    queenMultiplier,
    units
  };
  localStorage.setItem("idleInsectSave", JSON.stringify(data));
  localStorage.setItem("idleInsectSaveTime", Date.now());
  console.log("💾 Game autosaved!");
}

// Load the saved game state (if it exists) and handle offline progress
function loadGame() {
  const saved = localStorage.getItem("idleInsectSave");
  const savedTime = localStorage.getItem("idleInsectSaveTime");
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
    queenMultiplier = data.queenMultiplier || 1;

    // Safely merge unit data
    for (const key in units) {
      if (data.units[key]) Object.assign(units[key], data.units[key]);
    }

    // --- OFFLINE PROGRESS ---
    if (savedTime) {
      const secondsOffline = Math.floor((Date.now() - parseInt(savedTime)) / 1000);
      if (secondsOffline > 10) {
        const foodPerSec =
          (units.larva.count * 0.5 * larvaBoost +
           units.ant.count * 1 * antBoost +
           units.forager.count * 5) * efficiencyMultiplier;
        const soilPerSec = units.worker.count * efficiencyMultiplier;
        const mineralPerSec = units.digger.count * efficiencyMultiplier;
        const researchPerSec = units.scientist.count * efficiencyMultiplier;

        // Apply offline gains
        food += foodPerSec * secondsOffline;
        soil += soilPerSec * secondsOffline;
        minerals += mineralPerSec * secondsOffline;
        research += researchPerSec * secondsOffline;

        // Auto-queen production during offline
        units.larva.count += units.queen.count * 2 * queenMultiplier * secondsOffline;
        units.ant.count += units.queen.count * 0.1 * queenMultiplier * secondsOffline;

        // Notify player (simple alert for now)
        alert(`🐜 Welcome back! You were away for ${secondsOffline.toLocaleString()} seconds and your colony kept working!`);
      }
    }

    // Restore unlocked UI elements
    if (summaryUnlocked)
      document.getElementById("production-summary").classList.remove("hidden");
    if (research >= 1)
      document.getElementById("skills-tab-button").classList.remove("hidden");
    if (rebirthPoints >= 1)
      document.getElementById("ascension-tab-button").classList.remove("hidden");

    updateUI();
    console.log("✅ Game loaded successfully!");
  } catch (e) {
    console.error("❌ Error loading save:", e);
  }
}

// Delete save (for debugging or reset button)
function clearSave() {
  localStorage.removeItem("idleInsectSave");
  localStorage.removeItem("idleInsectSaveTime");
  console.log("🗑️ Save data cleared!");
}

// Load on startup
window.addEventListener("load", loadGame);

// Autosave every 10 seconds
setInterval(saveGame, 10000);

/* ---------------------------------------------------------
   SECTION 13: DEVELOPER CHEATS (Console Commands + UI Badge)
--------------------------------------------------------- */

// Make sure cheats are globally accessible right away
let swarm_cheats_enabled = false;

// Create on-screen badge for active cheat mode
const cheatBadge = document.createElement("div");
cheatBadge.id = "cheat-badge";
cheatBadge.textContent = "🐜 CHEAT MODE ACTIVE";
Object.assign(cheatBadge.style, {
  position: "fixed",
  bottom: "10px",
  right: "10px",
  background: "rgba(255, 0, 0, 0.85)",
  color: "white",
  fontWeight: "bold",
  padding: "6px 10px",
  borderRadius: "6px",
  fontSize: "13px",
  zIndex: "9999",
  display: "none",
  boxShadow: "0 0 8px rgba(255,0,0,0.6)",
  transition: "opacity 0.4s ease"
});

document.body.appendChild(cheatBadge);

// ---------------------- Core Enable / Disable ----------------------
function handleCheatEnable(value) {
  if (parseInt(value) === 1) {
    swarm_cheats_enabled = true;
    cheatBadge.style.display = "block";
    cheatBadge.style.opacity = "1";
    console.log("%c🐜 Cheat mode ENABLED!", "color: lime; font-weight: bold;");
    console.log("Available commands:");
    console.log("  swarm_food(amount)      → Add Food");
    console.log("  swarm_minerals(amount)  → Add Minerals");
    console.log("  swarm_research(amount)  → Add Research");
    console.log("  swarm_unlock_all()      → Unlock all content");
  } else {
    swarm_cheats_enabled = false;
    cheatBadge.style.opacity = "0";
    setTimeout(() => (cheatBadge.style.display = "none"), 400);
    console.log("%c❌ Cheat mode DISABLED.", "color: red; font-weight: bold;");
  }
}

// ---------------------- Enable / Disable Command ----------------------
window.swarm_cheat_enable = function (value = 0) {
  handleCheatEnable(value);
};

// Optional friendly aliases
window.enableCheats = () => swarm_cheat_enable(1);
window.disableCheats = () => swarm_cheat_enable(0);

// ---------------------- Resource Cheats ----------------------
window.swarm_food = function (amount) {
  if (!swarm_cheats_enabled)
    return console.warn("Cheats are disabled. Use swarm_cheat_enable(1) first.");
  const amt = parseFloat(amount) || 0;
  food += amt;
  console.log(`+${amt} Food added.`);
  updateUI();
};

window.swarm_minerals = function (amount) {
  if (!swarm_cheats_enabled)
    return console.warn("Cheats are disabled. Use swarm_cheat_enable(1) first.");
  const amt = parseFloat(amount) || 0;
  minerals += amt;
  console.log(`+${amt} Minerals added.`);
  updateUI();
};

window.swarm_research = function (amount) {
  if (!swarm_cheats_enabled)
    return console.warn("Cheats are disabled. Use swarm_cheat_enable(1) first.");
  const amt = parseFloat(amount) || 0;
  research += amt;
  console.log(`+${amt} Research added.`);
  updateUI();
};

// ---------------------- Unlock Everything ----------------------
window.swarm_unlock_all = function () {
  if (!swarm_cheats_enabled)
    return console.warn("Cheats are disabled. Use swarm_cheat_enable(1) first.");

  [
    "ant-unit",
    "forager-unit",
    "worker-unit",
    "queen-unit",
    "digger-unit",
    "scientist-unit"
  ].forEach(id => document.getElementById(id)?.classList.remove("hidden"));

  ["soil-container", "mineral-container", "research-container"].forEach(id =>
    document.getElementById(id)?.classList.remove("hidden")
  );

  document.getElementById("skills-tab-button")?.classList.remove("hidden");
  document.getElementById("ascension-tab-button")?.classList.remove("hidden");
  document.getElementById("production-summary")?.classList.remove("hidden");

  food = Math.max(food, 10000);
  soil = Math.max(soil, 1000);
  minerals = Math.max(minerals, 1000);
  research = Math.max(research, 10000);

  updateUI();
  console.log("%c🚀 All units, skills, and tabs unlocked!", "color: cyan; font-weight: bold;");
};

console.log(
  "%c🧩 Idle Insect cheat system loaded. Type swarm_cheat_enable(1) or enableCheats() to begin. To disable cheats, type swarm_cheat_enable(0) or disableCheats().",
  "color: orange;"
);


/* ---------------------------------------------------------
   SECTION 14: INITIALIZE
--------------------------------------------------------- */
updateUI();
updateUnitStatus();
