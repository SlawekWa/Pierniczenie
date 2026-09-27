import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    orderItems: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchOrders(seasonId = null) {
      this.loading = true
      this.error = null
      
      try {
        let query = supabase
          .from('orders')
          .select('*, seasons(*)')
          .order('due_date', { ascending: true })
        
        if (seasonId) {
          query = query.eq('season_id', seasonId)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        this.orders = data || []

        if (this.orders.length > 0) {
          const orderIds = this.orders.map(order => order.id)
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*, products(*), product_sets(*)')
            .in('order_id', orderIds)
          
          if (!itemsError) {
            this.orderItems = itemsData || []
          } else {
            console.error('Error fetching order items:', itemsError)
          }
        } else {
          this.orderItems = []
        }
      } catch (error) {
        this.error = error.message
        console.error('Error fetching orders:', error)
      } finally {
        this.loading = false
      }
    },

    async addOrder(orderData) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([orderData])
          .select('*, seasons(*)')
        
        if (error) throw error
        
        if (data && data.length > 0) {
          this.orders.unshift(data[0])
        }
        
        return { success: true, data: data[0] }
      } catch (error) {
        this.error = error.message
        console.error('Error adding order:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async addOrderItem(orderItemData) {
      this.loading = true
      this.error = null
      
      try {
        const { data, error } = await supabase
          .from('order_items')
          .insert([orderItemData])
          .select('*, products(*), product_sets(*)')
        
        if (error) throw error
        
        if (data && data.length > 0) {
          this.orderItems.push(data[0])
        }
        
        return { success: true, data: data[0] }
      } catch (error) {
        this.error = error.message
        console.error('Error adding order item:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async updateOrderStatus(orderId, newStatus) {
      this.error = null
      const orderIndex = this.orders.findIndex(order => order.id === orderId)
      const previousOrder = orderIndex !== -1 ? { ...this.orders[orderIndex] } : null

      if (orderIndex !== -1) {
        this.orders[orderIndex] = { ...this.orders[orderIndex], status: newStatus }
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId)
          .select('*, seasons(*)')
        
        if (error) throw error
        
        if (orderIndex !== -1 && data && data.length > 0) {
          this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            ...data[0],
            seasons: data[0].seasons || this.orders[orderIndex].seasons
          }
        }
        
        return { success: true }
      } catch (error) {
        if (orderIndex !== -1 && previousOrder) {
          this.orders[orderIndex] = previousOrder
        }
        this.error = error.message
        console.error('Error updating order status:', error)
        return { success: false, error: error.message }
      }
    },

    async updateOrder(orderId, orderData) {
      this.error = null

      try {
        const { data, error } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', orderId)
          .select('*, seasons(*)')

        if (error) throw error

        const orderIndex = this.orders.findIndex(order => order.id === orderId)
        if (orderIndex !== -1 && data && data.length > 0) {
          this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            ...data[0],
            seasons: data[0].seasons || this.orders[orderIndex].seasons
          }
        }

        return { success: true, data: data?.[0] || null }
      } catch (error) {
        this.error = error.message
        console.error('Error updating order:', error)
        return { success: false, error: error.message }
      }
    },

    async updateOrderItem(itemId, itemData) {
      this.error = null

      try {
        const { data, error } = await supabase
          .from('order_items')
          .update(itemData)
          .eq('id', itemId)
          .select('*, products(*), product_sets(*)')

        if (error) throw error

        const itemIndex = this.orderItems.findIndex(item => item.id === itemId)
        if (itemIndex !== -1 && data && data.length > 0) {
          this.orderItems[itemIndex] = data[0]
        }

        return { success: true, data: data?.[0] || null }
      } catch (error) {
        this.error = error.message
        console.error('Error updating order item:', error)
        return { success: false, error: error.message }
      }
    },

    async deleteOrderItem(itemId) {
      this.error = null

      try {
        const { error } = await supabase
          .from('order_items')
          .delete()
          .eq('id', itemId)

        if (error) throw error

        this.orderItems = this.orderItems.filter(item => item.id !== itemId)
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting order item:', error)
        return { success: false, error: error.message }
      }
    },

    async deleteOrder(orderId) {
      this.loading = true
      this.error = null
      
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId)
        
        if (error) throw error
        
        this.orders = this.orders.filter(order => order.id !== orderId)
        this.orderItems = this.orderItems.filter(item => item.order_id !== orderId)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting order:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    getOrderItems(orderId) {
      return this.orderItems.filter(item => item.order_id === orderId)
    },

    // Calculate total items in a column (breaking down sets into individual products)
    getColumnItemCount(status, seasonId = null) {
      const ordersInColumn = seasonId 
        ? this.orders.filter(order => order.status === status && order.season_id === seasonId)
        : this.orders.filter(order => order.status === status)
      
      const itemCounts = {}
      
      ordersInColumn.forEach(order => {
        const items = this.getOrderItems(order.id)
        items.forEach(item => {
          if (item.product_id && item.products) {
            // Single product
            const productName = item.products.name
            itemCounts[productName] = (itemCounts[productName] || 0) + item.quantity
          } else if (item.set_id && item.product_sets) {
            // Set - need to break it down (this will be implemented when we have set_items data)
            // For now, just count the set
            const setName = item.product_sets.name
            itemCounts[setName] = (itemCounts[setName] || 0) + item.quantity
          }
        })
      })
      
      return itemCounts
    }
  }
})
