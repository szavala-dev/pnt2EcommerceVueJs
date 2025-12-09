<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" permanent>
      <v-list>
        <v-list-item-group>
          <v-list-item @click="currentView = 'ProductManagement'">
            <v-list-item-icon>
              <v-icon>mdi-plus-box</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Agregar Producto</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="currentView = 'RoleManagement'">
            <v-list-item-icon>
              <v-icon>mdi-account-group</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Ver Roles</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="currentView = 'UserManagement'">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Ver Usuarios</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="currentView = 'OrdersManagement'">
            <v-list-item-icon>
              <v-icon>mdi-cart</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Órdenes</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="currentView = 'ImageUrlsManagement'">
            <v-list-item-icon>
              <v-icon>mdi-image-multiple</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Imágenes</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Panel de Administración</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid class="py-6">
        <v-row class="metrics-row" dense>
          <v-col cols="12" md="8">
            <v-card class="pa-4" elevation="2">
              <ProductMetrics />
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <BestCustomerCard />
          </v-col>
        </v-row>
        <v-card class="mt-6 pa-4" elevation="2">
          <component :is="currentViewComponent" />
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import ProductManagement from '@/components/ProductManagement.vue';
import UserManagement from '@/components/UserManagement.vue';
import RoleManagement from '@/components/RoleManagement.vue';
import OrdersManagement from '@/components/OrdersManagement.vue';
import ProductMetrics from '@/components/ProductMetrics.vue';
import BestCustomerCard from '@/components/BestCustomerCard.vue';
import ImageUrlsManagement from '@/components/ImageUrlsManagement.vue';

const router = useRouter();
const authStore = useAuthStore();
const drawer = ref(true);
const currentView = ref('ProductManagement');

const currentViewComponent = computed(() => {
  switch (currentView.value) {
    case 'ProductManagement':
      return ProductManagement;
    case 'UserManagement':
      return UserManagement;
    case 'RoleManagement':
      return RoleManagement;
    case 'OrdersManagement':
      return OrdersManagement;
    case 'ImageUrlsManagement':
      return ImageUrlsManagement;
    default:
      return ProductManagement;
  }
});

onMounted(async () => {
  try {
    await authStore.fetchUser(); // Asegúrate de que esta función exista y cargue la información del usuario
    if (!authStore.isAdminGetter) {
      alert('No tienes permisos para acceder al panel de administración.');
      router.push('/home');
    }
  } catch (error) {
    console.error('Error al verificar permisos de administrador:', error);
    router.push('/home');
  }
});
</script>

<style scoped>
.metrics-row {
  row-gap: 24px;
}
</style>