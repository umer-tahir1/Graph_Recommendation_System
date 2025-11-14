import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchProducts(){
  const r = await axios.get(`${API}/products`)
  return r.data
}

export async function fetchUsers(){
  const r = await axios.get(`${API}/users`)
  return r.data
}

export async function fetchRecommendations(userId, k=10){
  const r = await axios.get(`${API}/recommend/${userId}?k=${k}`)
  return r.data.recommendations
}

export async function createInteraction(userId, productId){
  const r = await axios.post(`${API}/interactions`, {user_id: userId, product_id: productId, rating: 1})
  return r.data
}
