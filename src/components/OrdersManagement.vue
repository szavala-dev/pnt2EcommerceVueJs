<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center mb-4">
      <div>
        <h3>Órdenes</h3>
        <p class="subtitle">Filtra, revisa y actualiza el estado de cada orden.</p>
      </div>
      <v-select
        :items="statusFilters"
        item-title="label"
        item-value="value"
        v-model="currentFilter"
        label="Filtrar por estado"
        hide-details
        density="comfortable"
        class="status-select"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="orders"
      :loading="loading"
      loading-text="Cargando órdenes..."
    >
      <template #item.status="{ item }">
        <v-chip :color="statusColor(item.status)" size="small" class="text-uppercase">
          {{ item.status }}
        </v-chip>
      </template>
      <template #item.totalprice="{ item }">
        ${{ Number(item.totalprice).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" @click="openDetails(item)"></v-btn>
        <v-menu transition="scale-transition">
          <template #activator="{ props }">
            <v-btn icon="mdi-swap-horizontal" variant="text" color="primary" v-bind="props"></v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="action in statusActions"
              :key="action.value"
              @click="updateStatus(item.id, action.value)"
            >
              <v-list-item-title>{{ action.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn icon="mdi-delete" variant="text" color="red" @click="deleteOrder(item.id)"></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card v-if="selectedOrder">
        <v-card-title>Orden #{{ selectedOrder.id }}</v-card-title>
        <v-card-text>
          <p><strong>Usuario:</strong> {{ selectedOrder.UserId ?? 'N/D' }}</p>
          <p><strong>Total:</strong> ${{ selectedOrder.totalprice }}</p>
          <p><strong>Estado:</strong> {{ selectedOrder.status }}</p>
          <p><strong>Dirección:</strong> {{ selectedOrder.delivery_address }}, {{ selectedOrder.city }}, {{ selectedOrder.state }}</p>
          <p><strong>Creada:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
          <p><strong>Actualizada:</strong> {{ formatDate(selectedOrder.updatedAt) }}</p>
          <div>
            <strong>Productos:</strong>
            <ul>
              <li v-for="product in parsedProducts" :key="product.ProductId">
                Producto #{{ product.ProductId }} - Cant: {{ product.quantity }} - ${{ product.price }}
              </li>
            </ul>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="detailsDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import apiClient from '@/plugins/axios';

const orders = ref([]);
const loading = ref(false);
const currentFilter = ref('all');
const detailsDialog = ref(false);
const selectedOrder = ref(null);

const statusFilters = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'Preparadas', value: 'prepared' },
  { label: 'Enviadas', value: 'sent' },
  { label: 'Canceladas', value: 'canceled' },
];

const statusActions = [
  { label: 'Confirmar', value: 'confirm' },
  { label: 'Preparar', value: 'prepare' },
  { label: 'Enviar', value: 'send' },
  { label: 'Cancelar', value: 'cancel' },
];

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Usuario', value: 'UserId' },
  { text: 'Estado', value: 'status' },
  { text: 'Total', value: 'totalprice' },
  { text: 'Creado', value: 'createdAt' },
  { text: 'Acciones', value: 'actions', sortable: false },
];

const parsedProducts = computed(() => {
  if (!selectedOrder.value?.products) return [];
  try {
    return JSON.parse(selectedOrder.value.products);
  } catch (error) {
    console.error('No se pudieron parsear los productos de la orden.', error);
    return [];
  }
});

const normalizeOrders = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.orders)) return payload.orders;
  if (Array.isArray(payload.message)) return payload.message;
  return [];
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const endpoint = currentFilter.value === 'all' ? '/orders' : `/orders/${currentFilter.value}`;
    const response = await apiClient.get(endpoint);
    orders.value = normalizeOrders(response.data);
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    alert('No se pudieron cargar las órdenes.');
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (orderId, action) => {
  try {
    await apiClient.put(`/orders/${orderId}/${action}`);
    alert('Estado actualizado.');
    fetchOrders();
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    alert('No se pudo actualizar el estado de la orden.');
  }
};

const deleteOrder = async (orderId) => {
  if (!confirm('¿Eliminar esta orden?')) return;
  try {
    await apiClient.delete(`/orders/${orderId}`);
    orders.value = orders.value.filter((order) => order.id !== orderId);
    alert('Orden eliminada.');
  } catch (error) {
    console.error('Error al eliminar la orden:', error);
    alert('No se pudo eliminar la orden.');
  }
};

const openDetails = (order) => {
  selectedOrder.value = order;
  detailsDialog.value = true;
};

const statusColor = (status) => {
  const colors = {
    pending: 'orange',
    confirmed: 'green',
    prepared: 'blue',
    sent: 'teal',
    canceled: 'red',
  };
  return colors[status] ?? 'grey';
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

watch(currentFilter, fetchOrders);

onMounted(fetchOrders);
</script>

<style scoped>
.subtitle {
  color: #666;
  margin-top: 4px;
}
.status-select {
  min-width: 220px;
}
</style>
