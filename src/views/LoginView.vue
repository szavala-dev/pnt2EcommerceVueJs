<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6">
        <v-card class="login-card">
          <v-card-title class="text-center">Iniciar Sesión</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitLogin">
              <v-text-field
                label="Email"
                v-model="mail"
                type="email"
                required
                outlined
                dense
                class="mb-4"
              ></v-text-field>
              <v-text-field
                label="Contraseña"
                v-model="pass"
                type="password"
                required
                outlined
                dense
                class="mb-4"
              ></v-text-field>
              <v-btn
                type="submit"
                block
                large
                :loading="submitting"
                :disabled="submitting"
              >
                {{ submitting ? 'Ingresando...' : 'Ingresar' }}
              </v-btn>
            </v-form>
            <v-alert
              v-if="errorMessage"
              type="error"
              class="mt-4"
              density="comfortable"
              border="start"
              border-color="error"
            >
              {{ errorMessage }}
            </v-alert>
            <v-divider class="my-4"></v-divider>
            <p class="register-link">
              ¿No tienes una cuenta? <v-btn text to="/register">Regístrate aquí</v-btn>
            </p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" class="d-none d-md-flex align-center justify-center">
        <div class="login-message">
          <h2>Ingresá tu e-mail para iniciar sesión</h2>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/plugins/axios';
import { useSnackbar } from '@/composables/useSnackbar';

const mail = ref('');
const pass = ref('');
const submitting = ref(false);
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();
const { showSnackbar } = useSnackbar();

const submitLogin = async () => {
  // Envía las credenciales, guarda token y redirige según rol
  errorMessage.value = '';
  submitting.value = true;
  try {
    const response = await apiClient.post('/users/login', {
      mail: mail.value,
      pass: pass.value
    });
    const token = response.data.token;
    await authStore.login(token);

    if (authStore.isAdminGetter) {
      router.push('/admin');
    } else {
      router.push('/');
    }
    showSnackbar({ message: 'Inicio de sesión exitoso', color: 'success' });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    const backendMessage = error?.response?.data?.message;
    errorMessage.value = backendMessage ?? 'Credenciales inválidas. Vuelve a intentarlo.';
    showSnackbar({ message: 'No pudimos iniciar sesión', color: 'error' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.login-container {
  padding: 40px 30px;
  margin-top: 100px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.register-link {
  font-size: 0.9em;
}

@media (max-width: 600px) {
  .login-container {
    margin-top: 50px;
    padding: 20px;
  }
}
</style>