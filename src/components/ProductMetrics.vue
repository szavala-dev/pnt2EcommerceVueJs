<template>
  <v-card class="mb-6">
    <v-card-title>Métricas de Productos</v-card-title>
    <v-card-subtitle>Compara rápidamente el más y el menos vendido.</v-card-subtitle>
    <v-divider class="my-3" />
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <metric-card
            title="Más vendido"
            :product="bestSelling"
            color="green"
            icon="mdi-chart-line"
            :loading="loading"
          />
        </v-col>
        <v-col cols="12" md="6">
          <metric-card
            title="Menos vendido"
            :product="leastSelling"
            color="orange"
            icon="mdi-chart-line-variant"
            :loading="loading"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/plugins/axios';

const bestSelling = ref(null);
const leastSelling = ref(null);
const loading = ref(false);

const normalizeProduct = (payload) => {
  if (!payload) return null;
  if (payload.product) return payload.product;
  if (payload.message) return payload.message;
  return payload;
};

const fetchMetrics = async () => {
  loading.value = true;
  try {
    const [bestRes, leastRes] = await Promise.all([
      apiClient.get('/products/best-selling'),
      apiClient.get('/products/least-selling'),
    ]);
    bestSelling.value = normalizeProduct(bestRes.data);
    leastSelling.value = normalizeProduct(leastRes.data);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    alert('No se pudieron cargar las métricas de productos.');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMetrics);
</script>

<script>
export default {
  components: {
    MetricCard: {
      props: {
        title: String,
        product: Object,
        color: String,
        icon: String,
        loading: Boolean,
      },
      template: `
        <v-card :color="color" variant="outlined">
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-h6">{{ title }}</div>
              <v-icon size="32">{{ icon }}</v-icon>
            </div>
            <div v-if="loading" class="text-caption">Cargando...</div>
            <div v-else-if="product">
              <p class="text-h5 mb-1">{{ product.name }}</p>
              <p class="mb-0">Vendidos: {{ product.totalSold ?? product.quantity ?? 'N/D' }}</p>
              <p class="mb-0">Stock: {{ product.stock ?? 'N/D' }}</p>
            </div>
            <div v-else>
              <p>No hay datos disponibles.</p>
            </div>
          </v-card-text>
        </v-card>
      `,
    },
  },
};
</script>
