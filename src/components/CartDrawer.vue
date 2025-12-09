<template>
  <v-navigation-drawer
    class="cart-drawer"
    location="right"
    temporary
    :model-value="modelValue"
    :width="drawerWidth"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <div class="drawer-header">
      <div>
        <p class="drawer-title">Tu carrito</p>
        <p class="drawer-subtitle" v-if="cartItems.length">
          {{ cartItems.length }} {{ cartItems.length === 1 ? 'producto' : 'productos' }}
        </p>
      </div>
      <v-btn icon variant="text" @click="closeDrawer">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-divider class="mb-4" />

    <div v-if="loading" class="state-wrapper">
      <v-progress-circular indeterminate color="black" />
    </div>

    <div v-else-if="!isAuthenticated" class="state-wrapper">
      <p>Inicia sesión para revisar tu carrito.</p>
      <v-btn class="primary-btn login-btn" @click="goToLogin">Ingresar</v-btn>
    </div>

    <div v-else-if="cartItems.length === 0" class="state-wrapper">
      <p>Tu carrito está vacío.</p>
      <v-btn class="primary-btn" block @click="goToCatalog">Ver productos</v-btn>
    </div>

    <div v-else class="drawer-body">
      <div class="item" v-for="item in cartItems" :key="item.id ?? item.ProductId">
        <div class="item-info">
          <p class="item-name">{{ item.Product?.name }}</p>
          <p class="item-price">${{ formatCurrency(item.Product?.price) }}</p>
        </div>
        <div class="item-actions">
          <div class="qty-controls">
            <v-btn
              icon
              class="qty-btn"
              :disabled="item.quantity <= 1"
              @click="decrementQuantity(item.ProductId)"
            >
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <span class="quantity-display">{{ item.quantity }}</span>
            <v-btn
              icon
              class="qty-btn"
              :disabled="isOutOfStock(item)"
              @click="incrementQuantity(item.ProductId)"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
          <v-btn icon variant="text" class="remove-icon" @click="removeFromCart(item.ProductId)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>

      <v-divider class="my-4" />

      <div class="summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <strong>${{ formatCurrency(cartTotal) }}</strong>
        </div>
        <div class="summary-row">
          <span>Productos</span>
          <strong>{{ cartItems.length }}</strong>
        </div>
      </div>

      <div class="actions">
        <v-btn block variant="outlined" class="ghost-btn" @click="goToCart">Ver carrito completo</v-btn>
        <v-btn
          block
          class="primary-btn"
          :loading="finalizing"
          :disabled="finalizing || cartItems.length === 0"
          @click="finalizeOrder"
        >
          Finalizar compra
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/store/auth';
import { useSnackbar } from '@/composables/useSnackbar';
import { useDisplay } from 'vuetify';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'cart-updated']);

const router = useRouter();
const authStore = useAuthStore();
const { showSnackbar } = useSnackbar();
const display = useDisplay();

const drawerWidth = computed(() => (display.smAndDown.value ? 320 : 420));
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userId = ref(authStore.userId);
const cartId = ref(null);
const cartItems = ref([]);
const loading = ref(false);
const finalizing = ref(false);

const formatCurrency = (value) => {
  const number = Number(value ?? 0);
  return number.toLocaleString('es-AR', { minimumFractionDigits: 2 });
};

const cartTotal = computed(() =>
  cartItems.value.reduce(
    (total, item) => total + Number(item.Product?.price ?? 0) * Number(item.quantity ?? 0),
    0
  )
);

const drawerIsOpen = computed(() => props.modelValue);

const notifyCartChanged = () => {
  // Emite un evento global para que otras vistas refresquen el carrito
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart:changed'));
  }
};

// Normaliza el identificador de producto sin importar la forma en el payload
const normalizeProductId = (rawId) => {
  const candidate = rawId?.ProductId ?? rawId?.productId ?? rawId?.Product?.id ?? rawId;
  return Number(candidate);
};

const emitCartCount = () => {
  // Notifica al padre el total de unidades en el carrito
  const totalItems = cartItems.value.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
  emit('cart-updated', totalItems);
};

const ensureUserContext = async () => {
  // Asegura tener userId cargado desde el store o backend
  if (!userId.value) {
    await authStore.fetchUser();
    userId.value = authStore.userId;
  }
  const normalizedId = Number(userId.value);
  if (!normalizedId) {
    throw new Error('Usuario no disponible');
  }
  userId.value = normalizedId;
};

const normalizeCartPayload = (data) => data?.message ?? data ?? {};

const fetchCartSnapshot = async () => {
  // Obtiene el snapshot del carrito del usuario o devuelve vacío
  await ensureUserContext();
  try {
    const response = await apiClient.get(`/carts/${userId.value}`);
    const payload = normalizeCartPayload(response.data);
    cartId.value = payload.id ?? cartId.value;
    return payload;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 400 || status === 404) {
      cartId.value = null;
      return { CartItems: [] };
    }
    throw error;
  }
};

const refreshCart = async () => {
  // Refresca items del carrito manejando estados de carga y auth
  if (!isAuthenticated.value) {
    cartItems.value = [];
    cartId.value = null;
    emitCartCount();
    return;
  }
  loading.value = true;
  try {
    const payload = await fetchCartSnapshot();
    cartItems.value = payload.CartItems ?? [];
    emitCartCount();
  } catch (error) {
    console.error('Error al cargar el carrito:', error);
    showSnackbar({ message: 'No se pudo actualizar el carrito.', color: 'error' });
  } finally {
    loading.value = false;
  }
};

const closeDrawer = () => {
  // Cierra el drawer del carrito
  emit('update:modelValue', false);
};

const goToLogin = () => {
  // Redirige a login cerrando el drawer
  closeDrawer();
  router.push('/login');
};

const goToCatalog = () => {
  // Redirige al catálogo
  closeDrawer();
  router.push('/catalog');
};

const goToCart = () => {
  // Redirige a la vista de carrito completa
  closeDrawer();
  router.push('/cart');
};

const getCartId = async () => {
  // Devuelve el id del carrito creando contexto si falta
  if (cartId.value) {
    return cartId.value;
  }
  const payload = await fetchCartSnapshot();
  return payload.id ?? cartId.value;
};

const isOutOfStock = (item) => {
  // Indica si la cantidad iguala o supera el stock
  const stock = Number(item.Product?.stock ?? 0);
  return stock <= item.quantity;
};

const incrementQuantity = async (productId) => {
  // Incrementa en uno la cantidad de un producto
  const normalizedProductId = normalizeProductId(productId);
  try {
    const activeCartId = await getCartId();
    await apiClient.post('/carts/add', {
      cartId: activeCartId,
      userId: Number(userId.value),
      productId: normalizedProductId,
      quantity: 1,
    });
    await refreshCart();
    notifyCartChanged();
    showSnackbar({ message: 'Cantidad aumentada en el carrito.', color: 'success' });
  } catch (error) {
    console.error('No se pudo aumentar la cantidad:', error);
    showSnackbar({ message: 'Error al aumentar la cantidad.', color: 'error' });
  }
};

const removeFromCart = async (productId) => {
  // Elimina completamente un producto del carrito
  const normalizedProductId = normalizeProductId(productId);
  try {
    const activeCartId = await getCartId();
    await apiClient.post('/carts/remove', {
      cartId: activeCartId,
      userId: Number(userId.value),
      productId: normalizedProductId,
    });
    await refreshCart();
    notifyCartChanged();
    showSnackbar({ message: 'Producto eliminado del carrito.', color: 'success' });
  } catch (error) {
    console.error('No se pudo eliminar el producto:', error);
    showSnackbar({ message: 'Error al eliminar el producto del carrito.', color: 'error' });
  }
};

const decrementQuantity = async (productId) => {
  // Reduce la cantidad de un producto y evita borrados inesperados
  const normalizedProductId = normalizeProductId(productId);
  const lineItem = cartItems.value.find((item) => normalizeProductId(item) === normalizedProductId);
  if (!lineItem) {
    return;
  }

  if (lineItem.quantity <= 1) {
    await removeFromCart(normalizedProductId);
    return;
  }

  try {
    const activeCartId = await getCartId();
    const currentQuantity = Number(lineItem.quantity ?? 0);
    const targetQuantity = Math.max(currentQuantity - 1, 1);

    // Limpia la línea y vuelve a crearla con la cantidad deseada para evitar que el backend elimine el ítem completo
    await apiClient.post('/carts/remove', {
      cartId: activeCartId,
      userId: Number(userId.value),
      productId: normalizedProductId,
    });

    await apiClient.post('/carts/add', {
      cartId: activeCartId,
      userId: Number(userId.value),
      productId: normalizedProductId,
      quantity: targetQuantity,
    });

    await refreshCart();
    notifyCartChanged();
    showSnackbar({ message: 'Cantidad reducida en el carrito.', color: 'success' });
  } catch (error) {
    console.error('No se pudo reducir la cantidad:', error);
    // Intento de rollback en caso de que la actualización falle
    try {
      const activeCartId = await getCartId();
      await apiClient.post('/carts/add', {
        cartId: activeCartId,
        userId: Number(userId.value),
        productId: normalizedProductId,
        quantity: Number(lineItem.quantity ?? 1),
      });
    } catch (restoreError) {
      console.error('No se pudo restaurar la cantidad original:', restoreError);
    }
    showSnackbar({ message: 'Error al reducir la cantidad.', color: 'error' });
  }
};

const finalizeOrder = async () => {
  // Genera la orden a partir del carrito y limpia el estado local
  try {
    finalizing.value = true;
    await ensureUserContext();
    await apiClient.post(`/carts/${userId.value}/generate-order`);
    showSnackbar({ message: 'Orden generada con éxito.', color: 'success' });
    cartItems.value = [];
    emitCartCount();
    notifyCartChanged();
    closeDrawer();
    router.push('/orders');
  } catch (error) {
    console.error('Error al generar la orden:', error);
    showSnackbar({ message: 'No se pudo generar la orden.', color: 'error' });
  } finally {
    finalizing.value = false;
  }
};

watch(drawerIsOpen, (open) => {
  if (open) {
    refreshCart();
  }
});

watch(
  () => authStore.userId,
  (newId) => {
    userId.value = newId;
    if (!newId) {
      cartItems.value = [];
      cartId.value = null;
      emitCartCount();
    } else if (drawerIsOpen.value) {
      refreshCart();
    }
  }
);

const handleCartChanged = () => {
  // Refresca el carrito cuando se emite el evento global
  if (isAuthenticated.value) {
    refreshCart();
  }
};

onMounted(() => {
  if (typeof window === 'undefined') {
    return;
  }
  window.addEventListener('cart:changed', handleCartChanged);
  if (isAuthenticated.value) {
    refreshCart();
  }
});

onUnmounted(() => {
  if (typeof window === 'undefined') {
    return;
  }
  window.removeEventListener('cart:changed', handleCartChanged);
});

defineExpose({ refreshCart });
</script>

<style scoped>
.cart-drawer {
  padding: 24px 20px;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.drawer-subtitle {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0;
  font-weight: 600;
}

.item-price {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  background-color: #000 !important;
  color: #fff !important;
}

.quantity-display {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
}

.remove-icon {
  color: #000 !important;
}

.summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-btn {
  background-color: #000 !important;
  color: #fff !important;
  border-radius: 999px;
}

.login-btn {
  min-width: 140px;
  align-self: center;
  padding: 10px 16px;
}

.ghost-btn {
  border-color: #000 !important;
  background-color: #000 !important;
  color: #fff !important;
  border-radius: 999px;
}

.state-wrapper {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}
</style>
