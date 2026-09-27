<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Zarządzanie Produktami</h2>
        <p class="text-gray-600">Dodawaj pojedyncze pierniki do katalogu</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Add Product Form -->
        <div class="lg:col-span-1">
          <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 sticky top-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">{{ editingProductId ? 'Edytuj produkt' : 'Nowy produkt' }}</h3>
            </div>
            
            <form @submit.prevent="handleSubmitProduct" class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nazwa produktu</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    v-model="newProduct.name"
                    required
                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="Mały piernik choinkowy"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Cena za sztukę (opcjonalna)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    v-model="newProduct.price_per_piece"
                    step="0.01"
                    min="0"
                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="4.50"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Sezon</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <select
                    v-model="newProduct.season_id"
                    required
                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none"
                  >
                    <option value="">Wybierz sezon</option>
                    <option v-for="season in seasonsStore.seasons" :key="season.id" :value="season.id">
                      {{ season.name }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Opis (opcjonalne)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-start pointer-events-none pt-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <textarea
                    v-model="newProduct.description"
                    rows="2"
                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                    placeholder="Dodatkowy opis produktu..."
                  ></textarea>
                </div>
              </div>
              
              <button
                type="submit"
                :disabled="productsStore.loading"
                class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span v-if="productsStore.loading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ editingProductId ? 'Zapisywanie...' : 'Dodawanie...' }}
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ editingProductId ? 'Zapisz zmiany' : 'Dodaj produkt' }}
                </span>
              </button>
              <button
                v-if="editingProductId"
                type="button"
                @click="cancelProductEdit"
                class="w-full bg-gray-100 text-gray-700 py-3.5 px-4 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold"
              >
                Anuluj edycję
              </button>
            </form>
          </div>
        </div>

        <!-- Products List -->
        <div class="lg:col-span-2">
          <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Lista produktów</h3>
              </div>
              <button
                @click="handleRefreshProducts"
                :disabled="productsStore.loading"
                class="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 text-indigo-600 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{{ productsStore.loading ? 'Ładowanie...' : 'Odśwież' }}</span>
              </button>
            </div>
            
            <div v-if="productsStore.loading && productsStore.products.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p class="text-gray-500 font-medium">Ładowanie produktów...</p>
            </div>
            
            <div v-else-if="productsStore.products.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p class="text-gray-500 font-medium">Brak produktów</p>
              <p class="text-gray-400 text-sm mt-1">Dodaj pierwszy produkt używając formularza</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="product in productsStore.products"
                :key="product.id"
                class="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
              >
                <div class="flex justify-between items-start mb-4">
                  <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                      <h4 class="font-bold text-gray-800 text-lg">{{ product.name }}</h4>
                      <span
                        v-if="product.seasons"
                        class="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm"
                        :style="{ backgroundColor: product.seasons.color_hex + '45', color: '#111827', border: `1px solid ${product.seasons.color_hex}` }"
                      >
                        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: product.seasons.color_hex }"></span>
                        {{ product.seasons.name }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-medium">
                        {{ product.price_per_piece != null ? `${product.price_per_piece} PLN/szt` : 'Brak ceny indywidualnej' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="startProductEdit(product)"
                      class="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m-1-1v2m7.071 8.071l-5.657 5.657a2 2 0 01-1.414.586H8a2 2 0 01-2-2v-3.999a2 2 0 01.586-1.414l5.657-5.657a2 2 0 012.828 0l2.999 2.999a2 2 0 010 2.828z" />
                      </svg>
                      Edytuj
                    </button>
                    <button
                      @click="handleDeleteProduct(product.id)"
                      class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:from-red-100 hover:to-pink-100 transition-all duration-200"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Usuń
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductsStore } from '../stores/products'
import { useSeasonsStore } from '../stores/seasons'
import Navigation from '../components/Navigation.vue'

const productsStore = useProductsStore()
const seasonsStore = useSeasonsStore()

const newProduct = ref({
  name: '',
  price_per_piece: 0,
  season_id: '',
  description: ''
})
const editingProductId = ref(null)

const resetProductForm = () => {
  newProduct.value = {
    name: '',
    price_per_piece: 0,
    season_id: seasonsStore.getDefaultSeason()?.id || '',
    description: ''
  }
  editingProductId.value = null
}

const handleSubmitProduct = async () => {
  const productData = {
    name: newProduct.value.name,
    price_per_piece: newProduct.value.price_per_piece === '' || newProduct.value.price_per_piece == null
      ? null
      : parseFloat(newProduct.value.price_per_piece),
    season_id: parseInt(newProduct.value.season_id),
    description: newProduct.value.description
  }
  const result = editingProductId.value
    ? await productsStore.updateProduct(editingProductId.value, productData)
    : await productsStore.addProduct(productData)

  if (result.success) {
    resetProductForm()
  }
}

const startProductEdit = (product) => {
  editingProductId.value = product.id
  newProduct.value = {
    name: product.name || '',
    price_per_piece: product.price_per_piece ?? 0,
    season_id: product.season_id || '',
    description: product.description || ''
  }
}

const cancelProductEdit = () => {
  resetProductForm()
}

const handleDeleteProduct = async (productId) => {
  if (confirm('Czy na pewno chcesz usunąć ten produkt?')) {
    await productsStore.deleteProduct(productId)
  }
}

const handleRefreshProducts = async () => {
  await productsStore.fetchProducts()
}

onMounted(async () => {
  await Promise.all([
    seasonsStore.fetchSeasons(),
    productsStore.fetchProducts()
  ])
  newProduct.value.season_id = seasonsStore.getDefaultSeason()?.id || ''
})
</script>