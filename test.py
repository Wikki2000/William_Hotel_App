from models.user import User
from models import storage

attr = {"title": "Mr.", "first_name": "Pope", "role": "staff",
        "last_name": "Love", "username": "pope", "portfolio": "Software Engineer",
        "email": "pope@gmail.com", "password": "12345"}

user = User(**attr)
user.hash_password()
storage.new(user)
storage.save()
storage.close()
