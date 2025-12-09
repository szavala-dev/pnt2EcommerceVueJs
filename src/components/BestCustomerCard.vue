<template>
  <v-card>
    <v-card-title>Mejor Cliente</v-card-title>
    <v-card-subtitle>Según total gastado en la plataforma</v-card-subtitle>
    <v-card-text>
      <div v-if="loading">Cargando información...</div>
      <div v-else-if="bestCustomer">
        <p class="text-h5 mb-2">{{ bestCustomer.name }} {{ bestCustomer.lastname }}</p>
        <p class="mb-1"><strong>Email:</strong> {{ bestCustomer.mail }}</p>
        <p class="mb-1"><strong>Órdenes:</strong> {{ bestCustomer.orderCount ?? bestCustomer.orders ?? 'N/D' }}</p>
        <p class="mb-1"><strong>Total gastado:</strong> ${{ formatCurrency(bestCustomer.totalSpent ?? bestCustomer.total) }}</p>
        <p class="mb-0"><strong>Última compra:</strong> {{ formatDate(bestCustomer.lastOrderDate) }}</p>
      </div>
      <div v-else>
        No hay datos suficientes para calcular el mejor cliente.
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/plugins/axios';

const bestCustomer = ref(null);
const loading = ref(false);

const fetchBestCustomer = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/users/best-customer');
    bestCustomer.value = response.data.customer ?? response.data.message ?? response.data;
  } catch (error) {
    console.error('Error al obtener el mejor cliente:', error);
    alert('No se pudo cargar el mejor cliente.');
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0';
  return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 });
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

onMounted(fetchBestCustomer);
</script>
