<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Tablica Kanban</h2>
            <p class="text-gray-600">Zarządzaj zamówieniami w czasie rzeczywistym</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <select
                v-model="selectedSeasonId"
                @change="handleSeasonChange"
                class="pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none min-w-[200px]"
              >
                <option value="">Wszystkie sezony</option>
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
            <button
              @click="handleRefreshOrders"
              :disabled="ordersStore.loading"
              class="flex items-center gap-2 px-4 py-3 bg-indigo-50/50 text-indigo-600 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{{ ordersStore.loading ? 'Ładowanie...' : 'Odśwież' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
        <div
          v-for="column in columns"
          :key="column.status"
          class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border p-4 flex flex-col min-h-[28rem] transition-all duration-200"
          :class="dragOverStatus === column.status ? 'border-indigo-400 ring-2 ring-indigo-300' : 'border-white/50'"
          @dragenter.prevent="handleDragOver($event, column.status)"
          @dragover.prevent="handleDragOver($event, column.status)"
          @dragleave="handleDragLeave($event, column.status)"
          @drop.prevent="handleDrop($event, column.status)"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" :class="column.iconBg">
                <svg v-if="column.status === 'ordered'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="column.status === 'baking'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 9c0 2.172 1.172 4.034 3 5.414A8 8 0 0020 20c0 2.172-1.172 4.034-3 5.414z" />
                </svg>
                <svg v-else-if="column.status === 'icing'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <svg v-else-if="column.status === 'packaging'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-bold text-gray-800">{{ column.title }}</h3>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="column.showAdd"
                @click="showAddOrderModal = true"
                class="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                :class="column.iconBg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="column.badge">
                {{ getColumnOrders(column.status).length }}
              </span>
            </div>
          </div>

          <div class="mb-4 p-3 rounded-xl border" :class="column.summary">
            <p class="text-xs font-semibold mb-2" :class="column.summaryTitle">Podsumowanie:</p>
            <div v-if="Object.keys(getColumnItemCount(column.status)).length > 0" class="space-y-1">
              <div v-for="(count, item) in getColumnItemCount(column.status)" :key="item" class="flex justify-between text-xs" :class="column.summaryItem">
                <span>{{ item }}</span>
                <span class="font-semibold">{{ count }}x</span>
              </div>
            </div>
            <p v-else class="text-xs" :class="column.summaryEmpty">Brak przedmiotów</p>
          </div>

          <div class="space-y-3 flex-1 min-h-[12rem] overflow-y-auto">
            <div
              v-for="order in getColumnOrders(column.status)"
              :key="order.id"
              draggable="true"
              @dragstart="handleDragStart($event, order.id)"
              @dragend="handleDragEnd"
              @click="openOrderDetails(order)"
              class="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-move"
              :class="{ 'opacity-50': draggedOrderId === order.id }"
              :style="{ borderLeft: `4px solid ${order.seasons?.color_hex || '#E0E0E0'}` }"
            >
              <h4 class="font-bold text-gray-800 text-sm mb-1">{{ order.client_name }}</h4>
              <p class="text-xs text-gray-500">{{ formatDate(order.due_date) }}</p>
            </div>
            <p v-if="getColumnOrders(column.status).length === 0" class="text-xs text-gray-400 text-center py-8 pointer-events-none">
              Upuść zamówienie tutaj
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddOrderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-800">Nowe zamówienie</h3>
          <button
            @click="showAddOrderModal = false"
            class="text-gray-400 hover:text-gray-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleAddOrder" class="space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Zamawiający</label>
            <input
              type="text"
              v-model="newOrder.client_name"
              required
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Imię i nazwisko"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Data realizacji</label>
            <input
              type="date"
              v-model="newOrder.due_date"
              required
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Cena (opcjonalne)</label>
            <input
              type="number"
              v-model="newOrder.total_price"
              step="0.01"
              min="0"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="0.00"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Zamówienie</label>
            <div class="space-y-2">
              <div
                v-for="(item, index) in newOrder.items"
                :key="index"
                class="flex gap-2 items-center bg-gray-50 rounded-xl p-3"
              >
                <select
                  v-model="item.type"
                  required
                  class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="product">Produkt</option>
                  <option value="set">Zestaw</option>
                </select>
                <select
                  v-model="item.id"
                  required
                  class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="">Wybierz {{ item.type === 'product' ? 'produkt' : 'zestaw' }}</option>
                  <option v-if="item.type === 'product'" v-for="product in productsStore.products" :key="product.id" :value="product.id">
                    {{ product.name }} ({{ product.price_per_piece }} PLN)
                  </option>
                  <option v-if="item.type === 'set'" v-for="set in productSetsStore.productSets" :key="set.id" :value="set.id">
                    {{ set.name }} ({{ set.price_per_set }} PLN)
                  </option>
                </select>
                <input
                  type="number"
                  v-model="item.quantity"
                  required
                  min="1"
                  class="w-20 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="1"
                />
                <button
                  type="button"
                  @click="removeOrderItem(index)"
                  class="text-red-500 hover:text-red-700 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                @click="addOrderItem"
                class="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Dodaj pozycję
              </button>
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Komentarz (opcjonalne)</label>
            <textarea
              v-model="newOrder.notes"
              rows="2"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
              placeholder="Dodatkowe informacje..."
            ></textarea>
          </div>
          
          <div class="flex gap-3">
            <button
              type="button"
              @click="showAddOrderModal = false"
              class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Anuluj
            </button>
            <button
              type="submit"
              :disabled="ordersStore.loading"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50"
            >
              {{ ordersStore.loading ? 'Dodawanie...' : 'Dodaj zamówienie' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showOrderDetailsModal && selectedOrder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-800">{{ isEditingOrder ? 'Edycja zamówienia' : 'Szczegóły zamówienia' }}</h3>
          <button
            @click="closeOrderDetails"
            class="text-gray-400 hover:text-gray-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="!isEditingOrder" class="space-y-4">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Zamawiający</p>
            <p class="text-lg font-bold text-gray-800">{{ selectedOrder.client_name }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Status</p>
              <p class="text-sm text-gray-800">{{ statusLabel(selectedOrder.status) }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Termin</p>
              <p class="text-sm text-gray-800">{{ formatDate(selectedOrder.due_date) || '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Sezon</p>
              <p class="text-sm text-gray-800">{{ selectedOrder.seasons?.name || '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Cena</p>
              <p class="text-sm text-gray-800">{{ selectedOrder.total_price != null ? `${selectedOrder.total_price} PLN` : '—' }}</p>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Komentarz</p>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedOrder.notes || '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Pozycje</p>
            <ul v-if="selectedOrderItems.length" class="space-y-2">
              <li
                v-for="item in selectedOrderItems"
                :key="item.id"
                class="flex justify-between text-sm bg-gray-50 rounded-xl px-3 py-2"
              >
                <span>{{ item.products?.name || item.product_sets?.name || 'Pozycja' }}</span>
                <span class="font-semibold">{{ item.quantity }}x</span>
              </li>
            </ul>
            <p v-else class="text-sm text-gray-400">Brak pozycji</p>
          </div>
        </div>

        <form v-else class="space-y-4" @submit.prevent="saveOrderDetails">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Zamawiający</label>
            <input
              v-model="editOrder.client_name"
              type="text"
              required
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
              <select
                v-model="editOrder.status"
                class="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option v-for="column in columns" :key="column.status" :value="column.status">
                  {{ column.title }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Termin</label>
              <input
                v-model="editOrder.due_date"
                type="date"
                required
                class="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Sezon</label>
              <select
                v-model="editOrder.season_id"
                class="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Brak</option>
                <option v-for="season in seasonsStore.seasons" :key="season.id" :value="season.id">
                  {{ season.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Cena</label>
              <input
                v-model="editOrder.total_price"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Komentarz</label>
            <textarea
              v-model="editOrder.notes"
              rows="2"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            ></textarea>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Pozycje</p>
            <div class="space-y-2">
              <div
                v-for="(item, index) in editOrder.items"
                :key="item.itemId || `new-${index}`"
                class="flex gap-2 items-center bg-gray-50 rounded-xl p-3"
              >
                <select
                  v-model="item.type"
                  required
                  class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="product">Produkt</option>
                  <option value="set">Zestaw</option>
                </select>
                <select
                  v-model="item.id"
                  required
                  class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Wybierz</option>
                  <option v-if="item.type === 'product'" v-for="product in productsStore.products" :key="product.id" :value="product.id">
                    {{ product.name }}
                  </option>
                  <option v-if="item.type === 'set'" v-for="set in productSetsStore.productSets" :key="set.id" :value="set.id">
                    {{ set.name }}
                  </option>
                </select>
                <input
                  v-model="item.quantity"
                  type="number"
                  required
                  min="1"
                  class="w-20 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="button" @click="removeEditOrderItem(index)" class="text-red-500 hover:text-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                @click="addEditOrderItem"
                class="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition flex items-center justify-center gap-2"
              >
                Dodaj pozycję
              </button>
            </div>
          </div>
          <p v-if="editOrderError" class="text-sm text-red-600">{{ editOrderError }}</p>
        </form>

        <div class="mt-6 flex gap-3">
          <template v-if="!isEditingOrder">
            <button
              @click="closeOrderDetails"
              class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Zamknij
            </button>
            <button
              @click="startEditingOrder"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Edytuj
            </button>
          </template>
          <template v-else>
            <button
              type="button"
              @click="cancelEditingOrder"
              :disabled="savingOrder"
              class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="button"
              @click="saveOrderDetails"
              :disabled="savingOrder"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50"
            >
              {{ savingOrder ? 'Zapisywanie...' : 'Zapisz' }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrdersStore } from '../stores/orders'
import { useSeasonsStore } from '../stores/seasons'
import { useProductSetsStore } from '../stores/productSets'
import { useProductsStore } from '../stores/products'
import Navigation from '../components/Navigation.vue'

const ordersStore = useOrdersStore()
const seasonsStore = useSeasonsStore()
const productSetsStore = useProductSetsStore()
const productsStore = useProductsStore()

const columns = [
  {
    status: 'ordered',
    title: 'Zamówione',
    showAdd: true,
    iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    badge: 'bg-yellow-100 text-yellow-800',
    summary: 'bg-yellow-50/50 border-yellow-200/50',
    summaryTitle: 'text-yellow-800',
    summaryItem: 'text-yellow-700',
    summaryEmpty: 'text-yellow-600'
  },
  {
    status: 'baking',
    title: 'W pieczeniu',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    badge: 'bg-blue-100 text-blue-800',
    summary: 'bg-blue-50/50 border-blue-200/50',
    summaryTitle: 'text-blue-800',
    summaryItem: 'text-blue-700',
    summaryEmpty: 'text-blue-600'
  },
  {
    status: 'icing',
    title: 'W lukrowaniu',
    iconBg: 'bg-gradient-to-br from-purple-400 to-pink-500',
    badge: 'bg-purple-100 text-purple-800',
    summary: 'bg-purple-50/50 border-purple-200/50',
    summaryTitle: 'text-purple-800',
    summaryItem: 'text-purple-700',
    summaryEmpty: 'text-purple-600'
  },
  {
    status: 'packaging',
    title: 'W pakowaniu',
    iconBg: 'bg-gradient-to-br from-orange-400 to-red-500',
    badge: 'bg-orange-100 text-orange-800',
    summary: 'bg-orange-50/50 border-orange-200/50',
    summaryTitle: 'text-orange-800',
    summaryItem: 'text-orange-700',
    summaryEmpty: 'text-orange-600'
  },
  {
    status: 'completed',
    title: 'Zakończone',
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
    badge: 'bg-green-100 text-green-800',
    summary: 'bg-green-50/50 border-green-200/50',
    summaryTitle: 'text-green-800',
    summaryItem: 'text-green-700',
    summaryEmpty: 'text-green-600'
  }
]

const selectedSeasonId = ref('')
const showAddOrderModal = ref(false)
const showOrderDetailsModal = ref(false)
const selectedOrder = ref(null)
const isEditingOrder = ref(false)
const savingOrder = ref(false)
const editOrderError = ref('')
const editOrder = ref({
  client_name: '',
  due_date: '',
  total_price: '',
  notes: '',
  status: 'ordered',
  season_id: '',
  items: []
})
const draggedOrderId = ref(null)
const dragOverStatus = ref(null)
const skipNextClick = ref(false)

const newOrder = ref({
  client_name: '',
  due_date: '',
  total_price: 0,
  notes: '',
  items: []
})

const selectedOrderItems = computed(() => {
  if (!selectedOrder.value) return []
  return ordersStore.getOrderItems(selectedOrder.value.id)
})

const addOrderItem = () => {
  newOrder.value.items.push({
    type: 'product',
    id: '',
    quantity: 1
  })
}

const removeOrderItem = (index) => {
  newOrder.value.items.splice(index, 1)
}

const getSeasonFromItems = () => {
  if (newOrder.value.items.length === 0) return null

  for (const item of newOrder.value.items) {
    if (item.type === 'set' && item.id) {
      const set = productSetsStore.productSets.find(s => s.id === item.id)
      if (set && set.season_id) return set.season_id
    } else if (item.type === 'product' && item.id) {
      const product = productsStore.products.find(p => p.id === item.id)
      if (product && product.season_id) return product.season_id
    }
  }

  return null
}

const handleAddOrder = async () => {
  const seasonId = getSeasonFromItems()

  const orderData = {
    client_name: newOrder.value.client_name,
    due_date: newOrder.value.due_date,
    total_price: newOrder.value.total_price ? parseFloat(newOrder.value.total_price) : null,
    season_id: seasonId,
    notes: newOrder.value.notes,
    status: 'ordered'
  }

  const result = await ordersStore.addOrder(orderData)

  if (result.success) {
    for (const item of newOrder.value.items) {
      if (!item.id) continue
      const itemData = {
        order_id: result.data.id,
        quantity: item.quantity
      }

      if (item.type === 'product') {
        itemData.product_id = item.id
      } else {
        itemData.set_id = item.id
      }

      await ordersStore.addOrderItem(itemData)
    }

    newOrder.value = {
      client_name: '',
      due_date: '',
      total_price: 0,
      notes: '',
      items: []
    }
    showAddOrderModal.value = false

    await ordersStore.fetchOrders(selectedSeasonId.value || null)
  }
}

const handleSeasonChange = async () => {
  await ordersStore.fetchOrders(selectedSeasonId.value || null)
}

const handleRefreshOrders = async () => {
  await ordersStore.fetchOrders(selectedSeasonId.value || null)
}

const getColumnOrders = (status) => {
  return ordersStore.orders.filter(order => order.status === status)
}

const getColumnItemCount = (status) => {
  return ordersStore.getColumnItemCount(status, selectedSeasonId.value || null)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const statusLabel = (status) => {
  return columns.find(column => column.status === status)?.title || status
}

const toDateInputValue = (dateString) => {
  if (!dateString) return ''
  return String(dateString).slice(0, 10)
}

const buildEditItems = (orderId) => {
  return ordersStore.getOrderItems(orderId).map(item => ({
    itemId: item.id,
    type: item.set_id ? 'set' : 'product',
    id: item.set_id || item.product_id || '',
    quantity: item.quantity
  }))
}

const startEditingOrder = () => {
  if (!selectedOrder.value) return
  editOrderError.value = ''
  editOrder.value = {
    client_name: selectedOrder.value.client_name || '',
    due_date: toDateInputValue(selectedOrder.value.due_date),
    total_price: selectedOrder.value.total_price ?? '',
    notes: selectedOrder.value.notes || '',
    status: selectedOrder.value.status,
    season_id: selectedOrder.value.season_id || '',
    items: buildEditItems(selectedOrder.value.id)
  }
  isEditingOrder.value = true
}

const cancelEditingOrder = () => {
  isEditingOrder.value = false
  editOrderError.value = ''
}

const addEditOrderItem = () => {
  editOrder.value.items.push({
    itemId: null,
    type: 'product',
    id: '',
    quantity: 1
  })
}

const removeEditOrderItem = (index) => {
  editOrder.value.items.splice(index, 1)
}

const itemPayload = (item) => ({
  quantity: Number(item.quantity) || 1,
  product_id: item.type === 'product' ? item.id : null,
  set_id: item.type === 'set' ? item.id : null
})

const saveOrderDetails = async () => {
  if (!selectedOrder.value) return
  if (!editOrder.value.client_name.trim()) {
    editOrderError.value = 'Podaj imię i nazwisko zamawiającego.'
    return
  }

  savingOrder.value = true
  editOrderError.value = ''

  const result = await ordersStore.updateOrder(selectedOrder.value.id, {
    client_name: editOrder.value.client_name.trim(),
    due_date: editOrder.value.due_date || null,
    total_price: editOrder.value.total_price === '' || editOrder.value.total_price == null
      ? null
      : parseFloat(editOrder.value.total_price),
    notes: editOrder.value.notes || null,
    status: editOrder.value.status,
    season_id: editOrder.value.season_id || null
  })

  if (!result.success) {
    editOrderError.value = result.error || 'Nie udało się zapisać zamówienia.'
    savingOrder.value = false
    return
  }

  const existingItems = ordersStore.getOrderItems(selectedOrder.value.id)
  const keptIds = editOrder.value.items.filter(item => item.itemId).map(item => item.itemId)

  for (const existing of existingItems) {
    if (!keptIds.includes(existing.id)) {
      const deleted = await ordersStore.deleteOrderItem(existing.id)
      if (!deleted.success) {
        editOrderError.value = deleted.error || 'Nie udało się usunąć pozycji.'
        savingOrder.value = false
        return
      }
    }
  }

  for (const item of editOrder.value.items) {
    if (!item.id) continue
    const payload = itemPayload(item)
    if (item.itemId) {
      const updated = await ordersStore.updateOrderItem(item.itemId, payload)
      if (!updated.success) {
        editOrderError.value = updated.error || 'Nie udało się zaktualizować pozycji.'
        savingOrder.value = false
        return
      }
    } else {
      const added = await ordersStore.addOrderItem({
        order_id: selectedOrder.value.id,
        ...payload
      })
      if (!added.success) {
        editOrderError.value = added.error || 'Nie udało się dodać pozycji.'
        savingOrder.value = false
        return
      }
    }
  }

  const updatedOrder = ordersStore.orders.find(order => order.id === selectedOrder.value.id)
  if (updatedOrder) {
    selectedOrder.value = updatedOrder
  }

  isEditingOrder.value = false
  savingOrder.value = false
}

const openOrderDetails = (order) => {
  if (skipNextClick.value) {
    skipNextClick.value = false
    return
  }
  selectedOrder.value = order
  isEditingOrder.value = false
  editOrderError.value = ''
  showOrderDetailsModal.value = true
}

const closeOrderDetails = () => {
  showOrderDetailsModal.value = false
  selectedOrder.value = null
  isEditingOrder.value = false
  editOrderError.value = ''
}

const handleDragStart = (event, orderId) => {
  draggedOrderId.value = orderId
  skipNextClick.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(orderId))
}

const handleDragOver = (event, status) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  dragOverStatus.value = status
}

const handleDragLeave = (event, status) => {
  const next = event.relatedTarget
  if (next && event.currentTarget.contains(next)) return
  if (dragOverStatus.value === status) {
    dragOverStatus.value = null
  }
}

const handleDragEnd = () => {
  draggedOrderId.value = null
  dragOverStatus.value = null
  setTimeout(() => {
    skipNextClick.value = false
  }, 0)
}

const handleDrop = async (event, targetStatus) => {
  event.preventDefault()
  dragOverStatus.value = null

  const orderId = draggedOrderId.value || event.dataTransfer.getData('text/plain')
  if (!orderId) return

  const current = ordersStore.orders.find(order => String(order.id) === String(orderId))
  if (!current || current.status === targetStatus) {
    draggedOrderId.value = null
    return
  }

  await ordersStore.updateOrderStatus(orderId, targetStatus)
  draggedOrderId.value = null
}

onMounted(async () => {
  await Promise.all([
    seasonsStore.fetchSeasons(),
    productSetsStore.fetchProductSets(),
    productsStore.fetchProducts(),
    ordersStore.fetchOrders()
  ])
})
</script>
