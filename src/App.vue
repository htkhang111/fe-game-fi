<template>
  <div class="app-layout">

    <aside class="sidebar">
      <div class="brand">
        ⚔️ NGHỊCH 2.0
      </div>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item">
          <span class="icon">🏠</span> Trang Chủ
        </router-link>

        <router-link to="/character" class="nav-item">
          <span class="icon">🧙‍♂️</span> Nhân Vật
        </router-link>

        <router-link to="/inventory" class="nav-item">
          <span class="icon">🎒</span> Túi Đồ
        </router-link>

        <router-link to="/village" class="nav-item">
          <span class="icon">ghim</span> Làng
        </router-link>

        <router-link to="/adventure" class="nav-item">
          <span class="icon">🗺️</span> Phiêu Lưu
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <small>v2.0.2 Beta</small>
      </div>
    </aside>

    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>

  </div>
</template>

<script setup>
import './assets/css/main.css'; 
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-app);
}

.sidebar {
  width: 240px;
  background-color: #1a1a1a;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.brand {
  height: 60px;
  display: flex;
  align-items: center;
  padding-left: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--gold);
  border-bottom: 1px solid #333;
  letter-spacing: 1px;
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  text-decoration: none;
  color: var(--text-mute);
  font-weight: 500;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.nav-item .icon {
  margin-right: 10px;
  width: 24px;
  text-align: center;
}

.nav-item:hover {
  background-color: #252525;
  color: #fff;
}

.nav-item.router-link-active {
  background-color: #2a2a2a;
  color: var(--gold);
  border-left-color: var(--gold);
}

.sidebar-footer {
  padding: 15px;
  text-align: center;
  color: #555;
  font-size: 0.8rem;
  border-top: 1px solid #333;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>