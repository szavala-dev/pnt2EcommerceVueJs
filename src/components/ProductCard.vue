<template>
  <v-card class="product-card" elevation="3">
    <div class="image-wrapper">
      <v-img
        :src="product.imageUrl"
        :alt="product.name"
        cover
        class="product-image"
      >
        <template #placeholder>
          <div class="image-placeholder">Imagen no disponible</div>
        </template>
      </v-img>
    </div>
    <v-card-text class="card-body">
      <p class="brand-label">{{ product.brand }}</p>
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="price-row">
        <span class="price">${{ Number(product.price).toLocaleString('es-AR') }}</span>
      </div>
    </v-card-text>
    <v-card-actions class="card-actions">
      <v-btn
        class="details-btn"
        block
        @click="viewDetails"
      >
        Ver detalle
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router';
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});
const router = useRouter();
const viewDetails = () => {
  router.push(`/product/${props.product.id}`);
};
</script>

<style scoped>
.product-card {
  border-radius: 22px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e6e6e6;
  box-shadow: 0 18px 35px rgba(15, 15, 15, 0.08);
  color: #0f0f0f;
  display: flex;
  flex-direction: column;
  min-height: 520px;
  width: clamp(260px, 32vw, 360px);
  margin: 16px auto;
}

.image-wrapper {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: #6b6b6b;
  background: #f5f5f5;
}

.card-body {
  flex: 1;
  padding: 28px 30px 0;
}

.brand-label {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5c5c5c;
  margin-bottom: 6px;
}

.product-name {
  font-size: 1.35rem;
  margin: 0 0 16px;
  color: #111;
  line-height: 1.3;
}


.price-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111;
  text-align: center;
  width: 100%;
}

.card-actions {
  padding: 24px 30px 30px;
}

.details-btn {
  background: #000;
  color: #fff !important;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 14px;
}

@media (max-width: 960px) {
  .product-card {
    min-height: 460px;
    width: 100%;
  }
  .price-row {
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
}

@media (max-width: 600px) {
  .product-card {
    min-height: 420px;
  }
}
</style>