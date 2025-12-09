<template>
  <div class="image-urls-module">
    <div class="d-flex flex-wrap justify-space-between align-center mb-4 gap-3">
      <div>
        <h3 class="mb-1">Gestión de Imágenes</h3>
        <p class="subtitle">Asocia múltiples URLs a cada producto y mantén la galería actualizada.</p>
      </div>
      <div class="d-flex flex-column flex-md-row align-center gap-2">
        <v-text-field
          v-model="search"
          label="Buscar por producto o URL"
          prepend-inner-icon="mdi-magnify"
          hide-details
          density="comfortable"
          variant="outlined"
          class="search-field"
        />
        <v-btn color="primary" prepend-icon="mdi-image-plus" @click="openCreateDialog">
          Nueva URL
        </v-btn>
      </div>
    </div>

    <v-data-table
      :headers="headers"
      :items="filteredImages"
      :loading="loading"
      class="elevation-1"
      loading-text="Cargando imágenes..."
    >
      <template #item.productId="{ item }">
        <span>#{{ item.productId ?? 'N/D' }}</span>
      </template>

      <template #item.url="{ item }">
        <div class="d-flex align-center gap-2">
          <v-avatar size="48" variant="tonal">
            <v-img :src="item.url" alt="preview" cover>
              <template #placeholder>
                <v-icon>mdi-image-off</v-icon>
              </template>
            </v-img>
          </v-avatar>
          <span class="truncate-url">{{ item.url }}</span>
        </div>
      </template>

      <template #item.isPrimary="{ item }">
        <v-chip :color="item.isPrimary ? 'green' : 'grey'" size="small" class="text-uppercase">
          {{ item.isPrimary ? 'Principal' : 'Secundaria' }}
        </v-chip>
      </template>

      <template #item.createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" variant="text" @click="openEditDialog(item)" />
        <v-btn icon="mdi-delete" color="red" variant="text" @click="deleteImage(item.id)" />
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="520px">
      <v-card>
        <v-card-title>{{ editMode ? 'Editar URL' : 'Nueva URL' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent>
            <v-text-field
              v-model="form.productId"
              label="ID del producto"
              type="number"
              min="1"
              required
            />
            <v-text-field
              v-model="form.url"
              label="URL de imagen"
              type="url"
              required
            />
            <v-text-field
              v-model="form.altText"
              label="Descripción alternativa (opcional)"
            />
            <v-switch
              v-model="form.isPrimary"
              color="primary"
              inset
              label="Marcar como imagen principal"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="saveImage" :loading="saving">
            {{ editMode ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import apiClient from '@/plugins/axios';

const imageUrls = ref([]);
const loading = ref(false);
const saving = ref(false);
const dialog = ref(false);
const editMode = ref(false);
const search = ref('');
const formRef = ref(null);
const form = reactive({
  id: null,
  productId: '',
  url: '',
  altText: '',
  isPrimary: false,
});

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Producto', value: 'productId' },
  { text: 'URL', value: 'url', sortable: false },
  { text: 'Principal', value: 'isPrimary' },
  { text: 'Creación', value: 'createdAt' },
  { text: 'Acciones', value: 'actions', sortable: false },
];

const normalizeImages = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.images)
      ? payload.images
      : Array.isArray(payload?.message)
        ? payload.message
        : [];

  return list.map((item) => ({
    id: item.id ?? item.ImageId ?? item.imageId,
    productId: item.ProductId ?? item.productId ?? item.Product?.id ?? null,
    url: item.url ?? item.imageUrl ?? item.path ?? '',
    altText: item.altText ?? item.description ?? item.label ?? '',
    isPrimary: Boolean(item.isPrimary ?? item.main ?? item.isMain ?? false),
    createdAt: item.createdAt ?? item.CreatedAt ?? item.updatedAt ?? null,
  }));
};

const filteredImages = computed(() => {
  if (!search.value) return imageUrls.value;
  const query = search.value.toString().toLowerCase();
  return imageUrls.value.filter((item) => {
    const productMatch = item.productId?.toString().includes(query);
    const urlMatch = item.url?.toLowerCase().includes(query);
    return productMatch || urlMatch;
  });
});

const fetchImages = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/image-urls');
    imageUrls.value = normalizeImages(response.data);
  } catch (error) {
    console.error('Error al obtener las imágenes:', error);
    alert('No se pudieron cargar las URLs de imagen.');
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  resetForm();
  dialog.value = true;
  editMode.value = false;
};

const openEditDialog = (item) => {
  form.id = item.id;
  form.productId = item.productId;
  form.url = item.url;
  form.altText = item.altText;
  form.isPrimary = item.isPrimary;
  editMode.value = true;
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

const resetForm = () => {
  form.id = null;
  form.productId = '';
  form.url = '';
  form.altText = '';
  form.isPrimary = false;
};

const buildPayload = () => {
  const productIdNumber = form.productId ? Number(form.productId) : null;
  return {
    ProductId: productIdNumber,
    productId: productIdNumber,
    url: form.url,
    imageUrl: form.url,
    altText: form.altText || undefined,
    description: form.altText || undefined,
    isPrimary: form.isPrimary,
  };
};

const saveImage = async () => {
  if (!form.productId || !form.url) {
    alert('Completa el producto y la URL antes de guardar.');
    return;
  }

  saving.value = true;
  const payload = buildPayload();

  try {
    if (editMode.value && form.id) {
      await apiClient.put(`/image-urls/${form.id}`, payload);
    } else {
      await apiClient.post('/image-urls', payload);
    }
    await fetchImages();
    closeDialog();
  } catch (error) {
    console.error('Error al guardar la imagen:', error);
    alert('No se pudo guardar la URL.');
  } finally {
    saving.value = false;
  }
};

const deleteImage = async (id) => {
  if (!id) return;
  if (!confirm('¿Eliminar esta URL de imagen?')) return;
  try {
    await apiClient.delete(`/image-urls/${id}`);
    imageUrls.value = imageUrls.value.filter((image) => image.id !== id);
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    alert('No se pudo eliminar la URL.');
  }
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

onMounted(fetchImages);
</script>

<style scoped>
.image-urls-module {
  width: 100%;
}
.subtitle {
  color: #666;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.truncate-url {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.search-field {
  min-width: 260px;
}
</style>
