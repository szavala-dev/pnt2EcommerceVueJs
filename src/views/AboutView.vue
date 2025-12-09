<template>
  <v-container fluid class="about-container">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="about-card">
          <v-card-title class="text-center title">Acerca de Nuestra Aplicación de E-Commerce</v-card-title>
          <v-card-text>
            <p class="intro-text">
              Bienvenido a nuestra SPA de e-commerce construida con Vue 3 + Vite. Integra catálogo público, autenticación JWT, carrito y seguimiento de órdenes, además de un panel administrativo con gestión de imágenes, usuarios, roles y productos. Todo convive con una arquitectura documentada en el README para que nuevos colaboradores puedan integrarse rápidamente.
            </p>

            <v-divider class="my-4"></v-divider>

            <h3 class="section-title">Bondades de Usar Nuestra Aplicación</h3>
            <v-container>
              <v-row>
                <v-col
                  v-for="(item, index) in bondades"
                  :key="index"
                  cols="12"
                  md="6"
                  lg="4"
                  class="feature-item"
                >
                  <v-card class="feature-card" outlined>
                    <v-card-text>
                      <strong>{{ item.title }}</strong>
                      <p>{{ item.description }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>

            <v-divider class="my-4"></v-divider>

            <h3 class="section-title">Panel Administrativo</h3>
            <p class="mb-4">
              El panel incluye módulos como <strong>ProductManagement</strong>, <strong>RoleManagement</strong>, <strong>UserManagement</strong>, <strong>OrdersManagement</strong> e <strong>ImageUrlsManagement</strong> para centralizar todas las gestiones críticas del negocio.
            </p>

            <h3 class="section-title">Seguridad y Roles</h3>
            <p>
              Implementamos guardias en `vue-router` con `meta.requiresAuth` y `meta.requiresAdmin`, respaldados por `Pinia` y el endpoint `/users/check-admin`. Esto garantiza que el panel solo sea accesible para perfiles autorizados, mientras que el resto de la app mantiene la experiencia fluida para clientes.
            </p>

            <h3 class="section-title">Tecnologías Utilizadas</h3>
            <v-container class="technologies-container">
              <v-row>
                <v-col cols="12">
                  <ul>
                    <li><strong>Vue 3:</strong> Un framework progresivo de JavaScript para construir interfaces de usuario.</li>
                    <li><strong>Vuetify:</strong> Un framework de componentes de Material Design para Vue.js.</li>
                    <li><strong>Vite:</strong> Un build tool rápido y moderno para proyectos de Vue.js.</li>
                    <li><strong>Pinia:</strong> Un store de estado para Vue.js.</li>
                    <li><strong>Axios:</strong> Una librería para hacer solicitudes HTTP.</li>
                    <li><strong>Vue Router:</strong> Maneja navegación SPA con guardias para rutas protegidas y perfiles admin.</li>
                  </ul>
                </v-col>
              </v-row>
            </v-container>

            <v-divider class="my-4"></v-divider>

            <h3 class="section-title">Documentación y Arquitectura</h3>
            <p>
              Toda la arquitectura, flujos y endpoints están detallados en el archivo <code>README.md</code>, incluyendo la plantilla <code>.env.example</code>, los módulos administrativos y las rutas protegidas. Cualquier colaborador puede seguir esa guía para levantar el entorno en minutos.
            </p>

            <v-divider class="my-4"></v-divider>

            <h3 class="section-title">Contribuciones</h3>
            <p>
              Las contribuciones son bienvenidas. Si deseas contribuir, por favor sigue los siguientes pasos:
            </p>
            <v-container class="contributions-container">
              <v-row>
                <v-col cols="12">
                  <ol>
                    <li>Haz un fork del proyecto.</li>
                    <li>Crea una nueva rama (<code>git checkout -b feature/nueva-funcionalidad</code>).</li>
                    <li>Realiza tus cambios y haz commit (<code>git commit -am 'Agrega nueva funcionalidad'</code>).</li>
                    <li>Haz push a la rama (<code>git push origin feature/nueva-funcionalidad</code>).</li>
                    <li>Abre un Pull Request.</li>
                  </ol>
                </v-col>
              </v-row>
            </v-container>

            <v-divider class="my-4"></v-divider>

            <h3 class="section-title">Licencia</h3>
            <p>
              Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo <code>LICENSE</code> para obtener más información.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AboutView',
  data() {
    return {
      bondades: [
        { title: 'Experiencia consistente', description: 'SPA con navegación instantánea, layouts reutilizables y soporte móvil/desktop para todo el flujo de compra.' },
        { title: 'Panel modular', description: 'Administra productos, roles, usuarios, órdenes e imágenes desde un solo dashboard con permisos por rol.' },
        { title: 'Gestión de imágenes', description: 'Carga, marca como principal y organiza URLs por producto mediante el módulo de imágenes.' },
        { title: 'Flujo de órdenes completo', description: 'Filtra órdenes por estado y ejecuta acciones como confirmar, preparar, enviar o cancelar sin salir del panel.' },
        { title: 'Seguridad basada en roles', description: 'Guardias de ruta y validación de tokens impiden el acceso no autorizado al panel administrativo.' },
        { title: 'Documentación viva', description: 'README y `.env.example` mantienen el setup claro para cualquier colaborador nuevo.' }
      ]
    };
  }
};
</script>

<style scoped>
.about-container {
  background-color: #f5f5f5;
  padding: 20px;
}

.about-card {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.intro-text {
  font-size: 1rem;
  line-height: 1.6;
}

.section-title {
  font-size: 1.4rem;
  color: #1976d2;
  margin-top: 1.5rem;
}

.feature-item {
  margin-bottom: 1.5rem;
}

.feature-card {
  padding: 15px;
  background-color: #fafafa;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.feature-card strong {
  font-size: 1.1rem;
  color: #333;
}

.feature-card p {
  font-size: 1rem;
  color: #555;
}

@media (max-width: 600px) {
  .title {
    font-size: 1.4rem;
  }

  .intro-text {
    font-size: 0.9rem;
  }

  .feature-card {
    padding: 12px;
  }

  .section-title {
    font-size: 1.2rem;
  }
}
</style>