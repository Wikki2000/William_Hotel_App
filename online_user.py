from models import storage
from models.user import User

"""
user_attr = {
    "first_name": "Self", "last_name": "Service",
    "email": "selfservice@online.com", "role": "staff", "performance": 100,
    "portfolio": "Online Transaction", "rank_number": 60, "password": "can't Open"
}

user = User(**user_attr)
storage.new(user)
storage.save()
"""
user = storage.get_by(User, first_name="Self")
print(user.id)
