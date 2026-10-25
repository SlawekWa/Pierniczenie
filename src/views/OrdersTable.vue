<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <Navigation />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Tabela zamówień</h2>
      <div class="bg-white rounded-2xl shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer" @click="sortBy('client_name')">Imię i nazwisko</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer" @click="sortBy('total_price')">Cena</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer" @click="sortBy('season')">Sezon</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Zawartość</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="order in sortedOrders" :key="order.id">
              <td class="px-4 py-3 text-sm text-gray-800">{{ order.client_name }}</td>
              <td class="px-4 py-3 text-sm text-gray-800">{{ order.total_price != null ? order.total_price + ' PLN' : '—' }}</td>
              <td class="px-4 py-3 text-sm text-gray-800">{{ order.seasons?.name || '—' }}</td>
              <td class="px-4 py-3 text-sm text-gray-800">{{ contentOf(order) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navigation from '../components/Navigation.vue'
import { useOrdersStore } from '../stores/orders'
import { useSeasonsStore } from '../stores/seasons'

const ordersStore = useOrdersStore()
const seasonsStore = useSeasonsStore()

const sortKey = ref('client_name')
const sortDir = ref('asc')

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const contentOf = (order) => {
  const items = ordersStore.orderItems.filter(i => i.order_id === order.id)
  return items.map(i => {
    const name = i.product_id ? (i.products?.name || 'Produkt') : (i.product_sets?.name || 'Zestaw')
    return `${name} x${i.quantity}`
  }).join(', ')
}

const sortedOrders = computed(() => {
  const list = [...ordersStore.orders].filter(o => o.status === 'archived')
  list.sort((a, b) => {
    let va, vb
    if (sortKey.value === 'client_name') { va = a.client_name || ''; vb = b.client_name || '' }
    else if (sortKey.value === 'total_price') { va = Number(a.total_price) || 0; vb = Number(b.total_price) || 0 }
    else if (sortKey.value === 'season') { va = a.seasons?.name || ''; vb = b.seasons?.name || '' }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
  return list
})

onMounted(async () => {
  await ordersStore.fetchOrders()
  await seasonsStore.fetchSeasons()
})
</script>
