<template>
  <v-footer color="black" dark class="footer">
    <v-row class="w-100" align="center">
      <v-col cols="12" md="4" class="contact-col">
        <p class="section-title">Contacto</p>
        <p class="contact-item">ascreacionesdigitales@gmail.com</p>
        <p class="contact-item">011 4084-9996</p>
      </v-col>
      <v-col cols="12" md="4" class="text-center footer-text">
        &copy; {{ new Date().getFullYear() }} Sublimas. Todos los derechos reservados.
        <router-link to="/about" class="footer-link">Sobre Nosotros</router-link>
      </v-col>
      <v-col cols="12" md="4" class="text-center social-col">
        <p class="section-title">Nuestras redes sociales</p>
        <div class="social-wrapper">
          <v-btn
            icon
            class="social-btn"
            href="https://www.facebook.com/Sublimas/"
            target="_blank"
            aria-label="Facebook Sublimas"
          >
            <v-icon size="20">mdi-facebook</v-icon>
          </v-btn>
          <v-btn
            icon
            class="social-btn"
            href="https://www.instagram.com/sublim_as"
            target="_blank"
            aria-label="Instagram Sublimas"
          >
            <v-icon size="20">mdi-instagram</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-footer>
</template>
<script setup>
</script>

<style scoped>
.footer {
  background-color: #000 !important;
  color: #fff !important;
  padding: 16px 0;
}

.contact-col,
.social-col {
  text-align: center;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.contact-item {
  margin: 0;
  font-size: 0.95rem;
}

.social-wrapper {
  display: inline-flex;
  gap: 8px;
}

.footer-text {
  font-size: 0.95rem;
}

.footer-link {
  display: inline-block;
  margin-top: 8px;
  color: #fff;
  text-decoration: underline;
  font-weight: 600;
}

.footer-link:hover {
  color: rgba(255, 255, 255, 0.8);
}

.social-btn {
  background-color: #fff !important;
  color: #000 !important;
  border-radius: 10px;
  margin: 0 4px;
}

.social-btn:hover {
  background-color: rgba(255, 255, 255, 0.8) !important;
}
</style>