<script setup>
import { computed } from 'vue'
import { formatTime } from '../../helpers/time'

const props = defineProps(['workOrder'])
const workOrderDisplay = computed(() => generateWorkOrderDisplay(props.workOrder))

/**
 * Generate work order display from work order
 */
 function generateWorkOrderDisplay(workOrder) {
  if (!workOrder || !workOrder.cells) {
    return {}
  }

  const workOrderDisplay = {}
  workOrderDisplay.shopfloor_name = workOrder.shopfloor_name ? workOrder.shopfloor_name : '-'
  
  if (workOrder.cells.length == 0) {    // If work order doesn't have any cell movement history
    if (workOrder.ended_at) {             // If already ended
      workOrderDisplay.last_cell_name = 'Work order telah selesai'
      workOrderDisplay.duration_in_shopfloor = formatTime(new Date(workOrder.ended_at) - new Date(workOrder.created_at))
    } else {                                    // If ongoing
      workOrderDisplay.last_cell_name = 'Masih di entry/exit atau belum terdeteksi'
      workOrderDisplay.duration_in_shopfloor = formatTime(new Date(workOrder.time) - new Date(workOrder.created_at))
    }

    workOrderDisplay.movements = '-'
  } else {
    const last_cell = workOrder.cells[workOrder.cells.length - 1]
    const first_active_cell = workOrder.cells.find((cell) => cell.moved_at == null) 
    
    if(last_cell.moved_at == null) {    // If work order is detected in the latest cell
      workOrderDisplay.last_cell_name = last_cell.name
      workOrderDisplay.duration_in_shopfloor = formatTime(new Date(workOrder.time) - new Date(workOrder.created_at))
    } else if (first_active_cell != undefined) {
      workOrderDisplay.last_cell_name = first_active_cell.name
      workOrderDisplay.duration_in_shopfloor = formatTime(new Date(workOrder.time) - new Date(workOrder.created_at))
    } else {
      if (workOrder.ended_at) {   // If work order finished (and not detected)
        workOrderDisplay.last_cell_name = 'Work order telah selesai'
        workOrderDisplay.duration_in_shopfloor = formatTime(new Date(workOrder.ended_at) - new Date(workOrder.created_at))
      } else {                          // If work order not finished not detected
        workOrderDisplay.last_cell_name = `${last_cell.name} (Sekarang tidak terdeteksi)`
        workOrderDisplay.duration_in_shopfloor = formatTime(new Date(workOrder.time) - new Date(workOrder.created_at))
      }
    }

    // Display work orders cells movement
    workOrderDisplay.movements = workOrder.cells[0].name
    for (const [i, cell] of workOrder.cells.entries()) {
      if (i == 0) continue;

      workOrderDisplay.movements += ` → ${cell.name}`
    }
    if (last_cell.moved_at != null && first_active_cell != undefined) {
      workOrderDisplay.movements += ` → ${first_active_cell.name}`
    }
  }

  return workOrderDisplay
}
</script>

<template>
<div>
  <h5 class="mb-2 text-2xl font-bold underline tracking-tight text-gray-900 dark:text-white">{{ workOrder.jid }}</h5>
  <div class="grid grid-cols-2 gap-y-1">
    <p class="row-start-1 font-normal text-gray-700 dark:text-gray-400">Shopfloor: <span class="font-semibold text-gray-900 dark:text-white">{{ workOrderDisplay.shopfloor_name }}</span></p>
    <p class="row-start-1 font-normal text-gray-700 dark:text-gray-400">Durasi work order di shopfloor: <span class="font-semibold text-gray-900 dark:text-white">{{ workOrderDisplay.duration_in_shopfloor }}</span></p>
    <p class="font-normal text-gray-700 dark:text-gray-400">Lokasi saat ini: <span class="font-semibold text-gray-900 dark:text-white">{{ workOrderDisplay.last_cell_name }}</span></p>
    <p class="col-start-1 col-span-2 font-normal text-gray-700 dark:text-gray-400">Informasi pergerakan work order: <span class="font-semibold text-gray-900 dark:text-white">{{ workOrderDisplay.movements }}</span></p>
    <div class="col-start-1 col-span-2 font-normal text-gray-700 dark:text-gray-400">
      <div class="relative overflow-x-auto">
        <table class="w-full border text-sm text-left text-gray-500 dark:text-gray-400">
          <thead class="text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <td scope="col" class="px-6 py-3">
                #
              </td>
              <th scope="col" class="px-6 py-3">
                Cell
              </th>
              <th scope="col" class="px-6 py-3">
                Waktu Masuk
              </th>
              <th scope="col" class="px-6 py-3">
                Waktu Keluar
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                0
              </td>
              <th class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                Entry/Exit
              </th>
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {{ new Date(workOrder.created_at).toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {{ workOrder.cells[0] ? new Date(workOrder.cells[0].entered_at).toLocaleString() : '-' }}
              </td>
            </tr>

            <tr v-for="(cell, index) in workOrder.cells" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {{ cell.name }}
              </td>
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {{ new Date(cell.entered_at).toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {{ cell.moved_at ? new Date(cell.moved_at).toLocaleString() : '-' }}
              </td>
            </tr>

            <tr v-if="workOrder.ended_at" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {{ workOrder.cells.length + 1 }}
              </td>
              <th class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                Finished
              </th>
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                {{ new Date(workOrder.ended_at).toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                (Finished)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
</template>
