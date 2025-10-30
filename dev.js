/* =========================================================
   Idle Swarm — Developer / Cheat Tools (Stable + Tab Fix)
   ========================================================= */

if (!window.swarm_dev_initialized) {
  window.swarm_dev_initialized = true;

  let swarm_cheats_enabled = false;
  let cheatBadge = null;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(() => {
    // === Create Badge ===
    cheatBadge = document.getElementById("cheat-badge");
    if (!cheatBadge) {
      cheatBadge = document.createElement("div");
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
        opacity: "0",
        boxShadow: "0 0 8px rgba(255,0,0,0.6)",
        transition: "opacity 0.4s ease, transform 0.4s ease"
      });
      document.body.appendChild(cheatBadge);

      const style = document.createElement("style");
      style.textContent = `
        @keyframes cheatPulse {
          0% { transform: scale(1); background: rgba(255, 0, 0, 0.85); }
          50% { transform: scale(1.15); background: rgba(255, 140, 0, 0.95); }
          100% { transform: scale(1); background: rgba(255, 0, 0, 0.85); }
        }
        #cheat-badge.pulsing {
          animation: cheatPulse 0.8s ease-in-out 3;
        }
      `;
      document.head.appendChild(style);
    }

    // === TAB REBIND FUNCTION ===
    function rebindTabButtons() {
      const buttons = document.querySelectorAll(".tab-button");
      buttons.forEach(btn => {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
      });

      document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", () => {
          const tabId = button.dataset.tab;
          document.querySelectorAll(".tab").forEach(tab => tab.classList.add("hidden"));
          document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
          button.classList.add("active");
          document.getElementById(tabId).classList.remove("hidden");
        });
      });
    }

    // === SHOW/HIDE CHEATS TAB ===
    function showCheatsTab() {
      const btn = document.getElementById("cheats-tab-button");
      const tab = document.getElementById("cheats-tab");
      if (btn && tab) {
        btn.classList.remove("hidden");
        tab.classList.remove("hidden");
      }

      // Rebind tab events so Skills/Main still work
      rebindTabButtons();

      // Resource buttons
      document.querySelectorAll(".cheat-add").forEach(b => {
        b.onclick = () => {
          if (!swarm_cheats_enabled) return;
          const res = b.dataset.resource;
          const amt = parseFloat(b.dataset.amount);
          switch (res) {
            case "food": food += amt; break;
            case "soil": soil += amt; break;
            case "minerals": minerals += amt; break;
            case "research": research += amt; break;
          }
          updateUI();
        };
      });

      // Free unit toggle
      const freeToggle = document.getElementById("toggle-free-units");
      if (freeToggle) {
        freeToggle.onclick = () => {
          const active = freeToggle.dataset.enabled === "true";
          freeToggle.dataset.enabled = (!active).toString();
          if (active) {
            freeToggle.textContent = "Enable Free Unit Buying";
            window.buyFreeUnits = false;
            console.log("%c💰 Free unit buying disabled.", "color: orange;");
          } else {
            freeToggle.textContent = "Disable Free Unit Buying";
            window.buyFreeUnits = true;
            console.log("%c💸 Free unit buying enabled.", "color: lime;");
          }
        };
      }
    }

    function hideCheatsTab() {
      const btn = document.getElementById("cheats-tab-button");
      const tab = document.getElementById("cheats-tab");
      if (btn && tab) {
        btn.classList.add("hidden");
        tab.classList.add("hidden");
      }
      rebindTabButtons();
    }

    // === ENABLE / DISABLE CHEATS ===
    function handleCheatEnable(value) {
      const isEnable = parseInt(value) === 1;
      swarm_cheats_enabled = isEnable;

      if (isEnable) {
        document.body.classList.add("devmode"); // Green-glow mode
        showCheatsTab();
        cheatBadge.textContent = "🐜 CHEAT MODE ACTIVE";
        cheatBadge.style.background = "rgba(255, 0, 0, 0.85)";
        cheatBadge.style.display = "block";
        requestAnimationFrame(() => {
          cheatBadge.style.opacity = "1";
          cheatBadge.classList.add("pulsing");
          setTimeout(() => cheatBadge.classList.remove("pulsing"), 2400);
        });
        console.log("%c🐜 Cheat mode ENABLED!", "color: lime; font-weight: bold;");
      } else {
        document.body.classList.remove("devmode"); // Remove glow
        hideCheatsTab();
        cheatBadge.textContent = "🔒 DEV MODE DISABLED";
        cheatBadge.style.background = "rgba(80,80,80,0.9)";
        cheatBadge.style.opacity = "1";
        setTimeout(() => {
          cheatBadge.style.opacity = "0";
          setTimeout(() => (cheatBadge.style.display = "none"), 400);
        }, 1000);
        console.log("%c❌ Cheat mode DISABLED.", "color: red; font-weight: bold;");
      }
    }

    // === GLOBAL FUNCTIONS ===
    window.swarm_cheat_enable = value => handleCheatEnable(value);
    window.enableCheats = () => swarm_cheat_enable(1);
    window.disableCheats = () => swarm_cheat_enable(0);

    // === BASIC CHEATS ===
    window.swarm_food = amount => {
      if (!swarm_cheats_enabled) return console.warn("Cheats disabled.");
      food += parseFloat(amount) || 0;
      updateUI();
    };
    window.swarm_soil = amount => {
      if (!swarm_cheats_enabled) return console.warn("Cheats disabled.");
      soil += parseFloat(amount) || 0;
      updateUI();
    };
    window.swarm_minerals = amount => {
      if (!swarm_cheats_enabled) return console.warn("Cheats disabled.");
      minerals += parseFloat(amount) || 0;
      updateUI();
    };
    window.swarm_research = amount => {
      if (!swarm_cheats_enabled) return console.warn("Cheats disabled.");
      research += parseFloat(amount) || 0;
      updateUI();
    };

    // === AUTO ENABLE ON LOAD ===
    setTimeout(() => window.enableCheats(), 400);

    console.log("%c🧩 Idle Swarm Dev Tools loaded (Cheats ready).", "color: orange;");
  });
}
