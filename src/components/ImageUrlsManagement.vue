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
        <v-btn prepend-icon="mdi-image-plus" @click="openCreateDialog">
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
        <v-btn class="icon-btn edit-btn" @click="openEditDialog(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn class="icon-btn delete-btn" @click="deleteImage(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
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
            <div class="upload-row">
              <v-file-input
                v-model="fileInputValue"
                label="Subir archivo (opcional)"
                accept="image/*"
                prepend-icon="mdi-cloud-upload"
                density="comfortable"
                :disabled="uploading"
                :loading="uploading"
              />
              <v-btn
                class="upload-button"
                :loading="uploading"
                :disabled="uploading"
                @click="uploadImage"
              >
                Cargar imagen
              </v-btn>
            </div>
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
          <v-btn @click="closeDialog">Cancelar</v-btn>
          <v-btn @click="saveImage" :loading="saving">
            {{ editMode ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import apiClient from '@/plugins/axios';
import { useSnackbar } from '@/composables/useSnackbar';

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
const fileInputValue = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);
const { showSnackbar } = useSnackbar();

watch(fileInputValue, (value) => {
  // Actualiza el archivo seleccionado al cambiar el input
  selectedFile.value = Array.isArray(value) ? value?.[0] ?? null : value ?? null;
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
  // Normaliza la respuesta de imágenes a un formato consistente
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
  // Filtra imágenes por búsqueda en producto o URL
  if (!search.value) return imageUrls.value;
  const query = search.value.toString().toLowerCase();
  return imageUrls.value.filter((item) => {
    const productMatch = item.productId?.toString().includes(query);
    const urlMatch = item.url?.toLowerCase().includes(query);
    return productMatch || urlMatch;
  });
});

const fetchImages = async () => {
  // Carga todas las URLs de imagen desde la API
  loading.value = true;
  try {
    const response = await apiClient.get('/image-urls');
    imageUrls.value = normalizeImages(response.data);
  } catch (error) {
    console.error('Error al obtener las imágenes:', error);
    showSnackbar({ message: 'No se pudieron cargar las URLs de imagen.', color: 'error' });
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  // Abre el diálogo para crear una nueva URL
  resetForm();
  dialog.value = true;
  editMode.value = false;
};

const openEditDialog = (item) => {
  // Abre el diálogo con los datos de la URL seleccionada
  form.id = item.id;
  form.productId = item.productId;
  form.url = item.url;
  form.altText = item.altText;
  form.isPrimary = item.isPrimary;
  editMode.value = true;
  dialog.value = true;
};

const closeDialog = () => {
  // Cierra el diálogo y reinicia el formulario
  dialog.value = false;
  resetForm();
};

const resetForm = () => {
  // Limpia el formulario y estados asociados a la carga
  form.id = null;
  form.productId = '';
  form.url = '';
  form.altText = '';
  form.isPrimary = false;
  fileInputValue.value = null;
  selectedFile.value = null;
  uploading.value = false;
};

const buildPayload = () => {
  // Construye el payload compatible con las variantes del backend
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

const extractUploadUrl = (payload) =>
  // Extrae la URL subida de distintas formas de respuesta
  payload?.url ??
  payload?.message?.url ??
  payload?.data?.url ??
  payload?.location ??
  payload?.secure_url ??
  '';

const uploadImage = async () => {
  // Sube un archivo opcional y coloca la URL resultante en el formulario
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
    form.url = uploadedUrl;
    showSnackbar({ message: 'Imagen subida con éxito.', color: 'success' });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    showSnackbar({ message: 'No se pudo subir la imagen.', color: 'error' });
  } finally {
    uploading.value = false;
    fileInputValue.value = null;
  }
};

const saveImage = async () => {
  // Crea o actualiza una URL de imagen según el modo
  if (!form.productId || !form.url) {
    showSnackbar({ message: 'Completa el producto y la URL antes de guardar.', color: 'warning' });
    return;
  }

  saving.value = true;
  const payload = buildPayload();

  try {
    if (editMode.value && form.id) {
      await apiClient.put(`/image-urls/${form.id}`, payload);
      showSnackbar({ message: 'URL actualizada con éxito.', color: 'success' });
    } else {
      await apiClient.post('/image-urls', payload);
      showSnackbar({ message: 'URL creada con éxito.', color: 'success' });
    }
    await fetchImages();
    closeDialog();
  } catch (error) {
    console.error('Error al guardar la imagen:', error);
    showSnackbar({ message: 'No se pudo guardar la URL.', color: 'error' });
  } finally {
    saving.value = false;
  }
};

const deleteImage = async (id) => {
  // Elimina una URL tras confirmar y actualiza la lista local
  if (!id) return;
  if (!confirm('¿Eliminar esta URL de imagen?')) return;
  try {
    await apiClient.delete(`/image-urls/${id}`);
    imageUrls.value = imageUrls.value.filter((image) => image.id !== id);
    showSnackbar({ message: 'URL eliminada.', color: 'success' });
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    showSnackbar({ message: 'No se pudo eliminar la URL.', color: 'error' });
  }
};

const formatDate = (value) => {
  // Formatea fecha para mostrar o devuelve guion
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
.upload-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.upload-button {
  min-width: 160px;
}
</style>
