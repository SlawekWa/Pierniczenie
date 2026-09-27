<template>
  <nav class="bg-white/80 backdrop-blur-xl border-b border-white/50 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="py-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 class="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent sm:text-xl truncate">
              Pierniczenie
            </h1>
            <div class="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50 rounded-xl shrink-0">
              <span class="text-[10px] sm:text-xs font-semibold text-emerald-700">Zarobki</span>
              <span class="text-xs sm:text-sm font-bold text-emerald-800">{{ formatMoney(earnings) }}</span>
              <button
                v-if="missingPriceOrders.length"
                type="button"
                @click="openMissingPrices"
                class="text-[10px] sm:text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap"
              >
                Brak ceny ({{ missingPriceOrders.length }})
              </button>
            </div>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div class="hidden sm:flex items-center gap-2 px-3 py-2 bg-indigo-50/50 rounded-xl max-w-[160px]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-xs font-medium text-indigo-900 truncate">{{ userEmail }}</span>
            </div>

            <button
              @click="handleLogout"
              class="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl sm:transform sm:hover:scale-105"
              :title="'Wyloguj'"
              aria-label="Wyloguj"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline sm:ml-2">Wyloguj</span>
            </button>
          </div>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <router-link
            to="/"
            class="flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] sm:px-4 sm:py-2 sm:text-sm transition-all duration-200"
            :class="isCurrentRoute('/') ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Kanban</span>
          </router-link>
          <router-link
            to="/products"
            class="flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] sm:px-4 sm:py-2 sm:text-sm transition-all duration-200"
            :class="isCurrentRoute('/products') ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Produkty</span>
          </router-link>
          <router-link
            to="/product-sets"
            class="flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] sm:px-4 sm:py-2 sm:text-sm transition-all duration-200"
            :class="isCurrentRoute('/product-sets') ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Zestawy</span>
          </router-link>
          <router-link
            to="/seasons"
            class="flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] sm:px-4 sm:py-2 sm:text-sm transition-all duration-200"
            :class="isCurrentRoute('/seasons') ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Sezony</span>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="showMissingPricesModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" @click.self="closeMissingPrices">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Zamówienia bez ceny</p>
            <h2 class="text-xl font-bold text-gray-800">Uzupełnij ceny</h2>
          </div>
          <button type="button" @click="closeMissingPrices" :disabled="savingPrices" class="text-gray-400 hover:text-gray-600 transition disabled:opacity-50" title="Zamknij">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="order in missingPriceOrders" :key="order.id" class="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <span class="font-semibold text-gray-800 truncate">{{ order.client_name }}</span>
            <div class="flex items-center gap-2 shrink-0">
              <input
                v-model="priceDrafts[order.id]"
                type="number"
                min="0"
                step="0.01"
                class="w-28 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
              <span class="text-sm text-gray-500">PLN</span>
            </div>
          </div>
        </div>
        <p v-if="priceError" class="mt-4 text-sm text-red-600">{{ priceError }}</p>
        <div class="mt-6 flex gap-3">
          <button type="button" @click="closeMissingPrices" :disabled="savingPrices" class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition disabled:opacity-50">
            Anuluj
          </button>
          <button type="button" @click="saveMissingPrices" :disabled="savingPrices" class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50">
            {{ savingPrices ? 'Zapisywanie...' : 'Zapisz' }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useOrdersStore } from '../stores/orders'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const showMissingPricesModal = ref(false)
const savingPrices = ref(false)
const priceError = ref('')
const priceDrafts = ref({})

const userEmail = computed(() => {
  return authStore.user?.email || 'Brak danych'
})

const earnings = computed(() => ordersStore.orders.reduce((total, order) => total + (Number(order.total_price) || 0), 0))
const missingPriceOrders = computed(() => ordersStore.orders.filter(order => !(Number(order.total_price) > 0)))

const formatMoney = (amount) => `${amount.toFixed(2)} PLN`

const openMissingPrices = () => {
  priceError.value = ''
  priceDrafts.value = Object.fromEntries(
    missingPriceOrders.value.map(order => [order.id, order.total_price > 0 ? order.total_price : ''])
  )
  showMissingPricesModal.value = true
}

const closeMissingPrices = () => {
  if (savingPrices.value) return
  showMissingPricesModal.value = false
  priceError.value = ''
}

const saveMissingPrices = async () => {
  savingPrices.value = true
  priceError.value = ''

  for (const order of missingPriceOrders.value) {
    const price = priceDrafts.value[order.id] === '' || priceDrafts.value[order.id] == null
      ? 0
      : Number(priceDrafts.value[order.id])
    const result = await ordersStore.updateOrder(order.id, { total_price: Number.isFinite(price) ? price : 0 })
    if (!result.success) {
      priceError.value = result.error || 'Nie udało się zapisać ceny.'
      savingPrices.value = false
      return
    }
  }

  savingPrices.value = false
  closeMissingPrices()
}

const isCurrentRoute = (path) => {
  return route.path === path
}

const handleLogout = async () => {
  const result = await authStore.signOut()
  if (result.success) {
    await router.push('/login')
  }
}

onMounted(async () => {
  if (ordersStore.orders.length === 0) {
    await ordersStore.fetchOrders()
  }
})
</script>