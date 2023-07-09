<script setup>
import { ref, onMounted, computed } from 'vue'
import Layout from '../../components/Layout.vue'
import WorkOrderCard from './WorkOrderCard.vue'

const showCard = ref(false)
const showLoading = ref(false)

const searchJid = ref('')
const jid = ref('')
const found = ref(false)
const workOrder = ref({});

async function submitSearch(e) {
  e.preventDefault()

  showCard.value = true
  showLoading.value = true
  jid.value = searchJid.value

  // fetch data
  const result = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/work-orders?jid=${searchJid.value}`)
  if (result.ok) {
    workOrder.value = await result.json();
    found.value = true;
  } else {
    found.value = false;
  }

  showLoading.value = false;
}

</script>

<template>
  <Layout>
    <div class="p-3" for="header">
      <h1 class="text-4xl font-bold dark:text-white">Work Orders Search</h1>
    </div>

    <div class="p-3" for="utility">
      <form @submit="submitSearch">
        <div class="flex">
          <div class="relative w-full">
            <input v-model="searchJid" type="search" id="search-dropdown" class="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Masukkan JID yang ingin dicari..." required>
            <button type="submit" class="absolute top-0 right-0 p-2.5 text-sm font-medium text-white bg-blue-700 rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              <svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span class="sr-only">Search</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <div class="p-3" for="content">
      <div v-if="showCard" class="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div v-if="!showLoading && !found">
          <h5 class="mb-2 text-2xl font-bold underline tracking-tight text-gray-900 dark:text-white">{{ jid }}</h5>
          <p class="font-normal text-gray-700 dark:text-gray-400">Work order tidak ditemukan</p>
        </div>

        <div v-if="!showLoading && found">
          <WorkOrderCard :workOrder="workOrder"/>
        </div>

        <div v-if="showLoading" role="status" class="max-w-sm animate-pulse">
          <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
          <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
          <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
          <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
          <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  </Layout>
</template>
