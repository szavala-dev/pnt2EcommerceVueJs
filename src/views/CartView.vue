<template>
  <div>
    <h1>Carrito de Compras</h1>
    <div v-if="cartItems.length">
      <v-row>
        <v-col
          cols="4"
          md="4"
          lg="4"
          v-for="item in cartItems"
          :key="item.id"
        >
          <CartItem
            :product="item.Product"
            :quantity="item.quantity"
            :cartId="cartId"
            @remove-from-cart="removeFromCart"
            @increment="incrementQuantity"
            @decrement="decrementQuantity"
          />
        </v-col>
      </v-row>
      <v-btn @click="generateOrder">Realizar Orden</v-btn>
    </div>
    <div v-else>
      <p>Tu carrito está vacío.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/store/auth';
import CartItem from '@/components/CartItem.vue';
import { useSnackbar } from '@/composables/useSnackbar';

const authStore = useAuthStore();
const userId = ref(authStore.userId);
const cartItems = ref([]);
const cartId = ref(null);
const { showSnackbar } = useSnackbar();

// Normaliza el id de producto cualquiera sea su forma en el payload
const normalizeProductId = (rawId) => {
  const candidate = rawId?.ProductId ?? rawId?.productId ?? rawId?.Product?.id ?? rawId;
  return Number(candidate);
};

const notifyCartChanged = () => {
  // Emite evento global para que otras vistas actualicen el carrito
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart:changed'));
  }
};

watch(
  () => authStore.userId,
  (newId) => {
    userId.value = newId;
    cartId.value = null;
    if (newId) {
      getCartItems();
    } else {
      cartItems.value = [];
      notifyCartChanged();
    }
  }
);

const ensureUserContext = async () => {
  // Garantiza contar con userId válido cargándolo si falta
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
  // Trae el snapshot del carrito o devuelve uno vacío ante 404
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

const getCartItems = async () => {
  // Actualiza los items locales del carrito desde la API
  try {
    const payload = await fetchCartSnapshot();
    cartItems.value = payload.CartItems ?? [];
    notifyCartChanged();
  } catch (error) {
    console.error('Error al obtener los ítems del carrito:', error);
    showSnackbar({ message: 'No se pudo cargar el carrito.', color: 'error' });
  }
};

const getCartId = async () => {
  // Devuelve el id del carrito obteniéndolo si aún no existe
  if (cartId.value) {
    return cartId.value;
  }
  const payload = await fetchCartSnapshot();
  return payload.id ?? cartId.value;
};

const removeFromCart = async (productId) => {
  // Elimina por completo un producto del carrito
  const normalizedProductId = normalizeProductId(productId);
  try {
    const activeCartId = await getCartId();
    await apiClient.post('/carts/remove', {
      cartId: activeCartId,
      userId: Number(userId.value),
      productId: normalizedProductId
    });
    await getCartItems();
    showSnackbar({
      message: 'Producto eliminado del carrito con éxito',
      color: 'success'
    });
  } catch (error) {
    console.error('Error al eliminar el producto del carrito:', error);
    showSnackbar({ message: 'Error al eliminar el producto del carrito.', color: 'error' });
  }
};

const incrementQuantity = async (productId) => {
  // Aumenta en uno la cantidad de un producto si hay stock
  const normalizedProductId = normalizeProductId(productId);
  try {
    const activeCartId = await getCartId();
    const lineItem = cartItems.value.find((item) => normalizeProductId(item) === normalizedProductId);
    const stockAvailable = Number(lineItem?.Product?.stock ?? 0);
    const currentQty = lineItem?.quantity ?? 0;

    if (!lineItem) {
      showSnackbar({ message: 'No se encontró el producto en el carrito.', color: 'warning' });
      return;
    }

    if (stockAvailable && currentQty + 1 > stockAvailable) {
      showSnackbar({ message: 'No puedes agregar más productos de los que hay en stock.', color: 'warning' });
      return;
    }

    await apiClient.post('/carts/add', {
      cartId: activeCartId,
      userId: Number(userId.value),
      productId: normalizedProductId,
      quantity: 1,
    });
    await getCartItems();
    showSnackbar({ message: 'Cantidad aumentada con éxito', color: 'success' });
  } catch (error) {
    console.error('Error al actualizar la cantidad del carrito:', error);
    showSnackbar({ message: 'No se pudo aumentar la cantidad.', color: 'error' });
  }
};

const decrementQuantity = async (productId) => {
  // Reduce en uno la cantidad sin perder la línea en backend
  const normalizedProductId = normalizeProductId(productId);
  try {
    const lineItem = cartItems.value.find((item) => normalizeProductId(item) === normalizedProductId);
    if (!lineItem) {
      return;
    }

    if (lineItem.quantity <= 1) {
      await removeFromCart(productId);
      return;
    }

    const activeCartId = await getCartId();
    const currentQuantity = lineItem.quantity;
    const targetQuantity = currentQuantity - 1;

    try {
      await apiClient.post('/carts/remove', {
        cartId: activeCartId,
        userId: Number(userId.value),
        productId: normalizedProductId
      });

      await apiClient.post('/carts/add', {
        cartId: activeCartId,
        userId: Number(userId.value),
        productId: normalizedProductId,
        quantity: targetQuantity,
      });

      await getCartItems();
      showSnackbar({ message: 'Cantidad reducida con éxito', color: 'success' });
    } catch (updateError) {
      console.error('Error al reducir la cantidad del carrito:', updateError);
      // Intentar restaurar la cantidad original para no dejar al usuario sin el producto
      try {
        await apiClient.post('/carts/add', {
          cartId: activeCartId,
          userId: Number(userId.value),
          productId: normalizedProductId,
          quantity: currentQuantity,
        });
      } catch (restoreError) {
        console.error('No se pudo restaurar la cantidad original del carrito:', restoreError);
      }
      showSnackbar({ message: 'No se pudo reducir la cantidad.', color: 'error' });
    }
  } catch (error) {
    console.error('Error al reducir la cantidad del carrito:', error);
  }
};

const generateOrder = async () => {
  // Genera una orden a partir del carrito actual
  try {
    await ensureUserContext();
    await apiClient.post(`/carts/${userId.value}/generate-order`);
    showSnackbar({ message: 'Orden generada con éxito', color: 'success' });
    await getCartItems();
  } catch (error) {
    console.error('Error al generar la orden:', error);
    showSnackbar({ message: 'Error al generar la orden.', color: 'error' });
  }
};

onMounted(() => {
  // Carga inicial del carrito si hay usuario
  if (userId.value) {
    getCartItems();
  }
});
</script>

<style scoped>
/* Tus estilos aquí */
</style>