<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterLink to="/">Home</RouterLink> <RouterLink to="/about">About</RouterLink>
  <RouterView />
</template>
