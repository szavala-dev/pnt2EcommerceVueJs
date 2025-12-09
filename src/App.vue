<template>
  <v-app>
    <NavBar />
    <v-main>
      <router-view />
    </v-main>
    <Footer />
    <v-snackbar
      v-model="snackbarState.visible"
      :color="snackbarState.color"
      :timeout="snackbarState.timeout"
      :location="snackbarState.location"
      variant="flat"
    >
      {{ snackbarState.message }}
    </v-snackbar>
  </v-app>
</template>

<script>
import NavBar from './components/NavBar.vue';
import Footer from './components/Footer.vue';
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'App',
  components: {
    NavBar,
    Footer,
  },
  setup() {
    const { snackbarState } = useSnackbar();
    return { snackbarState };
  },
};
</script>