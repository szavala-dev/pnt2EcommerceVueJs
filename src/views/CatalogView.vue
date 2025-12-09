<template>
  <div>
    <h2>Catálogo de Productos</h2>
    <v-row>
      <v-col
          cols="12"
          sm="6"
          md="4"
          lg="4"
        v-for="product in products"
        :key="product.id"
      >
        <ProductCard :product="product" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProductCard from '@/components/ProductCard.vue';
import apiClient from '@/plugins/axios';
import { useSnackbar } from '@/composables/useSnackbar';

const products = ref([]);
const { showSnackbar } = useSnackbar();

const loadProducts = async () => {
  // Obtiene el listado de productos para el catálogo
  try {
    const response = await apiClient.get('/products');
    products.value = response.data.message;
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    showSnackbar({ message: 'Error al obtener los productos.', color: 'error' });
  }
};

onMounted(loadProducts);
</script>

<style scoped>

</style>