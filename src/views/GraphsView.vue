<script setup>
import { ref, onMounted } from 'vue'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Colors,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Line } from 'vue-chartjs'
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Colors)

import Layout from '../components/Layout.vue'

const data = ref({
  loading: true,
  yearMonth: thisMonthStr(),
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  count: {
    labels: ['January', 'February', 'March'],
    datasets: [{
      label: 'Monthly Data',
      data: [40, 20, 12]
    }]
  },
  flowtime: {
    labels: ['January', 'February', 'March'],
    datasets: [{
      label: 'Monthly Data',
      data: [40, 20, 12]
    }]
  }
})

const optionsFlowtime = ref({
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Flow Time Harian'
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Tanggal'
      }
    },
    y: {
      min: 0,
      title: {
        display: true,
        text: 'Jam'
      }
    }
  },
})

const optionsCount = ref({
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Jumlah Work Order Harian'
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Tanggal'
      }
    },
    y: {
      min: 0,
      title: {
        display: true,
        text: 'Quantity'
      },
      ticks: {
        stepSize: 1
      }
    }
  },
})

onMounted(() => {
  fetchData()
})

async function fetchData() {
  data.value.loading = true

  const yearMonth = new Date(data.value.yearMonth)
  data.value.year = yearMonth.getFullYear()
  data.value.month = yearMonth.getMonth() + 1

  const now = new Date()
  let lastDay
  if (now.getFullYear() == yearMonth.getFullYear() && now.getMonth() == yearMonth.getMonth()) {
    lastDay = now.getDate()
  } else {
    lastDay = new Date(yearMonth.getFullYear(), yearMonth.getMonth() + 1, 0).getDate()
  }
  
  try {
    let res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/work-orders/monthly-daily-count-detail?` + new URLSearchParams({ year: data.value.year, month: data.value.month, 'last-day': lastDay }))
    if (res.ok) {
      const result = await res.json()

      data.value.count = {
        labels: result.data.total.map(el => el.day),
        datasets: [
          {
            label: 'Entered Work Order',
            data: result.data.created.map(el => el.count)
          },
          {
            label: 'Finished Work Order',
            data: result.data.ended.map(el => el.count)
          },
          {
            label: 'Active Work Order',
            data: result.data.total.map(el => el.count)
          }
        ]
      }  
    }

    res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/work-orders/monthly-daily-flowtime-detail?` + new URLSearchParams({ year: data.value.year, month: data.value.month, 'last-day': lastDay }))
    if (res.ok) {
      const result = await res.json()

      data.value.flowtime = {
        labels: result.data.flowtime.map(el => el.day),
        datasets: [
          {
            label: 'Rata-Rata Flow Time',
            data: result.data.flowtime.map(el => el.flowtime / (3600 * 1000))
          }
        ]
      }  
    }

    data.value.loading = false
  } catch(err){}
}

function thisMonthStr() {
  return `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
}
</script>

<template>
  <Layout>
    <div class="p-3" for="header">
      <h1 class="text-4xl font-bold dark:text-white">Graphs</h1>
    </div>

    <div class="p-3" for="utility">
      <div class="flex flex-row">
        <div>
          <label for="month" class="mr-2">Bulan</label>
          <input v-model="data.yearMonth" type="month" name="month" id="month" :max="thisMonthStr()">
        </div>
        <div class="ml-4">
          <button @click="fetchData" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Display</button>
        </div>
      </div>
      <div :set="displayingMonth = new Date(`${data.year}-${data.month.toString().padStart(2, '0')}`)" class="mt-2">
        <p class="block mb-2 text-sm text-gray-900 dark:text-white">Menampilkan <span class="font-medium">{{ displayingMonth.toLocaleString('default', { month: 'long' }) }} {{ displayingMonth.getFullYear() }}</span></p>
      </div>
    </div>

    <div class="p-3" for="content">
      <div v-if="!data.loading" class="grid grid-cols-1 gap-8">
        <div>
          <Line :data="data.flowtime" :options="optionsFlowtime" />
        </div>
        <div class="mb-6">
          <Line :data="data.count" :options="optionsCount" />
        </div>
      </div>

      <div v-if="data.loading">
        <div role="status" class="p-4 border border-gray-200 rounded shadow animate-pulse md:p-6 dark:border-gray-700">
          <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2.5"></div>
          <div class="w-48 h-2 mb-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
          <div class="flex items-baseline mt-4 space-x-6">
            <div class="w-full bg-gray-200 rounded-t-lg h-72 dark:bg-gray-700"></div>
            <div class="w-full h-56 bg-gray-200 rounded-t-lg dark:bg-gray-700"></div>
            <div class="w-full bg-gray-200 rounded-t-lg h-72 dark:bg-gray-700"></div>
            <div class="w-full h-64 bg-gray-200 rounded-t-lg dark:bg-gray-700"></div>
            <div class="w-full bg-gray-200 rounded-t-lg h-80 dark:bg-gray-700"></div>
            <div class="w-full bg-gray-200 rounded-t-lg h-72 dark:bg-gray-700"></div>
            <div class="w-full bg-gray-200 rounded-t-lg h-80 dark:bg-gray-700"></div>
          </div>
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  </Layout>
</template>
