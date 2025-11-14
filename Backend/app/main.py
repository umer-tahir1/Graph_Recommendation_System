from fastapi import FastAPI, HTTPException
from typing import List
from . import crud, recommender, db_init
from .models import User, Product, Interaction
import os

app = FastAPI(title='Graph-Based Recommendation API')

# Ensure DB exists
db_init.init_db()


@app.post('/users', response_model=User)
def create_user(u: User):
    uid = crud.add_user(u.name)
    u.id = uid
    return u


@app.get('/users', response_model=List[User])
def get_users():
    return [User(**r) for r in crud.list_users()]


@app.post('/products', response_model=Product)
def create_product(p: Product):
    pid = crud.add_product(p.name, p.category)
    p.id = pid
    return p


@app.get('/products', response_model=List[Product])
def get_products():
    return [Product(**r) for r in crud.list_products()]


@app.post('/interactions', response_model=Interaction)
def create_interaction(i: Interaction):
    # validate user and product exist
    users = {u['id'] for u in crud.list_users()}
    products = {p['id'] for p in crud.list_products()}
    if i.user_id not in users:
        raise HTTPException(status_code=404, detail='User not found')
    if i.product_id not in products:
        raise HTTPException(status_code=404, detail='Product not found')
    iid = crud.add_interaction(i.user_id, i.product_id, i.rating)
    i.id = iid
    return i


@app.get('/recommend/{user_id}')
def recommend(user_id: int, k: int = 10):
    interactions = crud.get_interactions()
    recs = recommender.recommend_by_collab(user_id, interactions, top_k=k)
    return {'user_id': user_id, 'recommendations': [{'product_id': r[0], 'score': r[1]} for r in recs]}


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
