<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '../router/stores'

import router from '../router';
import Layout from '../components/Layout.vue';

const appStore = useAppStore()

onMounted(() => {
  initDataTable()

  if (appStore.trackingLastShopfloorId) {
    router.replace(`/shopfloors/${appStore.trackingLastShopfloorId}`)
  }
})

function initDataTable() {
  let table = new DataTable('#data-table', {
    scrollX: true,
    searching: false,
    lengthChange: false,
    autoWidth: false,
    columnDefs: [{
      targets: "_all",
      className: "dt-center"
    }],
    ajax: {
      url: `${import.meta.env.VITE_BACKEND_BASE_URL}/shopfloors`,
      dataSrc: ''
    },
    columns: [
      { data: 'id' },
      { data: 'name' },
      { data: "id" , render : ( data, type, row, meta ) => {
        return `<a href="/shopfloors/${data}" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Open</a>`
      }}
    ]
  })
}
</script>

<template>
  <Layout>
    <div class="p-3" for="header">
      <h1 class="text-4xl font-bold dark:text-white">Tracking</h1>
    </div>

    <div class="p-3" for="utility">
    </div>

    <div class="p-3" for="content">
      <div>
        <table id="data-table" class="table is-striped" style="width: 100%;">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Shopfloor Jakarta</td>
              <td>A</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Shopfloor Bandung</td>
              <td>B</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Shopfloor Yogyakarta</td>
              <td>C</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Layout>
</template>
