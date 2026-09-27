<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Zarządzanie Zestawami</h2>
        <p class="text-gray-600">Twórz zestawy pierników i zarządzaj ich składem</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Add Set Form -->
        <div class="lg:col-span-1">
          <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 sticky top-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">{{ editingSetId ? 'Edytuj zestaw' : 'Nowy zestaw' }}</h3>
            </div>
            
            <form @submit.prevent="handleSubmitSet" class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nazwa zestawu</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    v-model="newSet.name"
                    required
                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="Mini Holiday Box"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Cena za zestaw</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    v-model="newSet.price_per_set"
                    required
                    step="0.01"
                    min="0"
                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="13.00"
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
                    v-model="newSet.season_id"
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
                    v-model="newSet.description"
                    rows="2"
                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                    placeholder="Dodatkowy opis zestawu..."
                  ></textarea>
                </div>
              </div>
              
              <button
                type="submit"
                :disabled="productSetsStore.loading"
                class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span v-if="productSetsStore.loading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ editingSetId ? 'Zapisywanie...' : 'Dodawanie...' }}
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ editingSetId ? 'Zapisz zmiany' : 'Dodaj zestaw' }}
                </span>
              </button>
              <button
                v-if="editingSetId"
                type="button"
                @click="cancelSetEdit"
                class="w-full bg-gray-100 text-gray-700 py-3.5 px-4 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold"
              >
                Anuluj edycję
              </button>
            </form>
          </div>
        </div>

        <!-- Sets List -->
        <div class="lg:col-span-2">
          <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Lista zestawów</h3>
              </div>
              <button
                @click="handleRefreshSets"
                :disabled="productSetsStore.loading"
                class="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 text-indigo-600 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{{ productSetsStore.loading ? 'Ładowanie...' : 'Odśwież' }}</span>
              </button>
            </div>
            
            <div v-if="productSetsStore.loading && productSetsStore.productSets.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p class="text-gray-500 font-medium">Ładowanie zestawów...</p>
            </div>
            
            <div v-else-if="productSetsStore.productSets.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p class="text-gray-500 font-medium">Brak zestawów</p>
              <p class="text-gray-400 text-sm mt-1">Dodaj pierwszy zestaw używając formularza</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="set in productSetsStore.productSets"
                :key="set.id"
                class="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
              >
                <div class="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <div class="min-w-0 space-y-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <h4 class="font-bold text-gray-800 text-lg">{{ set.name }}</h4>
                      <span
                        v-if="set.seasons"
                        class="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm"
                        :style="{ backgroundColor: set.seasons.color_hex + '45', color: '#111827', border: `1px solid ${set.seasons.color_hex}` }"
                      >
                        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: set.seasons.color_hex }"></span>
                        {{ set.seasons.name }}
                      </span>
                    </div>

                    <div class="flex items-center gap-2 text-gray-600 min-w-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-medium truncate">{{ set.price_per_set }} PLN/zestaw</span>
                    </div>

                    <div v-if="productSetsStore.getSetItems(set.id).length > 0" class="text-sm text-gray-600 bg-gray-50/50 rounded-xl p-3 min-w-0 break-words">
                      <span class="font-semibold text-gray-700">Skład:</span>
                      <span class="ml-2">{{ productSetsStore.getSetComposition(set.id) }}</span>
                    </div>
                  </div>

                  <div class="flex gap-2 sm:flex-col sm:items-stretch sm:justify-start">
                    <button
                      @click="startSetEdit(set)"
                      class="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-all duration-200 min-w-[140px]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m-1-1v2m7.071 8.071l-5.657 5.657a2 2 0 01-1.414.586H8a2 2 0 01-2-2v-3.999a2 2 0 01.586-1.414l5.657-5.657a2 2 0 012.828 0l2.999 2.999a2 2 0 010 2.828z" />
                      </svg>
                      <span>Edytuj</span>
                    </button>
                    <button
                      @click="handleAddItemToSet(set.id)"
                      class="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm font-medium hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 min-w-[140px]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Dodaj produkt</span>
                    </button>
                    <button
                      @click="handleDeleteSet(set.id)"
                      class="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:from-red-100 hover:to-pink-100 transition-all duration-200 min-w-[140px]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Usuń</span>
                    </button>
                  </div>
                </div>
                
                <!-- Set Items -->
                <div v-if="productSetsStore.getSetItems(set.id).length > 0" class="mt-4">
                  <button
                    type="button"
                    @click="toggleSetItems(set.id)"
                    class="w-full flex items-center justify-between px-3 py-2 bg-gray-50/70 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    <span>{{ expandedSetItems[set.id] ? 'Ukryj produkty' : 'Pokaż produkty' }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path v-if="expandedSetItems[set.id]" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div v-if="expandedSetItems[set.id]" class="space-y-2 mt-2">
                    <div
                      v-for="item in productSetsStore.getSetItems(set.id)"
                      :key="item.id"
                      class="flex items-center justify-between bg-gray-50/50 rounded-xl p-3"
                    >
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-gray-700">{{ item.quantity }}x</span>
                        <span class="text-sm text-gray-600">{{ item.products?.name || 'Nieznany produkt' }}</span>
                      </div>
                      <button
                        @click="handleDeleteSetItem(item.id)"
                        class="text-red-500 hover:text-red-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
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

    <!-- Add Item to Set Modal -->
    <div v-if="showAddItemModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">Dodaj produkt do zestawu</h3>
          <button
            type="button"
            @click="showAddItemModal = false"
            class="text-gray-400 hover:text-gray-600 transition"
            title="Zamknij"
            aria-label="Zamknij"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="handleAddSetItem(false)" class="space-y-4">
          <div v-if="addedSetItems.length" class="space-y-2">
            <p class="text-sm font-semibold text-gray-700">Dodane produkty</p>
            <div
              v-for="item in addedSetItems"
              :key="item.id"
              class="flex items-center justify-between gap-3 bg-emerald-50 rounded-xl px-3 py-2"
            >
              <span class="text-sm text-gray-700 truncate">{{ item.products?.name || item.productName }}</span>
              <span class="text-sm font-semibold text-emerald-700 shrink-0">{{ item.quantity }}x</span>
            </div>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Produkt</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                v-model="productSearch"
                @input="handleProductSearch"
                @focus="showProductOptions = true"
                placeholder="Wpisz nazwę produktu..."
                class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              <div
                v-if="showProductOptions && filteredProducts.length"
                class="absolute left-0 right-0 top-full mt-2 z-10 max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-1"
              >
                <button
                  v-for="product in filteredProducts"
                  :key="product.id"
                  type="button"
                  @mousedown.prevent="selectProduct(product)"
                  class="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 transition"
                >
                  <span class="block text-sm font-medium text-gray-800">{{ product.name }}</span>
                  <span class="block text-xs text-gray-500">{{ product.price_per_piece ?? 0 }} PLN/szt</span>
                </button>
              </div>
            </div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Liczba sztuk</label>
            <input
              v-model.number="newSetItem.quantity"
              type="number"
              min="1"
              step="1"
              required
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              @click="showAddItemModal = false"
              class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Anuluj
            </button>
            <button
              type="submit"
              :disabled="!newSetItem.product_id"
              class="flex-1 px-4 py-3 bg-indigo-100 text-indigo-700 rounded-2xl hover:bg-indigo-200 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Dodaj
            </button>
            <button
              type="button"
              :disabled="!newSetItem.product_id"
              @click="handleAddSetItem(true)"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Dodaj i zamknij
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProductSetsStore } from '../stores/productSets'
import { useProductsStore } from '../stores/products'
import { useSeasonsStore } from '../stores/seasons'
import Navigation from '../components/Navigation.vue'

const productSetsStore = useProductSetsStore()
const productsStore = useProductsStore()
const seasonsStore = useSeasonsStore()

const newSet = ref({
  name: '',
  price_per_set: '',
  season_id: '',
  description: ''
})
const editingSetId = ref(null)
const expandedSetItems = ref({})

const showAddItemModal = ref(false)
const currentSetId = ref(null)
const productSearch = ref('')
const showProductOptions = ref(false)
const addedSetItems = ref([])
const newSetItem = ref({
  product_id: '',
  quantity: 1
})

const normalizeSearchValue = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const filteredProducts = computed(() => {
  const searchValue = normalizeSearchValue(productSearch.value.trim())
  if (!searchValue) return productsStore.products

  return productsStore.products.filter(product =>
    normalizeSearchValue(product.name).includes(searchValue)
  )
})

const resetSetForm = () => {
  newSet.value = {
    name: '',
    price_per_set: '',
    season_id: seasonsStore.getDefaultSeason()?.id || '',
    description: ''
  }
  editingSetId.value = null
}

const handleSubmitSet = async () => {
  const setData = {
    name: newSet.value.name,
    price_per_set: parseFloat(newSet.value.price_per_set),
    season_id: parseInt(newSet.value.season_id),
    description: newSet.value.description
  }
  const result = editingSetId.value
    ? await productSetsStore.updateProductSet(editingSetId.value, setData)
    : await productSetsStore.addProductSet(setData)

  if (result.success) {
    resetSetForm()
  }
}

const startSetEdit = (set) => {
  editingSetId.value = set.id
  newSet.value = {
    name: set.name || '',
    price_per_set: set.price_per_set ?? '',
    season_id: set.season_id || '',
    description: set.description || ''
  }
}

const cancelSetEdit = () => {
  resetSetForm()
}

const toggleSetItems = (setId) => {
  expandedSetItems.value[setId] = !expandedSetItems.value[setId]
}

const handleAddItemToSet = (setId) => {
  currentSetId.value = setId
  newSetItem.value = {
    product_id: '',
    quantity: 1
  }
  productSearch.value = ''
  showProductOptions.value = false
  addedSetItems.value = []
  showAddItemModal.value = true
}

const selectProduct = (product) => {
  newSetItem.value.product_id = product.id
  productSearch.value = product.name
  showProductOptions.value = false
}

const handleProductSearch = () => {
  const selectedProduct = productsStore.products.find(product => String(product.id) === String(newSetItem.value.product_id))
  if (!selectedProduct || selectedProduct.name !== productSearch.value) {
    newSetItem.value.product_id = ''
  }
  showProductOptions.value = true
}

const handleAddSetItem = async (closeAfterAdd = false) => {
  const result = await productSetsStore.addSetItem({
    set_id: currentSetId.value,
    product_id: parseInt(newSetItem.value.product_id),
    quantity: Number(newSetItem.value.quantity) || 1
  })
  if (result.success) {
    const selectedProduct = productsStore.products.find(product => String(product.id) === String(newSetItem.value.product_id))
    addedSetItems.value.push({
      ...result.data,
      productName: selectedProduct?.name || 'Produkt'
    })
    newSetItem.value = {
      product_id: '',
      quantity: 1
    }
    productSearch.value = ''
    showProductOptions.value = false
    if (closeAfterAdd) showAddItemModal.value = false
  }
}

const handleDeleteSet = async (setId) => {
  if (confirm('Czy na pewno chcesz usunąć ten zestaw?')) {
    await productSetsStore.deleteProductSet(setId)
  }
}

const handleDeleteSetItem = async (itemId) => {
  await productSetsStore.deleteSetItem(itemId)
}

const handleRefreshSets = async () => {
  await productSetsStore.fetchProductSets()
}

onMounted(async () => {
  await Promise.all([
    seasonsStore.fetchSeasons(),
    productsStore.fetchProducts(),
    productSetsStore.fetchProductSets()
  ])
  newSet.value.season_id = seasonsStore.getDefaultSeason()?.id || ''
})
</script>