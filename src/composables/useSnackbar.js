import { reactive } from 'vue';

const state = reactive({
  visible: false,
  message: '',
  color: 'success',
  timeout: 2500,
  location: 'bottom',
});

const showSnackbar = ({ message, color = 'success', timeout = 2000 } = {}) => {
  // Muestra el snackbar con mensaje, color y duración elegidos
  state.message = message ?? '';
  state.color = color;
  state.timeout = timeout;
  state.visible = true;
};

const hideSnackbar = () => {
  // Oculta manualmente el snackbar
  state.visible = false;
};

export function useSnackbar() {
  return {
    snackbarState: state,
    showSnackbar,
    hideSnackbar,
  };
}
