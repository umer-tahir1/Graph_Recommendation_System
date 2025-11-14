from .db_init import init_db
from .crud import add_user, add_product, add_interaction


def populate_small():
    init_db()
    # Add users
    u1 = add_user('Alice')
    u2 = add_user('Bob')
    u3 = add_user('Carol')

    # Add products
    p1 = add_product('Laptop', 'Electronics')
    p2 = add_product('Mouse', 'Electronics')
    p3 = add_product('Keyboard', 'Electronics')
    p4 = add_product('Coffee Mug', 'Home')
    p5 = add_product('Notebook', 'Stationery')

    # Interactions
    add_interaction(u1, p1)
    add_interaction(u1, p2)
    add_interaction(u2, p2)
    add_interaction(u2, p3)
    add_interaction(u3, p1)
    add_interaction(u3, p4)

if __name__ == '__main__':
    populate_small()
    print('Sample data populated')
