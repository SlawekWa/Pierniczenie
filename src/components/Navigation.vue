<template>
  <nav class="bg-white/80 backdrop-blur-xl border-b border-white/50 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Pierniczenie</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <router-link 
              to="/" 
              class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
              :class="isCurrentRoute('/') ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/50'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span class="hidden sm:inline">Kanban</span>
            </router-link>
            <router-link 
              to="/products" 
              class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
              :class="isCurrentRoute('/products') ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/50'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span class="hidden sm:inline">Produkty</span>
            </router-link>
            <router-link 
              to="/product-sets" 
              class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
              :class="isCurrentRoute('/product-sets') ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/50'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span class="hidden sm:inline">Zestawy</span>
            </router-link>
            <router-link 
              to="/seasons" 
              class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
              :class="isCurrentRoute('/seasons') ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/50'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="hidden sm:inline">Sezony</span>
            </router-link>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-sm font-medium text-indigo-900">{{ userEmail }}</span>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Wyloguj</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userEmail = computed(() => {
  return authStore.user?.email || 'Brak danych'
})

const isCurrentRoute = (path) => {
  return route.path === path
}

const handleLogout = async () => {
  const result = await authStore.signOut()
  if (result.success) {
    await router.push('/login')
  }
}
</script>