<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h3>Gestión de Usuarios</h3>
        <p class="subtitle">Administra los clientes, sus datos y roles asignados.</p>
      </div>
      <v-btn @click="openAddUserDialog">Crear Usuario</v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="users"
      class="elevation-1"
      :loading="loading"
      loading-text="Cargando usuarios..."
    >
      <template #item.role="{ item }">
        {{ resolveRoleName(item.RoleId) }}
      </template>
      <template #item.createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
      <template #item.updatedAt="{ item }">
        {{ formatDate(item.updatedAt) }}
      </template>
      <template #item.actions="{ item }">
        <v-btn class="icon-btn" @click="openViewDialog(item)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn class="icon-btn edit-btn" @click="openEditUserDialog(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn class="icon-btn delete-btn" @click="deleteUserHandler(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialogo Crear/Editar -->
    <v-dialog v-model="editDialog" max-width="640px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEditing ? 'Editar Usuario' : 'Crear Usuario' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="saveUser">
            <v-row dense>
              <v-col cols="12" md="6"><v-text-field v-model="editableUser.name" label="Nombre" required /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editableUser.lastname" label="Apellido" required /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editableUser.mail" type="email" label="Correo" required /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editableUser.dni" label="DNI" required /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editableUser.dateOfBirth" type="date" label="Fecha de nacimiento" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editableUser.address" label="Dirección" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editableUser.city" label="Ciudad" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editableUser.state" label="Provincia" /></v-col>
              <v-col cols="12" md="6">
                <v-select
                  :items="roleOptions"
                  item-title="name"
                  item-value="id"
                  v-model="editableUser.RoleId"
                  label="Rol"
                  required
                />
              </v-col>
              <v-col cols="12" md="6" v-if="!isEditing">
                <v-text-field v-model="editableUser.pass" type="password" label="Contraseña temporal" required />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeEditDialog">Cancelar</v-btn>
          <v-btn @click="saveUser">{{ isEditing ? 'Guardar' : 'Crear' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogo detalle -->
    <v-dialog v-model="viewDialog" max-width="520px">
      <v-card>
        <v-card-title>Detalle de Usuario</v-card-title>
        <v-card-text v-if="selectedUser">
          <p><strong>Nombre:</strong> {{ selectedUser.name }} {{ selectedUser.lastname }}</p>
          <p><strong>Email:</strong> {{ selectedUser.mail }}</p>
          <p><strong>DNI:</strong> {{ selectedUser.dni }}</p>
          <p><strong>Rol:</strong> {{ resolveRoleName(selectedUser.RoleId) }}</p>
          <p><strong>Dirección:</strong> {{ selectedUser.address }}, {{ selectedUser.city }}, {{ selectedUser.state }}</p>
          <p><strong>Fecha de nacimiento:</strong> {{ formatDate(selectedUser.dateOfBirth) }}</p>
          <p><strong>Creado:</strong> {{ formatDate(selectedUser.createdAt) }}</p>
          <p><strong>Actualizado:</strong> {{ formatDate(selectedUser.updatedAt) }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="viewDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/plugins/axios';
import { useSnackbar } from '@/composables/useSnackbar';

const users = ref([]);
const roles = ref([]);
const loading = ref(false);
const editDialog = ref(false);
const viewDialog = ref(false);
const isEditing = ref(false);
const selectedUser = ref(null);
const formRef = ref(null);
const { showSnackbar } = useSnackbar();

const emptyUser = () => ({
  // Devuelve la plantilla vacía para un usuario editable
  id: null,
  name: '',
  lastname: '',
  mail: '',
  dni: '',
  pass: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  RoleId: null,
});

const editableUser = ref(emptyUser());

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Nombre', value: 'name' },
  { text: 'Apellido', value: 'lastname' },
  { text: 'Email', value: 'mail' },
  { text: 'Rol', value: 'role' },
  { text: 'Creado', value: 'createdAt' },
  { text: 'Actualizado', value: 'updatedAt' },
  { text: 'Acciones', value: 'actions', sortable: false },
];

const roleOptions = ref([]);

const normalizeArray = (payload) => {
  // Normaliza distintas formas de respuesta a un arreglo estándar
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.users)) return payload.users;
  if (Array.isArray(payload.message)) return payload.message;
  return [];
};

const fetchUsers = async () => {
  // Carga usuarios desde la API y actualiza la tabla
  loading.value = true;
  try {
    const response = await apiClient.get('/users');
    users.value = normalizeArray(response.data);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    showSnackbar({ message: 'No se pudieron cargar los usuarios.', color: 'error' });
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
  // Carga roles para popular select y resolver nombres
  try {
    const response = await apiClient.get('/roles');
    roles.value = normalizeArray(response.data);
    roleOptions.value = roles.value;
  } catch (error) {
    console.error('Error al obtener los roles:', error);
    showSnackbar({ message: 'No se pudieron cargar los roles.', color: 'error' });
  }
};

const openAddUserDialog = () => {
  // Abre diálogo para crear usuario nuevo
  isEditing.value = false;
  editableUser.value = emptyUser();
  editDialog.value = true;
};

const openEditUserDialog = (user) => {
  // Abre diálogo con datos precargados para editar usuario
  isEditing.value = true;
  editableUser.value = {
    ...user,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
  };
  editDialog.value = true;
};

const openViewDialog = (user) => {
  // Muestra el diálogo de detalle de usuario
  selectedUser.value = user;
  viewDialog.value = true;
};

const closeEditDialog = () => {
  // Cierra el diálogo de edición y limpia el formulario
  editDialog.value = false;
  editableUser.value = emptyUser();
};

const saveUser = async () => {
  // Crea o actualiza un usuario según el modo actual
  try {
    const payload = { ...editableUser.value };
    if (isEditing.value) {
      delete payload.pass;
      await apiClient.put(`/users/${payload.id}`, payload);
      showSnackbar({ message: 'Usuario actualizado con éxito.', color: 'success' });
    } else {
      if (!payload.pass) {
        showSnackbar({ message: 'Define una contraseña temporal.', color: 'warning' });
        return;
      }
      await apiClient.post('/users', payload);
      showSnackbar({ message: 'Usuario creado con éxito.', color: 'success' });
    }
    closeEditDialog();
    await fetchUsers();
  } catch (error) {
    console.error('Error al guardar el usuario:', error);
    showSnackbar({ message: 'No se pudo guardar el usuario.', color: 'error' });
  }
};

const deleteUserHandler = async (userId) => {
  // Elimina un usuario tras confirmación y actualiza la lista
  if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
  try {
    await apiClient.delete(`/users/${userId}`);
    users.value = users.value.filter((user) => user.id !== userId);
    showSnackbar({ message: 'Usuario eliminado.', color: 'success' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    showSnackbar({ message: 'No se pudo eliminar el usuario.', color: 'error' });
  }
};

const formatDate = (value) => {
  // Formatea fechas para mostrarlas o devuelve guion
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const resolveRoleName = (roleId) => {
  // Devuelve el nombre del rol según el id
  const role = roles.value.find((roleItem) => roleItem.id === roleId);
  return role ? role.name : 'Sin rol';
};

onMounted(async () => {
  // Carga inicial de usuarios y roles en paralelo
  await Promise.all([fetchUsers(), fetchRoles()]);
});
</script>

<style scoped>
.subtitle {
  color: #666;
  margin-top: 4px;
}
</style>
