import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useProductSetsStore = defineStore('productSets', {
  state: () => ({
    productSets: [],
    setItems: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchProductSets(seasonId = null) {
      this.loading = true
      this.error = null
      
      try {
        let query = supabase
          .from('product_sets')
          .select('*, seasons(*)')
          .order('name', { ascending: true })
        
        if (seasonId) {
          query = query.eq('season_id', seasonId)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        this.productSets = data || []
        
        // Fetch set items for all sets
        if (this.productSets.length > 0) {
          const setIds = this.productSets.map(set => set.id)
          const { data: itemsData, error: itemsError } = await supabase
            .from('set_items')
            .select('*, products(*)')
            .in('set_id', setIds)
          
          if (!itemsError) {
            this.setItems = itemsData || []
          }
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching product sets:', error)
      } finally {
        this.loading = false
      }
    },

    async addProductSet(setData) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('product_sets')
          .insert([setData])
          .select('*, seasons(*)')
        
        if (error) throw error
        
        if (data && data.length > 0) {
          this.productSets.push(data[0])
        }
        
        return { success: true, data: data[0] }
      } catch (error) {
        this.error = error.message
        console.error('Error adding product set:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async addSetItem(setItemData) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('set_items')
          .insert([setItemData])
          .select('*, products(*)')
        
        if (error) throw error
        
        if (data && data.length > 0) {
          this.setItems.push(data[0])
        }
        
        return { success: true, data: data[0] }
      } catch (error) {
        this.error = error.message
        console.error('Error adding set item:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async updateProductSet(setId, setData) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('product_sets')
          .update(setData)
          .eq('id', setId)
          .select('*, seasons(*)')
        
        if (error) throw error
        
        const setIndex = this.productSets.findIndex(set => set.id === setId)
        if (setIndex !== -1 && data && data.length > 0) {
          this.productSets[setIndex] = data[0]
        }
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error updating product set:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async deleteProductSet(setId) {
      this.loading = true
      this.error = null
      
      try {
        const { error } = await supabase
          .from('product_sets')
          .delete()
          .eq('id', setId)
        
        if (error) throw error
        
        this.productSets = this.productSets.filter(set => set.id !== setId)
        this.setItems = this.setItems.filter(item => item.set_id !== setId)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting product set:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async deleteSetItem(itemId) {
      this.loading = true
      this.error = null
      
      try {
        const { error } = await supabase
          .from('set_items')
          .delete()
          .eq('id', itemId)
        
        if (error) throw error
        
        this.setItems = this.setItems.filter(item => item.id !== itemId)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting set item:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    getSetItems(setId) {
      return this.setItems.filter(item => item.set_id === setId)
    },

    // Get set composition as text for tooltip
    getSetComposition(setId) {
      const items = this.getSetItems(setId)
      return items.map(item => `${item.quantity}x ${item.products?.name || 'Unknown'}`).join(', ')
    },

    // Break down set into individual products with quantities
    getSetBreakdown(setId) {
      const items = this.getSetItems(setId)
      const breakdown = {}
      
      items.forEach(item => {
        if (item.products) {
          const productName = item.products.name
          breakdown[productName] = (breakdown[productName] || 0) + item.quantity
        }
      })
      
      return breakdown
    },

    getProductSetsBySeason(seasonId) {
      return this.productSets.filter(set => set.season_id === seasonId)
    }
  }
})
