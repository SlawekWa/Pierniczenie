<template>
  <div
    v-if="item.isNewSet"
    class="mt-3 pt-3 border-t border-amber-200 space-y-3"
  >
    <p class="text-xs font-semibold text-amber-800 uppercase">Nowy zestaw</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Nazwa zestawu</label>
        <input
          type="text"
          v-model="item.newSet.name"
          placeholder="np. Zestaw świąteczny"
          class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Cena za zestaw</label>
        <input
          type="number"
          v-model.number="item.newSet.price_per_set"
          min="0"
          step="0.01"
          placeholder="0.00"
          class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Sezon</label>
        <select
          v-model="item.newSet.season_id"
          class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">Wybierz sezon</option>
          <option v-for="season in seasonsStore.seasons" :key="season.id" :value="season.id">
            {{ season.name }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Opis (opcjonalne)</label>
        <input
          type="text"
          v-model="item.newSet.description"
          placeholder="Dodatkowy opis..."
          class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>
    </div>

    <div>
      <label class="block text-xs font-semibold text-gray-600 mb-1">Produkty w zestawie</label>
      <div class="space-y-2">
        <div
          v-for="(entry, entryIndex) in item.newSetItems"
          :key="entryIndex"
          class="flex gap-2 items-start"
        >
          <div class="relative flex-1 min-w-0" data-order-dropdown>
            <input
              type="text"
              v-model="entry.search"
              @input="emit('search-item', entry)"
              @focus="entry.showOptions = true"
              placeholder="Wpisz nazwę produktu..."
              class="w-full min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div
              v-if="entry.showOptions && productOptions(entry).length"
              class="absolute left-0 right-0 top-full mt-1 z-20 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl p-1"
            >
              <button
                v-for="product in productOptions(entry)"
                :key="product.id"
                type="button"
                @click="emit('select-item', { entry, product })"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 transition"
              >
                <span class="block text-sm text-gray-800">{{ product.name }}</span>
                <span class="block text-xs text-gray-500">{{ product.price_per_piece ?? 0 }} PLN/szt</span>
              </button>
            </div>
          </div>
          <input
            type="number"
            v-model.number="entry.quantity"
            min="1"
            step="1"
            class="w-20 shrink-0 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            @click="emit('remove-item', entryIndex)"
            class="shrink-0 text-red-500 hover:text-red-700 transition py-1"
            aria-label="Usuń produkt z zestawu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <button
        type="button"
        @click="emit('add-item')"
        class="mt-2 w-full py-2 border-2 border-dashed border-amber-300 rounded-xl text-amber-700 hover:border-amber-500 hover:text-amber-800 transition flex items-center justify-center gap-2 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Dodaj produkt do zestawu
      </button>
    </div>

    <p v-if="item.setError" class="text-xs text-red-600">{{ item.setError }}</p>

    <div class="flex gap-2">
      <button
        type="button"
        @click="emit('cancel')"
        :disabled="item.savingSet"
        class="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition text-sm font-medium disabled:opacity-50"
      >
        Anuluj
      </button>
      <button
        type="button"
        @click="emit('create')"
        :disabled="item.savingSet"
        class="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition text-sm font-medium disabled:opacity-50"
      >
        {{ item.savingSet ? 'Tworzenie...' : 'Utwórz zestaw' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProductsStore } from '../stores/products'
import { useSeasonsStore } from '../stores/seasons'

const props = defineProps({
  item: { type: Object, required: true }
})

const emit = defineEmits(['create', 'cancel', 'add-item', 'remove-item', 'search-item', 'select-item'])

const productsStore = useProductsStore()
const seasonsStore = useSeasonsStore()

const normalizeSearchValue = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const productOptions = (entry) => {
  const search = normalizeSearchValue(entry.search?.trim() || '')
  if (!search) return productsStore.products
  return productsStore.products.filter(product =>
    normalizeSearchValue(product.name).includes(search)
  )
}
</script>
