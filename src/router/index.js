// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import CatalogView from '@/views/CatalogView.vue';
import ProductDetailsView from '@/views/ProductDetailsView.vue';
import CartView from '@/views/CartView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import OrderDetailsView from '@/views/OrderDetailsView.vue';
import AdminDashboardView from '@/views/AdminDashboardView.vue';
import ProfileView from '../views/ProfileView.vue';
import { useAuthStore } from '@/store/auth';
import AboutView from '../views/AboutView.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/catalog', name: 'Catalog', component: CatalogView },
  { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/product/:id', name: 'ProductDetails', component: ProductDetailsView, props: true },
  { path: '/cart', name: 'Cart', component: CartView, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/orders', name: 'Orders', component: OrderDetailsView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboardView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/about', name: 'AboutView', component: AboutView },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Protege rutas requeridas, hidrata sesión desde token y valida admin
  const authStore = useAuthStore();
  const requiresAuth = Boolean(to.meta?.requiresAuth);
  const requiresAdmin = Boolean(to.meta?.requiresAdmin);
  const storedToken = localStorage.getItem('authToken');

  if (storedToken && !authStore.token) {
    authStore.token = storedToken;
  }

  if (storedToken && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      console.error('Error al recuperar la sesión desde el guard:', error);
      authStore.logout();
    }
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  if (requiresAdmin && !authStore.isAdminGetter) {
    return next({ name: 'Home' });
  }

  return next();
});

export default router;