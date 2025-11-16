from typing import Optional, List, Literal, Dict, Any
from pydantic import BaseModel, Field


class User(BaseModel):
    id: Optional[int] = None
    name: str


class Category(BaseModel):
    id: Optional[int] = None
    name: str
    position: Optional[int] = None


class Product(BaseModel):
    id: Optional[int] = None
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    inventory: Optional[int] = None


class Review(BaseModel):
    id: Optional[int] = None
    user_id: int
    product_id: int
    rating: int = Field(ge=1, le=5)
    comment: str
    created_at: Optional[str] = None


class CartItem(BaseModel):
    id: Optional[int] = None
    user_id: int
    product_id: int
    quantity: int = Field(ge=1)
    product_name: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None


class Interaction(BaseModel):
    id: Optional[int] = None
    user_id: int
    product_id: int
    interaction_type: Literal['view', 'click', 'add_to_cart', 'review', 'like'] = 'view'
    weight: float = 1.0
    rating: Optional[int] = 1


class InteractionEvent(BaseModel):
    user_id: Optional[str] = None
    product_id: int
    action: Optional[Literal['view', 'like', 'add_to_cart']] = None
    interaction_type: Optional[Literal['view', 'click', 'add_to_cart', 'review', 'like']] = None
    metadata: Optional[Dict[str, Any]] = None
    weight: Optional[float] = None


class InteractionAck(BaseModel):
    status: str
    interaction_id: int
    product_id: int
    user_id: int
    action: str
    next_recommendations: Optional[List[Dict[str, Any]]] = None


class GraphNode(BaseModel):
    id: str
    label: str
    group: str
    value: Optional[float] = None
    meta: Optional[dict] = None


class GraphEdge(BaseModel):
    id: str
    from_node: str = Field(alias='from')
    to_node: str = Field(alias='to')
    weight: float
    label: Optional[str] = None


class ProductGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class CategoryOrder(BaseModel):
    ids: List[int]


class InteractionRecord(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str]
    product_id: int
    product_name: Optional[str]
    category: Optional[str] = None
    interaction_type: str
    weight: float
    metadata: Optional[str] = None
    timestamp: str


class ProductInteractionStat(BaseModel):
    product_id: int
    product_name: str
    category: Optional[str]
    interactions: int
    weight_sum: float


class GraphTotals(BaseModel):
    users: int
    products: int
    interactions: int


class GraphAnalytics(BaseModel):
    totals: GraphTotals
    top_products: List[ProductInteractionStat]
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class GraphRecommendationPath(BaseModel):
    source: int
    target: int
    weight: float


class GraphRecommendationItem(BaseModel):
    id: int
    name: str
    category: Optional[str]
    price: Optional[float]
    score: float
    distance: Optional[float] = None
    path: Optional[List[int]] = None
    edges: Optional[List[GraphRecommendationPath]] = None


class GraphRecommendationResponse(BaseModel):
    product_id: int
    user_id: str
    requested_k: int
    generated_at: str
    recommendations: List[GraphRecommendationItem]
    context: Optional[Dict[str, Any]] = None


class SupabaseUser(BaseModel):
    id: str
    email: Optional[str]
    role: Optional[str] = None
    status: Optional[str] = None
    last_sign_in_at: Optional[str] = None
    banned_until: Optional[str] = None
    app_metadata: Dict[str, Any] = Field(default_factory=dict)
    user_metadata: Dict[str, Any] = Field(default_factory=dict)


class SupabaseUserUpdate(BaseModel):
    role: Optional[str] = None
    disabled: Optional[bool] = None


class AdminAuditLog(BaseModel):
    id: int
    admin_id: str
    admin_email: Optional[str]
    action: str
    target_type: Optional[str]
    target_id: Optional[str]
    target_display: Optional[str]
    before_state: Optional[Any] = None
    after_state: Optional[Any] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: str


class AdminAuditLogPage(BaseModel):
    items: List[AdminAuditLog]
    page: int
    per_page: int
    total: int


class AdminAuditLogCreate(BaseModel):
    action: str
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    target_display: Optional[str] = None
    before_state: Optional[Any] = None
    after_state: Optional[Any] = None
    metadata: Optional[Dict[str, Any]] = None
