<template>
  <div class="combat-page">
    <div class="combat-container">

      <transition name="bounce">
        <div v-if="showLevelUp" class="levelup-overlay">
          <h2>🌟 LEVEL UP! {{ playerStore.stats.lv }} 🌟</h2>
          <p>Full HP/Energy - Tăng sức mạnh!</p>
        </div>
      </transition>

      <h2 class="combat-title" :class="{ 'text-red': isGameOver, 'text-green': isVictory }">
        {{ combatLog }}
      </h2>

      <div v-if="showParryBtn" class="parry-overlay">
        <button class="btn-parry" @click="handleParry">🛡️ ĐỠ NGAY!</button>
        <div class="parry-timer-bar"></div>
      </div>

      <div class="battlefield">
        <div class="fighter enemy" :class="{ 'attack-anim': enemyAttacking, 'hit-anim': enemyHit }">
          <div class="avatar-box">
            <img :src="currentEnemyImage" class="fighter-img enemy-img" alt="Enemy" />
          </div>
          <div class="name">{{ currentEnemyData.name }}</div>
          <div class="hp-bar-container">
            <div class="hp-bar" :style="{ width: visualEnemyHp + '%' }"></div>
          </div>
        </div>

        <div class="vs-text">VS</div>

        <div class="fighter player" :class="{ 'attack-anim': playerAttacking, 'hit-anim': playerHit }">
          <div class="avatar-box">
            <img src="https://cdn-icons-png.flaticon.com/512/9408/9408175.png" class="fighter-img player-img" />
          </div>
          <div class="name">
            {{ playerStore.stats.name }} <span class="badge-lv">Lv.{{ playerStore.stats.lv }}</span>
          </div>

          <div class="hp-bar-container">
            <div class="hp-bar player-bar" :style="{ width: playerHpPercent + '%' }"></div>
          </div>
          <div class="hp-text">{{ playerStore.stats.hp }} / {{ playerStore.stats.maxHp }}</div>

          <div class="exp-bar-container">
            <div class="hp-bar exp-bar"
              :style="{ width: (playerStore.stats.exp / playerStore.stats.nextLevelExp * 100) + '%' }"></div>
          </div>
          <div class="exp-text">EXP: {{ playerStore.stats.exp }} / {{ playerStore.stats.nextLevelExp }}</div>

          <div class="energy-text" style="color: yellow; font-size: 0.9rem;">⚡ {{ playerStore.stats.energy }}</div>
        </div>
      </div>

      <div class="controls">
        <div v-if="!isGameOver && !isVictory">
          <button v-if="isAutoBattling" class="btn btn-disabled" disabled>
            🤖 Đang tự động đánh...
          </button>
          <template v-else>
            <button class="btn btn-attack" @click="playerTurn('normal')" :disabled="isBusy">
              ⚔️ ĐÁNH THƯỜNG
            </button>
            <button class="btn btn-strong" @click="playerTurn('strong')"
              :disabled="isBusy || playerStore.stats.energy < 5">
              💥 ĐÁNH MẠNH (5⚡)
            </button>
            <button class="btn btn-auto" @click="startAutoBattle" :disabled="isBusy">
              🤖 AUTO
            </button>
          </template>
        </div>
        <div v-else class="end-actions">
          <button class="btn btn-back" @click="$router.push('/adventure')">Quay lại Rừng</button>
          <button class="btn btn-village" @click="$router.push('/village')">Về Làng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useRouter } from 'vue-router';

const playerStore = usePlayerStore();
const router = useRouter();

// --- ASSETS & STATE QUÁI ---
const enemyAssets = reactive({
  skeleton: {
    name: "Bộ Xương",
    idle: new URL('@/assets/enemy/idle_skeleton.png', import.meta.url).href,
    attack: new URL('@/assets/enemy/atk_skeleton.png', import.meta.url).href,
  },
  goblin: {
    name: "Yêu Tinh",
    idle: new URL('@/assets/enemy/idle_goblin.png', import.meta.url).href,
    attack: new URL('@/assets/enemy/atk_goblin.png', import.meta.url).href,
  },
  mushroom: {
    name: "Nấm Độc",
    idle: new URL('@/assets/enemy/idle_mushroom.png', import.meta.url).href,
    attack: new URL('@/assets/enemy/atk_mushroom.png', import.meta.url).href,
  }
});

const currentEnemyType = ref('skeleton');
const enemyState = ref('idle');

const currentEnemyImage = computed(() => {
  const data = enemyAssets[currentEnemyType.value];
  return (!data) ? '' : (enemyState.value === 'attack' ? data.attack : data.idle);
});
const currentEnemyData = computed(() => enemyAssets[currentEnemyType.value] || { name: "Quái Vật" });

// --- GAME STATE ---
const combatLog = ref('Sẵn sàng chiến đấu!');
const isAutoBattling = ref(false);
const isGameOver = ref(false);
const isVictory = ref(false);
const isBusy = ref(false);
const showLevelUp = ref(false); // State Level Up

const playerAttacking = ref(false);
const enemyAttacking = ref(false);
const playerHit = ref(false);
const enemyHit = ref(false);
const visualEnemyHp = ref(100);

const showParryBtn = ref(false);
let parrySuccess = false;
let autoBattleTimer = null;

const playerHpPercent = computed(() => {
  if (playerStore.stats.maxHp === 0) return 0;
  return (playerStore.stats.hp / playerStore.stats.maxHp) * 100;
});

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// --- PLAYER ACTION ---
const playerTurn = async (attackType = 'normal') => {
  if (isBusy.value) return;
  isBusy.value = true;

  playerAttacking.value = true;
  await delay(300);
  playerAttacking.value = false;

  combatLog.value = attackType === 'strong' ? "Tung đòn sấm sét!" : "Tấn công!";

  const result = await playerStore.attackEnemy(false, attackType);

  if (result) {
    if (result.error) {
      combatLog.value = result.message;
      isBusy.value = false;
      return;
    }

    // Xử lý Level Up
    if (result.levelUp) {
      showLevelUp.value = true;
      setTimeout(() => showLevelUp.value = false, 3000);
    }

    enemyHit.value = true;
    const visualDmg = attackType === 'strong' ? 35 : 20;
    visualEnemyHp.value = Math.max(0, visualEnemyHp.value - visualDmg);

    await delay(200);
    enemyHit.value = false;
    combatLog.value = result.message;

    if (result.status === 'DIED') {
      isGameOver.value = true;
      combatLog.value = "💀 Bạn đã thất bại...";
    } else if (visualEnemyHp.value <= 0) {
      isVictory.value = true;
      combatLog.value = "🎉 Chiến thắng!";
    } else {
      await enemyTurnAnimation();
    }
  }
  isBusy.value = false;
};

// --- ENEMY ANIMATION ---
const enemyTurnAnimation = async () => {
  await delay(500);
  enemyState.value = 'attack';
  enemyAttacking.value = true;
  await delay(300);
  enemyState.value = 'idle';
  enemyAttacking.value = false;

  playerHit.value = true;
  await delay(300);
  playerHit.value = false;
}

// --- AUTO BATTLE ---
const startAutoBattle = () => {
  if (isAutoBattling.value) return;
  isAutoBattling.value = true;
  combatLog.value = "🤖 Auto Battle kích hoạt...";
  runAutoTurn();
};

const runAutoTurn = async () => {
  if (isGameOver.value || isVictory.value || !isAutoBattling.value) return;

  const chance = Math.random() * 100;
  parrySuccess = false;
  if (chance < 20) await triggerParryEvent();

  const result = await playerStore.attackEnemy(parrySuccess, 'normal');

  if (result) {
    if (result.levelUp) {
      showLevelUp.value = true;
      setTimeout(() => showLevelUp.value = false, 3000);
    }

    enemyHit.value = true;
    visualEnemyHp.value = Math.max(0, visualEnemyHp.value - 20);
    await delay(200);
    enemyHit.value = false;

    combatLog.value = parrySuccess ? "🛡️ PARRY THÀNH CÔNG!" : result.message;

    if (result.status === 'DIED') {
      isGameOver.value = true;
      isAutoBattling.value = false;
    } else if (visualEnemyHp.value <= 0) {
      isVictory.value = true;
      isAutoBattling.value = false;
    } else {
      await enemyTurnAnimation();
      autoBattleTimer = setTimeout(runAutoTurn, 1500);
    }
  }
};

const triggerParryEvent = () => {
  return new Promise((resolve) => {
    showParryBtn.value = true;
    combatLog.value = "⚠️ ĐỠ ĐÒN!";
    setTimeout(() => { showParryBtn.value = false; resolve(); }, 730);
  });
};

const handleParry = () => { parrySuccess = true; showParryBtn.value = false; };

onMounted(() => {
  visualEnemyHp.value = 100;
  enemyState.value = 'idle';
  const types = ['skeleton', 'goblin', 'mushroom'];
  currentEnemyType.value = types[Math.floor(Math.random() * types.length)];
});

onUnmounted(() => { clearTimeout(autoBattleTimer); });
</script>

<style scoped>
.combat-page {
  width: 100%;
  color: white;
  text-align: center;
  padding: 20px;
  position: relative;
}

.combat-container {
  background: #222;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #444;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.combat-title {
  color: #ffd166;
  min-height: 30px;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.parry-overlay {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.btn-parry {
  background: #ffd700;
  color: #000;
  font-size: 24px;
  font-weight: 900;
  padding: 15px 40px;
  border: 4px solid #fff;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 0 20px #ffd700;
  animation: popIn 0.1s;
}

.parry-timer-bar {
  width: 100%;
  height: 5px;
  background: red;
  margin-top: 5px;
  animation: shrink 0.73s linear forwards;
}

@keyframes popIn {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

@keyframes shrink {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}

.battlefield {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.fighter {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.avatar-box {
  width: 120px;
  height: 120px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fighter-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.5));
}

.hp-bar-container {
  width: 100%;
  height: 8px;
  background: #444;
  border-radius: 5px;
  margin-top: 5px;
  overflow: hidden;
}

.hp-bar {
  height: 100%;
  background: #ef476f;
  transition: width 0.3s ease;
}

.player-bar {
  background: #06d6a0;
}

.vs-text {
  font-size: 24px;
  font-weight: 900;
  color: #555;
  font-style: italic;
}

.controls button {
  padding: 10px 15px;
  margin: 5px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-attack {
  background: #ef476f;
  color: white;
}

.btn-strong {
  background: #9d4edd;
  color: white;
  box-shadow: 0 0 10px #9d4edd;
}

.btn-auto {
  background: #118ab2;
  color: white;
}

.btn-disabled {
  background: #555;
  color: #aaa;
  cursor: not-allowed;
}

.btn-back {
  background: #555;
  color: white;
}

.btn-village {
  background: #118ab2;
  color: white;
}

.attack-anim {
  transform: scale(1.2) translateY(-20px);
}

.hit-anim {
  filter: brightness(0) sepia(1) hue-rotate(-50deg) saturate(5);
  animation: shake 0.3s;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

/* CSS MỚI CHO EXP & LEVEL UP */
.exp-bar-container {
  width: 100%;
  height: 4px;
  background: #333;
  margin-top: 5px;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.exp-bar {
  background: #3b82f6;
  height: 100%;
  transition: width 0.5s ease-out;
}

.exp-text {
  font-size: 0.7rem;
  color: #aaa;
  margin-top: 2px;
}

.badge-lv {
  background: #ffd700;
  color: black;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 0.8em;
  margin-left: 5px;
}

.levelup-overlay {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  color: #fff;
  text-shadow: 0 2px 0 #000;
  padding: 15px 30px;
  border-radius: 12px;
  border: 2px solid #fff;
  z-index: 999;
  text-align: center;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.levelup-overlay h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 900;
}

.levelup-overlay p {
  margin: 5px 0 0;
  font-size: 0.9rem;
}

.bounce-enter-active {
  animation: bounce-in .5s;
}

.bounce-leave-active {
  animation: bounce-in .5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: translateX(-50%) scale(0);
  }

  50% {
    transform: translateX(-50%) scale(1.2);
  }

  100% {
    transform: translateX(-50%) scale(1);
  }
}
</style>