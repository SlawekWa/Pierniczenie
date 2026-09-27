import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { useProductSetsStore } from './productSets'

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
      return this.getColumnProductSummary(status, seasonId).reduce((counts, item) => {
        counts[item.name] = item.count
        return counts
      }, {})
    },

    getColumnProductSummary(status, seasonId = null) {
      const productSetsStore = useProductSetsStore()
      const ordersInColumn = seasonId 
        ? this.orders.filter(order => order.status === status && order.season_id === seasonId)
        : this.orders.filter(order => order.status === status)
      
      const products = {}
      
      ordersInColumn.forEach(order => {
        const items = this.getOrderItems(order.id)
        items.forEach(item => {
          if (item.product_id && item.products) {
            const productName = item.products.name
            const product = products[item.product_id] || {
              id: item.product_id,
              name: productName,
              count: 0,
              orders: []
            }
            product.count += item.quantity
            product.orders.push({
              clientName: order.client_name,
              productName,
              quantity: item.quantity
            })
            products[item.product_id] = product
          } else if (item.set_id && item.product_sets) {
            const setItems = productSetsStore.getSetItems(item.set_id)

            if (setItems.length > 0) {
              setItems.forEach(setItem => {
                if (!setItem.products) return
                const productId = setItem.product_id
                const productName = setItem.products.name
                const quantity = setItem.quantity * item.quantity
                const product = products[productId] || {
                  id: productId,
                  name: productName,
                  count: 0,
                  orders: []
                }
                product.count += quantity
                product.orders.push({
                  clientName: order.client_name,
                  productName,
                  quantity
                })
                products[productId] = product
              })
            } else {
              const setName = item.product_sets.name || 'Zestaw'
              const product = products[`set-${item.set_id}`] || {
                id: `set-${item.set_id}`,
                name: setName,
                count: 0,
                orders: []
              }
              product.count += item.quantity
              product.orders.push({
                clientName: order.client_name,
                productName: setName,
                quantity: item.quantity
              })
              products[`set-${item.set_id}`] = product
            }
          }
        })
      })
      
      return Object.values(products).sort((firstProduct, secondProduct) => secondProduct.count - firstProduct.count)
    },

    getProductOrders(productId) {
      const productSetsStore = useProductSetsStore()
      const productOrders = {}
      const isSetFallback = String(productId).startsWith('set-')
      const targetSetId = isSetFallback ? String(productId).slice(4) : null

      const addProductOrder = (order, productName, quantity) => {
        const existing = productOrders[order.id]
        if (existing) {
          existing.quantity += quantity
          return
        }

        productOrders[order.id] = {
          orderId: order.id,
          clientName: order.client_name,
          productName,
          quantity
        }
      }

      this.orders.forEach(order => {
        this.getOrderItems(order.id).forEach(item => {
          if (item.product_id === productId && item.products) {
            addProductOrder(order, item.products.name, item.quantity)
            return
          }

          if (!item.set_id || !item.product_sets) return
          const setItems = productSetsStore.getSetItems(item.set_id)
          setItems.forEach(setItem => {
            const matchesProduct = setItem.product_id === productId && setItem.products
            const matchesFallbackSet = isSetFallback && String(item.set_id) === targetSetId
            if (matchesProduct || matchesFallbackSet) {
              addProductOrder(
                order,
                setItem.products?.name || item.product_sets.name,
                matchesProduct ? setItem.quantity * item.quantity : item.quantity
              )
            }
          })
        })
      })

      return Object.values(productOrders)
    }
  }
})
