<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
    <Navigation />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Zarządzanie Sezonami</h2>
        <p class="text-gray-600">Twórz i zarządzaj sezonami kampanii</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Add Season Form -->
        <div class="lg:col-span-1">
          <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 sticky top-24">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800">Nowy sezon</h3>
            </div>
            
            <form @submit.prevent="handleAddSeason" class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nazwa sezonu</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    v-model="newSeason.name"
                    required
                    class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="Christmas 2026"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Kolor sezonu</label>
                <div class="flex gap-2">
                  <input
                    type="color"
                    v-model="newSeason.color_hex"
                    required
                    class="w-16 h-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    v-model="newSeason.color_hex"
                    required
                    class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="#FFCDD2"
                  />
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="newSeason.is_active"
                  id="is_active"
                  class="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <label for="is_active" class="text-sm font-medium text-gray-700">Aktywny sezon</label>
              </div>
              
              <button
                type="submit"
                :disabled="seasonsStore.loading"
                class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span v-if="seasonsStore.loading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Dodawanie...
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Dodaj sezon
                </span>
              </button>
            </form>
          </div>
        </div>

        <!-- Seasons List -->
        <div class="lg:col-span-2">
          <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Lista sezonów</h3>
              </div>
              <button
                @click="handleRefreshSeasons"
                :disabled="seasonsStore.loading"
                class="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 text-indigo-600 rounded-xl hover:bg-indigo-100/50 transition-all duration-200 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{{ seasonsStore.loading ? 'Ładowanie...' : 'Odśwież' }}</span>
              </button>
            </div>
            
            <div v-if="seasonsStore.loading && seasonsStore.seasons.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p class="text-gray-500 font-medium">Ładowanie sezonów...</p>
            </div>
            
            <div v-else-if="seasonsStore.seasons.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p class="text-gray-500 font-medium">Brak sezonów</p>
              <p class="text-gray-400 text-sm mt-1">Dodaj pierwszy sezon używając formularza</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="season in seasonsStore.seasons"
                :key="season.id"
                class="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
              >
                <div class="flex justify-between items-start mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="font-bold text-gray-800 text-lg">{{ season.name }}</h4>
                      <span
                        class="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2"
                        :style="{ backgroundColor: season.color_hex + '20', color: season.color_hex, border: `1px solid ${season.color_hex}40` }"
                      >
                        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: season.color_hex }"></span>
                        {{ season.is_active ? 'Aktywny' : 'Nieaktywny' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 text-gray-600">
                      <div class="w-6 h-6 rounded-full border-2" :style="{ backgroundColor: season.color_hex, borderColor: season.color_hex }"></div>
                      <span class="font-mono text-sm">{{ season.color_hex }}</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="handleToggleActive(season.id, season.is_active)"
                      class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                      :class="season.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ season.is_active ? 'Deaktywuj' : 'Aktywuj' }}
                    </button>
                    <button
                      @click="handleDeleteSeason(season.id)"
                      class="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:from-red-100 hover:to-pink-100 transition-all duration-200"
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
import { useSeasonsStore } from '../stores/seasons'
import Navigation from '../components/Navigation.vue'

const seasonsStore = useSeasonsStore()

const newSeason = ref({
  name: '',
  color_hex: '#FFCDD2',
  is_active: true
})

const handleAddSeason = async () => {
  const result = await seasonsStore.addSeason({
    name: newSeason.value.name,
    color_hex: newSeason.value.color_hex,
    is_active: newSeason.value.is_active
  })
  if (result.success) {
    newSeason.value = {
      name: '',
      color_hex: '#FFCDD2',
      is_active: true
    }
  }
}

const handleToggleActive = async (seasonId, currentStatus) => {
  await seasonsStore.updateSeason(seasonId, { is_active: !currentStatus })
}

const handleDeleteSeason = async (seasonId) => {
  if (confirm('Czy na pewno chcesz usunąć ten sezon?')) {
    await seasonsStore.deleteSeason(seasonId)
  }
}

const handleRefreshSeasons = async () => {
  await seasonsStore.fetchSeasons()
}

onMounted(async () => {
  await seasonsStore.fetchSeasons()
})
</script>