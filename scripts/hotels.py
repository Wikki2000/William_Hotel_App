from models import storage
from models.hotel_setting import HotelSetting


hotel = HotelSetting()
storage.new(hotel)
storage.save()
