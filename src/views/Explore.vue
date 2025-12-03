<template>
  <div class="explore-page">

    <div class="status-bar-container">
      <div class="status-bar">
        <div class="level-badge">Lv.{{ playerStore.stats.lv }}</div>

        <div class="stat-item">❤️ {{ playerStore.stats.hp }}/{{ playerStore.stats.maxHp }}</div>
        <div class="stat-item">⚡ {{ playerStore.stats.energy }}/{{ playerStore.stats.maxEnergy }}</div>
        <div class="stat-item">💰 {{ playerStore.stats.gold }}</div>
      </div>

      <div class="exp-bar-wrapper">
        <div class="exp-bar" :style="{ width: expPercent + '%' }"></div>
      </div>
    </div>

    <div class="game-layout">
      <div class="stage-area">
        <div class="stage-background">

          <transition name="fade-up">
            <div v-if="showExpPopup" class="exp-popup">+10 EXP</div>
          </transition>

          <div class="actor player"
            :style="{ left: playerStore.explorationState.playerPos + '%', transform: `scaleX(${playerStore.explorationState.moveDir})` }">
            <div class="avatar-circle" :class="{ 'bounce': isMoving }">
              <img src="https://cdn-icons-png.flaticon.com/512/9408/9408175.png" class="avatar-img" />
            </div>
            <div class="label" :style="{ transform: `scaleX(${playerStore.explorationState.moveDir})` }">Bạn</div>
          </div>

          <div class="actor target" v-if="showTarget"
            :style="{ left: (playerStore.explorationState.playerPos + (12 * playerStore.explorationState.moveDir)) + '%' }">
            <div class="avatar-target" :class="{ 'is-enemy': isEncounter }">
              <img v-if="targetImage" :src="targetImage" class="avatar-img" />
              <div v-else class="text-3xl">🎁</div>
            </div>
            <div class="label">{{ targetName }}</div>
          </div>
        </div>

        <div class="controls">
          <template v-if="!isEncounter && !isBattling">
            <button class="btn-explore" @click="startExploration" :disabled="isMoving || playerStore.stats.hp <= 0">
              <span v-if="!isMoving">👣 TIẾP TỤC ĐI</span>
              <span v-else>🔍 Đang tìm kiếm... ({{ countdown }}s)</span>
            </button>
            <button class="btn-back" @click="$router.push('/village')" :disabled="isMoving">
              🏘️ Về làng
            </button>
          </template>

          <template v-if="isEncounter && !isBattling">
            <div class="encounter-actions">
              <button class="btn-ignore" @click="ignoreEncounter">🏃 Bỏ qua</button>
              <button class="btn-fight" @click="goToCombat">
                ⚔️ CHIẾN ĐẤU
              </button>
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
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useRouter } from 'vue-router';

const playerStore = usePlayerStore();
const router = useRouter();

// --- STATE ---
const isMoving = ref(false);
const isEncounter = ref(false);
const isBattling = ref(false);
const showTarget = ref(false);
const showExpPopup = ref(false);
const countdown = ref(0);
let moveInterval = null;

const targetImage = ref('');
const targetName = ref('');
const logContainer = ref(null);
const logs = ref([{ time: getCurrentTime(), msg: 'Sẵn sàng thám hiểm...' }]);

// --- DANH SÁCH QUÁI (Dùng ảnh local IDLE) ---
const enemyList = [
  {
    name: "Bộ Xương",
    img: new URL('@/assets/enemy/idle_skeleton.png', import.meta.url).href
  },
  {
    name: "Yêu Tinh",
    img: new URL('@/assets/enemy/idle_goblin.png', import.meta.url).href
  },
  {
    name: "Nấm Độc",
    img: new URL('@/assets/enemy/idle_mushroom.png', import.meta.url).href
  }
];

// Computed EXP %
const expPercent = computed(() => {
  if (!playerStore.stats.nextLevelExp || playerStore.stats.nextLevelExp === 0) return 0;
  return (playerStore.stats.exp / playerStore.stats.nextLevelExp) * 100;
});

function getCurrentTime() { const now = new Date(); return `${now.getHours()}:${now.getMinutes()}`; }

const addLog = async (msg) => {
  logs.value.push({ time: getCurrentTime(), msg });
  if (logs.value.length > 50) logs.value.shift();
  await nextTick();
  if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight;
};

// --- LOGIC DI CHUYỂN ---
const startMovingJS = () => {
  const speed = 0.15;
  if (moveInterval) clearInterval(moveInterval);
  moveInterval = setInterval(() => {
    if (Math.random() < 0.02) {
      playerStore.explorationState.moveDir = Math.random() < 0.5 ? 1 : -1;
    }
    playerStore.explorationState.playerPos += speed * playerStore.explorationState.moveDir;

    if (playerStore.explorationState.playerPos >= 85) playerStore.explorationState.moveDir = -1;
    else if (playerStore.explorationState.playerPos <= 5) playerStore.explorationState.moveDir = 1;
  }, 16);
};

const stopMovingJS = () => { if (moveInterval) { clearInterval(moveInterval); moveInterval = null; } };

// --- BẮT ĐẦU ---
const startExploration = () => {
  if (isMoving.value) return;
  isMoving.value = true;
  showTarget.value = false;
  isEncounter.value = false;

  if (playerStore.explorationState.playerPos < 0 || playerStore.explorationState.playerPos > 100) {
    playerStore.explorationState.playerPos = 10;
  }

  const duration = Math.floor(Math.random() * 3) + 3;
  countdown.value = duration;
  addLog('🔍 Đang lùng sục khắp nơi...');
  startMovingJS();

  const timer = setInterval(async () => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      await revealEventFromServer();
    }
  }, 1000);
};

// --- XỬ LÝ SỰ KIỆN TỪ SERVER ---
const revealEventFromServer = async () => {
  stopMovingJS();
  isMoving.value = false;

  // Gọi API lấy kết quả (Gold, Enemy, Nothing)
  const result = await playerStore.explore();

  // Hiệu ứng +EXP
  showExpPopup.value = true;
  setTimeout(() => showExpPopup.value = false, 800);

  if (result.type === 'GOLD') {
    showTarget.value = true;
    isEncounter.value = false;
    targetImage.value = 'https://cdn-icons-png.flaticon.com/512/2535/2535079.png';
    targetName.value = 'Túi Vàng';
    addLog(`<span style="color:#ffd166">💰 ${result.message}</span>`);

  } else if (result.type === 'ENEMY') {
    showTarget.value = true;
    isEncounter.value = true;

    // [LOGIC MỚI] Random quái hiện ra luôn (Không bụi cỏ nữa)
    const randomEnemy = enemyList[Math.floor(Math.random() * enemyList.length)];
    targetImage.value = randomEnemy.img;
    targetName.value = randomEnemy.name;

    addLog(`<span style="color:#ef476f">⚔️ Gặp <b>${randomEnemy.name}</b>! Chuẩn bị chiến đấu!</span>`);

  } else {
    showTarget.value = false;
    isEncounter.value = false;
    addLog(`<span style="color:gray">${result.message}</span>`);
  }
};

const ignoreEncounter = () => {
  isEncounter.value = false;
  showTarget.value = false;
  addLog('Bạn đã lờ đi và đi tiếp.');
};

const goToCombat = () => {
  stopMovingJS();
  router.push('/combat');
};

onMounted(() => { playerStore.fetchPlayerData(); });
onUnmounted(() => { stopMovingJS(); });
</script>

<style scoped>
.explore-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  color: #eee;
}

/* Status Bar & EXP */
.status-bar-container {
  background: #222;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  border: 2px solid #444;
}

.status-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 10px;
  font-weight: bold;
  font-size: 1.2rem;
  position: relative;
}

.level-badge {
  background: #ffd700;
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 1rem;
  position: absolute;
  left: 10px;
}

.exp-bar-wrapper {
  width: 100%;
  height: 6px;
  background: #111;
}

.exp-bar {
  height: 100%;
  background: #3b82f6;
  transition: width 0.5s ease-out;
}

/* Game Area */
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
  background: #1a1a1a;
  border: 2px solid #555;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

/* Actor */
.actor {
  position: absolute;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  z-index: 2;
  transition: transform 0.2s ease;
}

.bounce {
  animation: bounce 0.4s infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-5px);
  }
}

/* Avatar */
.avatar-circle {
  width: 70px;
  height: 70px;
  background: #333;
  border: 3px solid #06d6a0;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(6, 214, 160, 0.5);
}

.avatar-target {
  width: 70px;
  height: 70px;
  background: #333;
  border: 3px solid #ffd166;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.avatar-target.is-enemy {
  border-color: #ef476f;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.label {
  font-weight: bold;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 10px;
  border-radius: 4px;
  margin-top: 5px;
  font-size: 0.9rem;
  transition: transform 0.2s;
}

/* Controls & Log */
.controls {
  display: flex;
  gap: 10px;
  height: 60px;
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
}

.btn-explore:disabled {
  background: #555;
  cursor: not-allowed;
}

.btn-back {
  flex: 1;
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 50px;
  cursor: pointer;
}

.encounter-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.btn-fight {
  flex: 2;
  background: #ef476f;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  font-size: 18px;
}

.btn-ignore {
  flex: 1;
  background: #ffd166;
  color: black;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
}

.log-area {
  background: #111;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  font-family: monospace;
}

/* EXP Popup */
.exp-popup {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  color: #3b82f6;
  font-weight: bold;
  font-size: 1.5rem;
  text-shadow: 0 0 5px #000;
  z-index: 10;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.8s ease-out;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translate(-50%, 10px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -30px);
}
</style>