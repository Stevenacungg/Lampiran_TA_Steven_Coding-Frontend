<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Layout from '../../components/Layout.vue';

const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL

const formValid = ref(false)
const cells = ref([])
const cellSelectedId = ref(null)
let nextId = 1
const cellSelectedIdx = computed(() => {
  for (let i = 0; i < cells.value.length; i++) {
    if (cells.value[i].id == cellSelectedId.value) {
      return i
    }
  }
  return null
})

const denah = ref(null)
const previewImage = ref(null)
const fileInput = ref(null)
const fileExists = ref(false)
const denahLength = ref('')
const denahWidth = ref('')
const denahImageSize = ref({
  width: 0.0,
  height: 0.0
})

onMounted(() => {
  window.addEventListener('resize', resizeEventHandler)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeEventHandler)
})

function addCell() {
  const id = nextId
  nextId += 1
  cellSelectedId.value = id

  cells.value.push({
    id: id,
    name: '',
    nodemcu_code: '',
    relative_position_x: denahLength.value ? denahLength.value / 2 : 0,
    relative_position_y: denahWidth.value ? denahWidth.value / 2 : 0,
    radius: denahLength.value ? denahLength.value / 5 : 0
  })
}

function deleteCell() {
  if (cellSelectedId == null) {
    return
  }

  cells.value.splice(cellSelectedIdx.value, 1)
  cellSelectedId.value = null
}

function resizeEventHandler(e) {
  denahImageSize.value = { width: parseFloat(denah.value.width), height: parseFloat(denah.value.height) }
}

function pickFile() {
  let files = fileInput.value.files
  if (files && files[0]) {
    let reader = new FileReader
    reader.onload = async e => {
      previewImage.value = e.target.result
      await nextTick()
      resizeEventHandler()
    }
    reader.readAsDataURL(files[0])
    fileExists.value = true
  } else {
    resizeEventHandler()
    fileExists.value = false
  }
}

async function handleSubmit(e) {
  if (formValid.value) {
    return
  }

  e.preventDefault()
  if (cells.value.length == 0) {
    return alert('Gagal! Harus minimal ada 1 cell')
  }

  const nodemcuCodes = {}
  for (const cell of cells.value) {
    if (!cell.name || !cell.nodemcu_code || !cell.radius || !cell.relative_position_x || !cell.relative_position_y) {
      return alert('Gagal! Property beberapa cell belum terisi lengkap')
    }
    if (nodemcuCodes[cell.nodemcu_code] != undefined) {
      return alert('Gagal! Terdapat nodemcu_code yang sama')
    }

    nodemcuCodes[cell.nodemcu_code] = true
  }

  const nodemcu_codes = []
  for (const cell of cells.value) {
    nodemcu_codes.push(cell.nodemcu_code)
  }

  try {
    const res = await fetch(`${VITE_BACKEND_BASE_URL}/cells/check-nodemcu-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nodemcu_codes: nodemcu_codes })
    })
    const result = await res.json()

    if (result.used_nodemcu_codes.length > 0) {
      return alert(`NodeMCU codes ${result.used_nodemcu_codes} telah digunakan`)
    }
  } catch (err) {
    return alert(`Something wrong happened\n${err}`)
  }

  formValid.value = true
  document.getElementById('shopfloorForm').submit()
}
</script>

<template>
  <Layout>
    <div class="p-3" for="header">
      <h1 class="text-4xl font-bold dark:text-white">Shopfloors - Create</h1>
    </div>

    <div class="p-3" for="utility">
    </div>

    <div class="p-3" for="content">
      <div>
        <form id="shopfloorForm" @submit="handleSubmit" :action="`${VITE_BACKEND_BASE_URL}/shopfloors`" method="POST" enctype="multipart/form-data">
          <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Save</button>
          <div class="mb-3">
            <label for="shopfloor-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Shopfloor Name</label>
            <input type="text" id="shopfloor-name" name="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Shopfloor XYZ" required>
          </div>
          <div class="mb-3">
              <label for="shopfloor-length" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Shopfloor Length (m)</label>
              <input type="number" step="0.1" id="shopfloor-length" name="length" v-model="denahLength" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="6.5" required>
          </div>
          <div class="mb-4">
              <label for="shopfloor-width" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Shopfloor Width (m)</label>
              <input type="number" step="0.1" id="shopfloor-width" name="width" v-model="denahWidth" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="4.0" required>
          </div>
          <div>
            <label for="shopfloor-map" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Denah Shopfloor</label>
            <input type="file" id="shopfloor-map" name="shopfloor-map" accept="image/*" ref="fileInput" @input="pickFile" class="block" required>
          </div>
          
          <input type="hidden" v-for="(cell, index) in cells" :name="`cells[${index}]`" :value="encodeURIComponent(JSON.stringify(cell))">
        </form>
      </div>

      <div class="grid grid-cols-4">
        <div class="col-start-1 col-span-3 relative">
          <img ref="denah" :src="previewImage">
          <svg v-for="cell in cells"
              @click="() => cellSelectedId = cell.id"
              :width="cell.radius / denahLength * denahImageSize.width"
              :height="cell.radius / denahWidth * denahImageSize.height"
              class="absolute"
              :style="{
                left: (cell.relative_position_x - cell.radius/2)/denahLength * denahImageSize.width,
                top: (1 - (cell.relative_position_y + cell.radius/2)/denahWidth) * denahImageSize.height
              }">
            <ellipse  cx="50%" cy="50%" rx="45%" ry="45%" :stroke="cell.id == cellSelectedId ? 'green' : 'black'" stroke-width="3" stroke-dasharray="15" fill="none" />
            <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle">{{ cell.name }}</text>
            <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle">{{ cell.nodemcu_code }}</text>
          </svg>
        </div>
        <div class="col-start-4 p-2" v-if="fileExists && denahLength && denahWidth">
          <h2 class="mb-3 text-xl font-bold dark:text-white">Cell Property</h2>
          <div>
            <div class="flex flex-row">
              <button type="button" @click="addCell" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Add Cell</button>
              <button v-if="cellSelectedId != null" type="button" @click="deleteCell" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-xl text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Delete Cell</button>
            </div>
            <div v-if="cellSelectedIdx != null">
              <div class="mb-3">
                <label for="cell-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cell Name</label>
                <input v-model="cells[cellSelectedIdx].name"  id="cell-name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Cell A" required>
              </div>
              <div class="mb-3">
                <label for="cell-nodemcu-code" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NodeMCU Code</label>
                <input v-model="cells[cellSelectedIdx].nodemcu_code" type="text" id="cell-nodemcu-code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="AE5AKM1" required>
              </div>
              <div class="mb-3">
                <label for="cell-position-x" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position x (m)</label>
                <input v-model="cells[cellSelectedIdx].relative_position_x" type="number" step="0.1" id="cell-position-x" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="6.5" required>
              </div>
              <div class="mb-3">
                <label for="cell-position-y" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position y (m)</label>
                <input v-model="cells[cellSelectedIdx].relative_position_y" type="number" step="0.1" id="cell-position-y" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="4.0" required>
              </div>
              <div class="mb-3">
                <label for="cell-radius" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Radius (m)</label>
                <input v-model="cells[cellSelectedIdx].radius" type="number" step="0.1" id="cell-radius" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="4.0" required>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
