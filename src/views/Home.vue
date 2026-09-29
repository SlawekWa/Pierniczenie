<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <Navigation />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Zamówienia</h2>
            <button
              type="button"
              @click="showAddOrderModal = true"
              class="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 text-sm font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Dodaj</span>
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2 sm:gap-4">
            <button
              v-if="pendingAcceptanceOrders.length"
              type="button"
              @click="openPendingOrders"
              class="flex items-center gap-2 px-3 sm:px-4 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 hover:text-amber-900 transition-all duration-200 text-sm"
            >
              <span>Oczekujące na akceptację ({{ pendingAcceptanceOrders.length }})</span>
            </button>
            <button
              type="button"
              @click="toggleSelectionMode"
              class="flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 text-sm"
              :class="selectionMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-red-50 text-red-600 hover:bg-red-100'"
            >
              <span>{{ selectionMode ? 'Anuluj zaznaczanie' : 'Zaznacz kilka' }}</span>
            </button>
            <button
              v-if="selectionMode && selectedOrderIds.length"
              type="button"
              @click="openBulkDeleteConfirmation"
              class="flex items-center gap-2 px-3 sm:px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-sm"
            >
              Usuń wszystkie ({{ selectedOrderIds.length }})
            </button>
            <div class="relative flex-1 sm:flex-none sm:min-w-[200px] min-w-0">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5v12a2 2 0 002 2z" />
                </svg>
              </div>
              <select v-model="selectedSeasonId" @change="handleSeasonChange" class="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none">
                <option value="">Wszystkie sezony</option>
                <option v-for="season in seasonsStore.seasons" :key="season.id" :value="season.id">{{ season.name }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
        <div
          v-for="column in columns"
          :key="column.status"
          :data-column-status="column.status"
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
              <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="column.badge">
                {{ getColumnOrders(column.status).length }}
              </span>
            </div>
          </div>

          <div class="mb-4 p-3 rounded-xl border" :class="column.summary">
            <p class="text-xs font-semibold mb-2" :class="column.summaryTitle">Podsumowanie:</p>
            <div v-if="getColumnProductSummary(column.status).length > 0" class="space-y-1">
              <div
                v-for="summaryItem in visibleColumnProducts(column.status)"
                :key="summaryItem.id"
                class="text-xs"
                :class="column.summaryItem"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="min-w-0 truncate" :class="summaryItem.type === 'set' ? 'font-semibold' : ''">
                    {{ summaryItem.type === 'set' ? `Zestaw: ${summaryItem.name}` : summaryItem.name }}
                  </span>
                  <span class="flex items-center gap-1 shrink-0">
                    <span class="font-semibold">{{ summaryItem.count }}x</span>
                    <svg v-if="summaryItem.type === 'product' && summaryItem.isReady" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Gotowe we wszystkich zamówieniach">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <button
                      v-if="summaryItem.type === 'product'"
                      type="button"
                      title="Pokaż zamówienia"
                      class="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center hover:bg-white/70 transition"
                      @click.stop="openProductOrders({ ...summaryItem, id: summaryItem.productId }, column.status)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="9" stroke-width="2" />
                        <path stroke-linecap="round" stroke-width="2" d="M12 11v5m0-8h.01" />
                      </svg>
                    </button>
                  </span>
                </div>
                <div v-if="summaryItem.type === 'set'" class="ml-3 mt-1 space-y-0.5 border-l border-current/30 pl-2">
                  <div v-for="component in summaryItem.components" :key="component.id" class="flex items-center justify-between gap-2 text-[11px]">
                    <span class="min-w-0 truncate">{{ component.name }}</span>
                    <span class="flex items-center gap-1 shrink-0">
                      <span>{{ component.count }}x</span>
                      <svg v-if="component.isReady" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Gotowe we wszystkich zamówieniach">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <button
                        type="button"
                        title="Pokaż zamówienia z tym produktem"
                        class="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center hover:bg-white/70 transition"
                        @click.stop="openProductOrders({ ...component, id: component.productId }, column.status)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="9" stroke-width="2" />
                          <path stroke-linecap="round" stroke-width="2" d="M12 11v5m0-8h.01" />
                        </svg>
                      </button>
                    </span>
                  </div>
                </div>
              </div>
              <button
                v-if="shouldShowMoreButton(column.status)"
                type="button"
                class="w-full pt-1 text-xs font-semibold flex items-center justify-center gap-1 hover:underline"
                :class="column.summaryItem"
                @click="toggleColumnSummary(column.status)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="expandedSummaries[column.status]" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                {{ expandedSummaries[column.status] ? 'Zwiń' : 'Pokaż więcej' }}
              </button>
            </div>
            <p v-else class="text-xs" :class="column.summaryEmpty">Brak przedmiotów</p>
          </div>

          <div class="space-y-3 flex-1 min-h-[12rem] overflow-y-auto">
            <div
              v-for="order in getColumnOrders(column.status)"
              :key="order.id"
              :draggable="!selectionMode"
              @dragstart="handleDragStart($event, order.id)"
              @dragend="handleDragEnd"
              @touchstart="handleTileTouchStart($event, order)"
              @touchmove="handleTileTouchMove"
              @touchend="handleTileTouchEnd"
              @touchcancel="handleTileTouchEnd"
              @click="selectionMode ? toggleOrderSelection(order.id) : openOrderDetails(order)"
              class="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              :class="[
                { 'opacity-50': draggedOrderId === order.id },
                isTouchDevice ? 'cursor-pointer' : 'cursor-move'
              ]"
              :style="{ borderLeft: `4px solid ${order.seasons?.color_hex || '#E0E0E0'}` }"
            >
              <div v-if="getOrderProductionProgress(order).total" class="absolute inset-x-0 top-0 h-1.5 bg-gray-200">
                <div class="h-full bg-emerald-500 transition-all" :style="{ width: `${getOrderProductionProgress(order).percent}%` }"></div>
              </div>
              <div class="flex items-center gap-2">
                <input
                  v-if="selectionMode"
                  type="checkbox"
                  :checked="selectedOrderIds.includes(order.id)"
                  @click.stop
                  @change="toggleOrderSelection(order.id)"
                  class="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <h4 class="font-bold text-gray-800 text-sm mb-1">{{ order.client_name }}</h4>
              </div>
              <div class="flex items-center justify-between gap-2 mt-2">
                <p class="text-xs text-gray-500">{{ formatDate(order.due_date) }}</p>
                <div v-if="!selectionMode" class="flex items-center gap-1">
                  <button
                    type="button"
                    :disabled="getAdjacentStatus(order, -1) == null || movingOrderId === order.id"
                    @click.stop="moveOrderToAdjacentColumn(order, -1)"
                    @mousedown.stop
                    :aria-label="`Przenieś zamówienie ${order.client_name} do poprzedniej kolumny`"
                    title="Poprzednia kolumna"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7M8 12h13" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    :disabled="getAdjacentStatus(order, 1) == null || movingOrderId === order.id"
                    @click.stop="moveOrderToAdjacentColumn(order, 1)"
                    @mousedown.stop
                    :aria-label="`Przenieś zamówienie ${order.client_name} do następnej kolumny`"
                    title="Następna kolumna"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p v-if="getColumnOrders(column.status).length === 0" class="text-xs text-gray-400 text-center py-8 pointer-events-none">
              Upuść zamówienie tutaj
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showBulkDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closeBulkDeleteConfirmation">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain">
        <h3 class="text-xl font-bold text-gray-800 mb-2">Usuń zamówienia</h3>
        <p class="text-sm text-gray-600 mb-4">Czy na pewno chcesz usunąć zaznaczone zamówienia?</p>
        <ul class="space-y-2 mb-5">
          <li v-for="order in selectedOrders" :key="order.id" class="bg-gray-50 rounded-xl px-4 py-3 font-semibold text-gray-800">
            {{ order.client_name }}
          </li>
        </ul>
        <p v-if="bulkDeleteError" class="mb-4 text-sm text-red-600">{{ bulkDeleteError }}</p>
        <div class="flex gap-3">
          <button
            type="button"
            @click="closeBulkDeleteConfirmation"
            :disabled="deletingOrders"
            class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="button"
            @click="deleteSelectedOrders"
            :disabled="deletingOrders"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition disabled:opacity-50"
          >
            {{ deletingOrders ? 'Usuwanie...' : 'Usuń' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showProductOrdersModal && selectedProduct" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closeProductOrders">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain">
        <div class="flex items-center justify-between mb-5">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase">Zamówienia</p>
            <h3 class="text-xl font-bold text-gray-800">{{ selectedProduct.name }}</h3>
          </div>
          <button @click="closeProductOrders" class="text-gray-400 hover:text-gray-600 transition" title="Zamknij">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <section
            v-for="group in selectedProduct.columnGroups"
            :key="group.status"
            :class="group.status === selectedProduct.columnStatus ? '' : 'border-t border-gray-200 pt-4'"
          >
            <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">{{ statusLabel(group.status) }}</h4>
            <div class="space-y-2">
              <div v-for="(order, index) in group.orders" :key="`${order.orderId}-${index}`" class="bg-gray-50 rounded-xl px-4 py-3">
                <div class="flex items-center justify-between gap-2">
                  <p class="font-semibold text-gray-800">{{ order.clientName }}</p>
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      :disabled="getAdjacentStatus(findOrder(order.orderId), -1) == null || movingOrderId === order.orderId"
                      @click="moveOrderFromProductPopup(order.orderId, -1)"
                      :aria-label="`Przenieś ${order.clientName} do poprzedniej kolumny`"
                      title="Poprzednia kolumna"
                      class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7M8 12h13" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      :disabled="getAdjacentStatus(findOrder(order.orderId), 1) == null || movingOrderId === order.orderId"
                      @click="moveOrderFromProductPopup(order.orderId, 1)"
                      :aria-label="`Przenieś ${order.clientName} do następnej kolumny`"
                      title="Następna kolumna"
                      class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7m7-7H3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="ml-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                      @click="openOrderFromProduct(order.orderId)"
                    >
                      Otwórz
                    </button>
                  </div>
                </div>
                <div class="flex justify-between gap-3 text-sm text-gray-600">
                  <span>{{ order.setName ? `${order.productName} (${order.setName})` : order.productName }}</span>
                  <span class="font-semibold shrink-0">{{ order.quantity }}x</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <div v-if="showAddOrderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showAddOrderModal = false">
      <div class="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain">
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
          
          <div class="space-y-2 min-w-0">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Data realizacji</label>
            <input
              type="date"
              v-model="newOrder.due_date"
              required
              class="w-full min-w-0 max-w-full box-border px-2 sm:px-4 py-3 text-base sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Cena zamówienia</label>
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
            <label class="block text-sm font-semibold text-gray-700 mb-1">Zapłacono</label>
            <input
              type="number"
              v-model="newOrder.amount_paid"
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
                class="relative bg-gray-50 rounded-xl p-3"
              >
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                <div class="flex gap-2 items-center min-w-0 sm:contents">
                  <select
                    v-model="item.type"
                    @change="resetOrderItemSelection(item)"
                    required
                    class="w-24 sm:w-28 shrink-0 px-2 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <option value="product">Produkt</option>
                    <option value="set">Zestaw</option>
                  </select>
                  <div class="relative flex-1 min-w-0" data-order-dropdown>
                    <input
                      v-model="item.search"
                      @input="handleOrderItemSearch(item)"
                      @focus="item.showOptions = true"
                      :placeholder="`Wybierz ${item.type === 'product' ? 'produkt' : 'zestaw'}`"
                      required
                      class="w-full min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                    <div
                      v-if="item.showOptions && (getOrderItemOptions(item).length || item.type === 'set')"
                      class="absolute left-0 right-0 top-full mt-1 z-20 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl p-1"
                    >
                      <button
                        v-for="option in getOrderItemOptions(item)"
                        :key="option.id"
                        type="button"
                        @click="selectOrderItem(item, option)"
                        class="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 transition"
                      >
                        <span class="block text-sm text-gray-800">{{ option.name }}</span>
                        <span class="block text-xs text-gray-500">{{ item.type === 'product' ? (option.price_per_piece ?? 0) : option.price_per_set }} PLN</span>
                      </button>
                      <button
                        v-if="item.type === 'set'"
                        type="button"
                        @click="startCreatingSet(item)"
                        class="w-full text-left px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 border-dashed transition"
                      >
                        <span class="block text-sm font-semibold text-amber-800">+ Stwórz nowy zestaw</span>
                        <span class="block text-xs text-amber-600">Zdefiniuj skład od razu przy tym zamówieniu</span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeOrderItem(index)"
                    class="sm:hidden shrink-0 text-red-500 hover:text-red-700 transition"
                    aria-label="Usuń pozycję"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1 flex-1 min-w-0 sm:flex-none sm:shrink-0">
                    <label class="text-xs text-gray-500 sm:hidden shrink-0">Cena</label>
                    <input
                      type="number"
                      v-model.number="item.unit_price"
                      @input="recalculateNewOrderTotal"
                      min="0"
                      step="0.01"
                      required
                      class="w-full sm:w-20 min-w-0 px-3 sm:px-2 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                      placeholder="0.00"
                    />
                    <span class="text-xs text-gray-500 shrink-0">PLN</span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <label class="text-xs text-gray-500 sm:hidden">Ilość</label>
                    <input
                      type="number"
                      v-model.number="item.quantity"
                      @input="recalculateNewOrderTotal"
                      required
                      min="1"
                      class="w-20 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                  <button
                    type="button"
                    @click="removeOrderItem(index)"
                    class="hidden sm:block shrink-0 text-red-500 hover:text-red-700 transition"
                    aria-label="Usuń pozycję"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                </div>

                <NewSetForm
                  :item="item"
                  @create="createSetFromItem(item)"
                  @cancel="cancelCreatingSet(item)"
                  @add-item="addNewSetItem(item)"
                  @remove-item="removeNewSetItem(item, $event)"
                  @search-item="handleNewSetItemSearch(item, $event)"
                  @select-item="selectNewSetItem(item, $event)"
                />
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

    <div
      v-if="showPendingOrdersModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closePendingOrders"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain">
        <div class="flex items-center justify-between mb-5">
          <div>
            <p class="text-xs font-semibold text-amber-600 uppercase">Ze sklepu</p>
            <h3 class="text-xl font-bold text-gray-800">Zamówienia oczekujące na akceptację</h3>
          </div>
          <button
            type="button"
            @click="closePendingOrders"
            class="text-gray-400 hover:text-gray-600 transition"
            title="Zamknij"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="pendingAcceptanceOrders.length" class="space-y-2">
          <button
            v-for="order in pendingAcceptanceOrders"
            :key="order.id"
            type="button"
            @click="openPendingOrderAcceptance(order)"
            class="w-full flex items-center justify-between gap-3 bg-gray-50 hover:bg-indigo-50 rounded-xl px-4 py-3 text-left transition-colors duration-200"
          >
            <div class="min-w-0">
              <p class="font-semibold text-gray-800 truncate">{{ order.client_name }}</p>
              <p class="text-xs text-gray-500">
                {{ formatDate(order.due_date) || 'Brak terminu' }}
                <span v-if="order.seasons?.name"> · {{ order.seasons.name }}</span>
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-sm font-semibold text-gray-700">
                {{ order.total_price != null ? `${order.total_price} PLN` : '—' }}
              </span>
              <span class="text-xs font-semibold text-indigo-600 whitespace-nowrap">Akceptuj</span>
            </div>
          </button>
        </div>
        <p v-else class="text-sm text-gray-400">Brak zamówień oczekujących na akceptację.</p>
      </div>
    </div>

    <div v-if="showOrderDetailsModal && selectedOrder" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closeOrderDetails">
      <div class="relative overflow-hidden bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain">
        <div v-if="getOrderProductionProgress(selectedOrder).total" class="absolute inset-x-0 top-0 h-2 bg-gray-200">
          <div class="h-full bg-emerald-500 transition-all" :style="{ width: `${getOrderProductionProgress(selectedOrder).percent}%` }"></div>
        </div>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-800">
            <template v-if="isAcceptingOrder">Akceptacja zamówienia</template>
            <template v-else>{{ isEditingOrder ? 'Edycja zamówienia' : 'Szczegóły zamówienia' }}</template>
          </h3>
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
              <div class="flex items-center gap-2">
                <p class="text-sm text-gray-800">{{ statusLabel(selectedOrder.status) }}</p>
                <template v-if="!isEditingOrder">
                  <button
                    type="button"
                    :disabled="getAdjacentStatus(selectedOrder, -1) == null || movingOrderId === selectedOrder.id"
                    @click="moveOrderToAdjacentColumn(selectedOrder, -1)"
                    title="Poprzednia kolumna"
                    aria-label="Przenieś do poprzedniej kolumny"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7M8 12h13" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    :disabled="getAdjacentStatus(selectedOrder, 1) == null || movingOrderId === selectedOrder.id"
                    @click="moveOrderToAdjacentColumn(selectedOrder, 1)"
                    title="Następna kolumna"
                    aria-label="Przenieś do następnej kolumny"
                    class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7m7-7H3" />
                    </svg>
                  </button>
                </template>
              </div>
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
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Zapłacono</p>
              <p class="text-sm text-gray-800">{{ selectedOrder.amount_paid != null ? `${selectedOrder.amount_paid} PLN` : '—' }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Liczba produktów</p>
              <p class="text-sm text-gray-800">{{ selectedOrderTotalPieces }} szt.</p>
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
                class="flex justify-between gap-3 text-sm bg-gray-50 rounded-xl px-3 py-2"
              >
                <div class="min-w-0">
                  <p class="font-medium">{{ item.product_id ? `Produkt: ${item.products?.name || 'Pozycja'}` : `Zestaw: ${item.product_sets?.name || 'Pozycja'}` }}</p>
                  <p v-if="item.set_id && productSetsStore.getSetItems(item.set_id).length" class="mt-1 text-xs text-gray-500">
                    <span class="font-semibold text-gray-600">Skład:</span>
                    {{ productSetsStore.getSetComposition(item.set_id) }}
                  </p>
                </div>
                <span class="font-semibold shrink-0">{{ item.quantity }}x</span>
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
                <option v-if="editOrder.status === AWAITING_CONFIRMATION_STATUS" :value="AWAITING_CONFIRMATION_STATUS">
                  Oczekuje na akceptację
                </option>
                <option v-for="column in columns" :key="column.status" :value="column.status">
                  {{ column.title }}
                </option>
              </select>
            </div>
            <div class="min-w-0">
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Termin</label>
              <input
                v-model="editOrder.due_date"
                type="date"
                required
                class="w-full min-w-0 max-w-full box-border px-1.5 sm:px-3 py-3 text-base sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Cena zamówienia</label>
              <input
                v-model="editOrder.total_price"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Zapłacono</label>
              <input
                v-model="editOrder.amount_paid"
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
                class="relative bg-gray-50 rounded-xl p-3"
              >
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                <div class="flex gap-2 items-center min-w-0 sm:contents">
                  <select
                    v-model="item.type"
                    @change="resetEditItemSelection(item)"
                    required
                    class="w-24 sm:w-28 shrink-0 px-2 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <option value="product">Produkt</option>
                    <option value="set">Zestaw</option>
                  </select>
                  <div class="relative flex-1 min-w-0" data-order-dropdown>
                    <input
                      v-model="item.search"
                      @input="handleEditOrderItemSearch(item)"
                      @focus="item.showOptions = true"
                      :placeholder="`Wybierz ${item.type === 'product' ? 'produkt' : 'zestaw'}`"
                      required
                      class="w-full min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                    />
                    <div
                      v-if="item.showOptions && (getEditOrderItemOptions(item).length || item.type === 'set')"
                      class="absolute left-0 right-0 top-full mt-1 z-20 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl p-1"
                    >
                      <button
                        v-for="option in getEditOrderItemOptions(item)"
                        :key="option.id"
                        type="button"
                        @click="selectEditOrderItem(item, option)"
                        class="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 transition"
                      >
                        <span class="block text-sm text-gray-800">{{ option.name }}</span>
                        <span class="block text-xs text-gray-500">{{ item.type === 'product' ? (option.price_per_piece ?? 0) : option.price_per_set }} PLN</span>
                      </button>
                      <button
                        v-if="item.type === 'set'"
                        type="button"
                        @click="startCreatingSet(item)"
                        class="w-full text-left px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 border-dashed transition"
                      >
                        <span class="block text-sm font-semibold text-amber-800">+ Stwórz nowy zestaw</span>
                        <span class="block text-xs text-amber-600">Zdefiniuj skład od razu przy tym zamówieniu</span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeEditOrderItem(index)"
                    class="sm:hidden shrink-0 text-red-500 hover:text-red-700 transition"
                    aria-label="Usuń pozycję"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1 flex-1 min-w-0 sm:flex-none sm:shrink-0">
                    <label class="text-xs text-gray-500 sm:hidden shrink-0">Cena</label>
                    <input
                      v-model.number="item.unit_price"
                      @input="recalculateEditOrderTotal"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      class="w-full sm:w-20 min-w-0 px-3 sm:px-2 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                      placeholder="0.00"
                    />
                    <span class="text-xs text-gray-500 shrink-0">PLN</span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <label class="text-xs text-gray-500 sm:hidden">Ilość</label>
                    <input
                      v-model.number="item.quantity"
                      @input="recalculateEditOrderTotal"
                      type="number"
                      required
                      min="1"
                      class="w-20 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                  <button
                    type="button"
                    @click="removeEditOrderItem(index)"
                    class="hidden sm:block shrink-0 text-red-500 hover:text-red-700 transition"
                    aria-label="Usuń pozycję"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                </div>

                <NewSetForm
                  v-if="item.isNewSet"
                  :item="item"
                  @create="createSetFromItem(item)"
                  @cancel="cancelCreatingSet(item)"
                  @add-item="addNewSetItem(item)"
                  @remove-item="removeNewSetItem(item, $event)"
                  @search-item="handleNewSetItemSearch(item, $event)"
                  @select-item="selectNewSetItem(item, $event)"
                />
              </div>
              <button
                type="button"
                @click="addEditOrderItem"                class="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition flex items-center justify-center gap-2"
              >
                Dodaj pozycję
              </button>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Gotowość kształtów w tej fazie</p>
            <div v-if="selectedOrderProductionGroups.length" class="space-y-2">
              <section
                v-for="group in selectedOrderProductionGroups"
                :key="group.id"
                class="rounded-lg bg-gray-50 px-3 py-2"
              >
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <p class="min-w-0 truncate text-xs font-semibold text-gray-600">
                    {{ group.type === 'set' ? `Zestaw: ${group.name}` : 'Produkt' }}
                  </p>
                  <span v-if="group.type === 'set'" class="text-xs text-gray-500 shrink-0">{{ group.quantity }}x zestaw</span>
                </div>
                <label
                  v-if="group.type === 'product'"
                  class="flex items-center justify-between gap-3 cursor-pointer text-sm"
                >
                  <span class="flex min-w-0 items-center gap-2">
                    <input
                      type="checkbox"
                      :checked="isProductionProductComplete(selectedOrder, group.products[0].id)"
                      :disabled="savingProductionProgress"
                      @change="toggleProductionProduct(group.products[0].id)"
                      class="w-4 h-4 shrink-0 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span class="truncate">{{ group.name }}</span>
                  </span>
                  <span class="font-semibold shrink-0">{{ group.quantity }}x</span>
                </label>
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                  <label
                    v-for="product in group.products"
                    :key="product.id"
                    class="flex min-w-0 items-center justify-between gap-2 cursor-pointer text-xs"
                  >
                    <span class="flex min-w-0 items-center gap-1.5">
                      <input
                        type="checkbox"
                        :checked="isProductionProductComplete(selectedOrder, product.id)"
                        :disabled="savingProductionProgress"
                        @change="toggleProductionProduct(product.id)"
                        class="w-3.5 h-3.5 shrink-0 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span class="truncate">{{ product.name }}</span>
                    </span>
                    <span class="font-semibold shrink-0">{{ product.quantity }}x</span>
                  </label>
                </div>
              </section>
            </div>
            <p v-else class="text-sm text-gray-400">Brak pozycji</p>
            <p v-if="productionProgressError" class="mt-2 text-xs text-red-600">{{ productionProgressError }}</p>
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
              v-if="!isAcceptingOrder"
              type="button"
              @click="deleteSelectedOrder"
              :disabled="savingOrder"
              class="px-4 py-3 bg-red-100 text-red-700 rounded-2xl hover:bg-red-200 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Usuń
            </button>
            <button
              v-if="isAcceptingOrder"
              type="button"
              @click="rejectPendingOrder"
              :disabled="savingOrder"
              class="px-4 py-3 bg-red-100 text-red-700 rounded-2xl hover:bg-red-200 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Odrzuć
            </button>
            <button
              type="button"
              @click="cancelEditingOrder"
              :disabled="savingOrder"
              class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              v-if="isAcceptingOrder"
              type="button"
              @click="confirmPendingOrder"
              :disabled="savingOrder"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium disabled:opacity-50"
            >
              {{ savingOrder ? 'Potwierdzanie...' : 'Potwierdź' }}
            </button>
            <button
              v-else
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useOrdersStore } from '../stores/orders'
import { useSeasonsStore } from '../stores/seasons'
import { useProductSetsStore } from '../stores/productSets'
import { useProductsStore } from '../stores/products'
import Navigation from '../components/Navigation.vue'
import NewSetForm from '../components/NewSetForm.vue'

const ordersStore = useOrdersStore()
const seasonsStore = useSeasonsStore()
const productSetsStore = useProductSetsStore()
const productsStore = useProductsStore()

const columns = [
  {
    status: 'ordered',
    title: 'Zamówione',
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

const AWAITING_CONFIRMATION_STATUS = 'awaiting_confirmation'
const ACCEPTED_STATUS = columns[0].status
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches

const selectedSeasonId = ref('')
const showAddOrderModal = ref(false)
const showOrderDetailsModal = ref(false)
const showPendingOrdersModal = ref(false)
const isAcceptingOrder = ref(false)
const showProductOrdersModal = ref(false)
const selectedOrder = ref(null)
const selectedProduct = ref(null)
const isEditingOrder = ref(false)
const savingOrder = ref(false)
const editOrderError = ref('')
const savingProductionProgress = ref(false)
const productionProgressError = ref('')
const editOrder = ref({
  client_name: '',
  due_date: '',
  total_price: '',
  amount_paid: 0,
  notes: '',
  status: 'ordered',
  season_id: '',
  items: []
})
const draggedOrderId = ref(null)
const dragOverStatus = ref(null)
const skipNextClick = ref(false)
const movingOrderId = ref(null)
const expandedSummaries = ref({})
const selectionMode = ref(false)
const selectedOrderIds = ref([])
const showBulkDeleteModal = ref(false)
const deletingOrders = ref(false)
const bulkDeleteError = ref('')

const newOrder = ref({
  client_name: '',
  due_date: '',
  total_price: 0,
  amount_paid: 0,
  notes: '',
  items: []
})

const selectedOrders = computed(() => {
  return ordersStore.orders.filter(order => selectedOrderIds.value.includes(order.id))
})

const soloProducts = computed(() => {
  return productsStore.products.filter(product => product.is_available_solo !== false)
})

const editOrderProducts = computed(() => {
  const usedIds = new Set(
    editOrder.value.items
      .filter(item => item.type === 'product' && item.id)
      .map(item => String(item.id))
  )

  if (!usedIds.size) return soloProducts.value

  return productsStore.products.filter(product => {
    return product.is_available_solo !== false || usedIds.has(String(product.id))
  })
})

const selectedOrderItems = computed(() => {
  if (!selectedOrder.value) return []
  return ordersStore.getOrderItems(selectedOrder.value.id)
})

// Total piece count for an order: sets are expanded, so 5 sets of 3 pieces count as 15.
const selectedOrderTotalPieces = computed(() => {
  if (!selectedOrder.value) return 0

  return ordersStore.getOrderItems(selectedOrder.value.id).reduce((total, item) => {
    const itemQuantity = Number(item.quantity) || 0

    if (item.product_id) return total + itemQuantity
    if (!item.set_id) return total

    const setItems = productSetsStore.getSetItems(item.set_id)
    if (!setItems.length) return total + itemQuantity

    const setPieces = setItems.reduce((sum, setItem) => sum + (Number(setItem.quantity) || 0), 0)
    return total + (setPieces * itemQuantity)
  }, 0)
})

const pendingAcceptanceOrders = computed(() => {
  return ordersStore.orders.filter(order => order.status === AWAITING_CONFIRMATION_STATUS)
})

const selectedOrderProductionGroups = computed(() => {
  if (!selectedOrder.value) return []
  return getOrderProductionGroups(selectedOrder.value.id)
})

const getOrderProductionGroups = (orderId) => {
  return ordersStore.getOrderItems(orderId).map(item => {
    if (item.product_id && item.products) {
      return {
        id: `order-item-${item.id}`,
        type: 'product',
        name: item.products.name,
        quantity: Number(item.quantity) || 0,
        products: [{ id: `product-${item.product_id}`, name: item.products.name, quantity: Number(item.quantity) || 0 }]
      }
    }

    if (!item.set_id || !item.product_sets) return null

    const setProducts = new Map()
    productSetsStore.getSetItems(item.set_id).forEach(setItem => {
      if (!setItem.products) return
      const productId = `product-${setItem.product_id}`
      const product = setProducts.get(productId) || {
        id: productId,
        name: setItem.products.name,
        quantity: 0
      }
      product.quantity += (Number(setItem.quantity) || 0) * (Number(item.quantity) || 0)
      setProducts.set(productId, product)
    })

    if (!setProducts.size) {
      const setName = item.product_sets.name || 'Zestaw'
      setProducts.set(`set-${item.set_id}`, {
        id: `set-${item.set_id}`,
        name: setName,
        quantity: Number(item.quantity) || 0
      })
    }

    return {
      id: `order-item-${item.id}`,
      type: 'set',
      name: item.product_sets.name || 'Zestaw',
      quantity: Number(item.quantity) || 0,
      products: [...setProducts.values()]
    }
  })
  .filter(Boolean)
}

const getOrderProductionItems = (orderId) => {
  const products = new Map()
  getOrderProductionGroups(orderId).forEach(group => {
    group.products.forEach(item => {
      const product = products.get(item.id) || { ...item, quantity: 0 }
      product.quantity += item.quantity
      products.set(item.id, product)
    })
  })
  return [...products.values()]
}

const isProductionProductComplete = (order, productId) => {
  return (order.production_completed_products || []).includes(productId)
}

const getOrderProductionProgress = (order) => {
  const products = getOrderProductionItems(order?.id)
  const total = products.reduce((sum, product) => sum + product.quantity, 0)
  const complete = products.reduce((sum, product) => {
    return sum + (isProductionProductComplete(order, product.id) ? product.quantity : 0)
  }, 0)

  return {
    complete,
    total,
    percent: total ? Math.round((complete / total) * 100) : 0
  }
}

const toggleProductionProduct = async (productId) => {
  if (!selectedOrder.value || savingProductionProgress.value) return

  const order = selectedOrder.value
  const completedProducts = [...(order.production_completed_products || [])]
  const productIndex = completedProducts.indexOf(productId)
  if (productIndex === -1) completedProducts.push(productId)
  else completedProducts.splice(productIndex, 1)

  savingProductionProgress.value = true
  productionProgressError.value = ''
  const result = await ordersStore.updateProductionCompletedProducts(order.id, completedProducts)
  savingProductionProgress.value = false

  if (!result.success) {
    productionProgressError.value = result.error || 'Nie udało się zapisać postępu.'
    return
  }

  selectedOrder.value = ordersStore.orders.find(item => item.id === order.id) || order
}

const addOrderItem = () => {
  newOrder.value.items.push({
    type: 'product',
    id: '',
    quantity: 1,
    unit_price: 0,
    search: '',
    showOptions: false,
    isNewSet: false,
    newSet: null,
    newSetItems: [],
    setError: '',
    savingSet: false
  })
}

const removeOrderItem = (index) => {
  newOrder.value.items.splice(index, 1)
}

const normalizeSearchValue = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const getOrderItemOptions = (item) => {
  const options = item.type === 'product'
    ? soloProducts.value
    : productSetsStore.productSets
  const search = normalizeSearchValue(item.search?.trim() || '')
  if (!search) return options
  return options.filter(option => normalizeSearchValue(option.name).includes(search))
}

const selectOrderItem = (item, option) => {
  item.id = option.id
  item.search = option.name
  item.unit_price = Number(item.type === 'product' ? option.price_per_piece : option.price_per_set) || 0
  item.showOptions = false
  recalculateNewOrderTotal()
}

const handleOrderItemSearch = (item) => {
  const options = item.type === 'product' ? productsStore.products : productSetsStore.productSets
  const selected = options.find(option => String(option.id) === String(item.id))
  if (!selected || selected.name !== item.search) {
    item.id = ''
    item.unit_price = 0
  }
  item.showOptions = true
}

const resetOrderItemSelection = (item) => {
  item.id = ''
  item.search = ''
  item.unit_price = 0
  item.showOptions = false
  if (item.isNewSet) cancelCreatingSet(item)
  recalculateNewOrderTotal()
}

const recalculateNewOrderTotal = () => {
  newOrder.value.total_price = newOrder.value.items.reduce((total, item) => {
    return total + ((Number(item.unit_price) || 0) * (Number(item.quantity) || 0))
  }, 0)
}

const getCatalogItemPrice = (item) => {
  const collection = item.type === 'product' ? productsStore.products : productSetsStore.productSets
  const catalogItem = collection.find(option => String(option.id) === String(item.id))
  return Number(item.type === 'product' ? catalogItem?.price_per_piece : catalogItem?.price_per_set) || 0
}

const resetEditItemSelection = (item) => {
  item.id = ''
  item.search = ''
  item.unit_price = 0
  if (item.isNewSet) cancelCreatingSet(item)
  recalculateEditOrderTotal()
}

const setEditItemPrice = (item) => {
  item.unit_price = getCatalogItemPrice(item)
  recalculateEditOrderTotal()
}

const getEditOrderItemOptions = (item) => {
  const options = item.type === 'product'
    ? editOrderProducts.value
    : productSetsStore.productSets
  const search = normalizeSearchValue(item.search?.trim() || '')
  if (!search) return options
  return options.filter(option => normalizeSearchValue(option.name).includes(search))
}

const handleEditOrderItemSearch = (item) => {
  const options = getEditOrderItemOptions(item)
  const selected = options.find(option => String(option.id) === String(item.id))
  if (!selected || selected.name !== item.search) {
    item.id = ''
    item.unit_price = 0
  }
  item.showOptions = true
  recalculateEditOrderTotal()
}

const selectEditOrderItem = (item, option) => {
  item.id = option.id
  item.search = option.name
  item.showOptions = false
  setEditItemPrice(item)
}

const recalculateEditOrderTotal = () => {
  editOrder.value.total_price = editOrder.value.items.reduce((total, item) => {
    return total + ((Number(item.unit_price) || 0) * (Number(item.quantity) || 0))
  }, 0)
}

const startCreatingSet = (item) => {
  item.id = ''
  item.search = ''
  item.showOptions = false
  item.isNewSet = true
  item.setError = ''
  item.savingSet = false
  item.newSet = {
    name: '',
    price_per_set: '',
    season_id: seasonsStore.getDefaultSeason()?.id || '',
    description: ''
  }
  item.newSetItems = []
}

const cancelCreatingSet = (item) => {
  item.isNewSet = false
  item.setError = ''
  item.newSet = null
  item.newSetItems = []
}

const addNewSetItem = (item) => {
  item.newSetItems.push({ product_id: '', quantity: 1, search: '', showOptions: false })
}

const handleNewSetItemSearch = (item, entry) => {
  const selected = productsStore.products.find(product => String(product.id) === String(entry.product_id))
  if (!selected || selected.name !== entry.search) {
    entry.product_id = ''
  }
  entry.showOptions = true
}

const selectNewSetItem = (item, { entry, product }) => {
  entry.product_id = product.id
  entry.search = product.name
  entry.showOptions = false
}

const removeNewSetItem = (item, index) => {
  item.newSetItems.splice(index, 1)
}

const createSetFromItem = async (item) => {
  const setName = item.newSet?.name?.trim()
  if (!setName) {
    item.setError = 'Podaj nazwę zestawu.'
    return
  }

  const setPrice = parseFloat(item.newSet.price_per_set)
  if (!Number.isFinite(setPrice) || setPrice < 0) {
    item.setError = 'Podaj poprawną cenę zestawu.'
    return
  }

  const setSeasonId = item.newSet.season_id || seasonsStore.getDefaultSeason()?.id
  if (!setSeasonId) {
    item.setError = 'Wybierz sezon zestawu.'
    return
  }

  const validProducts = item.newSetItems.filter(entry => entry.product_id)
  item.setError = ''
  item.savingSet = true

  const setResult = await productSetsStore.addProductSet({
    name: setName,
    price_per_set: setPrice,
    season_id: setSeasonId,
    description: item.newSet.description || '',
    image_url: null
  })

  if (!setResult.success) {
    item.setError = setResult.error || 'Nie udało się utworzyć zestawu.'
    item.savingSet = false
    return
  }

  const newSetId = setResult.data.id

  for (const entry of validProducts) {
    const entryResult = await productSetsStore.addSetItem({
      set_id: newSetId,
      product_id: entry.product_id,
      quantity: Number(entry.quantity) || 1
    })

    if (!entryResult.success) {
      item.setError = entryResult.error || 'Nie udało się dodać produktu do zestawu.'
      item.savingSet = false
      return
    }
  }

  item.isNewSet = false
  item.savingSet = false
  item.newSet = null
  item.newSetItems = []
  item.id = newSetId
  item.search = setResult.data.name
  item.unit_price = setPrice
  item.showOptions = false
  recalculateNewOrderTotal()
  recalculateEditOrderTotal()
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
  const unfinishedSet = newOrder.value.items.find(item => item.isNewSet)
  if (unfinishedSet) {
    if (unfinishedSet.setError) return
    unfinishedSet.setError = 'Uzupełnij zestaw i kliknij „Utwórz zestaw”.'
    return
  }

  const seasonId = getSeasonFromItems()

  const orderData = {
    client_name: newOrder.value.client_name,
    due_date: newOrder.value.due_date,
    total_price: Number(newOrder.value.total_price) || 0,
    amount_paid: Number(newOrder.value.amount_paid) || 0,
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
        quantity: item.quantity,
        unit_price: Number(item.unit_price) || 0
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
      amount_paid: 0,
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

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedOrderIds.value = []
    closeBulkDeleteConfirmation()
  }
}

const toggleOrderSelection = (orderId) => {
  if (selectedOrderIds.value.includes(orderId)) {
    selectedOrderIds.value = selectedOrderIds.value.filter(id => id !== orderId)
  } else {
    selectedOrderIds.value.push(orderId)
  }
}

const openBulkDeleteConfirmation = () => {
  if (!selectedOrderIds.value.length) return
  bulkDeleteError.value = ''
  showBulkDeleteModal.value = true
}

const closeBulkDeleteConfirmation = () => {
  if (deletingOrders.value) return
  showBulkDeleteModal.value = false
  bulkDeleteError.value = ''
}

const deleteSelectedOrders = async () => {
  const orderIds = [...selectedOrderIds.value]
  deletingOrders.value = true
  bulkDeleteError.value = ''

  for (const orderId of orderIds) {
    const result = await ordersStore.deleteOrder(orderId)
    if (!result.success) {
      bulkDeleteError.value = result.error || 'Nie udało się usunąć wszystkich zamówień.'
      deletingOrders.value = false
      return
    }
  }

  deletingOrders.value = false
  showBulkDeleteModal.value = false
  selectedOrderIds.value = []
  selectionMode.value = false
}

const getColumnOrders = (status) => {
  return ordersStore.orders.filter(order => order.status === status)
}

const getColumnItemCount = (status) => {
  return ordersStore.getColumnItemCount(status, selectedSeasonId.value || null)
}

const getColumnProductSummary = (status) => {
  const orders = getColumnOrders(status)
  const readiness = new Map()
  const standaloneProducts = new Map()
  const sets = new Map()

  orders.forEach(order => {
    getOrderProductionItems(order.id).forEach(product => {
      const state = readiness.get(product.id) || { orderCount: 0, completeCount: 0 }
      state.orderCount += 1
      if (isProductionProductComplete(order, product.id)) state.completeCount += 1
      readiness.set(product.id, state)
    })

    ordersStore.getOrderItems(order.id).forEach(item => {
      if (item.product_id && item.products) {
        const productId = `product-${item.product_id}`
        const product = standaloneProducts.get(productId) || {
          id: productId,
          type: 'product',
          productId: item.product_id,
          name: item.products.name,
          count: 0
        }
        product.count += Number(item.quantity) || 0
        standaloneProducts.set(productId, product)
        return
      }

      if (!item.set_id || !item.product_sets) return
      const setId = `set-${item.set_id}`
      const set = sets.get(setId) || {
        id: setId,
        type: 'set',
        name: item.product_sets.name || 'Zestaw',
        count: 0,
        components: new Map()
      }
      const setCount = Number(item.quantity) || 0
      set.count += setCount
      productSetsStore.getSetItems(item.set_id).forEach(setItem => {
        if (!setItem.products) return
        const productId = `product-${setItem.product_id}`
        const component = set.components.get(productId) || {
          id: productId,
          productId: setItem.product_id,
          name: setItem.products.name,
          count: 0
        }
        component.count += (Number(setItem.quantity) || 0) * setCount
        set.components.set(productId, component)
      })
      sets.set(setId, set)
    })
  })

  const products = [...standaloneProducts.values()].map(product => {
    const state = readiness.get(product.id)
    return { ...product, isReady: Boolean(state?.orderCount && state.completeCount === state.orderCount) }
  })
  const setRows = [...sets.values()].map(set => ({
    ...set,
    components: [...set.components.values()].map(component => {
      const state = readiness.get(component.id)
      return { ...component, isReady: Boolean(state?.orderCount && state.completeCount === state.orderCount) }
    }).sort((first, second) => second.count - first.count)
  }))

  return [...products, ...setRows].sort((first, second) => second.count - first.count)
}

const visibleColumnProducts = (status) => {
  const products = getColumnProductSummary(status)
  if (expandedSummaries.value[status]) return products

  const result = []
  let lineCount = 0

  for (const product of products) {
    const linesForProduct = product.type === 'set' ? 1 + product.components.length : 1
    
    if (lineCount + linesForProduct <= 3) {
      result.push(product)
      lineCount += linesForProduct
    } else {
      // Jeśli produkt to zestaw i zmieści się tylko nazwa (bez komponentów)
      if (product.type === 'set' && lineCount + 1 <= 3) {
        result.push({ ...product, components: [] })
        lineCount += 1
      }
      break
    }
  }

  return result
}

const toggleColumnSummary = (status) => {
  expandedSummaries.value[status] = !expandedSummaries.value[status]
}

const shouldShowMoreButton = (status) => {
  const products = getColumnProductSummary(status)
  let lineCount = 0
  for (const product of products) {
    const linesForProduct = product.type === 'set' ? 1 + product.components.length : 1
    lineCount += linesForProduct
    if (lineCount > 3) return true
  }
  return false
}

const openProductOrders = (product, columnStatus) => {
  const orderStatuses = new Map(ordersStore.orders.map(order => [String(order.id), order.status]))
  const activeOrders = ordersStore.getProductOrders(product.id)
    .map(order => ({ ...order, status: orderStatuses.get(String(order.orderId)) }))
    .filter(order => order.status && order.status !== 'completed')
  const orderedStatuses = [
    columnStatus,
    ...columns
      .filter(column => column.status !== columnStatus && column.status !== 'completed')
      .map(column => column.status)
  ]

  selectedProduct.value = {
    ...product,
    columnStatus,
    columnGroups: orderedStatuses
      .map(status => ({
        status,
        orders: activeOrders.filter(order => order.status === status)
      }))
      .filter(group => group.status === columnStatus || group.orders.length > 0)
  }
  showProductOrdersModal.value = true
}

const closeProductOrders = () => {
  showProductOrdersModal.value = false
  selectedProduct.value = null
}

const openOrderFromProduct = (orderId) => {
  const order = findOrder(orderId)
  closeProductOrders()
  if (order) openOrderDetails(order)
}

const findOrder = (orderId) => {
  return ordersStore.orders.find(order => String(order.id) === String(orderId))
}

const moveOrderFromProductPopup = async (orderId, direction) => {
  const order = findOrder(orderId)
  if (!order) return

  const moved = await moveOrderToAdjacentColumn(order, direction)
  if (moved && selectedProduct.value) {
    openProductOrders(selectedProduct.value, selectedProduct.value.columnStatus)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const statusLabel = (status) => {
  if (status === AWAITING_CONFIRMATION_STATUS) return 'Oczekuje na akceptację'
  return columns.find(column => column.status === status)?.title || status
}

const getAdjacentStatus = (order, direction) => {
  const currentIndex = columns.findIndex(column => column.status === order?.status)
  const nextColumn = columns[currentIndex + direction]
  return nextColumn?.status || null
}

const moveOrderToAdjacentColumn = async (order, direction) => {
  const nextStatus = getAdjacentStatus(order, direction)
  if (!nextStatus || movingOrderId.value === order.id) return false

  movingOrderId.value = order.id
  const result = await ordersStore.updateOrderStatus(order.id, nextStatus)
  movingOrderId.value = null

  if (result.success && selectedOrder.value?.id === order.id) {
    selectedOrder.value = ordersStore.orders.find(item => item.id === order.id) || selectedOrder.value
  }

  return result.success
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
    search: item.set_id ? (item.product_sets?.name || '') : (item.products?.name || ''),
    showOptions: false,
    quantity: item.quantity,
    unit_price: item.unit_price ?? (item.set_id
      ? Number(item.product_sets?.price_per_set) || 0
      : Number(item.products?.price_per_piece) || 0)
  }))
}

const startEditingOrder = () => {
  if (!selectedOrder.value) return
  editOrderError.value = ''
  editOrder.value = {
    client_name: selectedOrder.value.client_name || '',
    due_date: toDateInputValue(selectedOrder.value.due_date),
    total_price: selectedOrder.value.total_price ?? '',
    amount_paid: selectedOrder.value.amount_paid ?? 0,
    notes: selectedOrder.value.notes || '',
    status: selectedOrder.value.status,
    season_id: selectedOrder.value.season_id || '',
    items: buildEditItems(selectedOrder.value.id)
  }
  recalculateEditOrderTotal()
  isEditingOrder.value = true
}

const openPendingOrders = () => {
  showPendingOrdersModal.value = true
}

const closePendingOrders = () => {
  showPendingOrdersModal.value = false
}

const openPendingOrderAcceptance = (order) => {
  selectedOrder.value = order
  isAcceptingOrder.value = true
  editOrderError.value = ''
  productionProgressError.value = ''
  startEditingOrder()
  editOrder.value.status = ACCEPTED_STATUS
  showPendingOrdersModal.value = false
  showOrderDetailsModal.value = true
}

const confirmPendingOrder = async () => {
  if (!selectedOrder.value) return
  if (selectedOrder.value.status !== AWAITING_CONFIRMATION_STATUS) {
    isAcceptingOrder.value = false
    return saveOrderDetails()
  }

  editOrder.value.status = ACCEPTED_STATUS
  const saved = await saveOrderDetails()
  if (saved === false) return
  closeOrderDetails()
  showPendingOrdersModal.value = pendingAcceptanceOrders.value.length > 0
}

const deleteOrderFromDatabase = async (orderId) => {
  const result = await ordersStore.deleteOrder(orderId)
  if (!result.success) {
    return result.error || 'Nie udało się usunąć zamówienia.'
  }

  return null
}

const deleteSelectedOrder = async () => {
  if (!selectedOrder.value) return
  if (!window.confirm('Czy na pewno chcesz usunąć to zamówienie?')) return

  savingOrder.value = true
  editOrderError.value = ''

  const error = await deleteOrderFromDatabase(selectedOrder.value.id)
  savingOrder.value = false

  if (error) {
    editOrderError.value = error
    return
  }

  closeOrderDetails()
}

const rejectPendingOrder = async () => {
  if (!selectedOrder.value) return
  if (!window.confirm('Czy na pewno chcesz odrzucić i usunąć to zamówienie?')) return

  savingOrder.value = true
  editOrderError.value = ''

  const error = await deleteOrderFromDatabase(selectedOrder.value.id)
  savingOrder.value = false

  if (error) {
    editOrderError.value = error
    return
  }

  closeOrderDetails()
  showPendingOrdersModal.value = pendingAcceptanceOrders.value.length > 0
}

const cancelEditingOrder = () => {
  isEditingOrder.value = false
  editOrderError.value = ''
  if (isAcceptingOrder.value) {
    closeOrderDetails()
    showPendingOrdersModal.value = true
  }
}

const addEditOrderItem = () => {
  editOrder.value.items.push({
    itemId: null,
    type: 'product',
    id: '',
    search: '',
    showOptions: false,
    quantity: 1,
    unit_price: 0,
    isNewSet: false,
    newSet: null,
    newSetItems: [],
    setError: '',
    savingSet: false
  })
}

const removeEditOrderItem = (index) => {
  editOrder.value.items.splice(index, 1)
}

const itemPayload = (item) => ({
  quantity: Number(item.quantity) || 1,
  unit_price: Number(item.unit_price) || 0,
  product_id: item.type === 'product' ? item.id : null,
  set_id: item.type === 'set' ? item.id : null
})

const saveOrderDetails = async () => {
  if (!selectedOrder.value) return false

  const unfinishedSet = editOrder.value.items.find(item => item.isNewSet)
  if (unfinishedSet) {
    if (!unfinishedSet.setError) {
      unfinishedSet.setError = 'Uzupełnij zestaw i kliknij „Utwórz zestaw”.'
    }
    return false
  }

  if (!editOrder.value.client_name.trim()) {
    editOrderError.value = 'Podaj imię i nazwisko zamawiającego.'
    return false
  }

  savingOrder.value = true
  editOrderError.value = ''

  const result = await ordersStore.updateOrder(selectedOrder.value.id, {
    client_name: editOrder.value.client_name.trim(),
    due_date: editOrder.value.due_date || null,
    total_price: editOrder.value.total_price === '' || editOrder.value.total_price == null
      ? null
      : parseFloat(editOrder.value.total_price),
    amount_paid: editOrder.value.amount_paid === '' || editOrder.value.amount_paid == null
      ? 0
      : parseFloat(editOrder.value.amount_paid),
    notes: editOrder.value.notes || null,
    status: editOrder.value.status,
    season_id: editOrder.value.season_id || null
  })

  if (!result.success) {
    editOrderError.value = result.error || 'Nie udało się zapisać zamówienia.'
    savingOrder.value = false
    return false
  }

  const existingItems = ordersStore.getOrderItems(selectedOrder.value.id)
  const keptIds = editOrder.value.items.filter(item => item.itemId).map(item => item.itemId)

  for (const existing of existingItems) {
    if (!keptIds.includes(existing.id)) {
      const deleted = await ordersStore.deleteOrderItem(existing.id)
      if (!deleted.success) {
        editOrderError.value = deleted.error || 'Nie udało się usunąć pozycji.'
        savingOrder.value = false
        return false
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
        return false
      }
    } else {
      const added = await ordersStore.addOrderItem({
        order_id: selectedOrder.value.id,
        ...payload
      })
      if (!added.success) {
        editOrderError.value = added.error || 'Nie udało się dodać pozycji.'
        savingOrder.value = false
        return false
      }
    }
  }

  const updatedOrder = ordersStore.orders.find(order => order.id === selectedOrder.value.id)
  if (updatedOrder) {
    selectedOrder.value = updatedOrder
  }

  isEditingOrder.value = false
  savingOrder.value = false
  return true
}

const openOrderDetails = (order) => {
  if (skipNextClick.value) {
    skipNextClick.value = false
    return
  }
  selectedOrder.value = order
  isEditingOrder.value = false
  isAcceptingOrder.value = false
  editOrderError.value = ''
  productionProgressError.value = ''
  showOrderDetailsModal.value = true
}

const closeOrderDetails = () => {
  showOrderDetailsModal.value = false
  selectedOrder.value = null
  isEditingOrder.value = false
  isAcceptingOrder.value = false
  editOrderError.value = ''
  productionProgressError.value = ''
}

const handleDragStart = (event, orderId) => {
  draggedOrderId.value = orderId
  skipNextClick.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(orderId))
}

const handleDragOver = (event, status) => {
  if (isTouchDevice) return
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

const touchDragActive = ref(false)

const touchDrag = {
  orderId: null,
  order: null,
  startX: 0,
  startY: 0,
  timer: null
}

const clearTouchDragTimer = () => {
  if (touchDrag.timer) {
    clearTimeout(touchDrag.timer)
    touchDrag.timer = null
  }
}

const handleTileTouchStart = (event, order) => {
  if (selectionMode.value || !isTouchDevice) return

  const touch = event.touches[0]
  if (!touch) return

  touchDrag.orderId = order.id
  touchDrag.order = order
  touchDrag.startX = touch.clientX
  touchDrag.startY = touch.clientY
  touchDragActive.value = false

  clearTouchDragTimer()
  touchDrag.timer = setTimeout(() => {
    touchDragActive.value = true
    draggedOrderId.value = order.id
    if ('vibrate' in navigator) navigator.vibrate(15)
  }, 350)
}

const handleTileTouchMove = (event) => {
  const touch = event.touches[0]
  if (!touch) return

  if (!touchDragActive.value) {
    const distance = Math.hypot(touch.clientX - touchDrag.startX, touch.clientY - touchDrag.startY)
    if (distance > 10) {
      clearTouchDragTimer()
      touchDrag.orderId = null
      touchDrag.order = null
    }
    return
  }

  event.preventDefault()

  const target = document.elementFromPoint(touch.clientX, touch.clientY)
  const column = target?.closest('[data-column-status]')
  dragOverStatus.value = column?.dataset.columnStatus || null
}

const handleTileTouchEnd = async () => {
  clearTouchDragTimer()

  if (!touchDragActive.value) {
    touchDrag.orderId = null
    touchDrag.order = null
    return
  }

  const orderId = touchDrag.orderId
  const targetStatus = dragOverStatus.value
  const current = touchDrag.order

  touchDragActive.value = false
  touchDrag.orderId = null
  touchDrag.order = null
  draggedOrderId.value = null
  dragOverStatus.value = null
  skipNextClick.value = true
  setTimeout(() => {
    skipNextClick.value = false
  }, 0)

  if (!orderId || !targetStatus || !current || current.status === targetStatus) {
    return
  }

  await ordersStore.updateOrderStatus(orderId, targetStatus)
}

const isAnyModalOpen = computed(() => {
  return showAddOrderModal.value
    || showPendingOrdersModal.value
    || showOrderDetailsModal.value
    || showProductOrdersModal.value
    || showBulkDeleteModal.value
})

const watchBodyScroll = computed(() => isAnyModalOpen.value || touchDragActive.value)

watch(watchBodyScroll, (locked) => {
  document.body.style.overflow = locked ? 'hidden' : ''
})

const closeDropdownsOnOutsideClick = (event) => {
  if (event.target?.closest?.('[data-order-dropdown]')) return

  newOrder.value.items.forEach(item => {
    item.showOptions = false
    item.newSetItems?.forEach(entry => { entry.showOptions = false })
  })
  editOrder.value.items.forEach(item => {
    item.showOptions = false
    item.newSetItems?.forEach(entry => { entry.showOptions = false })
  })
}

onMounted(async () => {
  document.addEventListener('click', closeDropdownsOnOutsideClick)
  await Promise.all([
    seasonsStore.fetchSeasons(),
    productSetsStore.fetchProductSets(),
    productsStore.fetchProducts(),
    ordersStore.fetchOrders()
  ])
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdownsOnOutsideClick)
  document.body.style.overflow = ''
})
</script>
