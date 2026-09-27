import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false,
    error: null
  }),

  actions: {
    async getSession() {
      this.loading = true
      this.error = null
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        this.session = session
        this.user = session?.user || null
      } catch (error) {
        this.error = error.message
        console.error('Error getting session:', error)
      } finally {
        this.loading = false
      }
    },

    async signIn(email, password) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        this.session = data.session
        this.user = data.user
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error signing in:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      this.loading = true
      this.error = null
      
      try {
        const { error } = await supabase.auth.signOut()
        
        if (error) throw error
        
        this.session = null
        this.user = null
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error signing out:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    initializeAuthListener() {
      supabase.auth.onAuthStateChange((event, session) => {
        this.session = session
        this.user = session?.user || null
      })
    },

    async checkSession() {
      await this.getSession()
      this.initializeAuthListener()
    }
  }
})
