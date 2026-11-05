// Auto-generated 1:1 Food & Beverage Data from qr.unipos.tech/skyhill
export interface FoodBeverageItem {
  id: string;
  name: string;
  nameEn?: string;
  nameRu?: string;
  desc?: string;
  badge?: string;
  price?: string;
  priceNum: number;
  image: string;
}

export interface VenueCategory {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  cover: string;
  hours: string;
  type: 'restaurant' | 'bar' | 'entertainment' | 'room_service' | 'events' | 'conference';
  items: FoodBeverageItem[];
}

export const foodBeverageVenues: VenueCategory[] = [
  {
    "id": "shirvan",
    "code": "4578",
    "title": "SHIRVAN",
    "subtitle": "Restoran və teras · Bütün gün",
    "cover": "/media/guest/shirvan.webp",
    "hours": "08:00 – 23:00",
    "type": "restaurant",
    "items": [
      {
        "id": "43140",
        "name": "Aşpazın təklifi — quzu qabırğası",
        "nameEn": "Chef's Special — Lamb Ribs",
        "nameRu": "Блюдо от шефа — бараньи рёбрышки",
        "desc": "Dağ otları ilə marinadlanmış quzu qabırğası, közdə tərəvəz, nar sousu",
        "badge": "Aşpazın seçimi",
        "price": "34.00 ₼",
        "priceNum": 34,
        "image": "/media/guest/lamb-ribs.webp"
      },
      {
        "id": "43141",
        "name": "Şah plov",
        "nameEn": "Shah Plov",
        "nameRu": "Шах-плов",
        "desc": "Lavaşda bişmiş düyü, quzu əti, şabalıd, ərik qurusu, kişmiş (2 nəfərlik)",
        "badge": "",
        "price": "28.00 ₼",
        "priceNum": 28,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43142",
        "name": "Yarpaq dolması",
        "nameEn": "Vine Leaf Dolma",
        "nameRu": "Долма в виноградных листьях",
        "desc": "Quzu əti, düyü, üzüm yarpağı, sarımsaqlı qatıq",
        "badge": "",
        "price": "12.00 ₼",
        "priceNum": 12,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43143",
        "name": "Qutab dəsti",
        "nameEn": "Qutab Set",
        "nameRu": "Сет кутабов",
        "desc": "Göyərti, ət və balqabaq qutabı, sumaq, qatıq",
        "badge": "",
        "price": "9.00 ₼",
        "priceNum": 9,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43144",
        "name": "Piti",
        "nameEn": "Piti",
        "nameRu": "Пити",
        "desc": "Saxsı qabda quzu əti, noxud, şabalıd, zəfəran",
        "badge": "",
        "price": "14.00 ₼",
        "priceNum": 14,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43145",
        "name": "Dana steyk",
        "nameEn": "Beef Steak",
        "nameRu": "Говяжий стейк",
        "desc": "Dana bonfile (250 q), qulançar, kartof püresi, bibər sousu",
        "badge": "",
        "price": "42.00 ₼",
        "priceNum": 42,
        "image": "/media/guest/steak.webp"
      },
      {
        "id": "43146",
        "name": "Kabab assorti",
        "nameEn": "Kebab Platter",
        "nameRu": "Ассорти из кебабов",
        "desc": "Lülə, tikə və toyuq kababı, közdə tərəvəz, lavaş (2 nəfərlik)",
        "badge": "",
        "price": "36.00 ₼",
        "priceNum": 36,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43147",
        "name": "Sezar salatı",
        "nameEn": "Caesar Salad",
        "nameRu": "Салат «Цезарь»",
        "desc": "Romain kahı, toyuq filesi, parmezan, krutonlar, Sezar sousu",
        "badge": "",
        "price": "14.00 ₼",
        "priceNum": 14,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43148",
        "name": "Çoban salatı",
        "nameEn": "Shepherd Salad",
        "nameRu": "Чобан-салат",
        "desc": "Pomidor, xiyar, bibər, soğan, göyərti, zeytun yağı",
        "badge": "",
        "price": "8.00 ₼",
        "priceNum": 8,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43149",
        "name": "Ev üsulu makaron",
        "nameEn": "Homemade Pasta",
        "nameRu": "Домашняя паста",
        "desc": "Tagliatelle, krem sousu, göbələk, parmezan",
        "badge": "",
        "price": "16.00 ₼",
        "priceNum": 16,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43150",
        "name": "Dovğa",
        "nameEn": "Dovga",
        "nameRu": "Довга",
        "desc": "Qatıq, düyü, nanə, şüyüd, cəfəri",
        "badge": "",
        "price": "6.00 ₼",
        "priceNum": 6,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43151",
        "name": "Şəkərbura və paxlava",
        "nameEn": "Shekerbura &amp; Pakhlava",
        "nameRu": "Шекербура и пахлава",
        "desc": "Şəki paxlavası, şəkərbura, badam, bal",
        "badge": "",
        "price": "9.00 ₼",
        "priceNum": 9,
        "image": "/media/guest/shirvan.webp"
      },
      {
        "id": "43152",
        "name": "Portağallı keks",
        "nameEn": "Orange Cake",
        "nameRu": "Апельсиновый кекс",
        "desc": "İsti keks, portağal, vanil dondurması",
        "badge": "",
        "price": "8.00 ₼",
        "priceNum": 8,
        "image": "/media/guest/shirvan.webp"
      }
    ]
  },
  {
    "id": "saqi",
    "code": "4579",
    "title": "SAQI",
    "subtitle": "Lounge bar · 16:00–02:00",
    "cover": "/media/guest/saqi.webp",
    "hours": "16:00 – 02:00",
    "type": "bar",
    "items": [
      {
        "id": "43153",
        "name": "İmza kokteyli",
        "nameEn": "Signature",
        "nameRu": "Фирменный",
        "desc": "İmza kokteyli: nar, portağal, rom, laym",
        "badge": "İmza kokteyli",
        "price": "16.00 ₼",
        "priceNum": 16,
        "image": "/media/guest/cocktails.webp"
      },
      {
        "id": "43154",
        "name": "Marqarita",
        "nameEn": "Margarita",
        "nameRu": "Маргарита",
        "desc": "Tekila, laym, portağal likörü, duzlu kənar",
        "badge": "",
        "price": "14.00 ₼",
        "priceNum": 14,
        "image": "/media/guest/margarita.webp"
      },
      {
        "id": "43155",
        "name": "Aperol Spritz",
        "nameEn": "Aperol Spritz",
        "nameRu": "Апероль шприц",
        "desc": "Aperol, prosekko, soda, portağal",
        "badge": "",
        "price": "15.00 ₼",
        "priceNum": 15,
        "image": "/media/guest/aperol.webp"
      },
      {
        "id": "43156",
        "name": "Mojito",
        "nameEn": "Mojito",
        "nameRu": "Мохито",
        "desc": "Rom, nanə, laym, soda",
        "badge": "",
        "price": "13.00 ₼",
        "priceNum": 13,
        "image": "/media/guest/saqi.webp"
      },
      {
        "id": "43157",
        "name": "Qırmızı şərab (bokal)",
        "nameEn": "Red Wine (glass)",
        "nameRu": "Красное вино (бокал)",
        "desc": "Mədrəsə, Şamaxı · 150 ml",
        "badge": "",
        "price": "12.00 ₼",
        "priceNum": 12,
        "image": "/media/guest/wine-pour.webp"
      },
      {
        "id": "43158",
        "name": "Ağ şərab (bokal)",
        "nameEn": "White Wine (glass)",
        "nameRu": "Белое вино (бокал)",
        "desc": "Bayanşirə, Gəncə · 150 ml",
        "badge": "",
        "price": "12.00 ₼",
        "priceNum": 12,
        "image": "/media/guest/wine-table.webp"
      },
      {
        "id": "43159",
        "name": "Espresso",
        "nameEn": "Espresso",
        "nameRu": "Эспрессо",
        "desc": "İtalyan qovurması · 30 ml",
        "badge": "",
        "price": "4.00 ₼",
        "priceNum": 4,
        "image": "/media/guest/saqi.webp"
      },
      {
        "id": "43160",
        "name": "Kapuçino və tort",
        "nameEn": "Cappuccino &amp; Cake",
        "nameRu": "Капучино и торт",
        "desc": "Kapuçino + günün tortu",
        "badge": "",
        "price": "11.00 ₼",
        "priceNum": 11,
        "image": "/media/guest/saqi.webp"
      },
      {
        "id": "43161",
        "name": "Azərbaycan çayı (dəmlik)",
        "nameEn": "Azerbaijani Tea (pot)",
        "nameRu": "Азербайджанский чай (чайник)",
        "desc": "Armudu stəkanda, mürəbbə, limon, nabat",
        "badge": "",
        "price": "8.00 ₼",
        "priceNum": 8,
        "image": "/media/guest/saqi.webp"
      },
      {
        "id": "43162",
        "name": "Makaron dəsti",
        "nameEn": "Macaron Set",
        "nameRu": "Набор макарон",
        "desc": "6 ədəd, fransız makaronları",
        "badge": "",
        "price": "9.00 ₼",
        "priceNum": 9,
        "image": "/media/guest/saqi.webp"
      }
    ]
  },
  {
    "id": "elixir",
    "code": "4580",
    "title": "ELIXIR",
    "subtitle": "Sağlam bar · 08:00–20:00",
    "cover": "/media/guest/elixir.webp",
    "hours": "08:00 – 20:00",
    "type": "bar",
    "items": [
      {
        "id": "43163",
        "name": "Giləmeyvə smuzisi",
        "nameEn": "Berry Smoothie",
        "nameRu": "Ягодный смузи",
        "desc": "Moruq, qaragilə, banan, qatıq",
        "badge": "",
        "price": "9.00 ₼",
        "priceNum": 9,
        "image": "/media/guest/smoothie.webp"
      },
      {
        "id": "43164",
        "name": "Portağal fresh",
        "nameEn": "Fresh Orange Juice",
        "nameRu": "Апельсиновый фреш",
        "desc": "Təzə sıxılmış · 300 ml",
        "badge": "",
        "price": "8.00 ₼",
        "priceNum": 8,
        "image": "/media/guest/juice.webp"
      },
      {
        "id": "43165",
        "name": "Detoks smuzi",
        "nameEn": "Detox Smoothie",
        "nameRu": "Детокс-смузи",
        "desc": "Armud, kərəviz, ispanaq, alma",
        "badge": "",
        "price": "9.00 ₼",
        "priceNum": 9,
        "image": "/media/guest/elixir.webp"
      },
      {
        "id": "43166",
        "name": "Meyvə kasası",
        "nameEn": "Fruit Bowl",
        "nameRu": "Фруктовая тарелка",
        "desc": "Mövsüm meyvələri, qoz-fındıq, bal",
        "badge": "",
        "price": "10.00 ₼",
        "priceNum": 10,
        "image": "/media/guest/fruit-bowl.webp"
      },
      {
        "id": "43167",
        "name": "Protein kokteyli",
        "nameEn": "Protein Shake",
        "nameRu": "Протеиновый коктейль",
        "desc": "Süd, banan, yulaf, protein",
        "badge": "",
        "price": "10.00 ₼",
        "priceNum": 10,
        "image": "/media/guest/elixir.webp"
      }
    ]
  },
  {
    "id": "strike",
    "code": "4581",
    "title": "STRIKE",
    "subtitle": "Boulinq və bar · 12:00–00:00",
    "cover": "/media/guest/tile-entertainment.webp",
    "hours": "12:00 – 00:00",
    "type": "entertainment",
    "items": [
      {
        "id": "43168",
        "name": "Skyhill burger",
        "nameEn": "Skyhill Burger",
        "nameRu": "Бургер Skyhill",
        "desc": "Dana kotleti, çeddar, karamelizə soğan, kartof fri",
        "badge": "",
        "price": "16.00 ₼",
        "priceNum": 16,
        "image": "/media/guest/burger.webp"
      },
      {
        "id": "43169",
        "name": "Çizburger",
        "nameEn": "Cheeseburger",
        "nameRu": "Чизбургер",
        "desc": "İkiqat pendir, turşu, xüsusi sous",
        "badge": "",
        "price": "15.00 ₼",
        "priceNum": 15,
        "image": "/media/guest/burger-2.webp"
      },
      {
        "id": "43170",
        "name": "Toyuq qanadları",
        "nameEn": "Chicken Wings",
        "nameRu": "Куриные крылышки",
        "desc": "BBQ və ya acılı, 8 ədəd",
        "badge": "",
        "price": "12.00 ₼",
        "priceNum": 12,
        "image": "/media/guest/tile-entertainment.webp"
      },
      {
        "id": "43171",
        "name": "Kartof fri",
        "nameEn": "French Fries",
        "nameRu": "Картофель фри",
        "desc": "Dəniz duzu, ketçup",
        "badge": "",
        "price": "5.00 ₼",
        "priceNum": 5,
        "image": "/media/guest/tile-entertainment.webp"
      },
      {
        "id": "43172",
        "name": "Naços",
        "nameEn": "Nachos",
        "nameRu": "Начос",
        "desc": "Pendir sousu, halapenyo, salsa",
        "badge": "",
        "price": "9.00 ₼",
        "priceNum": 9,
        "image": "/media/guest/tile-entertainment.webp"
      },
      {
        "id": "43173",
        "name": "Qaralama pivə",
        "nameEn": "Draft Beer",
        "nameRu": "Разливное пиво",
        "desc": "0.5 l",
        "badge": "",
        "price": "6.00 ₼",
        "priceNum": 6,
        "image": "/media/guest/tile-entertainment.webp"
      }
    ]
  },
  {
    "id": "room-service",
    "code": "4582",
    "title": "Otaq xidməti",
    "subtitle": "24 saat · daxili 3",
    "cover": "/media/guest/room-service.webp",
    "hours": "24 saat",
    "type": "room_service",
    "items": [
      {
        "id": "43174",
        "name": "Səhər yeməyi seti",
        "nameEn": "Breakfast Set",
        "nameRu": "Завтрак-сет",
        "desc": "Omlet, pendir çeşidi, bal, qaymaq, təzə çörək, çay və ya qəhvə",
        "badge": "",
        "price": "25.00 ₼",
        "priceNum": 25,
        "image": "/media/guest/breakfast.webp"
      },
      {
        "id": "43175",
        "name": "Omlet",
        "nameEn": "Omelette",
        "nameRu": "Омлет",
        "desc": "3 yumurta, pomidor, göyərti",
        "badge": "",
        "price": "9.00 ₼",
        "priceNum": 9,
        "image": "/media/guest/eggs.webp"
      },
      {
        "id": "43176",
        "name": "Klub sendviç",
        "nameEn": "Club Sandwich",
        "nameRu": "Клаб-сэндвич",
        "desc": "Toyuq, bekon, pomidor, kahı, kartof fri",
        "badge": "",
        "price": "12.00 ₼",
        "priceNum": 12,
        "image": "/media/guest/room-service.webp"
      },
      {
        "id": "43177",
        "name": "Sezar salatı",
        "nameEn": "Caesar Salad",
        "nameRu": "Салат «Цезарь»",
        "desc": "Toyuq filesi, parmezan, krutonlar",
        "badge": "",
        "price": "14.00 ₼",
        "priceNum": 14,
        "image": "/media/guest/salad.webp"
      },
      {
        "id": "43178",
        "name": "Meyvə kasası",
        "nameEn": "Fruit Bowl",
        "nameRu": "Фруктовая тарелка",
        "desc": "Mövsüm meyvələri",
        "badge": "",
        "price": "10.00 ₼",
        "priceNum": 10,
        "image": "/media/guest/fruit-bowl.webp"
      },
      {
        "id": "43179",
        "name": "Çay dəsti",
        "nameEn": "Tea Set",
        "nameRu": "Чайный сет",
        "desc": "Dəmlik çay, mürəbbə, limon, şirniyyat",
        "badge": "",
        "price": "8.00 ₼",
        "priceNum": 8,
        "image": "/media/guest/room-service.webp"
      }
    ]
  },
  {
    "id": "ballroom",
    "code": "4583",
    "title": "ZIRVE Ballroom",
    "subtitle": "Tədbirlər və şənliklər",
    "cover": "/media/guest/ballroom.webp",
    "hours": "Sifarişlə",
    "type": "events",
    "items": [
      {
        "id": "43180",
        "name": "Toy ziyafəti",
        "nameEn": "Wedding Banquet",
        "nameRu": "Свадебный банкет",
        "desc": "",
        "badge": "adambaşı 85 ₼-dan",
        "price": "",
        "priceNum": 0,
        "image": "/media/guest/ballroom.webp"
      },
      {
        "id": "43181",
        "name": "Ad günü paketi",
        "nameEn": "Birthday Package",
        "nameRu": "Пакет «День рождения»",
        "desc": "",
        "badge": "adambaşı 45 ₼-dan",
        "price": "",
        "priceNum": 0,
        "image": "/media/guest/ballroom.webp"
      },
      {
        "id": "43182",
        "name": "Korporativ şam yeməyi",
        "nameEn": "Corporate Dinner",
        "nameRu": "Корпоративный ужин",
        "desc": "",
        "badge": "adambaşı 60 ₼-dan",
        "price": "",
        "priceNum": 0,
        "image": "/media/guest/ballroom.webp"
      }
    ]
  },
  {
    "id": "tusi",
    "code": "4584",
    "title": "TUSI",
    "subtitle": "Konfrans zalı",
    "cover": "/media/guest/conference.webp",
    "hours": "Sifarişlə",
    "type": "conference",
    "items": [
      {
        "id": "43184",
        "name": "Yarım gün paketi",
        "nameEn": "Half-Day Package",
        "nameRu": "Пакет на полдня",
        "desc": "",
        "badge": "adambaşı 35 ₼",
        "price": "",
        "priceNum": 0,
        "image": "/media/guest/conference.webp"
      },
      {
        "id": "43185",
        "name": "Tam gün paketi",
        "nameEn": "Full-Day Package",
        "nameRu": "Пакет на целый день",
        "desc": "",
        "badge": "adambaşı 55 ₼",
        "price": "",
        "priceNum": 0,
        "image": "/media/guest/conference.webp"
      },
      {
        "id": "43186",
        "name": "Texniki təchizat",
        "nameEn": "Equipment",
        "nameRu": "Оборудование",
        "desc": "",
        "badge": "",
        "price": "",
        "priceNum": 0,
        "image": "/media/guest/conference.webp"
      }
    ]
  }
];

export const getVenueByCodeOrId = (key: string): VenueCategory | undefined => {
  const clean = key.toLowerCase().trim();
  return foodBeverageVenues.find(v => v.id.toLowerCase() === clean || v.code === clean);
};

export const findFoodItemById = (itemId: string): { item: FoodBeverageItem; venue: VenueCategory } | undefined => {
  for (const venue of foodBeverageVenues) {
    const found = venue.items.find(it => it.id === itemId);
    if (found) {
      return { item: found, venue };
    }
  }
  return undefined;
};
