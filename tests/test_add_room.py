from models import storage
from models.room import Room

room = Room(room_type="Deluxe", room_number=1234, unit_cost=500.00)
storage.new(room)
storage.save()
storage.save()
