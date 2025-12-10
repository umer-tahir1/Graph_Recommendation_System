from db_init import init_db
import crud


PRODUCTS = [
    {
        'name': 'Aether Wave Pro',
        'category': 'Headphones',
        'description': 'Wireless ANC headphones with 40h battery life and adaptive EQ.',
        'price': 199.99,
        'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        'inventory': 50,
    },
    {
        'name': 'Pulse Air Max',
        'category': 'Mobiles',
        'description': 'Flagship smartphone with 6.7" LTPO display and tri-camera system.',
        'price': 999.0,
        'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        'inventory': 35,
    },
    {
        'name': 'Nebula X1 Laptop',
        'category': 'Laptops',
        'description': 'Ultra thin creator laptop with RTX graphics and OLED display.',
        'price': 1799.0,
        'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        'inventory': 20,
    },
    {
        'name': 'Aurora Flex Hoodie',
        'category': 'Apparel',
        'description': 'Graph-lined performance hoodie with moisture-wicking interior panels.',
        'price': 129.0,
        'image_url': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
        'inventory': 80,
    },
    {
        'name': 'Circuit Runner Jacket',
        'category': 'Apparel',
        'description': 'Lightweight shell with reflective graph piping and hidden phone pocket.',
        'price': 189.0,
        'image_url': 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb',
        'inventory': 60,
    },
    {
        'name': 'Graph Brew Mug',
        'category': 'Mugs',
        'description': 'Double-wall ceramic mug etched with the recommendation network.',
        'price': 39.0,
        'image_url': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
        'inventory': 120,
    },
    {
        'name': 'Orbit Pour Over Set',
        'category': 'Kitchen & Utensils',
        'description': 'Matte steel pour over kit with precision scale and insulated server.',
        'price': 149.0,
        'image_url': 'https://images.unsplash.com/photo-1506086679525-9d03a18a96ab',
        'inventory': 40,
    },
    {
        'name': 'Lumen Smart Lamp',
        'category': 'Home Goods',
        'description': 'Adaptive desk lamp that brightens based on your graph interactions.',
        'price': 229.0,
        'image_url': 'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
        'inventory': 35,
    },
    {
        'name': 'Helix Roadster',
        'category': 'Bikes',
        'description': 'Carbon frame endurance bike with electronic shifting.',
        'price': 3499.0,
        'image_url': 'https://images.unsplash.com/photo-1502877338535-766e1452684a',
        'inventory': 12,
    },
    {
        'name': 'Orbit XR Sedan',
        'category': 'Cars',
        'description': 'Electric sedan delivering 500km range and autopilot ready sensors.',
        'price': 45999.0,
        'image_url': 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d',
        'inventory': 6,
    },
    {
        'name': 'Pixel Forge Desktop',
        'category': 'Computers',
        'description': 'Custom workstation with 64-core CPU for ML workloads.',
        'price': 3899.0,
        'image_url': 'https://images.unsplash.com/photo-1518770660439-4636190af475',
        'inventory': 10,
    },
]

SIZE_MAP = {
    'Aurora Flex Hoodie': {'XS': 5, 'S': 18, 'M': 24, 'L': 20, 'XL': 13},
    'Circuit Runner Jacket': {'S': 10, 'M': 18, 'L': 16, 'XL': 8},
}


def populate_full():
    init_db()
    # Categories with stable ordering
    ordered_categories = [
        'Laptops',
        'Mobiles',
        'Apparel',
        'Mugs',
        'Home Goods',
        'Kitchen & Utensils',
        'Headphones',
        'Computers',
        'Bikes',
        'Cars',
    ]
    for idx, cat in enumerate(ordered_categories, start=1):
        crud.upsert_category(cat, position=idx)

    # Users
    alice = crud.add_user('Alice')
    bob = crud.add_user('Bob')
    carol = crud.add_user('Carol')
    dave = crud.add_user('Dave')

    # Products & details
    crud.bulk_insert_products(PRODUCTS)
    products = {p['name']: p['id'] for p in crud.list_products()}
    for name, sizes in SIZE_MAP.items():
        product_id = products.get(name)
        if product_id:
            crud.replace_product_sizes(product_id, sizes)

    # Interactions
    crud.add_interaction(alice, products['Aether Wave Pro'], 'view', 1.0)
    crud.add_interaction(alice, products['Pulse Air Max'], 'click', 1.2)
    crud.add_interaction(bob, products['Nebula X1 Laptop'], 'view', 1.0)
    crud.add_interaction(bob, products['Pixel Forge Desktop'], 'click', 1.4)
    crud.add_interaction(carol, products['Aurora Flex Hoodie'], 'view', 1.1)
    crud.add_interaction(carol, products['Circuit Runner Jacket'], 'add_to_cart', 1.6)
    crud.add_interaction(carol, products['Helix Roadster'], 'view', 1.0)
    crud.add_interaction(dave, products['Orbit XR Sedan'], 'view', 1.0)
    crud.add_interaction(dave, products['Helix Roadster'], 'add_to_cart', 1.6)

    # Reviews
    crud.add_review(alice, products['Aether Wave Pro'], 5, 'Crisp highs and powerful bass!')
    crud.add_review(bob, products['Nebula X1 Laptop'], 4, 'Perfect for video editing on the go.')
    crud.add_review(carol, products['Aurora Flex Hoodie'], 5, 'Soft interior and the reflective trim looks great.')
    crud.add_review(dave, products['Circuit Runner Jacket'], 4, 'Windproof yet packs down into my courier bag.')


if __name__ == '__main__':
    populate_full()
    print('Sample data populated')
