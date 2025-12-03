import { defineStore } from 'pinia';
import axios from 'axios';
import { reactive } from 'vue';

const API_URL = 'http://localhost:8080/api/game';

export const usePlayerStore = defineStore('player', () => {

  // --- STATE ---
  const stats = reactive({
    id: 1, name: 'Loading...', hp: 100, maxHp: 100, energy: 50, maxEnergy: 50,
    atk: 10, def: 5, spd: 10, lv: 1, exp: 0, gold: 0
  });

  // [MỚI] Lưu vị trí thám hiểm để không bị reset khi chuyển cảnh
  const explorationState = reactive({
    playerPos: 10, // Vị trí % (Mặc định 10)
    moveDir: 1     // Hướng mặt (1: Phải, -1: Trái)
  });

  const equipment = reactive({ /* Giữ nguyên mock data */ });
  const inventory = reactive([ /* Giữ nguyên mock data */]);

  // --- ACTIONS ---
  const fetchPlayerData = async () => {
    try {
      const res = await axios.get(`${API_URL}/player/${stats.id}`);
      Object.assign(stats, res.data);
    } catch (error) { console.error("Lỗi Server:", error); }
  };

  const attackEnemy = async (isParried = false) => {
    try {
      const res = await axios.post(`${API_URL}/attack`, null, {
        params: { playerId: stats.id, isParried: isParried }
      });
      const result = res.data;
      if (result.playerHp !== undefined) stats.hp = result.playerHp;
      return result;
    } catch (error) { return null; }
  };

  const explore = async () => {
    try {
      const res = await axios.post(`${API_URL}/explore?playerId=${stats.id}`);
      const result = res.data;
      if (result.currentGold !== undefined) stats.gold = result.currentGold;
      return result;
    } catch (error) { return { type: 'ERROR', message: 'Lỗi kết nối!' }; }
  };

  const restAtInn = async () => {
    try {
      const res = await axios.post(`${API_URL}/rest?playerId=${stats.id}`);
      Object.assign(stats, res.data);
      return true;
    } catch (error) { return false; }
  };

  // Mock functions (giữ nguyên)
  const equipItem = (item) => { };
  const unequipItem = (slot) => { };
  const useConsumable = (item) => { };

  // Nhớ return explorationState ra
  return {
    stats, explorationState, equipment, inventory,
    fetchPlayerData, attackEnemy, explore, restAtInn,
    equipItem, unequipItem, useConsumable
  };
});