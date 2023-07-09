<script setup>
import { ref } from 'vue'
import router from '../router';

const username = ref('')
const password = ref('')

const error = ref('')

async function handleSubmit(e) {
  e.preventDefault()
  
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          username: username.value,
          password: password.value
      })
    })

    if (res.ok) {
      localStorage.setItem('rtls-user', await res.text())
      router.replace({ name: 'home' })
    } else if (res.status != 404) {
      error.value = await res.text()
    }
  } catch(e) {
  }
}
</script>

<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Real Time Locating System
      </a>
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Login to account
          </h1>
          <div v-if="error" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span class="font-medium">Gagal!</span> {{ error }}
          </div>
          <form class="space-y-4 md:space-y-6" @submit="handleSubmit">
            <div>
              <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
              <input v-model="username" type="text" name="username" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="">
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
              <input v-model="password" type="password" name="password" id="password" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="">
            </div>
            <button type="submit" class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign in</button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
