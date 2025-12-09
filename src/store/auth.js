import { defineStore } from 'pinia';
import apiClient from '@/plugins/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    roleId: null,
    isAdmin: false,
  }),
  actions: {
    async fetchUser() {
      // Obtiene el usuario desde el token y calcula si es admin
      try {
        const response = await apiClient.get('/users/loginToken');
        const userData = response.data.user;
        this.user = { id: userData.id, name: userData.name };
        this.roleId = userData.RoleId;
        
        const adminResponse = await apiClient.post('/users/check-admin', {
          RoleId: userData.RoleId
        });
        this.isAdmin = adminResponse.data.isAdmin; 
      } catch (error) {
        console.error('Error al cargar la información del usuario:', error);
      }
    },
    async login(token) {
      // Guarda el token, lo persiste y carga el usuario
      this.token = token;
      localStorage.setItem('authToken', token);
      await this.fetchUser();
    },
    logout() {
      // Limpia sesión y token persistido
      this.user = null;
      this.token = null;
      this.roleId = null;
      this.isAdmin = false;
      localStorage.removeItem('authToken');
    },
    setUser(updatedUser) {
      // Actualiza en memoria los datos básicos del usuario
      this.user = { id: updatedUser.id, name: updatedUser.name };
      this.roleId = updatedUser.RoleId;
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => (state.user ? state.user.name : ''),
    userId: (state) => (state.user ? state.user.id : null),
    isAdminGetter: (state) => state.isAdmin,
  },
});