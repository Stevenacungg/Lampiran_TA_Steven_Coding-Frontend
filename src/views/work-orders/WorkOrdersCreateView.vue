<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Layout from '../../components/Layout.vue';
import router from '../../router';

const jid = ref('');
const epc_code = ref('');
const last_fetched_epc_code = ref('')

const loading = ref(false)
const success = ref(null)
const error = ref(null)

const finish = ref({
  loading: false,
  jid: '',
  success: '',
  error: ''
})

const fetchTimeoutId = ref(null)
onMounted(() => {
  refetch()
})
onUnmounted(() => {
  clearTimeout(fetchTimeoutId.value)
})

async function refetch() {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/work-orders/scanned-epc-code`)
    if (res.ok) {
      const data = await res.json()
      if (data.epc_code != last_fetched_epc_code.value) {
        last_fetched_epc_code.value = data.epc_code
        epc_code.value = data.epc_code
      }
    }
  } catch(e) {
  }

  fetchTimeoutId.value = setTimeout(refetch, 1000)
}

async function submitInput(e) {
  e.preventDefault()

  loading.value = true
  success.value = null
  error.value = null

  // fetch data
  const result = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/work-orders`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jid: jid.value,
      epc_code: epc_code.value
    })
  });

  loading.value = false;
  if (result.status == 409) {
    error.value = await result.text();
  } else if (result.status == 401) {
    error.value = 'unauthorized! silakan logout dan login lagi'
    router.replace({ name: 'login' })
  } else if (result.ok) {
    success.value = 'Add work order success';
  }
}

async function submitFinish(e) {
  e.preventDefault()

  finish.value.loading = true
  finish.value.success = null
  finish.value.error = null

  // fetch data
  const jid = finish.value.jid
  const result = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/work-orders/finish`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jid: jid
    })
  });

  finish.value.loading = false;
  if (result.status == 401) {
    finish.value.error = 'unauthorized! silakan logout dan login lagi'
    router.replace({ name: 'login' })
  } else if (!result.ok) {
    finish.value.error = await result.text();
  } else if (result.ok) {
    finish.value.success = `work order dengan jid ${jid} berhasil diselesaikan`;
  }
}
</script>

<template>
  <Layout>
    <div for="input" class="mb-4">
      <div class="p-3" for="header">
        <h1 class="text-4xl font-bold dark:text-white">Input Work Order</h1>
      </div>
  
      <div class="p-3" for="utility">
        <form @submit="submitInput">
          <div class="grid grid-cols-2 mb-4 gap-4">
            <div>
              <label for="epc-code" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kode EPC</label>
              <input v-model="epc_code" type="text" id="epc-code" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Kode EPC" required>
            </div>
            <div>
              <label for="jid" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kode JID</label>
              <input v-model="jid" type="text" id="jid" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Kode JID" required>
            </div>
          </div>
          <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
        </form>
      </div>
  
      <div class="p-3" for="content">
        <div v-if="loading" class="p-4 text-sm text-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300" role="alert">
          <div class="flex items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <div role="status">
                <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
        <div v-if="success" class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
          <span class="font-medium">Sukses!</span> {{ success }}
        </div>
        <div v-if="error" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span class="font-medium">Gagal!</span> {{ error }}
        </div>
      </div>
    </div>

    <div for="finish">
      <div class="p-3" for="header">
        <h1 class="text-4xl font-bold dark:text-white">Finish Work Order</h1>
      </div>
  
      <div class="p-3" for="utility">
        <form @submit="submitFinish">
          <div class="grid grid-cols-2 mb-4 gap-4">
            <div>
              <label for="jid" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kode JID</label>
              <input v-model="finish.jid" type="text" id="jid" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Kode JID" required>
            </div>
          </div>
          <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Finish</button>
        </form>
      </div>
  
      <div class="p-3" for="content">
        <div v-if="finish.loading" class="p-4 text-sm text-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300" role="alert">
          <div class="flex items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <div role="status">
                <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
        <div v-if="finish.success" class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
          <span class="font-medium">Sukses!</span> {{ finish.success }}
        </div>
        <div v-if="finish.error" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span class="font-medium">Gagal!</span> {{ finish.error }}
        </div>
      </div>
    </div>
  </Layout>
</template>
