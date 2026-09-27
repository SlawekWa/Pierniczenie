import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useSeasonsStore = defineStore('seasons', {
  state: () => ({
    seasons: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchSeasons() {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('seasons')
          .select('*')
          .order('name', { ascending: false })
        
        if (error) throw error
        
        this.seasons = data || []
        console.log('Fetched seasons:', this.seasons)
      } catch (error) {
        this.error = error.message
        console.error('Error fetching seasons:', error)
      } finally {
        this.loading = false
      }
    },

    async addSeason(seasonData) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('seasons')
          .insert([seasonData])
          .select()
        
        if (error) throw error
        
        if (data && data.length > 0) {
          this.seasons.push(data[0])
        }
        
        return { success: true, data: data[0] }
      } catch (error) {
        this.error = error.message
        console.error('Error adding season:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async updateSeason(seasonId, seasonData) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('seasons')
          .update(seasonData)
          .eq('id', seasonId)
          .select()
        
        if (error) throw error
        
        const seasonIndex = this.seasons.findIndex(season => season.id === seasonId)
        if (seasonIndex !== -1 && data && data.length > 0) {
          this.seasons[seasonIndex] = data[0]
        }
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error updating season:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async deleteSeason(seasonId) {
      this.loading = true
      this.error = null
      
      try {
        const { error } = await supabase
          .from('seasons')
          .delete()
          .eq('id', seasonId)
        
        if (error) throw error
        
        this.seasons = this.seasons.filter(season => season.id !== seasonId)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting season:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    getActiveSeason() {
      return this.seasons.find(season => season.is_active) || null
    }
  }
})
