import axios from 'axios'

/** @typedef {import('@/types/api').Product} Product */
/** @typedef {import('@/types/api').GraphRecommendationResponse} GraphRecommendationResponse */
/** @typedef {import('@/types/api').InteractionAck} InteractionAck */

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

let authToken = null

export function setApiAuthToken(token){
  authToken = token ? `Bearer ${token}` : null
}

const client = axios.create({ baseURL: API })

client.interceptors.request.use((config) => {
  if (authToken) {
    const headers = /** @type {import('axios').AxiosRequestHeaders} */ (config.headers ?? {})
    headers.Authorization = authToken
    config.headers = headers
  }
  return config
})

/**
 * @template T
 * @param {string} url
 * @param {import('axios').AxiosRequestConfig} [config]
 * @returns {Promise<T>}
 */
const get = (url, config) => client.get(url, config).then((r) => r.data)

/**
 * @template T
 * @param {string} url
 * @param {any} data
 * @returns {Promise<T>}
 */
const post = (url, data) => client.post(url, data).then((r) => r.data)

/**
 * @template T
 * @param {string} url
 * @param {any} data
 * @returns {Promise<T>}
 */
const put = (url, data) => client.put(url, data).then((r) => r.data)

const cleanParams = (params = {}) => {
  const filtered = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      filtered[key] = value
    }
  })
  return filtered
}

/**
 * @param {string} [category]
 * @param {string} [search]
 * @returns {Promise<Product[]>}
 */
export function fetchProducts(category, search){
  const params = {}
  if (category) params.category = category
  if (search) params.q = search
  return get('/products', { params })
}

export function fetchProduct(productId){
  return get(`/products/${productId}`)
}

export function fetchCategories(){
  return get('/categories')
}

export function fetchUsers(){
  return get('/users')
}

export function fetchRecommendations(userId, k=10){
  return get(`/recommend/${userId}`, { params: { k } }).then((data) => data.recommendations)
}

export function fetchProductGraph(productId){
  return get(`/products/${productId}/graph`)
}

export function fetchProductReviews(productId){
  return get(`/products/${productId}/reviews`)
}

export function createReview(review){
  return post('/reviews', review)
}

export function addToCart(item){
  return post('/cart', item)
}

export function fetchCart(userId){
  return get(`/cart/${userId}`)
}

export function removeCartItem(itemId){
  return client.delete(`/cart/${itemId}`)
}

/**
 * @param {Partial<import('@/types/api').InteractionInput>} [payload]
 * @returns {Promise<InteractionAck>}
 */
export function createInteraction(payload = {}){
  if (!payload.productId && !payload.product_id) {
    throw new Error('productId is required to create an interaction')
  }
  const body = {
    product_id: payload.productId ?? payload.product_id,
    user_id: payload.userId ?? payload.user_id,
    action: payload.action ?? payload.interaction_type,
    metadata: payload.metadata,
    weight: payload.weight,
  }
  if (!body.action) {
    body.action = payload.interaction_type || 'view'
  }
  return post('/interactions', body)
}

export function adminCreateProduct(product){
  return post('/admin/products', product)
}

export function adminUpdateProduct(id, product){
  return put(`/admin/products/${id}`, product)
}

export function adminDeleteProduct(id){
  return client.delete(`/admin/products/${id}`)
}

export function adminCreateCategory(category){
  return post('/admin/categories', category)
}

export function adminDeleteCategory(id){
  return client.delete(`/admin/categories/${id}`)
}

export function adminReorderCategories(ids){
  return put('/admin/categories/order', { ids })
}

export function fetchAdminInteractions(limit=200){
  return get('/admin/interactions', { params: { limit } })
}

export function fetchAdminGraphExport(){
  return get('/admin/graph/export')
}

export function fetchAdminUsers(){
  return get('/admin/users')
}

export function updateAdminUser(userId, payload){
  return put(`/admin/users/${userId}`, payload)
}

export function deleteAdminUser(userId){
  return client.delete(`/admin/users/${userId}`)
}

export function fetchAdminAuditLogs(params={}){
  return get('/admin/audit', { params: cleanParams(params) })
}

export function emitClientAuditLog(entry){
  return post('/admin/audit', entry)
}

/**
 * @param {{
 *  productId?: number | null,
 *  userId?: string | null,
 *  limit?: number,
 *  debug?: boolean
 * }} [options]
 * @returns {Promise<GraphRecommendationResponse>}
 */
export function fetchGraphRecommendations({ productId, userId, limit = 5, debug = false } = {}){
  const params = cleanParams({
    product_id: productId,
    user_id: userId,
    k: limit,
    debug,
  })
  return get('/graph/recommendations', { params })
}
