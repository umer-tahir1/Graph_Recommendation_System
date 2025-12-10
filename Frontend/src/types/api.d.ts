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

export interface CartItem {
  id: number
  user_id: number
  product_id: number
  quantity: number
  product_name?: string | null
  price?: number | null
  image_url?: string | null
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

export interface EmailPreferenceResponse {
  email_opt_in: boolean
}

export interface MarketingEmailRequestPayload {
  subject: string
  content: string
  user_ids?: number[] | null
}

export interface MarketingEmailResponse {
  status: string
  summary: Record<string, number>
}

export interface RecommendationEmailRequestPayload {
  user_ids?: number[] | null
  limit?: number
}

export interface RecommendationEmailResponse {
  status: string
  summary: Record<string, number>
}

export interface Review {
  id: number
  user_id: number
  product_id: number
  rating: number
  comment: string
  created_at?: string | null
}

export interface GraphNode {
  id: string
  label: string
  group: string
  value?: number | null
  meta?: Record<string, unknown> | null
}

export interface GraphEdge {
  id: string
  from: string
  to: string
  weight: number
  label?: string | null
}

export interface ProductGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface ProductSizeInfo {
  size: string
  quantity: number
}

export interface ProductReviewSummary {
  average_rating: number
  total_reviews: number
}

export interface ProductInteractionSummary {
  total: number
  views: number
  likes: number
  adds: number
  last_interaction_at?: string | null
}

export interface CategoryProductSummary extends Product {
  average_rating: number
  total_reviews: number
  total_interactions: number
}

export interface CategoryListingResponse {
  category: string
  products: CategoryProductSummary[]
}

export interface ProductDetailPayload {
  product: Product
  sizes: ProductSizeInfo[]
  review_summary: ProductReviewSummary
  reviews: Review[]
  interaction_summary: ProductInteractionSummary
  graph?: ProductGraph | null
}

export interface ProductReservationRequest {
  quantity: number
  size?: string | null
}

export interface ProductReservationResponse {
  status: string
  inventory: number
  sizes: ProductSizeInfo[]
  updated_size?: ProductSizeInfo | null
}

export interface UserCategorySummary {
  id?: number
  name: string
  slug: string
  position?: number | null
  product_count: number
  hero_image?: string | null
}
