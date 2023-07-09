<script setup>
import { onMounted } from 'vue'

import Layout from '../components/Layout.vue'
import router from '../router'

onMounted(async () => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/account/me`, {
    credentials: 'include'
  })
  if (res.ok) {
    localStorage.setItem('rtls-user', await res.text())
  } else if (res.status == 401) {
    if (localStorage.getItem('rtls-user')) {
      localStorage.removeItem('rtls-user')
      router.replace({ name: 'login' })
    }
  }
})
</script>

<template>
  <Layout>
    <div class="p-3" for="header">
      <h1 class="text-4xl font-bold dark:text-white">Real-Time Locating System</h1>
    </div>

    <div class="p-3" for="utility">
      
    </div>

    <div class="p-3" for="content">
      
    </div>
  </Layout> 
</template>
