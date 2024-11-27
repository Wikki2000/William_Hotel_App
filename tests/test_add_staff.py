from models import storage
from models.user import User


attr = {
    "title": "Mr", "first_name": "Wisdom", "portfolio": "CEO",
    "last_name": "Okposin", "username": "wikki",
    "email": "wikki@gmail.com", "role": "staff"
}
user = User(**attr)
storage.new(user)
storage.save()
user.hash_password()
storage.save()
