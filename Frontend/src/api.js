// Import axios for making HTTP requests
import axios from 'axios'

// Initialize API base URL from environment variable or use localhost default
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Fetch all available products from the backend
export async function fetchProducts(){
  // Make GET request to retrieve all products
  const r = await axios.get(`${API}/products`)
  return r.data
}

// Fetch all available users from the backend
export async function fetchUsers(){
  // Make GET request to retrieve all users
  const r = await axios.get(`${API}/users`)
  return r.data
}

// Fetch personalized product recommendations for a specific user
// Parameters: userId - target user ID, k - number of recommendations (default 10)
export async function fetchRecommendations(userId, k=10){
  // Make GET request to fetch recommendations based on user ID and count
  const r = await axios.get(`${API}/recommend/${userId}?k=${k}`)
  return r.data.recommendations
}

// Record a user-product interaction (e.g., purchase, view, rating)
// Creates a rating of 1 to indicate positive interaction
export async function createInteraction(userId, productId){
  // Make POST request to record user interaction with product
  const r = await axios.post(`${API}/interactions`, {user_id: userId, product_id: productId, rating: 1})
  return r.data
}
