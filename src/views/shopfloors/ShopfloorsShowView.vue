<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Modal } from 'flowbite';

import { useAppStore } from '../../router/stores';
import Layout from '../../components/Layout.vue';
import router from '../../router';

const route = useRoute()
const appStore = useAppStore()
appStore.trackingLastShopfloorId = route.params.id

// Variables declaration
const shopfloor = ref({});
const cellSelectedId = ref(null)
const cellSelected = computed(() => {
  let selected
  if (shopfloor.value.cells) {
    selected = shopfloor.value.cells.find((cell) => cell.id == cellSelectedId.value)
    
  }
  
  return selected || {}
})
const statistic = computed(() => {
  let countWIP = 0
  let averageCountWIP = 0
  let averageDurationWIP = 0

  if (shopfloor.value.cells) {
    for (const cell of shopfloor.value.cells) {
      for (const work_order of cell.work_orders) {
        countWIP += 1
        averageDurationWIP +=  new Date(shopfloor.value.time) - new Date(work_order.entered_at)
      }
    }
  
    averageCountWIP = Math.round(countWIP / shopfloor.value.cells.length)
    averageDurationWIP = Math.floor(averageDurationWIP / countWIP)
  }

  return {
    averageCountWIP,
    averageDurationWIP
  }
})

const detailModal = ref('')
const denah = ref(null)
const previewImage = ref(null)
const denahLength = ref('')
const denahWidth = ref('')
const denahImageSize = ref({
  width: 0.0,
  height: 0.0
})
const fetchTimeoutId = ref(null)

// Functions
function calculateAverageFlowtime(work_orders) {
  if (work_orders.length == 0) {
    return '-'
  }

  let total = 0
  const now = new Date(shopfloor.value.time)
  for (const wo of work_orders) {
    total += now - (new Date(wo.entered_at))
  }
  return Math.floor(total / work_orders.length / 60000)
}

function formatTime(diff) {
  return `${Math.floor(diff/1000 / 3600).toString().padStart(2, '0')}:${Math.floor((diff/1000 % 3600) / 60).toString().padStart(2, '0')}:${Math.floor((diff/1000 % 3600) % 60).toString().padStart(2, '0')}`
}

onMounted(async () => {
  window.addEventListener('resize', resizeEventHandler)
  detailModal.value = new Modal(document.getElementById('detailModal'))
  
  // Fetch recursively data
  refetch()

  // Resize denah
  denah.value.addEventListener('load', () => {
    resizeEventHandler();
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeEventHandler)
  clearTimeout(fetchTimeoutId.value)
})

async function refetch() {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/shopfloors/${route.params.id}?` + new URLSearchParams({ 'cells': true, 'active-work-orders': true }))
    if (res.ok) {
      const fetchedShopfloor = await res.json()
      shopfloor.value = fetchedShopfloor
      
      previewImage.value = `${import.meta.env.VITE_BACKEND_BASE_URL}/${fetchedShopfloor.map_url}`
      denahLength.value = fetchedShopfloor.length
      denahWidth.value = fetchedShopfloor.width
    }
  } catch(e) {
  }

  fetchTimeoutId.value = setTimeout(refetch, 1000)
}

function changeSelectedId(id) {
  cellSelectedId.value = id
  detailModal.value.show()
}

function resizeEventHandler(e) {
  denahImageSize.value = { width: parseFloat(denah.value.width), height: parseFloat(denah.value.height) }
}

function goBackToTracking(e) {
  appStore.trackingLastShopfloorId = ''
  router.replace({ name: 'tracking' })
}
</script>

<template>
  <Layout>
    <div class="p-3" for="header">
      <button @click="goBackToTracking" class="mr-4 hover:underline md:mr-6 ">&lt; Kembali</button>
      <h1 class="text-4xl font-bold dark:text-white">Shopfloor</h1>
      <h2 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">{{ shopfloor.name }}</h2>
    </div>

    <div for="utility">
    </div>

    <div for="content">
      <div class="mb-1 grid grid-cols-2">
        <p class="block mb-2 text-center text-medium text-gray-900 dark:text-white">Rata-Rata Jumlah Work Order: <span class="font-medium">{{ statistic.averageCountWIP }}</span></p>
        <p class="block mb-2 text-center text-medium text-gray-900 dark:text-white">Rata-Rata Flow Time Shopfloor: <span class="font-medium">{{ Math.floor(shopfloor.average_flow_time / 60000) }} menit</span></p>
      </div>

      <div class="w-full grid grid-cols-6">
        <div class="col-start-2 col-span-4 relative">
          <img ref="denah" :src="previewImage">

          <svg v-for="cell in shopfloor.cells"
              @click="() => changeSelectedId(cell.id)"
              :width="cell.radius / denahLength * denahImageSize.width"
              :height="cell.radius / denahWidth * denahImageSize.height"
              class="absolute"
              :style="{
                left: (cell.relative_position_x - cell.radius/2)/denahLength * denahImageSize.width,
                top: (1 - (cell.relative_position_y + cell.radius/2)/denahWidth) * denahImageSize.height
              }">
            <ellipse  cx="50%" cy="50%" rx="45%" ry="45%" stroke="DarkSlateGray" stroke-width="3" stroke-dasharray="15" fill="none" />
            <text x="50%" y="30%" dominant-baseline="middle" text-anchor="middle" font-size="16px" fill="DarkSlateGray">{{ cell.name }}</text>
            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="50px" font-weight="bold" fill="ForestGreen">{{ cell.work_orders.length }}</text>
          </svg>
        </div>
      </div>
    </div>
  </Layout>
  <!-- Default Modal -->
  <div id="detailModal" tabindex="-1" aria-hidden="true" class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
      <div class="relative w-full max-w-2xl max-h-full">
          <!-- Modal content -->
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <!-- Modal header -->
              <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                      Shopfloor Cell ({{ cellSelected.name }})
                  </h3>
                  <button @click="() => detailModal.hide()" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                      <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                      <span class="sr-only">Close modal</span>
                  </button>
              </div>
              <!-- Modal body -->
              <div v-if="cellSelected.work_orders" class="p-6 space-y-6">
                <div class="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <p>Jumlah work order saat ini: {{ cellSelected.work_orders.length }}</p>
                    <p>Rata-rata flow time: {{ calculateAverageFlowtime(cellSelected.work_orders) }} Menit</p>
                </div>
                <p class="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                </p>
                <div class="relative overflow-x-auto">
                  <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                              <th scope="col" class="px-6 py-3">
                                  No
                              </th>
                              <th scope="col" class="px-6 py-3">
                                  JID
                              </th>
                              <th scope="col" class="px-6 py-3">
                                  Time (jj:mm:dd)
                              </th>
                          </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(work_order, index) in cellSelected.work_orders" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                              <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  {{ index+1 }}
                              </th>
                              <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  {{ work_order.jid }}
                              </td>
                              <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" :set="diff = new Date(shopfloor.time) - new Date(work_order.entered_at)"
                                :style="{ color: `rgb(${diff/statistic.averageDurationWIP * 122}, ${(1 - diff/statistic.averageDurationWIP) * 255 + 122}, 0)` }">
                                  {{ formatTime(diff) }}
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
              </div>
          </div>
      </div>
  </div>

</template>
