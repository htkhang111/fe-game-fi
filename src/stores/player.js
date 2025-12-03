import { defineStore } from 'pinia';
import axios from 'axios';
import { reactive, computed } from 'vue';

const API_URL = 'http://localhost:8080/api/game';

export const usePlayerStore = defineStore('player', () => {
  const stats = reactive({
    id: 1, name: 'Loading...', hp: 100, maxHp: 100,
    energy: 50, maxEnergy: 50, atk: 10, def: 5, spd: 10,
    lv: 1, exp: 0, gold: 0, nextLevelExp: 100
  });

  const explorationState = reactive({ playerPos: 10, moveDir: 1 });
  const inventory = reactive([]);

  // Computed slots
  const equipment = computed(() => {
    const slots = { WEAPON: null, HELM: null, ARMOR: null, BOOTS: null, RING: null, NECKLACE: null };
    inventory.forEach(item => {
      if (item.equipped && slots[item.type] !== undefined) {
        slots[item.type] = item;
      }
    });
    return slots;
  });

  const fetchPlayerData = async () => {
    try {
      const resPlayer = await axios.get(`${API_URL}/player/${stats.id}`);
      Object.assign(stats, resPlayer.data);
      stats.nextLevelExp = 100 * Math.pow(stats.lv, 2);

      const resInv = await axios.get(`${API_URL}/inventory/${stats.id}`);
      inventory.splice(0, inventory.length, ...resInv.data);
    } catch (error) { console.error("Lỗi Server:", error); }
  };

  const attackEnemy = async (isParried = false, attackType = 'normal') => {
    try {
      const res = await axios.post(`${API_URL}/attack`, null, {
        params: { playerId: stats.id, isParried, attackType }
      });
      const result = res.data;

      if (result.playerHp !== undefined) stats.hp = result.playerHp;
      if (result.playerExp !== undefined) stats.exp = result.playerExp;
      if (result.playerLv !== undefined) stats.lv = result.playerLv;
      if (result.playerMaxHp !== undefined) stats.maxHp = result.playerMaxHp;
      if (result.playerEnergy !== undefined) stats.energy = result.playerEnergy;
      if (result.nextLevelExp !== undefined) stats.nextLevelExp = result.nextLevelExp;

      if (result.drop) {
        const exists = inventory.some(i => i.id === result.drop.id);
        if (!exists) inventory.push(result.drop);
      }
      return result;
    } catch (error) { return null; }
  };

  const equipItemApi = async (item) => {
    try {
      const res = await axios.post(`${API_URL}/equip`, null, {
        params: { playerId: stats.id, itemId: item.id }
      });
      if (res.data.success) {
        Object.assign(stats, res.data.player);
        inventory.forEach(i => { if (i.type === item.type) i.equipped = false; });
        const found = inventory.find(i => i.id === item.id);
        if (found) found.equipped = true;
      }
    } catch (e) { console.error(e); }
  };

  // [MỚI] Gỡ trang bị
  const unequipItemApi = async (item) => {
    if (!item) return;
    try {
      const res = await axios.post(`${API_URL}/unequip`, null, {
        params: { playerId: stats.id, itemId: item.id }
      });
      if (res.data.success) {
        // Cập nhật stats (giảm chỉ số)
        Object.assign(stats, res.data.player);
        // Cập nhật UI
        const found = inventory.find(i => i.id === item.id);
        if (found) found.equipped = false;
      }
    } catch (e) { console.error(e); }
  };

  const explore = async () => {
    try {
      const res = await axios.post(`${API_URL}/explore?playerId=${stats.id}`);
      const result = res.data;
      if (result.currentGold !== undefined) stats.gold = result.currentGold;
      if (result.playerExp !== undefined) stats.exp = result.playerExp;
      if (result.playerLv !== undefined) stats.lv = result.playerLv;
      if (result.nextLevelExp !== undefined) stats.nextLevelExp = result.nextLevelExp;
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

  const equipItem = (item) => { };
  const unequipItem = (slot) => { };
  const useConsumable = (item) => { };

  return {
    stats, explorationState, equipment, inventory,
    fetchPlayerData, attackEnemy, equipItemApi, unequipItemApi, // Xuất hàm gỡ đồ
    explore, restAtInn, equipItem, unequipItem, useConsumable
  };
});