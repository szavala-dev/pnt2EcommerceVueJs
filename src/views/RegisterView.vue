<template>
  <div class="register-container">
    <v-card class="mx-auto" max-width="500">
      <v-card-title class="text-center">Crear Cuenta</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleRegister">
          <v-text-field label="Nombre" v-model="name" required></v-text-field>
          <v-text-field label="Apellido" v-model="lastname" required></v-text-field>
          <v-text-field label="Correo electrónico" v-model="mail" type="email" required></v-text-field>
          <v-text-field label="DNI" v-model="dni" required></v-text-field>
          <v-text-field label="Contraseña" v-model="pass" type="password" required></v-text-field>
          <v-text-field label="Fecha de Nacimiento" v-model="dateOfBirth" type="date" required></v-text-field>
          <v-text-field label="Dirección" v-model="address" required></v-text-field>
          <v-text-field label="Ciudad" v-model="city" required></v-text-field>
          <v-text-field label="Estado" v-model="state" required></v-text-field>
          <v-btn type="submit" class="mt-3" block>Crear</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import apiClient from '@/plugins/axios';
import { useSnackbar } from '@/composables/useSnackbar';

const { showSnackbar } = useSnackbar();

export default {
  name: 'RegisterView',
  data() {
    return {
      name: '',
      lastname: '',
      mail: '',
      dni: '',
      pass: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: ''
    };
  },
  methods: {
    async handleRegister() {
      try {
        const response = await apiClient.post('/users', {
          name: this.name,
          lastname: this.lastname,
          mail: this.mail,
          dni: this.dni,
          pass: this.pass,
          dateOfBirth: this.dateOfBirth,
          address: this.address,
          city: this.city,
          state: this.state
        });
        console.log('Registrado:', response.data);
        showSnackbar({ message: 'Registro exitoso', color: 'success' });
        this.$router.push('/login'); // Redirige al login después del registro
      } catch (error) {
        console.error('Error registrando:', error);
        showSnackbar({ message: 'Error al registrar. Por favor, intente nuevamente.', color: 'error' });
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  padding: 20px;
}
</style>