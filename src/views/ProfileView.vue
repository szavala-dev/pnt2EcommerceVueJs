<template>
  <div>
    <h2>Perfil de Usuario</h2>
    <ProfileCard :user="user" @update="handleUpdate" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import ProfileCard from '@/components/ProfileCard.vue';
import apiClient from '@/plugins/axios';
import { useSnackbar } from '@/composables/useSnackbar';

const authStore = useAuthStore();
const router = useRouter();
const user = ref({});
const { showSnackbar } = useSnackbar();

const fetchUserDetails = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    const userData = response.data;
    if (userData.dateOfBirth) {
      userData.dateOfBirth = new Date(userData.dateOfBirth).toISOString().split('T')[0];
    }
    user.value = userData;
  } catch (error) {
    console.error('Error al obtener los detalles del usuario:', error);
    showSnackbar({ message: 'Error al obtener los detalles del usuario.', color: 'error' });
  }
};

onMounted(async () => {
  try {
    await authStore.fetchUser();  
    if (!authStore.isAuthenticated) {
      showSnackbar({ message: 'Inicia sesión para ver tu perfil.', color: 'warning' });
      router.push('/login');
    } else {
      const userId = authStore.userId;
      if (authStore.userId) {
        fetchUserDetails(userId);
      } else {
        console.error('User ID is undefined');
        showSnackbar({ message: 'Error al obtener el ID del usuario.', color: 'error' });
    }} 
  } catch (error) {
    console.error('Error al verificar permisos de administrador:', error);
    router.push('/home');
  }

});

const handleUpdate = (updatedUser) => {
  user.value = updatedUser;
  authStore.setUser(updatedUser); // Actualizar el estado de autenticación con los datos actualizados del usuario
};
</script>

<style scoped>
/* Tus estilos aquí */
</style>