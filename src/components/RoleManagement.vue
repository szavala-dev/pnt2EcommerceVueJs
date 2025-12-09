<template>
    <div>
      <h3>Gestión de Roles</h3>
      <v-btn @click="openAddRoleDialog">Agregar Rol</v-btn>
      <v-data-table
        :headers="headers"
        :items="roles"
        class="elevation-1"
      >
        <template #item.createdAt="{ item }">
          {{ new Date(item.createdAt).toLocaleString() }}
        </template>
        <template #item.updatedAt="{ item }">
          {{ new Date(item.updatedAt).toLocaleString() }}
        </template>
        <template #item.actions="{ item }">
          <v-btn small class="edit-btn" @click="openEditRoleDialog(item)">Editar</v-btn>
          <v-btn small class="delete-btn" @click="deleteRoleHandler(item.id)">Eliminar</v-btn>
        </template>
      </v-data-table>
  
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ isEditing ? 'Editar Rol' : 'Agregar Rol' }}</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-text-field v-model="editedRole.id" label="ID del Rol" :disabled="isEditing" required></v-text-field>
              <v-text-field v-model="editedRole.name" label="Nombre del Rol" required></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="closeDialog">Cancelar</v-btn>
            <v-btn @click="saveRole">{{ isEditing ? 'Guardar' : 'Agregar' }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import apiClient from '@/plugins/axios';
  import { useSnackbar } from '@/composables/useSnackbar';
  
  const roles = ref([]);
  const dialog = ref(false);
  const isEditing = ref(false);
  const editedRole = ref({ id: '', name: '' });
  const { showSnackbar } = useSnackbar();
  const headers = [
    { text: 'ID', value: 'id' },
    { text: 'Nombre', value: 'name' },
    { text: 'Creado', value: 'createdAt' },
    { text: 'Actualizado', value: 'updatedAt' },
    { text: 'Acciones', value: 'actions', sortable: false },
  ];
  
  const fetchRoles = async () => {
    // Obtiene los roles desde la API y llena la tabla
    try {
      const response = await apiClient.get('/roles');
      roles.value = response.data.message;
    } catch (error) {
      console.error('Error al obtener los roles:', error);
      showSnackbar({ message: 'Error al obtener los roles.', color: 'error' });
    }
  };
  
  const openAddRoleDialog = () => {
    // Prepara el diálogo para crear un nuevo rol
    isEditing.value = false;
    editedRole.value = { id: '', name: '' };
    dialog.value = true;
  };
  
  const openEditRoleDialog = (role) => {
      // Abre el diálogo con los datos del rol a editar
    isEditing.value = true;
    editedRole.value = { ...role };
    dialog.value = true;
  };
  
  const closeDialog = () => {
      // Cierra el diálogo y no altera datos
    dialog.value = false;
  };
  
  const saveRole = async () => {
      // Crea o actualiza un rol y refresca la lista local
    try {
      if (isEditing.value) {
        await apiClient.put(`/roles/${editedRole.value.id}`, editedRole.value);
        const index = roles.value.findIndex(role => role.id === editedRole.value.id);
        if (index !== -1) {
          roles.value[index] = { ...editedRole.value };
        }
      } else {
        const response = await apiClient.post('/roles', editedRole.value);
        roles.value.push(response.data.message);
      }
      closeDialog();
      showSnackbar({
        message: isEditing.value ? 'Rol actualizado con éxito.' : 'Rol agregado con éxito.',
        color: 'success',
      });
    } catch (error) {
      console.error('Error al guardar el rol:', error);
      showSnackbar({ message: 'Error al guardar el rol.', color: 'error' });
    }
  };
  
  const deleteRoleHandler = async (roleId) => {
    // Elimina un rol tras confirmación y actualiza el listado
    if (confirm('¿Estás seguro de eliminar este rol?')) {
      try {
        await apiClient.delete(`/roles/${roleId}`);
        roles.value = roles.value.filter(role => role.id !== roleId);
        showSnackbar({ message: 'Rol eliminado con éxito.', color: 'success' });
      } catch (error) {
        console.error('Error al eliminar el rol:', error);
        showSnackbar({ message: 'Error al eliminar el rol.', color: 'error' });
      }
    }
  };
  
  onMounted(fetchRoles);
  </script>
  
  <style scoped>
  /* Tus estilos aquí */
  </style>