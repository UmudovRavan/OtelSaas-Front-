// Auto-generated 1:1 SPA & Wellness Data from qr.unipos.tech/skyhill/hotel/g/193
export interface SpaTreatmentItem {
  id: string;
  title: string;
  titleEn?: string;
  titleRu?: string;
  desc: string;
  price?: string;
  priceNum: number;
  image?: string;
}

export interface SpaCategory {
  id: string;
  code: string;
  type: 'category' | 'page';
  title: string;
  titleEn?: string;
  titleRu?: string;
  cover: string;
  hours?: string;
  articleContent?: string;
  items: SpaTreatmentItem[];
}

export const spaCategories: SpaCategory[] = [
  {
    id: 'about',
    code: '43188',
    type: 'page',
    title: 'MARAL Spa haqqında',
    titleEn: 'About MARAL Spa',
    titleRu: 'О MARAL Spa',
    cover: '/media/guest/massage-back.webp',
    hours: 'Hər gün 09:00–22:00 · daxili 5',
    articleContent: `Hər gün 09:00–22:00 · daxili 5\n\nMARAL Spa — 2000 m² sakitlik: qapalı hovuz, fin saunası, türk hamamı, jakuzi, istirahət zonası və 8 masaj otağı.\n\nProseduralarda Qafqaz bitkilərindən hazırlanmış təbii yağlar istifadə olunur.\n\nRezervasiya üçün resepsiyona və ya birbaşa spaya zəng edin.`,
    items: []
  },
  {
    id: 'facilities',
    code: '4586',
    type: 'category',
    title: 'SPA imkanları',
    titleEn: 'SPA Facilities',
    titleRu: 'Инфраструктура SPA',
    cover: '/media/guest/pool-indoor.webp',
    hours: '07:00 – 22:00',
    items: [
      {
        id: 'pool',
        title: 'Qapalı hovuz',
        titleEn: 'Indoor Pool',
        titleRu: 'Крытый бассейн',
        desc: '25 m uzunluqda, istilikli su (28°C), panoramik təbiət mənzərəsi',
        priceNum: 0,
        image: '/media/guest/pool-indoor.webp'
      },
      {
        id: 'sauna',
        title: 'Fin saunası',
        titleEn: 'Finnish Sauna',
        titleRu: 'Финская сауна',
        desc: '85–95°C quru buxar, sidr ağacından hazırlanmış interyer',
        priceNum: 0,
        image: '/media/guest/wellness.webp'
      },
      {
        id: 'hammam',
        title: 'Türk hamamı',
        titleEn: 'Turkish Hammam',
        titleRu: 'Турецкий хаммам',
        desc: 'Klassik mərmər göbək daşı, kisə və köpük müalicələri',
        priceNum: 0,
        image: '/media/guest/spa-salts.webp'
      },
      {
        id: 'jacuzzi',
        title: 'Jakuzi',
        titleEn: 'Jacuzzi',
        titleRu: 'Джакузи',
        desc: 'Hidromasaj və xromoterapiya funksiyalı isti su hovuzu',
        priceNum: 0,
        image: '/media/guest/pool-indoor.webp'
      },
      {
        id: 'relaxation',
        title: 'İstirahət zonası',
        titleEn: 'Relaxation Zone',
        titleRu: 'Зона отдыха',
        desc: 'Anatomik şezlonqlar, sakitləşdirici musiqi və təbii bitki çayları',
        priceNum: 0,
        image: '/media/guest/wellness.webp'
      }
    ]
  },
  {
    id: 'massages',
    code: '4587',
    type: 'category',
    title: 'Masaj və bədən müalicələri',
    titleEn: 'Massages & Body Treatments',
    titleRu: 'Массаж и уход за телом',
    cover: '/media/guest/massage.webp',
    hours: '09:00 – 22:00',
    items: [
      {
        id: 'classic-massage',
        title: 'Klassik masaj',
        titleEn: 'Classic Massage',
        titleRu: 'Классический массаж',
        desc: '60 dəqiqə · bütün bədən əzələlərinin gərginliyini aradan qaldırır',
        price: '80.00 ₼',
        priceNum: 80,
        image: '/media/guest/massage.webp'
      },
      {
        id: 'aroma-massage',
        title: 'Aromaterapiya masajı',
        titleEn: 'Aromatherapy Massage',
        titleRu: 'Ароматерапевтический массаж',
        desc: '60 dəqiqə · fərdi seçilmiş təbii efir yağları ilə',
        price: '90.00 ₼',
        priceNum: 90,
        image: '/media/guest/spa-oil.webp'
      },
      {
        id: 'hot-stone',
        title: 'İsti daş masajı',
        titleEn: 'Hot Stone Massage',
        titleRu: 'Массаж горячими камнями',
        desc: '90 dəqiqə · vulkanik bazalt daşları ilə dərin istilik terapiyası',
        price: '120.00 ₼',
        priceNum: 120,
        image: '/media/guest/massage-back.webp'
      },
      {
        id: 'bali-massage',
        title: 'Bali masajı',
        titleEn: 'Balinese Massage',
        titleRu: 'Балийский массаж',
        desc: '75 dəqiqə · dərin toxuma və akupressura texnikası',
        price: '110.00 ₼',
        priceNum: 110,
        image: '/media/guest/massage.webp'
      },
      {
        id: 'foot-reflex',
        title: 'Ayaq refleksoterapiyası',
        titleEn: 'Foot Reflexology',
        titleRu: 'Рефлексотерапия стоп',
        desc: '45 dəqiqə · daxili orqanların balansı və yorğunluğun aradan qaldırılması',
        price: '55.00 ₼',
        priceNum: 55,
        image: '/media/guest/massage-back.webp'
      },
      {
        id: 'salt-scrub',
        title: 'Duz pilinqi',
        titleEn: 'Salt Scrub',
        titleRu: 'Солевой пилинг',
        desc: '45 dəqiqə · dəniz duzu və qidalandırıcı yağlar ilə dərinin yenilənməsi',
        price: '60.00 ₼',
        priceNum: 60,
        image: '/media/guest/spa-salts.webp'
      }
    ]
  },
  {
    id: 'facial',
    code: '4588',
    type: 'category',
    title: 'Üz baxımı',
    titleEn: 'Facial Treatments',
    titleRu: 'Уход за лицом',
    cover: '/media/guest/facial.webp',
    hours: '09:00 – 22:00',
    items: [
      {
        id: 'hydra-facial',
        title: 'Nəmləndirici üz baxımı',
        titleEn: 'Hydrating Facial',
        titleRu: 'Увлажняющий уход',
        desc: '50 dəqiqə · hialuron turşusu və dərinin dərindən nəmləndirilməsi',
        price: '70.00 ₼',
        priceNum: 70,
        image: '/media/guest/facial.webp'
      },
      {
        id: 'anti-age',
        title: 'Anti-age baxım',
        titleEn: 'Anti-Aging Care',
        titleRu: 'Антивозрастной уход',
        desc: '60 dəqiqə · kollagen maskası, liftinq effekti və cavanlaşma',
        price: '95.00 ₼',
        priceNum: 95,
        image: '/media/guest/facial-2.webp'
      },
      {
        id: 'deep-cleanse',
        title: 'Dərin təmizləmə',
        titleEn: 'Deep Cleansing',
        titleRu: 'Глубокое очищение',
        desc: '45 dəqiqə · məsamələrin təmizlənməsi və dərinin canlandırılması',
        price: '60.00 ₼',
        priceNum: 60,
        image: '/media/guest/facial.webp'
      }
    ]
  },
  {
    id: 'rituals',
    code: '4589',
    type: 'category',
    title: 'İmza ritualları',
    titleEn: 'Signature Rituals',
    titleRu: 'Фирменные ритуалы',
    cover: '/media/guest/spa-oil.webp',
    hours: '09:00 – 22:00',
    items: [
      {
        id: 'honey-ritual',
        title: 'Qafqaz balı ritualı',
        titleEn: 'Caucasian Honey Ritual',
        titleRu: 'Ритуал «Кавказский мёд»',
        desc: '120 dəqiqə · bal pilinqi, bədən masajı və dağ bitki çayı',
        price: '150.00 ₼',
        priceNum: 150,
        image: '/media/guest/spa-oil.webp'
      },
      {
        id: 'flower-ritual',
        title: 'Dağ çiçəkləri ritualı',
        titleEn: 'Mountain Flower Ritual',
        titleRu: 'Ритуал «Горные цветы»',
        desc: '105 dəqiqə · çiçək vannası, zərif aromaterapiya və masaj',
        price: '140.00 ₼',
        priceNum: 140,
        image: '/media/guest/massage.webp'
      },
      {
        id: 'couples-ritual',
        title: 'Cütlüklər üçün ritual',
        titleEn: 'Couples Ritual',
        titleRu: 'Ритуал для пар',
        desc: '120 dəqiqə · iki nəfər, ayrıca VIP otaq, jakuzi və şampan',
        price: '260.00 ₼',
        priceNum: 260,
        image: '/media/guest/wellness.webp'
      }
    ]
  },
  {
    id: 'phytotherapy',
    code: '4590',
    type: 'category',
    title: 'Fitoterapiya',
    titleEn: 'Plant Therapy',
    titleRu: 'Фитотерапия',
    cover: '/media/guest/spa-salts.webp',
    hours: '09:00 – 22:00',
    items: [
      {
        id: 'herbal-compress',
        title: 'Bitki kompresi masajı',
        titleEn: 'Herbal Compress Massage',
        titleRu: 'Массаж травяными мешочками',
        desc: '75 dəqiqə · isti dağ bitki kisələri ilə orqanizmin bərpası',
        price: '95.00 ₼',
        priceNum: 95,
        image: '/media/guest/spa-oil.webp'
      },
      {
        id: 'phyto-bath',
        title: 'Fito-vanna',
        titleEn: 'Phyto-Bath',
        titleRu: 'Фито-ванна',
        desc: '30 dəqiqə · müalicəvi Qafqaz dağ otları dəmləməsi',
        price: '45.00 ₼',
        priceNum: 45,
        image: '/media/guest/pool-indoor.webp'
      },
      {
        id: 'tea-session',
        title: 'Bitki çayı seansı',
        titleEn: 'Herbal Tea Ceremony',
        titleRu: 'Чайная фито-церемония',
        desc: 'Kəklikotu, nanə, itburnu, bal və çərəz təqdimatı',
        price: '20.00 ₼',
        priceNum: 20,
        image: '/media/guest/elixir.webp'
      }
    ]
  },
  {
    id: 'packages',
    code: '4591',
    type: 'category',
    title: 'SPA paketləri',
    titleEn: 'SPA Packages',
    titleRu: 'SPA-пакеты',
    cover: '/media/guest/wellness.webp',
    hours: '09:00 – 22:00',
    items: [
      {
        id: 'full-day-spa',
        title: 'Bütün gün SPA',
        titleEn: 'Full Day SPA Experience',
        titleRu: 'SPA на целый день',
        desc: 'Hovuz, sauna, hamam + 60 dəq. masaj + sağlam nahar',
        price: '180.00 ₼',
        priceNum: 180,
        image: '/media/guest/wellness.webp'
      },
      {
        id: 'romantic-spa',
        title: 'Romantik SPA (iki nəfər)',
        titleEn: 'Romantic SPA (for 2)',
        titleRu: 'Романтический SPA (для двоих)',
        desc: 'Cütlük masajı, jakuzi, şampan və təzə meyvə təqdimatı',
        price: '320.00 ₼',
        priceNum: 320,
        image: '/media/guest/wellness.webp'
      },
      {
        id: 'detox-day',
        title: 'Detoks günü',
        titleEn: 'Detox Day',
        titleRu: 'Детокс-день',
        desc: 'Duz pilinqi, limfa drenaj masajı və təzə detoks smuzi',
        price: '160.00 ₼',
        priceNum: 160,
        image: '/media/guest/elixir.webp'
      }
    ]
  },
  {
    id: 'etiquette',
    code: '43212',
    type: 'page',
    title: 'SPA etiketi',
    titleEn: 'SPA Etiquette',
    titleRu: 'Правила SPA',
    cover: '/media/guest/pool-indoor.webp',
    hours: '07:00 – 22:00',
    articleContent: `Prosedurdan 10 dəqiqə əvvəl gəlin.\n\n• Spa ərazisində sakitliyə riayət edin, telefonu səssiz rejimə keçirin.\n• Hovuza papaqla və duşdan sonra girin.\n• 16 yaşadək uşaqlar — yalnız valideynlə, 10:00–17:00.\n• Sağlamlıq problemləriniz varsa, terapevtə əvvəlcədən bildirin.\n• Prosedurun pulsuz ləğvi — 4 saat əvvələdək.`,
    items: []
  }
];

export const getSpaCategoryByCodeOrId = (key: string): SpaCategory | undefined => {
  const clean = key.toLowerCase().trim();
  return spaCategories.find(c => c.id.toLowerCase() === clean || c.code === clean);
};
