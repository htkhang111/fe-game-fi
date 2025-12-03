<template>
  <div class="explore-page">

    <div class="status-bar">
      <div class="stat-item">
        <span class="icon-emoji">❤️</span> {{ playerStore.stats.hp }}/{{ playerStore.stats.maxHp }}
      </div>
      <div class="stat-item">
        <span class="icon-emoji">⚡</span> {{ playerStore.stats.energy }}/{{ playerStore.stats.maxEnergy }}
      </div>
      <div class="stat-item">
        <span class="icon-emoji">💰</span> {{ playerStore.stats.gold }}
      </div>
    </div>

    <div class="game-layout">

      <div class="stage-area">
        <div class="stage-background">

          <div class="actor player" :class="{ 'moving-right': isMoving, 'attack-anim': pAnim }">
            <div class="avatar-circle" :class="{ 'walk-anim': isMoving }">
              <img src="@/assets/img/c-Samurai.png" class="avatar-img" />
            </div>
            <div class="label">Bạn</div>
            <div v-if="pDmgPop" class="dmg-popup text-red">-{{ pDmgVal }}</div>
            <div v-if="pParryPop" class="dmg-popup text-yellow">PERFECT PARRY!</div>
          </div>

          <div class="spacer"></div>

          <div v-if="showParryBtn" class="parry-zone">
            <button class="btn-parry" @click="manualParry">
              🛡️ ĐỠ NGAY!
              <div class="timer-bar"></div>
            </button>
          </div>

          <div class="actor target" :style="{ opacity: showTarget ? 1 : 0 }">
            <div class="avatar-target" :class="{ 'shake-anim': eAnim, 'is-enemy': isEncounter }">
              <img v-if="targetImage" :src="targetImage" class="avatar-img" />
            </div>
            <div class="label">{{ targetName }}</div>

            <div v-if="isEncounter" class="mini-hp-bar">
              <div class="fill" :style="{ width: (enemyStats.hp / enemyStats.maxHp * 100) + '%' }"></div>
            </div>
            <div v-if="eDmgPop" class="dmg-popup text-red">-{{ eDmgVal }}</div>
          </div>

        </div>

        <div class="controls">
          <template v-if="!isEncounter && !isBattling">
            <button class="btn-explore" @click="startExploration" :disabled="isMoving || playerStore.stats.hp <= 0">
              <span v-if="!isMoving">👣 PHIÊU LƯU</span>
              <span v-else>⏳ Đang đi... ({{ countdown }}s)</span>
            </button>

            <button class="btn-back" @click="$router.push('/village')" :disabled="isMoving">
              🏘️ Về làng
            </button>
          </template>

          <template v-if="isEncounter && !isBattling">
            <div class="encounter-actions">
              <button class="btn-ignore" @click="ignoreEncounter">🏃 Bỏ qua</button>
              <button class="btn-fight" @click="startAutoBattle">⚔️ CHIẾN ĐẤU</button>
            </div>
          </template>

          <template v-if="isBattling">
            <div class="battle-status">
              <span v-if="showParryBtn" class="text-parry">⚠️ BẤM ĐỠ ĐÒN NHANH!</span>
              <span v-else>⚔️ Đang giao tranh...</span>
            </div>
          </template>

        </div>
      </div>

      <div class="log-area">
        <h3>📜 Nhật ký hành trình</h3>
        <div class="log-container" ref="logContainer">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            <span class="time">[{{ log.time }}]</span>
            <span class="content" v-html="log.msg"></span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();

// --- STATE ---
const isMoving = ref(false);
const isEncounter = ref(false);
const isBattling = ref(false);
const showTarget = ref(false);
const countdown = ref(0);

// Visual State
const targetImage = ref('');
const targetName = ref('');
const pAnim = ref(false);
const eAnim = ref(false);
const pDmgPop = ref(false);
const pDmgVal = ref(0);
const pParryPop = ref(false);
const eDmgPop = ref(false);
const eDmgVal = ref(0);

const showParryBtn = ref(false);
let parryResolver = null;

const enemyStats = reactive({ hp: 0, maxHp: 0, atk: 0, spd: 0 });
const logContainer = ref(null);
const logs = ref([{ time: getCurrentTime(), msg: 'Đứng tại bìa rừng.' }]);

// HELPERS
function getCurrentTime() { const now = new Date(); return `${now.getHours()}:${now.getMinutes()}`; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1) + min); }
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Hàm lấy ảnh an toàn
const getEnemyAsset = (name) => {
  try {
    return new URL(`../assets/img/enemies/${name}`, import.meta.url).href;
  } catch (e) { return ''; }
};

const getAsset = (name) => {
  try {
    return new URL(`../assets/img/${name}`, import.meta.url).href;
  } catch (e) { return ''; }
};

const addLog = async (msg) => {
  logs.value.push({ time: getCurrentTime(), msg });
  if (logs.value.length > 50) logs.value.shift();
  await nextTick();
  if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight;
};

// --- LOGIC DI CHUYỂN ---
const startExploration = () => {
  if (isMoving.value) return;
  isMoving.value = true;
  showTarget.value = false;
  isEncounter.value = false;

  const duration = rand(3, 5);
  countdown.value = duration;
  addLog('Bạn bắt đầu bước đi...');

  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      revealEvent();
    }
  }, 1000);
};

const revealEvent = () => {
  isMoving.value = false;
  const roll = Math.random() * 100;

  if (roll < 30) {
    showTarget.value = false;
    addLog('<span style="color:gray">Khu rừng yên tĩnh...</span>');
  } else if (roll < 60) {
    showTarget.value = true;
    const gold = rand(5, 15);
    playerStore.stats.gold += gold;

    // Load ảnh Vàng (Giả sử bạn có file items/gold.png, nếu chưa có dùng tạm ảnh khác)
    targetImage.value = ''; // Để trống hoặc link ảnh vàng
    targetName.value = 'Túi vàng';

    addLog(`<span style="color:#ffd166">Nhặt được <b>${gold} Gold</b>!</span>`);
  } else {
    showTarget.value = true;
    spawnEnemy();
    isEncounter.value = true;
    addLog(`<span style="color:#ef476f">⚔️ Gặp <b>${targetName.value}</b>! Chiến hay Bỏ?</span>`);
  }
};

const spawnEnemy = () => {
  // Tên file ảnh trong thư mục assets/img/enemies/
  // Hãy chắc chắn bạn đã tạo thư mục và có file ảnh
  const enemies = ['goblin.png', 'wolf.png', 'skeleton.png'];
  const chosen = enemies[Math.floor(Math.random() * enemies.length)];

  targetImage.value = getEnemyAsset(chosen);
  targetName.value = chosen.split('.')[0].toUpperCase();

  enemyStats.maxHp = rand(30, 50);
  enemyStats.hp = enemyStats.maxHp;
  enemyStats.atk = rand(5, 8);
  enemyStats.spd = rand(8, 12);
};

const ignoreEncounter = () => {
  isEncounter.value = false;
  targetImage.value = '';
  targetName.value = 'Đã bỏ qua';
  addLog('<span style="color:#aaa">Bạn lẳng lặng đi vòng qua con quái.</span>');
};

// --- BATTLE LOGIC (Giữ nguyên logic cũ, chỉ sửa hiển thị ảnh) ---
const startAutoBattle = async () => {
  isEncounter.value = false;
  isBattling.value = true;
  addLog('<span style="color:#ef476f"><b>--- BẮT ĐẦU ---</b></span>');
  await delay(500);

  while (playerStore.stats.hp > 0 && enemyStats.hp > 0) {
    const pSpd = playerStore.stats.spd;
    const eSpd = enemyStats.spd;
    let first = 'player';
    if (eSpd > pSpd) first = 'enemy';
    else if (eSpd === pSpd) first = Math.random() < 0.5 ? 'player' : 'enemy';

    if (first === 'player') await playerAttack();
    else await enemyAttack();

    if (enemyStats.hp <= 0 || playerStore.stats.hp <= 0) break;
    await delay(800);

    if (first === 'player') await enemyAttack();
    else await playerAttack();

    if (enemyStats.hp <= 0 || playerStore.stats.hp <= 0) break;
    await delay(1000);
  }

  isBattling.value = false;
  showParryBtn.value = false;

  if (playerStore.stats.hp > 0) {
    targetImage.value = '';
    addLog('<span style="color:#06d6a0"><b>CHIẾN THẮNG!</b></span>');
    playerStore.stats.gold += 10;
    playerStore.stats.exp += 20;
  } else {
    addLog('<span style="color:red"><b>THẤT BẠI!</b></span>');
    playerStore.stats.hp = 1;
  }
};

const playerAttack = async () => {
  pAnim.value = true;
  await delay(200);
  pAnim.value = false;
  const dmg = Math.max(1, playerStore.stats.atk);
  enemyStats.hp = Math.max(0, enemyStats.hp - dmg);
  eDmgVal.value = dmg;
  eDmgPop.value = true;
  setTimeout(() => eDmgPop.value = false, 500);
  addLog(`Bạn đánh <b>${dmg}</b> sát thương.`);
};

const enemyAttack = async () => {
  eAnim.value = true;
  addLog(`<span style="color:#ef476f">${targetName.value} chuẩn bị tấn công!</span>`);
  const canParry = Math.random() < 0.4;

  if (canParry) {
    showParryBtn.value = true;
    const success = await waitForUserParry();
    showParryBtn.value = false;
    eAnim.value = false;

    if (success) {
      pParryPop.value = true;
      setTimeout(() => pParryPop.value = false, 1000);
      addLog(`<span style="color:yellow"><b>PERFECT PARRY!</b></span> Bạn phản đòn!`);
      const reflectDmg = Math.floor(enemyStats.atk * 0.5);
      enemyStats.hp = Math.max(0, enemyStats.hp - reflectDmg);
      eDmgVal.value = reflectDmg;
      eDmgPop.value = true;
      setTimeout(() => eDmgPop.value = false, 500);
      return;
    } else {
      addLog(`<span style="color:gray">Đỡ trượt rồi!</span>`);
    }
  } else {
    await delay(400);
    eAnim.value = false;
  }

  const dmg = Math.max(1, enemyStats.atk - Math.floor(playerStore.stats.def / 2));
  playerStore.stats.hp = Math.max(0, playerStore.stats.hp - dmg);
  pDmgVal.value = dmg;
  pDmgPop.value = true;
  setTimeout(() => pDmgPop.value = false, 500);
  addLog(`Bạn chịu <span style="color:red">${dmg}</span> sát thương.`);
};

const waitForUserParry = () => {
  return new Promise((resolve) => {
    parryResolver = resolve;
    setTimeout(() => {
      if (parryResolver) {
        parryResolver(false);
        parryResolver = null;
      }
    }, 1500);
  });
};

const manualParry = () => {
  if (parryResolver) {
    parryResolver(true);
    parryResolver = null;
  }
};
</script>

<style scoped>
.explore-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  color: #eee;
}

.status-bar {
  display: flex;
  justify-content: center;
  gap: 30px;
  background: #222;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 1.2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* AVATAR STYLE */
.avatar-circle {
  width: 80px;
  height: 80px;
  background: #333;
  border: 2px solid #06d6a0;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(6, 214, 160, 0.3);
}

.avatar-target {
  width: 80px;
  height: 80px;
  background: #333;
  border: 2px solid #ffd166;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-target.is-enemy {
  border-color: #ef476f;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* LAYOUT */
.game-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  height: 500px;
}

.stage-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.stage-background {
  flex: 1;
  background-image: url('@/assets/img/b-RungKhoiNguyen.png');
  background-size: cover;
  background-position: center;
  border: 2px solid #555;
  border-radius: 12px;
  display: flex;
  align-items: flex-end;
  padding: 0 60px;
  padding-bottom: 5px;
  position: relative;
  overflow: hidden;
}

.spacer {
  flex: 1;
}

.parry-zone {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;
}

.btn-parry {
  background: #ffd700;
  color: #000;
  font-size: 20px;
  font-weight: 900;
  padding: 15px 30px;
  border: 5px solid #fff;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 0 30px #ffd700;
  animation: pulse-fast 0.5s infinite;
  position: relative;
  overflow: hidden;
}

.timer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 5px;
  background: red;
  width: 100%;
  animation: shrink 1.5s linear forwards;
}

@keyframes shrink {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}

@keyframes pulse-fast {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

.battle-status {
  width: 100%;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  background: #333;
  padding: 15px;
  border-radius: 50px;
  border: 1px solid #555;
}

.text-parry {
  color: #ffd700;
  animation: blink 0.2s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.2;
  }

  100% {
    opacity: 1;
  }
}

.actor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100px;
  position: relative;
  z-index: 2;
  transition: all 0.2s;
}

.label {
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px #000;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 4px;
}

.mini-hp-bar {
  width: 80px;
  height: 6px;
  background: #555;
  margin-top: -5px;
  border-radius: 3px;
  overflow: hidden;
}

.mini-hp-bar .fill {
  height: 100%;
  background: #ef476f;
  transition: width 0.2s;
}

.moving-right {
  animation: slideRight 7s linear forwards;
}

@keyframes slideRight {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(300px);
  }
}

.walk-anim {
  animation: walk 0.6s infinite alternate ease-in-out;
}

@keyframes walk {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-8px);
  }
}

.attack-anim {
  transform: translateX(50px);
}

.shake-anim {
  animation: shake 0.2s infinite;
}

.dmg-popup {
  position: absolute;
  top: -40px;
  font-size: 24px;
  font-weight: bold;
  animation: floatUp 0.5s ease-out;
  z-index: 10;
  white-space: nowrap;
}

.text-red {
  color: #ff4d4d;
  text-shadow: 0 0 5px #000;
}

.text-yellow {
  color: #ffd700;
  text-shadow: 0 0 5px #000;
  font-size: 20px;
}

@keyframes floatUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  100% {
    transform: translateY(-40px);
    opacity: 0;
  }
}

.controls {
  display: flex;
  gap: 10px;
  height: 60px;
}

.encounter-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.btn-explore {
  flex: 2;
  background: #06d6a0;
  color: #000;
  border: none;
  font-size: 18px;
  font-weight: 900;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 0 #04c68e;
}

.btn-explore:active {
  transform: translateY(4px);
  box-shadow: none;
}

.btn-explore:disabled {
  background: #555;
  color: #888;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-back {
  flex: 1;
  background: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
}

.btn-fight {
  flex: 2;
  background: #ef476f;
  color: white;
  font-weight: bold;
  font-size: 18px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  animation: pulse 1s infinite;
}

.btn-ignore {
  flex: 1;
  background: #ffd166;
  color: black;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  cursor: pointer;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.log-area {
  background: #111;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.log-area h3 {
  margin: 0 0 10px 0;
  color: #888;
  font-size: 1rem;
  text-align: center;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.log-item {
  margin-bottom: 8px;
  border-bottom: 1px solid #222;
  padding-bottom: 5px;
}

.time {
  color: #555;
  font-size: 0.8em;
  margin-right: 5px;
}

@media (max-width: 768px) {
  .game-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .stage-area {
    height: 400px;
  }

  .log-area {
    height: 200px;
  }
}
</style>