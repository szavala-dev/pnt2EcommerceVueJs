<template>
    <div>
      <h2>Gestión de Productos</h2>
      <v-btn @click="openAddProductDialog">Agregar Producto</v-btn>
      <v-data-table
        :headers="productHeaders"
        :items="products"
        class="elevation-1"
      >
        <template #item.imageUrl="{ item }">
          <v-img :src="item.imageUrl" alt="Imagen del producto" max-height="100" max-width="100"></v-img>
        </template>
        <template #item.actions="{ item }">
          <v-btn small class="edit-btn" @click="openEditProductDialog(item)">Editar</v-btn>
          <v-btn small class="delete-btn" @click="deleteProductHandler(item.id)">Eliminar</v-btn>
        </template>
      </v-data-table>
  
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ isEditing ? 'Editar Producto' : 'Agregar Producto' }}</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-text-field v-model="editedProduct.name" label="Nombre" required></v-text-field>
              <v-textarea v-model="editedProduct.description" label="Descripción" required></v-textarea>
              <v-text-field v-model="editedProduct.price" label="Precio" type="number" required></v-text-field>
              <v-text-field v-model="editedProduct.stock" label="Stock" type="number" required></v-text-field>
              <v-text-field v-model="editedProduct.category" label="Categoría" required></v-text-field>
              <v-text-field v-model="editedProduct.brand" label="Marca" required></v-text-field>
              <v-text-field v-model="editedProduct.imageUrl" label="URL de la Imagen" required></v-text-field>
              <div class="upload-row">
                <v-file-input
                  v-model="fileInputValue"
                  label="Subir imagen (opcional)"
                  accept="image/*"
                  prepend-icon="mdi-cloud-upload"
                  density="comfortable"
                  :disabled="uploading"
                  :loading="uploading"
                />
                <v-btn
                  class="upload-button"
                  :disabled="uploading"
                  :loading="uploading"
                  @click="uploadImage"
                >
                  Cargar imagen
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeDialog">Cancelar</v-btn>
            <v-btn text @click="saveProduct">{{ isEditing ? 'Guardar' : 'Agregar' }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import apiClient from '@/plugins/axios';
  import { useSnackbar } from '@/composables/useSnackbar';
  
  const { showSnackbar } = useSnackbar();
  const products = ref([]);
  const dialog = ref(false);
  const isEditing = ref(false);
  const editedProduct = ref({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    brand: '',
    imageUrl: '',
  });
  const fileInputValue = ref(null);
  const selectedFile = ref(null);
  const uploading = ref(false);

  watch(fileInputValue, (value) => {
    selectedFile.value = Array.isArray(value) ? value?.[0] ?? null : value ?? null;
  });
  const productHeaders = [
    { text: 'ID', value: 'id' },
    { text: 'Nombre', value: 'name' },
    { text: 'Descripción', value: 'description' },
    { text: 'Precio', value: 'price' },
    { text: 'Marca', value: 'brand' },
    { text: 'Stock', value: 'stock' },
    { text: 'Categoría', value: 'category' },
    { text: 'Imagen', value: 'imageUrl' },
    { text: 'Acciones', value: 'actions', sortable: false },
  ];
  
  const fetchProducts = async () => {
    // Carga el listado completo de productos desde la API
    try {
      const response = await apiClient.get('/products');
      products.value = response.data.message;
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      showSnackbar({ message: 'Error al obtener los productos.', color: 'error' });
    }
  };
  
  const openAddProductDialog = () => {
    // Prepara el formulario para crear un nuevo producto
    isEditing.value = false;
    editedProduct.value = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      brand: '',
      imageUrl: '',
    };
    clearFileSelection();
    dialog.value = true;
  };
  
  const openEditProductDialog = (product) => {
    // Abre el formulario precargado para editar el producto
    isEditing.value = true;
    editedProduct.value = { ...product };
    clearFileSelection();
    dialog.value = true;
  };
  
  const closeDialog = () => {
    // Cierra el diálogo y limpia la selección de archivo
    dialog.value = false;
    clearFileSelection();
  };

  const clearFileSelection = () => {
    // Reinicia los estados vinculados a la carga de imagen
    fileInputValue.value = null;
    selectedFile.value = null;
    uploading.value = false;
  };

  const normalizeNumberInput = (value) => {
    // Convierte entradas numéricas (coma o punto) a Number
    const normalized = String(value ?? '')
      .replace(',', '.')
      .trim();
    if (!normalized) {
      return Number.NaN;
    }
    return Number(normalized);
  };

  const buildProductPayload = () => ({
    // Construye el payload con los campos limpios para la API
    name: editedProduct.value.name?.trim() ?? '',
    description: editedProduct.value.description?.trim() ?? '',
    price: normalizeNumberInput(editedProduct.value.price),
    stock: normalizeNumberInput(editedProduct.value.stock),
    category: editedProduct.value.category?.trim() ?? '',
    brand: editedProduct.value.brand?.trim() ?? '',
    imageUrl: editedProduct.value.imageUrl?.trim() ?? '',
  });

  const isValidProductPayload = (payload) => {
    // Valida campos obligatorios y números antes de enviar
    const priceNumber = payload.price;
    const stockNumber = payload.stock;
    if (!payload.name || !payload.description || !payload.category || !payload.brand) {
      showSnackbar({ message: 'Completa todos los campos obligatorios.', color: 'warning' });
      return false;
    }
    if (!payload.imageUrl) {
      showSnackbar({ message: 'Carga una imagen o indica su URL.', color: 'warning' });
      return false;
    }
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      showSnackbar({ message: 'El precio debe ser mayor a 0.', color: 'warning' });
      return false;
    }
    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      showSnackbar({ message: 'El stock debe ser un entero mayor o igual a 0.', color: 'warning' });
      return false;
    }
    return true;
  };

  const extractUploadUrl = (payload) =>
    // Normaliza posibles llaves de respuesta al subir imagen
    payload?.url ??
    payload?.message?.url ??
    payload?.data?.url ??
    payload?.location ??
    payload?.secure_url ??
    '';

  const uploadImage = async () => {
    // Sube una imagen opcional y setea su URL en el formulario
    if (!selectedFile.value) {
      showSnackbar({ message: 'Selecciona una imagen antes de subirla.', color: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile.value);
    uploading.value = true;

    try {
      const response = await apiClient.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = extractUploadUrl(response.data);
      if (!uploadedUrl) {
        throw new Error('Respuesta sin URL');
      }
      editedProduct.value.imageUrl = uploadedUrl;
      showSnackbar({ message: 'Imagen subida con éxito.', color: 'success' });
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      showSnackbar({ message: 'No se pudo subir la imagen.', color: 'error' });
    } finally {
      uploading.value = false;
      fileInputValue.value = null;
    }
  };
  
  const saveProduct = async () => {
    // Crea o actualiza un producto según el estado de edición
      const payload = buildProductPayload();
      if (!isValidProductPayload(payload)) {
        return;
      }
    try {
      if (isEditing.value) {
          await apiClient.put(`/products/${editedProduct.value.id}`, payload);
          const index = products.value.findIndex(product => product.id === editedProduct.value.id);
        if (index !== -1) {
            products.value[index] = { ...products.value[index], ...payload, id: editedProduct.value.id };
        }
      } else {
          const response = await apiClient.post('/products', payload);
        products.value.push(response.data.message);
      }
      closeDialog();
      showSnackbar({
        message: isEditing.value ? 'Producto actualizado con éxito.' : 'Producto agregado con éxito.',
        color: 'success',
      });
    } catch (error) {
        console.error('Error saving product:', error?.response ?? error);
        const backendMessage = error?.response?.data?.message;
        showSnackbar({
          message: backendMessage ?? 'Error al guardar el producto.',
          color: 'error',
        });
    }
  };
  
  const deleteProductHandler = async (productId) => {
    // Elimina un producto tras confirmar
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await apiClient.delete(`/products/${productId}`);
        fetchProducts();
        showSnackbar({ message: 'Producto eliminado.', color: 'success' });
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
        showSnackbar({ message: 'No se pudo eliminar el producto.', color: 'error' });
      }
    }
  };
  
  onMounted(fetchProducts);
  </script>
  
  <style scoped>
  .upload-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
  }
  .upload-button {
    min-width: 150px;
  }
  </style>