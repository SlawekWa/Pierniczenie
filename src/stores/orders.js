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
      const statusChanged = previousOrder && previousOrder.status !== newStatus

      if (orderIndex !== -1) {
        this.orders[orderIndex] = {
          ...this.orders[orderIndex],
          status: newStatus,
          ...(statusChanged ? { production_completed_products: [] } : {})
        }
      }

      try {
        const orderData = { status: newStatus }
        if (statusChanged) orderData.production_completed_products = []

        const { data, error } = await supabase
          .from('orders')
          .update(orderData)
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
        const currentOrder = this.orders.find(order => order.id === orderId)
        const updateData = { ...orderData }
        if (currentOrder && Object.hasOwn(updateData, 'status') && currentOrder.status !== updateData.status) {
          updateData.production_completed_products = []
        }

        const { data, error } = await supabase
          .from('orders')
          .update(updateData)
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

    async updateProductionCompletedProducts(orderId, productIds) {
      this.error = null

      try {
        const completedProducts = [...new Set(productIds.map(String))]
        const { data, error } = await supabase
          .from('orders')
          .update({ production_completed_products: completedProducts })
          .eq('id', orderId)
          .select('*, seasons(*)')

        if (error) throw error

        const orderIndex = this.orders.findIndex(order => order.id === orderId)
        if (orderIndex !== -1 && data?.length) {
          this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            ...data[0],
            seasons: data[0].seasons || this.orders[orderIndex].seasons
          }
        }

        return { success: true }
      } catch (error) {
        this.error = error.message
        console.error('Error updating production progress:', error)
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

    getOrdersWithSet(setId) {
      const targetSetId = String(setId)
      const affected = {}

      this.orders.forEach(order => {
        this.getOrderItems(order.id).forEach(item => {
          if (item.set_id == null || String(item.set_id) !== targetSetId) return
          if (!affected[order.id]) {
            affected[order.id] = {
              orderId: order.id,
              clientName: order.client_name,
              dueDate: order.due_date,
              setName: item.product_sets?.name || 'Zestaw',
              quantity: 0
            }
          }
          affected[order.id].quantity += Number(item.quantity) || 0
        })
      })

      return Object.values(affected)
    },

    getOrdersWithProduct(productId) {
      const productSetsStore = useProductSetsStore()
      const targetProductId = String(productId)
      const direct = {}
      const viaSets = {}

      this.orders.forEach(order => {
        this.getOrderItems(order.id).forEach(item => {
          if (item.product_id != null && String(item.product_id) === targetProductId) {
            if (!direct[order.id]) {
              direct[order.id] = {
                orderId: order.id,
                clientName: order.client_name,
                dueDate: order.due_date,
                setName: null,
                quantity: 0
              }
            }
            direct[order.id].quantity += Number(item.quantity) || 0
            return
          }

          if (item.set_id == null) return
          const setName = item.product_sets?.name || 'Zestaw'
          const containsProduct = productSetsStore
            .getSetItems(item.set_id)
            .some(setItem => String(setItem.product_id) === targetProductId)

          if (!containsProduct) return

          if (!viaSets[order.id]) {
            viaSets[order.id] = {
              orderId: order.id,
              clientName: order.client_name,
              dueDate: order.due_date,
              setName,
              quantity: 0
            }
          }
          viaSets[order.id].quantity += Number(item.quantity) || 0
        })
      })

      return { direct: Object.values(direct), viaSets: Object.values(viaSets) }
    },

    // Removes the set from every order that uses it and lowers each order total
    // by the set price frozen on the order item, not the current catalog price.
    async deleteSetWithOrders(setId) {
      this.loading = true
      this.error = null

      const setName = this.orderItems.find(item => String(item.set_id) === String(setId))?.product_sets?.name
        || null

      try {
      const affectedOrders = this.getOrdersWithSet(setId)

      for (const affected of affectedOrders) {
        affected.removedAmount = 0
        const items = this.getOrderItems(affected.orderId).filter(item =>
            item.set_id != null && String(item.set_id) === String(setId)
          )

          for (const item of items) {
            const { error: deleteError } = await supabase
              .from('order_items')
              .delete()
              .eq('id', item.id)

            if (deleteError) throw deleteError

            this.orderItems = this.orderItems.filter(entry => entry.id !== item.id)
            affected.removedAmount += ((Number(item.unit_price) || 0) * (Number(item.quantity) || 0))
          }

          const order = this.orders.find(entry => entry.id === affected.orderId)
          if (!order) continue

          const nextTotal = Math.max(0, (Number(order.total_price) || 0) - affected.removedAmount)
          const { error: updateError } = await supabase
            .from('orders')
            .update({ total_price: nextTotal })
            .eq('id', affected.orderId)

          if (updateError) throw updateError

          order.total_price = nextTotal
        }

        return { success: true, affectedOrders: affectedOrders.length, setName }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting set with orders:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Removes the product from orders that list it directly (lowering those order
    // totals) and from set compositions, where the set price is left untouched.
    async deleteProductWithOrders(productId) {
      this.loading = true
      this.error = null

      try {
        const { direct, viaSets } = this.getOrdersWithProduct(productId)
        let removedAmount = 0
        let removedItems = 0

        for (const affected of direct) {
          const items = this.getOrderItems(affected.orderId).filter(item =>
            item.product_id != null && String(item.product_id) === String(productId)
          )

          for (const item of items) {
            const { error: deleteError } = await supabase
              .from('order_items')
              .delete()
              .eq('id', item.id)

            if (deleteError) throw deleteError

            this.orderItems = this.orderItems.filter(entry => entry.id !== item.id)
            removedAmount += ((Number(item.unit_price) || 0) * (Number(item.quantity) || 0))
            removedItems += 1
          }

          const order = this.orders.find(entry => entry.id === affected.orderId)
          if (!order) continue

          const nextTotal = Math.max(0, (Number(order.total_price) || 0) - removedAmount)
          const { error: updateError } = await supabase
            .from('orders')
            .update({ total_price: nextTotal })
            .eq('id', affected.orderId)

          if (updateError) throw updateError

          order.total_price = nextTotal
        }

        // Orders keep their set; only the composition changes, so no totals move here.
        const productSetsStore = useProductSetsStore()
        const setItemDeletes = productSetsStore.setItems.filter(setItem =>
          String(setItem.product_id) === String(productId)
        )

        for (const setItem of setItemDeletes) {
          const { error: deleteError } = await supabase
            .from('set_items')
            .delete()
            .eq('id', setItem.id)

          if (deleteError) throw deleteError
        }

        const removedSetItemIds = new Set(setItemDeletes.map(setItem => setItem.id))
        productSetsStore.setItems = productSetsStore.setItems.filter(
          setItem => !removedSetItemIds.has(setItem.id)
        )

        return { success: true, affectedOrders: direct.length, setOrders: viaSets.length, removedItems }
      } catch (error) {
        this.error = error.message
        console.error('Error deleting product with orders:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
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
      // Callers may pass a raw product id, a "product-<id>" production key, or a
      // "set-<id>" fallback, so normalise before comparing against raw columns.
      const rawProductId = String(productId).replace(/^product-/, '')
      const isSetFallback = String(productId).startsWith('set-')
      const targetSetId = isSetFallback ? String(productId).slice(4) : null

      const addProductOrder = (order, productName, quantity, setName = null) => {
        const existing = productOrders[order.id]
        if (existing) {
          existing.quantity += quantity
          return
        }

        productOrders[order.id] = {
          orderId: order.id,
          clientName: order.client_name,
          productName,
          quantity,
          setName
        }
      }

      this.orders.forEach(order => {
        this.getOrderItems(order.id).forEach(item => {
          if (item.product_id != null && String(item.product_id) === rawProductId && item.products) {
            addProductOrder(order, item.products.name, item.quantity, null)
            return
          }

          if (!item.set_id || !item.product_sets) return
          const setItems = productSetsStore.getSetItems(item.set_id)
          setItems.forEach(setItem => {
            const matchesProduct = setItem.product_id != null && String(setItem.product_id) === rawProductId && setItem.products
            const matchesFallbackSet = isSetFallback && String(item.set_id) === targetSetId
            if (matchesProduct || matchesFallbackSet) {
              addProductOrder(
                order,
                setItem.products?.name || item.product_sets.name,
                matchesProduct ? setItem.quantity * item.quantity : item.quantity,
                matchesProduct ? item.product_sets.name : null
              )
            }
          })
        })
      })

      return Object.values(productOrders)
    }
  }
})
