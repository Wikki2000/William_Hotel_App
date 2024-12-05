from models import storage
from models.room import Room

for i in range(101, 106):
    room = Room(room_number=i, amount=20.0, room_type="Standard Room")
    storage.new(room)
for i in range(201, 208):
    room = Room(room_number=i, amount=50.0, room_type="Deluxe Room")
    storage.new(room)
storage.save()
storage.close()
