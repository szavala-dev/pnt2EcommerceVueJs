<template>
  <div class="product-details">
    <div class="product-images">
      <div class="image-container">
        <img :src="product.imageUrl" :alt="product.name" />
      </div>
    </div>
    <div class="product-info">
      <h2 class="product-title">{{ product.name }}</h2>
      <p class="product-description">{{ product.description }}</p>
      <p class="product-price"><strong>Precio:</strong> ${{ product.price }}</p>
      <p><strong>Marca:</strong> {{ product.brand }}</p>
      <p><strong>Stock:</strong> {{ product.stock }}</p>
      <div class="purchase-actions">
        <div class="quantity-control">
          <v-btn
            icon
            class="qty-btn"
            @click="decrementQuantity"
            :disabled="quantity === 1"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <span class="quantity-display">{{ quantity }}</span>
          <v-btn
            icon
            class="qty-btn"
            @click="incrementQuantity"
            :disabled="quantity >= product.stock || product.stock === 0"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
        <v-btn
          class="add-cart-btn"
          block
          :disabled="product.stock === 0"
          @click="addToCart"
        >
          Agregar al carrito
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/store/auth';
import { useSnackbar } from '@/composables/useSnackbar';

const route = useRoute();
const router = useRouter();
const product = ref({});
const authStore = useAuthStore();
const { showSnackbar } = useSnackbar();

const userId = ref(authStore.userId);
const cartId = ref(null);
const quantity = ref(1);

const notifyCartChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart:changed'));
  }
};

watch(
  () => authStore.userId,
  (newId) => {
    userId.value = newId;
    cartId.value = null;
  }
);

watch(
  () => product.value?.id,
  () => {
    quantity.value = 1;
  }
);

const getProductDetails = async () => {
  // Carga los datos del producto según el id de la ruta
  try {
    const response = await apiClient.get(`/products/${route.params.id}`);
    product.value = response.data.message; // Asegúrate de acceder a la propiedad correcta en la respuesta
  } catch (error) {
    console.error('Error al obtener los detalles del producto:', error);
    showSnackbar({ message: 'Error al obtener los detalles del producto.', color: 'error' });
  }
};

const ensureUserId = async () => {
  // Garantiza tener un userId numérico cargado desde store o backend
  if (!userId.value) {
    await authStore.fetchUser();
    userId.value = authStore.userId;
  }
  const normalizedId = Number(userId.value);
  if (!normalizedId) {
    throw new Error('Usuario no disponible');
  }
  userId.value = normalizedId;
  return normalizedId;
};

const fetchCartSnapshotSafe = async (currentUserId) => {
  // Obtiene el snapshot del carrito sin lanzar errores en 404/400
  try {
    const response = await apiClient.get(`/carts/${currentUserId}`);
    const payload = response.data?.message ?? response.data ?? {};
    cartId.value = payload.id ?? cartId.value;
    return {
      cartId: payload.id ?? null,
      items: payload.CartItems ?? [],
    };
  } catch (error) {
    const status = error?.response?.status;
    if (status === 400 || status === 404) {
      cartId.value = null;
      return { cartId: null, items: [] };
    }
    throw error;
  }
};

const createCartForUser = async (currentUserId) => {
  // Crea un carrito para el usuario y devuelve su id
  const response = await apiClient.post('/carts', { userId: Number(currentUserId) });
  const payload = response.data?.message ?? response.data ?? {};
  const newCartId = payload.id ?? payload.cartId ?? payload.CartId ?? null;
  if (!newCartId) {
    throw new Error('No se pudo crear el carrito.');
  }
  cartId.value = newCartId;
  return newCartId;
};

const decrementQuantity = () => {
  // Reduce la cantidad local del producto a mínimo 1
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
};

const incrementQuantity = () => {
  // Incrementa la cantidad local respetando el stock disponible
  const availableStock = Number(product.value?.stock) || 0;
  if (availableStock === 0) {
    return;
  }
  if (quantity.value < availableStock) {
    quantity.value += 1;
  }
};

const addToCart = async () => {
  // Agrega el producto al carrito validando login y stock
  if (!authStore.isAuthenticated) {
    showSnackbar({ message: 'Inicia sesión para agregar productos al carrito.', color: 'warning' });
    router.push('/login');
    return;
  }
  if (quantity.value <= 0) {
    showSnackbar({ message: 'Selecciona una cantidad válida.', color: 'warning' });
    return;
  }
  try {
    const currentUserId = await ensureUserId();
    let { cartId: existingCartId, items } = await fetchCartSnapshotSafe(currentUserId);
    if (!existingCartId) {
      existingCartId = await createCartForUser(currentUserId);
      items = [];
    }
    const cartItem = items.find((item) => item.ProductId === product.value.id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;

    if (currentQuantity + quantity.value > product.value.stock) {
      showSnackbar({ message: 'No puedes agregar más productos de los que hay en stock.', color: 'warning' });
      return;
    }

    const payload = {
      userId: Number(currentUserId),
      productId: Number(product.value.id),
      quantity: quantity.value,
    };
    if (existingCartId) {
      payload.cartId = existingCartId;
    }

    await apiClient.post('/carts/add', payload);
    notifyCartChanged();
    showSnackbar({ message: 'Producto agregado al carrito con éxito', color: 'success' });
  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error?.response ?? error);
    const backendMessage = error?.response?.data?.message;
    showSnackbar({
      message: backendMessage ?? 'Error al agregar el producto al carrito.',
      color: 'error',
    });
  }
};

onMounted(getProductDetails);
</script>

<style scoped>
.product-details {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.5));
  padding: 20px;
  border-radius: 8px;
}
.product-images {
  flex: 1;
  min-width: 300px;
}
.image-container {
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}
.image-container img {
  width: 100%;
  height: auto;
}
.product-info {
  flex: 1;
  min-width: 300px;
}
.product-title {
  font-size: 2rem;
  margin-bottom: 20px;
}
.product-description {
  font-size: 1.2rem;
  margin-bottom: 20px;
}
.product-price {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.purchase-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 320px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  background-color: #000 !important;
  color: #fff !important;
  border-radius: 50%;
}

.quantity-display {
  min-width: 42px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
}

.add-cart-btn {
  background-color: #000 !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 999px;
  letter-spacing: 0.02em;
}
</style>