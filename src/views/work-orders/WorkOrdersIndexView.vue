<script setup>
import { ref, watch, onMounted } from 'vue'
import { formatTime } from '../../helpers/time'
import { Modal } from 'flowbite'
import Layout from '../../components/Layout.vue';
import WorkOrderCard from './WorkOrderCard.vue';

const showDetail = ref({
  jid: '',
  workOrder: {},
  loading: false,
  found: false
})
const detailModal = ref('')

async function openDetail(jid) {
  detailModal.value.show()

  if (showDetail.value.jid == jid) {  //no need refetch if the jid is same
    return
  }

  showDetail.value = {
    ...showDetail.value,
    jid: jid,
    loading: true
  }

  // fetch data
  const result = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/work-orders?jid=${showDetail.value.jid}`)
  showDetail.value.loading = false;
  if (result.ok) {
    showDetail.value.workOrder = await result.json();
    showDetail.value.found = true;
  } else {
    showDetail.value.found = false;
  }
}

onMounted(() => {
  initDataTable()

  detailModal.value = new Modal(document.getElementById('detailModal'))
})

function initDataTable() {
  let table = new DataTable('#data-table', {
    scrollX: true,
    searching: true,
    lengthChange: true,
    autoWidth: true,
    columnDefs: [{
      targets: "_all",
      className: "dt-center"
    }],
    processing: true,
    serverSide: true,
    ajax: {
      url: `${import.meta.env.VITE_BACKEND_BASE_URL}/work-orders/recap`,
      type: 'POST'
    },
    columns: [
      { data: 'jid' },
      { data: 'durationInShopfloor', searchable: false, render: (data, type, row, meta) => {
        if (data) {
          return formatTime(data)
        } else {
          return '-'
        }
      } },
      { data: "jid", searchable: false, orderable: false, render : ( data, type, row, meta ) => {
        return `<button data-jid=${data} type="button" class="open-detail text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Detail</button>`
      }}
    ],
    drawCallback: function(settings) {
      $(".open-detail").on('click', function (e) {
        openDetail(e.target.dataset.jid)
      });
    }
  })
}
</script>

<template>
  <Layout>
    <div class="p-3" for="header">
      <h1 class="text-4xl font-bold dark:text-white">Finished Work Orders</h1>
    </div>

    <div class="p-3" for="utility">
    </div>

    <div class="p-3" for="content">
      <div>
        <table id="data-table" class="table is-striped" style="width: 100%;">
          <thead>
            <tr>
              <th>JID</th>
              <th>Durasi di Shopfloor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>(No data)</td>
              <td>(No data)</td>
              <td>(No data)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  
    <!-- Detail modal -->
    <div id="detailModal" tabindex="-1" aria-hidden="true" class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative w-full max-w-4xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                        Work Order Detail
                    </h3>
                    <button type="button" @click="() => detailModal.hide()" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <div class="p-6 space-y-6">
                  <div class="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <div v-if="!showDetail.loading && !showDetail.found">
                      <h5 class="mb-2 text-2xl font-bold underline tracking-tight text-gray-900 dark:text-white">{{ showDetail.jid }}</h5>
                      <p class="font-normal text-gray-700 dark:text-gray-400">Work order tidak ditemukan</p>
                    </div>
  
                    <div v-if="!showDetail.loading && showDetail.found">
                      <WorkOrderCard :workOrder="showDetail.workOrder"/>
                    </div>
  
                    <div v-if="showDetail.loading" role="status" class="max-w-sm animate-pulse">
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
            </div>
        </div>
    </div>
  </Layout>
</template>
