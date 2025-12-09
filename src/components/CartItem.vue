<template>
  <v-card class="cart-card" elevation="2">
    <v-img
      :src="product.imageUrl"
      :alt="product.name"
      class="product-image"
      cover
    ></v-img>
    <v-card-title class="title">{{ product.name }}</v-card-title>
    <v-card-subtitle class="subtitle">{{ product.description }}</v-card-subtitle>
    <v-card-text class="body">
      <p class="price">${{ Number(product.price).toLocaleString('es-AR') }}</p>
      <div class="quantity-control">
        <v-btn
          icon
          class="qty-btn"
          :disabled="quantity <= 1"
          @click="decrement"
        >
          <v-icon>mdi-minus</v-icon>
        </v-btn>
        <span class="quantity-display">{{ quantity }}</span>
        <v-btn
          icon
          class="qty-btn"
          @click="increment"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-card-text>
    <v-card-actions class="actions">
      <v-btn class="remove-btn" variant="outlined" @click="removeFromCart">Quitar producto</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  cartId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['remove-from-cart', 'increment', 'decrement']);

const removeFromCart = () => {
  emit('remove-from-cart', props.product.id);
};

const increment = () => {
  emit('increment', props.product.id);
};

const decrement = () => {
  if (props.quantity <= 1) return;
  emit('decrement', props.product.id);
};
</script>

<style scoped>
.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.cart-card {
  border-radius: 16px;
  overflow: hidden;
}

.title {
  font-weight: 600;
}

.subtitle {
  font-size: 0.9rem;
  color: #555;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  background-color: #000 !important;
  color: #fff !important;
}

.quantity-display {
  min-width: 36px;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
}

.actions {
  padding: 0 16px 16px;
}

.remove-btn {
  border-color: #000 !important;
  color: #000 !important;
}
</style>