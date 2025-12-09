<template>
  <v-app-bar app color="" light class="navbar" height="70">
    <v-toolbar-title class="brand">
      <img :src="logo" alt="E-Commerce Logo" class="logo" />
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <div class="header-actions">
      <div v-if="!isMobile" class="secondary-links">
        <v-btn variant="text" to="/" class="nav-btn">Home</v-btn>
        <v-btn variant="text" to="/catalog" class="nav-btn">Catálogo</v-btn>
        <v-btn
          v-if="isAuthenticated && isAdmin"
          to="/admin"
          class="nav-btn strong"
          variant="text"
        >
          Panel de Administración
        </v-btn>
        <v-btn
          v-if="isAuthenticated"
          variant="text"
          to="/orders"
          class="nav-btn"
        >
          Órdenes
        </v-btn>
        <v-btn
          v-if="isAuthenticated"
          variant="text"
          to="/profile"
          class="nav-btn"
        >
          Hola, {{ userName }}
        </v-btn>
        <v-btn v-if="isAuthenticated" variant="text" class="nav-btn" @click="logout">
          Logout
        </v-btn>
      </div>

      <v-btn icon class="cart-toggle" @click="openCartDrawer">
        <v-badge
          v-if="cartCount > 0"
          :content="cartCount"
          inline
          color="black"
          offset-x="-4"
          offset-y="4"
        >
          <v-icon>mdi-cart-outline</v-icon>
        </v-badge>
        <v-icon v-else>mdi-cart-outline</v-icon>
      </v-btn>

      <v-btn
        v-if="!isAuthenticated && !isMobile"
        variant="text"
        to="/login"
        class="nav-btn login-link"
      >
        Ingresar
      </v-btn>

      <v-menu
        v-if="isMobile"
        v-model="mobileMenu"
        offset-y
        transition="scale-transition"
      >
        <template #activator="{ props }">
          <v-btn icon class="menu-toggle" v-bind="props">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list class="mobile-menu">
          <v-list-item v-for="item in mobileLinks" :key="item.label" :to="item.to">
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item>
          <v-divider class="my-2" />
          <template v-if="isAuthenticated">
            <v-list-item to="/profile">
              <v-list-item-title>Perfil</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleMobileLogout">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>

  <CartDrawer
    ref="cartDrawerRef"
    v-model="cartDrawerOpen"
    @cart-updated="updateCartCount"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import CartDrawer from '@/components/CartDrawer.vue';
import logo from '@/assets/logo.png';

const authStore = useAuthStore();
const router = useRouter();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.userName);
const isAdmin = computed(() => authStore.isAdminGetter);
const display = useDisplay();

const isMobile = computed(() => display.smAndDown.value);

const mobileMenu = ref(false);
const cartDrawerOpen = ref(false);
const cartDrawerRef = ref(null);
const cartCount = ref(0);

const mobileLinks = computed(() => {
  const links = [
    { label: 'Home', to: '/' },
    { label: 'Catálogo', to: '/catalog' },
  ];

  if (isAuthenticated.value) {
    links.push({ label: 'Órdenes', to: '/orders' });
    if (isAdmin.value) {
      links.push({ label: 'Panel de Administración', to: '/admin' });
    }
  } else {
    links.push({ label: 'Ingresar', to: '/login' });
  }

  return links;
});

const openCartDrawer = () => {
  cartDrawerOpen.value = true;
};

const updateCartCount = (count) => {
  cartCount.value = count;
};

const requestCartSync = () => {
  if (cartDrawerRef.value?.refreshCart) {
    cartDrawerRef.value.refreshCart();
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('cart:changed', requestCartSync);
  }
  requestCartSync();
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('cart:changed', requestCartSync);
  }
});

const logout = () => {
  authStore.logout();
  router.push('/');
};

const handleMobileLogout = () => {
  mobileMenu.value = false;
  logout();
};
</script>

<style scoped>


.navbar {
  backdrop-filter: blur(6px);
  padding: 16px 15px;
  min-height: 70px;
}


.brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 28px;
  flex-wrap: nowrap;
}

.logo {
  height: 78px;
  width: auto;
}

.secondary-links {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.nav-btn {
  color: #000 !important;
  text-transform: none !important;
  font-weight: 500;
  letter-spacing: 0;
  padding: 4px 8px !important;
  min-height: auto !important;
}

.nav-btn.strong {
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.menu-toggle,
.cart-toggle {
  border-radius: 999px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-toggle {
  background-color: #000 !important;
  color: #fff !important;
}

.menu-toggle :deep(.v-icon) {
  color: #fff !important;
}

.cart-toggle {
  background-color: #fff !important;
  color: #000 !important;
  border: 1px solid #000 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cart-toggle :deep(.v-icon) {
  color: #000 !important;
}

.mobile-menu {
  min-width: 220px;
}

@media (max-width: 960px) {
  .brand {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>