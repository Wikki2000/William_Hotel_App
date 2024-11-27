from models import storage
from models.service import Service

service = Service(name="Food")
storage.new(service)
storage.save()
storage.save()
