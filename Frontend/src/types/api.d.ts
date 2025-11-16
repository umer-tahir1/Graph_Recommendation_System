export interface Product {
  id: number
  name: string
  category?: string | null
  description?: string | null
  price?: number | null
  image_url?: string | null
  imageUrl?: string | null
  inventory?: number | null
}

export interface GraphRecommendationEdge {
  source: number
  target: number
  weight: number
}

export interface GraphRecommendationPathEntry {
  distance: number | null
  path: number[]
}

export interface GraphRecommendationItem {
  id: number
  name: string
  category?: string | null
  price?: number | null
  score: number
  distance?: number | null
  path?: number[] | null
  edges?: GraphRecommendationEdge[]
}

export interface GraphRecommendationContext {
  totals?: {
    products?: number
    edges?: number
    interactions?: number
  }
  generated_edges?: number
  popularity_leaders?: Array<{ id: number; name: string; score?: number }>
  seed_product?: Product
  paths?: Record<string, GraphRecommendationPathEntry>
}

export interface GraphRecommendationResponse {
  product_id: number
  user_id?: string | null
  requested_k: number
  generated_at: string
  recommendations: GraphRecommendationItem[]
  context?: GraphRecommendationContext
}

export interface InteractionInput {
  productId?: number
  product_id?: number
  userId?: string | number | null
  user_id?: string | number | null
  action?: 'view' | 'like' | 'add_to_cart' | 'review' | 'click'
  interaction_type?: string
  metadata?: Record<string, unknown>
  weight?: number
}

export interface InteractionAck {
  status: string
  interaction_id: number
  product_id: number
  user_id: number
  action: string
  next_recommendations?: GraphRecommendationItem[]
}
