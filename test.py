from models import storage
from models.order_item import OrderItem
from sqlalchemy import func

session = storage.get_session

results = (
    session.query(OrderItem.drink_id, func.sum(OrderItem.qty_order).label("sum"))
    .filter(OrderItem.drink_id.is_not(None)).group_by(OrderItem.drink_id).all()
)
print(len(results))
print(results)
