import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import ProductsManagement from '../views/ProductsManagement.vue'
import ProductSetsManagement from '../views/ProductSetsManagement.vue'
import SeasonsManagement from '../views/SeasonsManagement.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/product-sets',
      name: 'product-sets',
      component: ProductSetsManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/seasons',
      name: 'seasons',
      component: SeasonsManagement,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (!authStore.session) {
      await authStore.checkSession()
    }
    
    if (!authStore.session) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
