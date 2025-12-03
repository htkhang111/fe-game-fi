<template>
  <div class="combat-page">
    <div class="combat-container">
      <h2 class="combat-title">{{ combatLog }}</h2>

      <div class="battlefield">
        <div class="fighter enemy" :class="{ 'attack-anim': enemyAttacking, 'hit-anim': enemyHit }">
          <div class="avatar-box">
            <img :src="getEnemyImg(currentEnemy.image)" class="fighter-img enemy-img" alt="Enemy" />
          </div>
          <div class="name">{{ currentEnemy.name }}</div>
          <div class="hp-bar-container">
            <div class="hp-bar" :style="{ width: enemyHpPercent + '%' }"></div>
          </div>
          <div class="hp-text">{{ currentEnemy.hp }} / {{ currentEnemy.maxHp }}</div>
        </div>

        <div class="vs-text">VS</div>

        <div class="fighter player" :class="{ 'attack-anim': playerAttacking, 'hit-anim': playerHit }">
          <div class="avatar-box">
            <img src="@/assets/img/c-Samurai.png" class="fighter-img player-img" alt="Player" />
          </div>
          <div class="name">Samurai (Lv.{{ playerStore.stats.lv }})</div>
          <div class="hp-bar-container">
            <div class="hp-bar player-bar" :style="{ width: playerHpPercent + '%' }"></div>
          </div>
          <div class="hp-text">{{ playerStore.stats.hp }} / {{ playerStore.stats.maxHp }}</div>
        </div>
      </div>

      <div v-if="showParryZone" class="parry-overlay" @click="handleParry">
        <div class="parry-btn">
          🛡️ ĐỠ ĐÒN!
        </div>
      </div>

      <div class="controls">
        <div v-if="inCombat">
          <button class="btn btn-attack" @click="playerTurn" :disabled="isEnemyTurn">
            ⚔️ Tấn công
          </button>
          <button class="btn btn-flee" @click="flee" :disabled="isEnemyTurn">
            🏃 Bỏ chạy
          </button>
        </div>

        <div v-else class="end-message">
          Đang tổng kết trận đấu...
        </div>
      </div>
    </div>

    <audio ref="audioAttack"
      src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_c3c6db06f4.mp3?filename=sword-attack-140540.mp3"></audio>
    <audio ref="audioParry"
      src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_7263d09f9c.mp3?filename=shield-block-140877.mp3"></audio>
    <audio ref="audioWin"
      src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_1fa1a7c789.mp3?filename=click-button-140881.mp3"></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();
const emit = defineEmits(['combat-end']);

// ----- STATE -----
const inCombat = ref(true);
const isEnemyTurn = ref(false);
const combatLog = ref('Một kẻ địch xuất hiện!');
const showParryZone = ref(false);
let parrySuccess = false;

// Animation Refs
const playerAttacking = ref(false);
const enemyAttacking = ref(false);
const playerHit = ref(false);
const enemyHit = ref(false);

// Audio Refs
const audioAttack = ref(null);
const audioParry = ref(null);
const audioWin = ref(null);

// DATA QUÁI VẬT (Thêm trường 'image')
const ENEMIES = [
  { name: 'Goblin', maxHp: 80, atk: 8, image: 'goblin.png' },
  { name: 'Skeleton', maxHp: 100, atk: 12, image: 'skeleton.png' },
  { name: 'Sói Hoang', maxHp: 60, atk: 15, image: 'wolf.png' },
  { name: 'Pháp Sư', maxHp: 70, atk: 20, image: 'mage.png' }
];

const currentEnemy = ref({ ...ENEMIES[0] });

// ----- HELPER: Load ảnh Quái -----
const getEnemyImg = (imgName) => {
  try {
    return new URL(`../assets/img/enemies/${imgName}`, import.meta.url).href;
  } catch (e) {
    return '';
  }
};

// Computed HP %
const playerHpPercent = computed(() => (playerStore.stats.hp / playerStore.stats.maxHp) * 100);
const enemyHpPercent = computed(() => (currentEnemy.value.hp / currentEnemy.value.maxHp) * 100);

// ----- LOGIC GAME (GIỮ NGUYÊN) -----
const startNewCombat = () => {
  inCombat.value = true;
  isEnemyTurn.value = false;
  showParryZone.value = false;

  const randomEnemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
  currentEnemy.value = { ...randomEnemy, hp: randomEnemy.maxHp };

  combatLog.value = `Đụng độ ${currentEnemy.value.name}!`;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const playSound = (audioRef) => {
  if (audioRef.value) {
    audioRef.value.currentTime = 0;
    audioRef.value.play().catch(() => { });
  }
};

const playerTurn = async () => {
  if (isEnemyTurn.value) return;
  playerAttacking.value = true;
  combatLog.value = 'Bạn tấn công!';
  await delay(300);
  playSound(audioAttack);
  playerAttacking.value = false;

  const dmg = Math.max(1, playerStore.stats.atk);
  currentEnemy.value.hp = Math.max(0, currentEnemy.value.hp - dmg);
  enemyHit.value = true;
  await delay(200);
  enemyHit.value = false;

  if (currentEnemy.value.hp <= 0) {
    endCombat(true);
    return;
  }
  startEnemyTurn();
};

const startEnemyTurn = async () => {
  isEnemyTurn.value = true;
  combatLog.value = `${currentEnemy.value.name} chuẩn bị ra đòn...`;
  await delay(1000);

  parrySuccess = false;
  if (Math.random() < 0.5) {
    showParryZone.value = true;
    await delay(800);
    showParryZone.value = false;
  } else {
    await delay(500);
  }

  enemyAttacking.value = true;

  if (parrySuccess) {
    combatLog.value = '🛡️ PARRY THÀNH CÔNG! Phản đòn!';
    playSound(audioParry);
    currentEnemy.value.hp = Math.max(0, currentEnemy.value.hp - 5);
  } else {
    combatLog.value = `${currentEnemy.value.name} đánh trúng bạn!`;
    playSound(audioAttack);
    let dmg = Math.max(1, currentEnemy.value.atk - Math.floor(playerStore.stats.def / 2));
    playerStore.stats.hp = Math.max(0, playerStore.stats.hp - dmg);
    playerHit.value = true;
  }

  await delay(300);
  enemyAttacking.value = false;
  playerHit.value = false;

  if (playerStore.stats.hp <= 0) {
    endCombat(false);
    return;
  }

  isEnemyTurn.value = false;
  combatLog.value = 'Đến lượt bạn!';
};

const handleParry = () => {
  parrySuccess = true;
  showParryZone.value = false;
};

const endCombat = async (win) => {
  inCombat.value = false;
  if (win) {
    const expGain = 20;
    const goldGain = 10;
    combatLog.value = `🎉 Thắng! +${expGain} EXP, +${goldGain} Gold`;
    playSound(audioWin);
    playerStore.stats.gold += goldGain;
    playerStore.stats.exp += expGain;
    await delay(1500);
    emit('combat-end', 'win');
  } else {
    combatLog.value = '💀 Bạn đã thất bại...';
    playerStore.stats.hp = 10;
    await delay(1500);
    emit('combat-end', 'lose');
  }
};

const flee = async () => {
  combatLog.value = 'Bạn đã bỏ chạy!';
  inCombat.value = false;
  await delay(1000);
  emit('combat-end', 'flee');
};

onMounted(() => {
  startNewCombat();
});
</script>

<style scoped>
/* Style mới cho Image Based Combat */
.combat-page {
  width: 100%;
  color: white;
  text-align: center;
}

.combat-container {
  background: #222;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  position: relative;
  border: 2px solid #444;
}

.combat-title {
  color: #ffd166;
  min-height: 30px;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.battlefield {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

/* KHUNG CHỨA ẢNH */
.fighter {
  width: 40%;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-box {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

/* ẢNH NHÂN VẬT/QUÁI */
.fighter-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.5));
}

/* Lật ảnh quái cho đối mặt với nhân vật (tuỳ ảnh gốc) */
.enemy-img {
  transform: scaleX(-1);
}

.name {
  font-weight: bold;
  margin: 5px 0;
  font-size: 0.9rem;
}

/* Animation */
.attack-anim {
  transform: scale(1.2);
  z-index: 10;
}

.enemy.attack-anim {
  transform: translateX(-50px) scale(1.2);
}

.player.attack-anim {
  transform: translateX(50px) scale(1.2);
}

.hit-anim {
  animation: shake 0.3s;
  filter: brightness(0) sepia(1) hue-rotate(-50deg) saturate(5);
  /* Nháy đỏ */
}

@keyframes shake {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }

  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }

  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }

  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }

  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }

  100% {
    transform: translate(0, 0) rotate(0);
  }
}

/* HP Bars */
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

/* Controls */
.btn {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-attack {
  background: #ef476f;
  color: white;
}

.btn-flee {
  background: #ffd166;
  color: black;
}

/* Parry Zone */
.parry-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 215, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  cursor: pointer;
  border-radius: 12px;
}

.parry-btn {
  background: #ffd166;
  color: #000;
  padding: 15px 30px;
  font-size: 20px;
  font-weight: 900;
  border: 4px solid #fff;
  border-radius: 50px;
  box-shadow: 0 0 20px #ffd166;
  animation: pulse 0.5s infinite;
  display: flex;
  align-items: center;
  gap: 10px;
}

@keyframes pulse {
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
</style>