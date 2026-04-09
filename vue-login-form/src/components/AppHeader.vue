<template>
  <div class="Header">
    <nav class="navbar bg-transparent">
      <div class="container-fluid">

        <template v-if="isMobileView && authStore.isLogged">
          <div class="grow leftAlign">
            <div class="d-flex align-items-center flex-row">
              <button
                class="btn btn-outline-secondary me-4"
                @click="mobileMenuOpen = true"
              >
                <img :src="iconMenu" style="width: 30px" alt="menu icon" />
              </button>
              <div class="ml-auto d-flex align-items-center flex-row">
                <select class="language-selector" :value="locale" @change="handleLocalization">
                  <option value="fi">Finnish</option>
                  <option value="en">English</option>
                  <option value="sv">Swedish</option>
                </select>
                <button class="btn btn-danger" @click="handleLogout">{{ t('logout') }}</button>
              </div>
            </div>

            <div v-if="mobileMenuOpen" class="offcanvas offcanvas-start show" style="width: 220px">
              <div class="offcanvas-header">
                <h5 class="offcanvas-title">{{ t('welcome') }}</h5>
                <button class="btn-close" @click="mobileMenuOpen = false"></button>
              </div>
              <div class="offcanvas-body">
                <nav class="nav flex-column">
                  <template v-for="item in navItems" :key="item.link">
                    <template v-if="item.permission">
                      <RouterLink
                        v-if="hasPermission(item.permission).value"
                        class="nav-link"
                        :to="item.link"
                        @click="mobileMenuOpen = false"
                      >
                        {{ t(item.text) }}
                      </RouterLink>
                    </template>
                    <RouterLink
                      v-else
                      class="nav-link"
                      :to="item.link"
                      @click="mobileMenuOpen = false"
                    >
                      {{ t(item.text) }}
                    </RouterLink>
                  </template>
                  <a
                    class="nav-link btn btn-danger text-white mt-4"
                    style="cursor:pointer"
                    @click="handleLogout(); mobileMenuOpen = false"
                  >
                    {{ t('logout') }}
                  </a>
                </nav>
              </div>
            </div>
            <div v-if="mobileMenuOpen" class="offcanvas-backdrop fade show" @click="mobileMenuOpen = false"></div>
          </div>
        </template>

        <template v-else>
          <nav class="nav me-auto my-2 my-lg-0 menu" style="max-height: 100px; flex-wrap: wrap">
            <template v-if="authStore.isLogged">
              <RouterLink class="Header-nav-link" to="/my-profile">{{ t('myProfile') }}</RouterLink>
              <RouterLink class="Header-nav-link" to="/revenue-report">{{ t('revenueReport') }}</RouterLink>
              <RouterLink class="Header-nav-link" to="/stl-viewer">{{ t('stlViewer') }}</RouterLink>
              <RouterLink class="Header-nav-link" to="/video-photo">{{ t('videoPhoto') }}</RouterLink>
              <RouterLink class="Header-nav-link" to="/pusher-chat">{{ t('chat') }}</RouterLink>
              <RouterLink class="Header-nav-link" to="/timesheet">{{ t('timesheet') }}</RouterLink>
              <RouterLink class="Header-nav-link" to="/cv-editor">{{ t('cvEditor') }}</RouterLink>
              <RouterLink class="Header-nav-link" to="/document-bank">{{ t('documentBank') }}</RouterLink>
              <RouterLink class="Header-nav-link" to="/issue-tracker">{{ t('issueTracker') }}</RouterLink>

              <RouterLink v-if="hasPermission('users.view').value"  class="Header-nav-link" to="/manage-users">{{ t('manageUsers') }}</RouterLink>
              <RouterLink v-if="hasPermission('domain.view').value" class="Header-nav-link" to="/manage-domains">{{ t('manageDomains') }}</RouterLink>
              <RouterLink v-if="hasPermission('roles.view').value"  class="Header-nav-link" to="/manage-roles">{{ t('manageRoles') }}</RouterLink>
              <RouterLink v-if="hasPermission('settings.manage').value" class="Header-nav-link" to="/settings">{{ t('settings') }}</RouterLink>
            </template>
          </nav>

          <div class="ml-auto d-flex align-items-center flex-row">
            <select class="language-selector" :value="locale" @change="handleLocalization">
              <option value="fi">Finnish</option>
              <option value="en">English</option>
              <option value="sv">Swedish</option>
            </select>
            <button v-if="authStore.isLogged" class="btn btn-danger" @click="handleLogout">
              {{ t('logout') }}
            </button>
            <button v-else class="Header-login-button btn btn-info" @click="router.push('/login')">
              {{ t('login') }}
            </button>
          </div>
        </template>

      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import { useAuthStore } from '../stores/auth';
import { usePermission } from '../composables/usePermission';
import iconMenu from '../assets/icon_menu.png';
import { persistLanguage } from '../i18n';

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();
const { hasPermission } = usePermission();

const mobileMenuOpen = ref(false);
const isMobileView = ref(false);

const navItems = [
  { text: 'myProfile',     link: '/my-profile' },
  { text: 'revenueReport', link: '/revenue-report' },
  { text: 'stlViewer',     link: '/stl-viewer' },
  { text: 'videoPhoto',    link: '/video-photo' },
  { text: 'chat',          link: '/pusher-chat' },
  { text: 'timesheet',     link: '/timesheet' },
  { text: 'cvEditor',      link: '/cv-editor' },
  { text: 'documentBank',  link: '/document-bank' },
  { text: 'issueTracker',  link: '/issue-tracker' },
  { text: 'manageUsers',   link: '/manage-users',   permission: 'users.view' },
  { text: 'manageDomains', link: '/manage-domains', permission: 'domain.view' },
  { text: 'manageRoles',   link: '/manage-roles',   permission: 'roles.view' },
  { text: 'settings',      link: '/settings',       permission: 'settings.manage' },
];

const checkMobileView = () => {
  isMobileView.value = window.innerWidth <= 1000;
};

onMounted(() => {
  checkMobileView();
  window.addEventListener('resize', checkMobileView);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileView);
});

const handleLocalization = (e) => {
  locale.value = e.target.value;
  persistLanguage(e.target.value);
};

const handleLogout = async () => {
  try {
    await axios.get(`${API_BASE_URL}/api/users/logout`, {
      headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
  } catch (err) {
    console.error(err);
  }
  authStore.authStateChanged({ user: null, token: null, isLogged: false });
  localStorage.removeItem(ACCESS_TOKEN_NAME);
  router.push('/login');
};
</script>