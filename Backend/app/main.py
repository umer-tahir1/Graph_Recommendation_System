import json
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware

from . import crud, recommender, db_init, supabase_admin
from .auth import AdminAuthContext, UserAuthContext, require_admin, require_user, admin_error, ensure_not_self
from .audit import emit_audit_event, emit_user_audit_event
from .models import (
    User,
    Product,
    Interaction,
    InteractionEvent,
    InteractionAck,
    Category,
    Review,
    CartItem,
    ProductGraph,
    GraphNode,
    GraphEdge,
    CategoryOrder,
    InteractionRecord,
    GraphAnalytics,
    GraphTotals,
    ProductInteractionStat,
    SupabaseUser,
    SupabaseUserUpdate,
    AdminAuditLog,
    AdminAuditLogPage,
    AdminAuditLogCreate,
    GraphRecommendationResponse,
    GraphRecommendationItem,
    GraphRecommendationPath,
)
from .product_graph import ProductGraph as WeightedProductGraph, Product as WeightedProduct


app = FastAPI(title='Graph-Based Recommendation API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Ensure DB exists
db_init.init_db()

ACTION_WEIGHTS: Dict[str, float] = {
    'view': 1.0,
    'like': 1.4,
    'add_to_cart': 1.8,
}

LEGACY_ACTION_MAP = {
    'click': 'view',
    'review': 'view',
}


def _category_not_found(category_id: int):
    admin_error(status.HTTP_404_NOT_FOUND, 'category.not_found', 'Category not found', details={'id': category_id})


def _product_not_found(product_id: int):
    admin_error(status.HTTP_404_NOT_FOUND, 'product.not_found', 'Product not found', details={'id': product_id})


def _preferred_display_name(user_ctx: UserAuthContext) -> str:
    meta = user_ctx.profile.get('user_metadata') if isinstance(user_ctx.profile, dict) else {}
    full_name = (meta or {}).get('full_name')
    return full_name or user_ctx.email or f'User {user_ctx.user_id[:8]}'


def _resolve_internal_user(user_ctx: UserAuthContext, requested_user_id: Optional[str]) -> Dict[str, Any]:
    if not requested_user_id or requested_user_id == user_ctx.user_id:
        return crud.ensure_user_from_external(user_ctx.user_id, fallback_name=_preferred_display_name(user_ctx))

    numeric_id: Optional[int] = None
    try:
        numeric_id = int(requested_user_id)
    except (TypeError, ValueError):
        numeric_id = None

    if numeric_id is not None:
        existing = crud.get_user(numeric_id)
        if existing:
            return existing
        admin_error(status.HTTP_404_NOT_FOUND, 'user.not_found', 'Referenced user does not exist', details={'id': numeric_id})

    if requested_user_id != user_ctx.user_id and not user_ctx.has_role('admin'):
        admin_error(
            status.HTTP_403_FORBIDDEN,
            'auth.forbidden',
            'Cannot act on behalf of another user',
            details={'requested_user_id': requested_user_id}
        )

    return crud.ensure_user_from_external(requested_user_id, fallback_name=_preferred_display_name(user_ctx))


def _build_weighted_graph() -> Tuple[WeightedProductGraph, Dict[int, float], Dict[str, Any]]:
    products = crud.list_products()
    if not products:
        raise HTTPException(status_code=404, detail='No products available')

    weighted_products = [
        WeightedProduct(
            id=row['id'],
            name=row['name'],
            category=row.get('category') or 'Uncategorized',
            price=float(row.get('price') or 0.0),
        )
        for row in products
    ]
    graph = WeightedProductGraph(weighted_products)

    interactions = crud.list_interactions_for_graph()
    user_product_weights: Dict[int, Dict[int, float]] = defaultdict(dict)
    popularity: Dict[int, float] = defaultdict(float)

    for row in interactions:
        uid = row['user_id']
        pid = row['product_id']
        weight = float(row.get('weight') or 1.0)
        current = user_product_weights[uid].get(pid, 0.0)
        if weight > current:
            user_product_weights[uid][pid] = weight
        popularity[pid] += weight

    edge_strength: Dict[Tuple[int, int], float] = defaultdict(float)
    for product_weights in user_product_weights.values():
        items = sorted(product_weights.items())
        for idx in range(len(items)):
            left_id, left_weight = items[idx]
            for jdx in range(idx + 1, len(items)):
                right_id, right_weight = items[jdx]
                contribution = (left_weight + right_weight) / 2.0
                edge_strength[(left_id, right_id)] += contribution

    for (left_id, right_id), strength in edge_strength.items():
        if left_id == right_id:
            continue
        cost = max(0.05, 1.0 / strength) if strength > 0 else 1.5
        try:
            graph.add_edge(left_id, right_id, cost)
        except ValueError:
            # One of the products might have been deleted between queries
            continue

    stats = {
        'interaction_count': len(interactions),
        'edge_count': len(edge_strength),
    }

    return graph, dict(popularity), stats


def _fallback_recommendations(
    graph: WeightedProductGraph,
    seed_product_id: int,
    popularity: Dict[int, float],
    limit: int,
) -> List[Tuple[WeightedProduct, float]]:
    candidates = [product for product in graph.products() if product.id != seed_product_id]
    candidates.sort(key=lambda prod: (popularity.get(prod.id, 0.0), prod.price or 0.0), reverse=True)
    sliced = candidates[:limit]
    return [(product, popularity.get(product.id, 0.1) or 0.1) for product in sliced]


def _build_recommendation_items(
    graph: WeightedProductGraph,
    recommendations: List[Tuple[WeightedProduct, float]],
    shortest_paths: Dict[int, Tuple[float, List[int]]],
    *,
    include_paths: bool,
    include_edges: bool,
) -> List[GraphRecommendationItem]:
    items: List[GraphRecommendationItem] = []
    for product, score in recommendations:
        path_entry = shortest_paths.get(product.id)
        distance = path_entry[0] if path_entry else None
        path_nodes = path_entry[1] if path_entry else None
        edges_payload: Optional[List[GraphRecommendationPath]] = None
        if include_edges and path_nodes and len(path_nodes) > 1:
            edges_payload = [
                GraphRecommendationPath(source=src, target=dst, weight=graph.neighbors(src).get(dst, 0.0))
                for src, dst in zip(path_nodes, path_nodes[1:])
            ]
        items.append(
            GraphRecommendationItem(
                id=product.id,
                name=product.name,
                category=product.category,
                price=product.price,
                score=round(float(score), 6),
                distance=distance,
                path=path_nodes if include_paths and path_nodes else None,
                edges=edges_payload,
            )
        )
    return items


def _graph_context(
    graph: WeightedProductGraph,
    stats: Dict[str, Any],
    popularity: Dict[int, float],
    seed_product_id: int,
    include_paths: bool,
    shortest_paths: Dict[int, Tuple[float, List[int]]],
) -> Dict[str, Any]:
    product_list = list(graph.products())
    total_edges = sum(len(graph.neighbors(product.id)) for product in product_list) // 2
    popularity_leaders = [
        {
            'id': product.id,
            'name': product.name,
            'score': popularity.get(product.id, 0.0),
        }
        for product in sorted(product_list, key=lambda prod: popularity.get(prod.id, 0.0), reverse=True)[:5]
    ]
    try:
        seed_product = graph.product(seed_product_id)
    except KeyError:
        seed_product = WeightedProduct(id=seed_product_id, name=f'Product {seed_product_id}', category='Unknown', price=0.0)

    context: Dict[str, Any] = {
        'totals': {
            'products': len(product_list),
            'edges': total_edges,
            'interactions': stats.get('interaction_count', 0),
        },
        'generated_edges': stats.get('edge_count', 0),
        'popularity_leaders': popularity_leaders,
        'seed_product': {
            'id': seed_product.id,
            'name': seed_product.name,
            'category': seed_product.category,
            'price': seed_product.price,
        },
    }

    if include_paths:
        context['paths'] = {
            str(pid): {'distance': dist, 'path': nodes}
            for pid, (dist, nodes) in shortest_paths.items()
            if pid != seed_product_id
        }

    return context


def _generate_recommendation_payload(
    seed_product_id: int,
    *,
    limit: int,
    include_paths: bool = False,
    include_edges: bool = False,
) -> Tuple[List[GraphRecommendationItem], Dict[str, Any]]:
    product = crud.get_product(seed_product_id)
    if not product:
        _product_not_found(seed_product_id)

    graph, popularity, stats = _build_weighted_graph()
    shortest_paths = graph.dijkstra(seed_product_id)
    scored = graph.recommend_top_k(seed_product=seed_product_id, k=limit, popularity=popularity)
    if not scored:
        scored = _fallback_recommendations(graph, seed_product_id, popularity, limit)

    items = _build_recommendation_items(
        graph,
        scored,
        shortest_paths,
        include_paths=include_paths,
        include_edges=include_edges,
    )
    context = _graph_context(graph, stats, popularity, seed_product_id, include_paths, shortest_paths)
    return items, context


# -------------------- Users -------------------- #

@app.post('/users', response_model=User)
def create_user(u: User):
    uid = crud.add_user(u.name)
    u.id = uid
    return u


@app.get('/users', response_model=List[User])
def get_users():
    return [User(**r) for r in crud.list_users()]


# -------------------- Categories -------------------- #

@app.get('/categories', response_model=List[Category])
def get_categories():
    return [Category(**row) for row in crud.list_categories()]


@app.post('/admin/categories', response_model=Category)
def create_category(cat: Category, admin: AdminAuthContext = Depends(require_admin)):
    cat.id = crud.upsert_category(cat.name, cat.id, cat.position)
    emit_audit_event(
        admin,
        action='category.create',
        target_type='category',
        target_id=str(cat.id),
        target_display=cat.name,
        after=cat,
    )
    return cat


@app.delete('/admin/categories/{category_id}')
def remove_category(category_id: int, admin: AdminAuthContext = Depends(require_admin)):
    existing = crud.get_category(category_id)
    if not existing:
        _category_not_found(category_id)
    crud.delete_category(category_id)
    emit_audit_event(
        admin,
        action='category.delete',
        target_type='category',
        target_id=str(category_id),
        target_display=existing['name'],
        before=existing,
    )
    return {'status': 'ok'}


@app.put('/admin/categories/order', response_model=List[Category])
def reorder_categories(payload: CategoryOrder, admin: AdminAuthContext = Depends(require_admin)):
    before = crud.list_categories()
    crud.reorder_categories(payload.ids)
    after = [Category(**row) for row in crud.list_categories()]
    emit_audit_event(
        admin,
        action='category.reorder',
        target_type='category',
        metadata={'order': payload.ids},
        before=before,
        after=[cat.model_dump() for cat in after],
    )
    return after


# -------------------- Products -------------------- #

@app.get('/products', response_model=List[Product])
def get_products(category: Optional[str] = Query(default=None), search: Optional[str] = Query(default=None, alias='q')):
    rows = crud.list_products(category=category, search=search)
    return [Product(**row) for row in rows]


@app.get('/products/{product_id}', response_model=Product)
def get_product(product_id: int):
    product = crud.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    return Product(**product)


@app.post('/admin/products', response_model=Product)
def create_product(p: Product, admin: AdminAuthContext = Depends(require_admin)):
    payload = p.model_dump()
    pid = crud.add_product(payload)
    payload['id'] = pid
    product = Product(**payload)
    emit_audit_event(
        admin,
        action='product.create',
        target_type='product',
        target_id=str(pid),
        target_display=payload.get('name'),
        after=product,
    )
    return product


@app.put('/admin/products/{product_id}', response_model=Product)
def update_product(product_id: int, p: Product, admin: AdminAuthContext = Depends(require_admin)):
    before = crud.get_product(product_id)
    if not before:
        _product_not_found(product_id)
    crud.update_product(product_id, p.model_dump())
    updated = crud.get_product(product_id)
    product = Product(**updated)
    emit_audit_event(
        admin,
        action='product.update',
        target_type='product',
        target_id=str(product_id),
        target_display=product.name,
        before=before,
        after=product,
    )
    return product


@app.delete('/admin/products/{product_id}')
def remove_product(product_id: int, admin: AdminAuthContext = Depends(require_admin)):
    before = crud.get_product(product_id)
    if not before:
        _product_not_found(product_id)
    crud.delete_product(product_id)
    emit_audit_event(
        admin,
        action='product.delete',
        target_type='product',
        target_id=str(product_id),
        target_display=before.get('name'),
        before=before,
    )
    return {'status': 'ok'}


# -------------------- Admin: Interactions & Graphs -------------------- #

@app.get('/admin/interactions', response_model=List[InteractionRecord])
def admin_interactions(limit: int = Query(default=200, ge=10, le=1000), admin: AdminAuthContext = Depends(require_admin)):
    interactions = [InteractionRecord(**row) for row in crud.list_interactions_detailed(limit=limit)]
    emit_audit_event(
        admin,
        action='interaction.list',
        target_type='interaction',
        metadata={'limit': limit, 'returned': len(interactions)},
    )
    return interactions


@app.get('/admin/graph/export', response_model=GraphAnalytics)
def admin_graph_export(admin: AdminAuthContext = Depends(require_admin)):
    snapshot = crud.graph_export_snapshot()
    totals = GraphTotals(**snapshot['totals'])
    top_products = [ProductInteractionStat(**row) for row in snapshot['top_products']]
    nodes = [GraphNode(**node) for node in snapshot['nodes']]
    edges = [GraphEdge(**edge) for edge in snapshot['edges']]
    emit_audit_event(
        admin,
        action='graph.export',
        target_type='graph',
        metadata={'nodes': len(nodes), 'edges': len(edges)},
    )
    return GraphAnalytics(totals=totals, top_products=top_products, nodes=nodes, edges=edges)


@app.get('/admin/users', response_model=List[SupabaseUser])
def admin_list_users(admin: AdminAuthContext = Depends(require_admin)):
    users = supabase_admin.paged_user_list()
    emit_audit_event(
        admin,
        action='user.list',
        target_type='user',
        metadata={'returned': len(users)},
    )
    return [SupabaseUser(**user) for user in users]


@app.put('/admin/users/{user_id}', response_model=SupabaseUser)
def admin_update_user(user_id: str, payload: SupabaseUserUpdate, admin: AdminAuthContext = Depends(require_admin)):
    if payload.disabled:
        ensure_not_self('disable', admin, user_id)
    try:
        before_raw = supabase_admin.get_user(user_id)
    except ValueError as exc:
        admin_error(status.HTTP_404_NOT_FOUND, 'user.not_found', 'Supabase user not found', details={'id': user_id})
    except RuntimeError as exc:
        admin_error(status.HTTP_502_BAD_GATEWAY, 'supabase.error', str(exc))

    before = supabase_admin.serialize_user(before_raw)
    try:
        updated = supabase_admin.update_user(user_id, role=payload.role, disabled=payload.disabled)
    except ValueError as exc:
        admin_error(status.HTTP_400_BAD_REQUEST, 'user.update_failed', str(exc))
    after = supabase_admin.serialize_user(updated)
    emit_audit_event(
        admin,
        action='user.update',
        target_type='user',
        target_id=user_id,
        target_display=after.get('email'),
        before=before,
        after=after,
        metadata={'role': payload.role, 'disabled': payload.disabled},
    )
    return SupabaseUser(**after)


@app.delete('/admin/users/{user_id}')
def admin_remove_user(user_id: str, admin: AdminAuthContext = Depends(require_admin)):
    ensure_not_self('delete', admin, user_id)
    try:
        before_raw = supabase_admin.get_user(user_id)
    except ValueError:
        admin_error(status.HTTP_404_NOT_FOUND, 'user.not_found', 'Supabase user not found', details={'id': user_id})
    except RuntimeError as exc:
        admin_error(status.HTTP_502_BAD_GATEWAY, 'supabase.error', str(exc))

    before = supabase_admin.serialize_user(before_raw)
    try:
        supabase_admin.delete_user(user_id)
    except ValueError as exc:
        admin_error(status.HTTP_400_BAD_REQUEST, 'user.delete_failed', str(exc))

    emit_audit_event(
        admin,
        action='user.delete',
        target_type='user',
        target_id=user_id,
        target_display=before.get('email'),
        before=before,
    )
    return {'status': 'ok'}


@app.post('/admin/audit', response_model=AdminAuditLog, status_code=status.HTTP_201_CREATED)
def admin_create_audit_log(payload: AdminAuditLogCreate, admin: AdminAuthContext = Depends(require_admin)):
    log_id = emit_audit_event(
        admin,
        action=payload.action,
        target_type=payload.target_type,
        target_id=payload.target_id,
        target_display=payload.target_display,
        before=payload.before_state,
        after=payload.after_state,
        metadata=payload.metadata,
    )
    record = crud.get_admin_audit_log(log_id)
    if not record:
        admin_error(status.HTTP_500_INTERNAL_SERVER_ERROR, 'audit.write_failed', 'Failed to persist audit entry')
    return AdminAuditLog(**record)


@app.get('/admin/audit', response_model=AdminAuditLogPage)
def admin_list_audit_logs(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=200),
    action: Optional[str] = Query(default=None),
    target_type: Optional[str] = Query(default=None),
    admin_id: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    start: Optional[str] = Query(default=None, description='ISO8601 lower bound'),
    end: Optional[str] = Query(default=None, description='ISO8601 upper bound'),
    admin: AdminAuthContext = Depends(require_admin),
):
    items, total = crud.list_admin_audit_logs(
        page,
        per_page,
        action=action,
        target_type=target_type,
        admin_id=admin_id,
        search=search,
        start_date=start,
        end_date=end,
    )
    return AdminAuditLogPage(
        items=[AdminAuditLog(**item) for item in items],
        page=page,
        per_page=per_page,
        total=total,
    )


# -------------------- Reviews -------------------- #

@app.post('/reviews', response_model=Review)
def create_review(review: Review):
    if not crud.get_product(review.product_id):
        raise HTTPException(status_code=404, detail='Product not found')
    rid = crud.add_review(review.user_id, review.product_id, review.rating, review.comment)
    review.id = rid
    return review


@app.get('/products/{product_id}/reviews', response_model=List[Review])
def product_reviews(product_id: int):
    return [Review(**row) for row in crud.list_reviews(product_id)]


# -------------------- Cart -------------------- #

@app.post('/cart', response_model=CartItem)
def add_to_cart(item: CartItem):
    cid = crud.add_cart_item(item.user_id, item.product_id, item.quantity)
    item.id = cid
    return item


@app.get('/cart/{user_id}', response_model=List[CartItem])
def get_cart(user_id: int):
    rows = crud.list_cart_items(user_id)
    return [CartItem(**row) for row in rows]


@app.delete('/cart/{item_id}')
def remove_cart_item(item_id: int):
    crud.delete_cart_item(item_id)
    return {'status': 'ok'}


# -------------------- Interactions & Recommendations -------------------- #


@app.get('/graph/recommendations', response_model=GraphRecommendationResponse)
def graph_recommendations(
    product_id: int = Query(..., description='Seed product id'),
    user_id: Optional[str] = Query(default=None, description='Optional user identifier'),
    k: int = Query(default=5, ge=1, le=25),
    debug: bool = Query(default=False, description='Include path + edge diagnostics (admin only)'),
    user_ctx: UserAuthContext = Depends(require_user),
):
    if user_id and user_id != user_ctx.user_id and not user_ctx.has_role('admin'):
        admin_error(
            status.HTTP_403_FORBIDDEN,
            'auth.forbidden',
            'Cannot inspect another user’s recommendations',
            details={'user_id': user_id},
        )

    if debug and not user_ctx.has_role('admin'):
        admin_error(status.HTTP_403_FORBIDDEN, 'auth.forbidden', 'Debug view restricted to admins')

    items, context = _generate_recommendation_payload(
        product_id,
        limit=k,
        include_paths=debug,
        include_edges=debug,
    )
    timestamp = datetime.utcnow().replace(microsecond=0).isoformat() + 'Z'
    return GraphRecommendationResponse(
        product_id=product_id,
        user_id=user_ctx.user_id,
        requested_k=k,
        generated_at=timestamp,
        recommendations=items,
        context=context,
    )

@app.post('/interactions', response_model=Interaction)
@app.post('/interactions', response_model=InteractionAck)
def create_interaction(event: InteractionEvent, user_ctx: UserAuthContext = Depends(require_user)):
    resolved_action = event.action or event.interaction_type or 'view'
    resolved_action = LEGACY_ACTION_MAP.get(resolved_action, resolved_action)
    if resolved_action not in ACTION_WEIGHTS:
        resolved_action = 'view'

    internal_user = _resolve_internal_user(user_ctx, event.user_id)
    product = crud.get_product(event.product_id)
    if not product:
        _product_not_found(event.product_id)

    base_weight = ACTION_WEIGHTS[resolved_action]
    weight = float(event.weight or base_weight)
    rating = 5 if resolved_action in {'like', 'add_to_cart'} else 1

    metadata_payload = {
        'source': 'api.interactions',
        'actor_external_id': user_ctx.user_id,
        'actor_email': user_ctx.email,
        'action': resolved_action,
        'legacy_interaction_type': event.interaction_type,
    }
    if event.metadata:
        metadata_payload.update(event.metadata)

    try:
        metadata_json = json.dumps(metadata_payload)
    except (TypeError, ValueError):
        metadata_json = json.dumps({'raw': str(metadata_payload)})

    interaction_id = crud.add_interaction(
        internal_user['id'],
        event.product_id,
        resolved_action,
        weight,
        rating,
        metadata_json,
    )

    emit_user_audit_event(
        user_ctx,
        action=f'interaction.{resolved_action}',
        target_type='product',
        target_id=str(event.product_id),
        target_display=product.get('name'),
        metadata={
            'interaction_id': interaction_id,
            'impersonated_user_id': event.user_id,
        },
    )

    recommendations, _context = _generate_recommendation_payload(
        event.product_id,
        limit=3,
        include_paths=False,
        include_edges=False,
    )

    return InteractionAck(
        status='ok',
        interaction_id=interaction_id,
        product_id=event.product_id,
        user_id=internal_user['id'],
        action=resolved_action,
        next_recommendations=[rec.model_dump() for rec in recommendations],
    )


@app.get('/recommend/{user_id}')
def recommend(user_id: int, k: int = 10):
    interactions = crud.get_interactions()
    recs = recommender.recommend_by_collab(user_id, interactions, top_k=k)
    return {'user_id': user_id, 'recommendations': [{'product_id': r[0], 'score': r[1]} for r in recs]}


def _build_product_graph(product_id: int) -> ProductGraph:
    product = crud.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')

    interactions = crud.get_interactions()
    user_to_products, product_to_users = recommender.build_bipartite_graph(interactions)
    target_users = product_to_users.get(product_id, set())

    nodes = [
        GraphNode(id=f'product:{product_id}', label=product['name'], group='product', value=product.get('price'), meta={'category': product.get('category')})
    ]
    edges: List[GraphEdge] = []

    for user in target_users:
        nodes.append(GraphNode(id=f'user:{user}', label=f'User {user}', group='user'))
        edges.append(GraphEdge(id=f'edge:user:{user}:{product_id}', from_node=f'user:{user}', to_node=f'product:{product_id}', weight=1, label='view'))

    target_set = product_to_users.get(product_id, set())
    similarities = []
    for other_product, users in product_to_users.items():
        if other_product == product_id:
            continue
        score = recommender.jaccard_similarity(target_set, users)
        if score > 0:
            similarities.append((other_product, score))
    similarities.sort(key=lambda x: x[1], reverse=True)
    for other_id, score in similarities[:5]:
        other_prod = crud.get_product(other_id)
        if not other_prod:
            continue
        nodes.append(GraphNode(id=f'product:{other_id}', label=other_prod['name'], group='product', value=other_prod.get('price'), meta={'category': other_prod.get('category')}))
        edges.append(GraphEdge(id=f'edge:product:{product_id}:{other_id}', from_node=f'product:{product_id}', to_node=f'product:{other_id}', weight=score, label=f'{score:.2f}'))

    graph = ProductGraph(nodes=[n for n in nodes], edges=[e for e in edges])
    return graph


@app.get('/products/{product_id}/graph')
def product_graph(product_id: int):
    graph = _build_product_graph(product_id)
    return {
        'nodes': [n.model_dump() for n in graph.nodes],
        'edges': [e.model_dump(by_alias=True) for e in graph.edges]
    }


@app.get('/related_products/{product_id}')
def related_products(product_id: int, depth: int = 2):
    interactions = crud.get_interactions()
    _, product_to_users = recommender.build_bipartite_graph(interactions)
    prod_graph = recommender.build_product_graph(product_to_users)
    if product_id not in prod_graph and product_id not in product_to_users:
        raise HTTPException(status_code=404, detail='Product not found')
    related = recommender.bfs_related_products(product_id, prod_graph, max_depth=depth)
    return {'product_id': product_id, 'related': related}


@app.get('/')
def root():
    return {'message': 'Graph Recommendation System API'}
