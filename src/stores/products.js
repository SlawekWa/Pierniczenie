import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchProducts(seasonId = null) {
      this.loading = true
      this.error = null
      
      try {
        let query = supabase
          .from('products')
          .select('*, seasons(*)')
          .order('name', { ascending: true })
        
        if (seasonId) {
          query = query.eq('season_id', seasonId)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        this.products = data || []
      } catch (error) {
        this.error = error.message
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },

    async addProduct(productData) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select('*, seasons(*)')
        
        if (error) throw error
        
        if (data && data.length > 0) {
          this.products.push(data[0])
        }
        
        return { success: true, data: data[0] }
      } catch (error) {
        this.error = error.message
        console.error('Error adding product:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async updateProduct(productId, productData) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
          .select('*, seasons(*)')
        
        if (error) throw error
        
        const productIndex = this.products.findIndex(product => product.id === productId)
        if (productIndex !== -1 && data && data.length > 0) {
          this.products[productIndex] = data[0]
        }
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error updating product:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(productId) {
      this.loading = true
      this.error = null
      
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId)
        
        if (error) throw error
        
        this.products = this.products.filter(product => product.id !== productId)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting product:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    getProductsBySeason(seasonId) {
      return this.products.filter(product => product.season_id === seasonId)
    }
  }
})
