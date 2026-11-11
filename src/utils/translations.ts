export type Language = 'az' | 'en' | 'ru';

export interface ServiceItemTranslation {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  badge?: string;
  actionUrl?: string;
}

export interface CategoryTranslation {
  id: string;
  title: string;
  items: ServiceItemTranslation[];
}

export interface ActivityTranslation {
  id: string;
  title: string;
  time: string;
  location: string;
  category: string;
}

export interface TranslationSchema {
  statusActive: string;
  starsLabel: string;
  hotelName: string;
  hotelDescription: string;
  quickActions: {
    roomService: string;
    wifi: string;
    whatsapp: string;
    call: string;
  };
  tabs: {
    services: string;
    activities: string;
  };
  todaySchedule: string;
  allResort: string;
  wifiBanner: {
    title: string;
    action: string;
    connectBtn: string;
  };
  wifiModal: {
    title: string;
    desc: string;
    ssidLabel: string;
    passLabel: string;
    copy: string;
    copied: string;
    close: string;
  };
  inquiry: {
    title: string;
    desc: string;
    quickNeedsLabel: string;
    quickNeeds: string[];
    roomLabel: string;
    roomPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitBtn: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
  };
  serviceModal: {
    orderBtn: string;
    closeBtn: string;
  };
  footerAddress: string;
  footerPowered: string;
  categories: CategoryTranslation[];
  activities: ActivityTranslation[];
}

export const translations: Record<Language, TranslationSchema> = {
  az: {
    statusActive: "Otaq Xidməti Aktivdir",
    starsLabel: "5 Ulduzlu Lüks Qonaqlama",
    hotelName: "Altensor Otel",
    hotelDescription: "Lənkəranın füsunkar təbiətində yerləşən Altensor Otel-ə xoş gəlmisiniz! Sizin rahatlığınız və unudulmaz istirahətiniz üçün 24/7 xidmətinizdəyik.",
    quickActions: {
      roomService: "Otaq Servisi",
      wifi: "Wi-Fi",
      whatsapp: "WhatsApp",
      call: "Zəng Et",
    },
    tabs: {
      services: "Xidmətlər & Menyular",
      activities: "Gündəlik Tədbirlər",
    },
    todaySchedule: "Bugünkü Proqram",
    allResort: "Bütün Otel Ərazisi",
    wifiBanner: {
      title: "Qonaq Wi-Fi Şəbəkəsi",
      action: "Şifrəni göstər",
      connectBtn: "Qoşul",
    },
    wifiModal: {
      title: "Yüksək Sürətli Wi-Fi",
      desc: "Otel ərazisində limitsiz və ödənişsiz internet şəbəkəsi",
      ssidLabel: "Şəbəkə Adı (SSID)",
      passLabel: "Şifrə (Password)",
      copy: "Kopyala",
      copied: "Kopyalandı",
      close: "Bağla",
    },
    inquiry: {
      title: "Otaq Xidməti & Resepşn",
      desc: "İstəyinizi bildirin, personalımız dərhal otağınıza təmin etsin.",
      quickNeedsLabel: "Sürətli Tələblər",
      quickNeeds: [
        "Əlavə Dəsmal",
        "Otaq Təmizliyi",
        "Su & Çay dəsti",
        "Yastıq / Yorğan",
        "Texniki Kömək",
      ],
      roomLabel: "Otaq № *",
      roomPlaceholder: "304",
      nameLabel: "Adınız & Soyadınız",
      namePlaceholder: "Məs: Əli Məmmədov",
      phoneLabel: "Telefon / WhatsApp Nömrəniz *",
      phonePlaceholder: "+994 50 123 45 67",
      messageLabel: "Ətraflı Qeyd (İstəyə görə)",
      messagePlaceholder: "Xahiş edirik əlavə 2 şüşə qazsız su və 1 ədəd böyük hamam dəsmalı gətirin...",
      submitBtn: "Müraciəti Resepşna Göndər",
      submitting: "Göndərilir...",
      successTitle: "Müraciətiniz Qəbul Edildi!",
      successDesc: "Resepşn komandamız dərhal müraciətinizlə maraqlanır və otağınıza yönləndirilir.",
    },
    serviceModal: {
      orderBtn: "Resepşna Sifariş / Sual Göndər",
      closeBtn: "Geri Qayıt",
    },
    footerAddress: "Heydər Əliyev prospekti, Lənkəran, Azərbaycan",
    footerPowered: "Powered by Hotel QR Concierge SaaS",
    categories: [
      {
        id: "dining",
        title: "Restoran & Otaq Sifarişi",
        items: [
          {
            id: "d1",
            title: "Əsas Restoran Menyusu",
            subtitle: "Səhər yeməyi, nahar və şam yeməyi",
            iconName: "Utensils",
            badge: "Açıqdır",
            actionUrl: "#menu",
          },
          {
            id: "d2",
            title: "Otağa Yemək Sifarişi (Room Service)",
            subtitle: "24 saat otağınıza operativ çatdırılma",
            iconName: "Bell",
            badge: "24/7",
            actionUrl: "#room-service",
          },
          {
            id: "d3",
            title: "Lounge & Kokteyl Bar",
            subtitle: "Eksklüziv içkilər və qəlyanaltılar",
            iconName: "Wine",
            actionUrl: "#bar",
          },
        ],
      },
      {
        id: "wellness",
        title: "Sağlamlıq & İstirahət",
        items: [
          {
            id: "w1",
            title: "Spa & Masaj Rezervasiyası",
            subtitle: "Türk hamamı, sauna və aromaterapiya",
            iconName: "Sparkles",
            actionUrl: "#spa",
          },
          {
            id: "w2",
            title: "Açıq Hovuz & Çimərlik Klubu",
            subtitle: "Dəsmal xidməti və xilasedici nəzarəti",
            iconName: "Waves",
            actionUrl: "#pool",
          },
          {
            id: "w3",
            title: "Fitness & İdman Mərkəzi",
            subtitle: "07:00 - 23:00 / Peşəkar trenajorlar",
            iconName: "Dumbbell",
            actionUrl: "#fitness",
          },
        ],
      },
      {
        id: "services",
        title: "Otel Xidmətləri & Məlumat",
        items: [
          {
            id: "s1",
            title: "Otaq Təmizliyi & Dəsmal İstəyi",
            subtitle: "Əlavə yastıq, yorğan və təmizlik ləvazimatları",
            iconName: "Bed",
            actionUrl: "#housekeeping",
          },
          {
            id: "s2",
            title: "Paltaryuyan & Quru Təmizləmə",
            subtitle: "Ekspres xidmət və ütüləmə",
            iconName: "Shirt",
            actionUrl: "#laundry",
          },
          {
            id: "s3",
            title: "Transfer & Şəhər Turları",
            subtitle: "Hava limanı qarşılama və VIP avtomobil xidməti",
            iconName: "Car",
            actionUrl: "#transfer",
          },
        ],
      },
    ],
    activities: [
      {
        id: "a1",
        title: "Hovuz Kənarı Canlı DJ Set",
        time: "16:00 - 18:30",
        location: "Əsas Açıq Hovuz",
        category: "Əyləncə",
      },
      {
        id: "a2",
        title: "Uşaqlar üçün Əyləncəli Oyunlar",
        time: "17:00 - 19:00",
        location: "Kids Club",
        category: "Ailə",
      },
      {
        id: "a3",
        title: "Caz Gecəsi & Canlı Vokal",
        time: "20:30 - 23:00",
        location: "Panorama Lounge Bar",
        category: "Musiqi",
      },
    ],
  },
  en: {
    statusActive: "Room Service Active",
    starsLabel: "5-Star Luxury Stay",
    hotelName: "Altensor Hotel",
    hotelDescription: "Welcome to Altensor Hotel, nestled in the scenic subtropical nature of Lankaran! We are at your service 24/7 for your ultimate comfort and unforgettable vacation.",
    quickActions: {
      roomService: "Room Service",
      wifi: "Wi-Fi",
      whatsapp: "WhatsApp",
      call: "Call Us",
    },
    tabs: {
      services: "Services & Menus",
      activities: "Daily Activities",
    },
    todaySchedule: "Today's Schedule",
    allResort: "All Resort Areas",
    wifiBanner: {
      title: "Guest Wi-Fi Network",
      action: "Show password",
      connectBtn: "Connect",
    },
    wifiModal: {
      title: "High-Speed Wi-Fi",
      desc: "Free and unlimited high-speed internet across the entire hotel",
      ssidLabel: "Network Name (SSID)",
      passLabel: "Password",
      copy: "Copy",
      copied: "Copied",
      close: "Close",
    },
    inquiry: {
      title: "Room Service & Reception",
      desc: "State your request, and our team will attend to your room immediately.",
      quickNeedsLabel: "Quick Needs",
      quickNeeds: [
        "Extra Towels",
        "Housekeeping",
        "Water & Tea Set",
        "Pillow / Blanket",
        "Technical Help",
      ],
      roomLabel: "Room № *",
      roomPlaceholder: "304",
      nameLabel: "Full Name",
      namePlaceholder: "E.g. John Doe",
      phoneLabel: "Phone / WhatsApp Number *",
      phonePlaceholder: "+994 50 123 45 67",
      messageLabel: "Detailed Note (Optional)",
      messagePlaceholder: "Please bring 2 bottles of still water and an extra bath towel...",
      submitBtn: "Send Request to Reception",
      submitting: "Sending...",
      successTitle: "Request Received!",
      successDesc: "Our reception team has received your request and is attending to your room right away.",
    },
    serviceModal: {
      orderBtn: "Send Order / Question to Reception",
      closeBtn: "Go Back",
    },
    footerAddress: "Heydar Aliyev Avenue, Lankaran, Azerbaijan",
    footerPowered: "Powered by Hotel QR Concierge SaaS",
    categories: [
      {
        id: "dining",
        title: "Dining & Room Service",
        items: [
          {
            id: "d1",
            title: "Main Restaurant Menu",
            subtitle: "Breakfast, lunch, and dinner à la carte",
            iconName: "Utensils",
            badge: "Open Now",
            actionUrl: "#menu",
          },
          {
            id: "d2",
            title: "In-Room Dining (Room Service)",
            subtitle: "24-hour fast delivery to your room",
            iconName: "Bell",
            badge: "24/7",
            actionUrl: "#room-service",
          },
          {
            id: "d3",
            title: "Lounge & Cocktail Bar",
            subtitle: "Signature cocktails, fine wines & light bites",
            iconName: "Wine",
            actionUrl: "#bar",
          },
        ],
      },
      {
        id: "wellness",
        title: "Wellness & Leisure",
        items: [
          {
            id: "w1",
            title: "Spa & Massage Booking",
            subtitle: "Turkish bath, sauna & holistic aromatherapy",
            iconName: "Sparkles",
            actionUrl: "#spa",
          },
          {
            id: "w2",
            title: "Outdoor Pool & Beach Club",
            subtitle: "Complimentary towels & lifeguard on duty",
            iconName: "Waves",
            actionUrl: "#pool",
          },
          {
            id: "w3",
            title: "Fitness & Gym Center",
            subtitle: "07:00 - 23:00 / Professional cardio & weights",
            iconName: "Dumbbell",
            actionUrl: "#fitness",
          },
        ],
      },
      {
        id: "services",
        title: "Hotel Services & Info",
        items: [
          {
            id: "s1",
            title: "Housekeeping & Towel Request",
            subtitle: "Extra pillows, duvets & bathroom amenities",
            iconName: "Bed",
            actionUrl: "#housekeeping",
          },
          {
            id: "s2",
            title: "Laundry & Dry Cleaning",
            subtitle: "Express laundry, ironing & dry clean services",
            iconName: "Shirt",
            actionUrl: "#laundry",
          },
          {
            id: "s3",
            title: "Airport Transfer & City Tours",
            subtitle: "Airport pick-up, VIP transfers & guided excursions",
            iconName: "Car",
            actionUrl: "#transfer",
          },
        ],
      },
    ],
    activities: [
      {
        id: "a1",
        title: "Poolside Live DJ Set",
        time: "16:00 - 18:30",
        location: "Main Outdoor Pool",
        category: "Entertainment",
      },
      {
        id: "a2",
        title: "Kids Club Fun Games",
        time: "17:00 - 19:00",
        location: "Kids Club Arena",
        category: "Family",
      },
      {
        id: "a3",
        title: "Jazz Night & Live Vocal",
        time: "20:30 - 23:00",
        location: "Panorama Lounge Bar",
        category: "Music",
      },
    ],
  },
  ru: {
    statusActive: "Обслуживание номеров активно",
    starsLabel: "5-звездочный отель",
    hotelName: "Отель Altensor",
    hotelDescription: "Добро пожаловать в отель Altensor в Ленкорани! Мы к вашим услугам 24/7 для вашего максимального комфорта и незабываемого отдыха.",
    quickActions: {
      roomService: "Сервис в номер",
      wifi: "Wi-Fi",
      whatsapp: "WhatsApp",
      call: "Позвонить",
    },
    tabs: {
      services: "Услуги и меню",
      activities: "Мероприятия",
    },
    todaySchedule: "Расписание на сегодня",
    allResort: "Вся территория отеля",
    wifiBanner: {
      title: "Гостевой Wi-Fi",
      action: "Показать пароль",
      connectBtn: "Подключить",
    },
    wifiModal: {
      title: "Высокоскоростной Wi-Fi",
      desc: "Бесплатный и безлимитный интернет на всей территории отеля",
      ssidLabel: "Имя сети (SSID)",
      passLabel: "Пароль",
      copy: "Копировать",
      copied: "Скопировано",
      close: "Закрыть",
    },
    inquiry: {
      title: "Обслуживание номеров и ресепшн",
      desc: "Укажите ваш запрос, и наш персонал оперативно выполнит его.",
      quickNeedsLabel: "Быстрый выбор",
      quickNeeds: [
        "Доп. полотенца",
        "Уборка номера",
        "Вода и чай",
        "Подушка / Одеяло",
        "Техпомощь",
      ],
      roomLabel: "Номер комнаты *",
      roomPlaceholder: "304",
      nameLabel: "Ваше имя и фамилия",
      namePlaceholder: "Напр: Иван Иванов",
      phoneLabel: "Номер телефона / WhatsApp *",
      phonePlaceholder: "+994 50 123 45 67",
      messageLabel: "Примечание (Необязательно)",
      messagePlaceholder: "Пожалуйста, принесите 2 бутылки воды и дополнительное банное полотенце...",
      submitBtn: "Отправить на ресепшн",
      submitting: "Отправка...",
      successTitle: "Запрос принят!",
      successDesc: "Наша служба ресепшн уже приняла заявку и занимается вашим номером.",
    },
    serviceModal: {
      orderBtn: "Отправить заказ / вопрос на ресепшн",
      closeBtn: "Назад",
    },
    footerAddress: "Проспект Гейдара Алиева, Ленкорань, Азербайджан",
    footerPowered: "Powered by Hotel QR Concierge SaaS",
    categories: [
      {
        id: "dining",
        title: "Ресторан и заказ в номер",
        items: [
          {
            id: "d1",
            title: "Меню главного ресторана",
            subtitle: "Завтрак, обед и ужин à la carte",
            iconName: "Utensils",
            badge: "Открыто",
            actionUrl: "#menu",
          },
          {
            id: "d2",
            title: "Заказ еды в номер (Room Service)",
            subtitle: "Круглосуточная доставка блюд в ваш номер",
            iconName: "Bell",
            badge: "24/7",
            actionUrl: "#room-service",
          },
          {
            id: "d3",
            title: "Лаундж и коктейль-бар",
            subtitle: "Фирменные коктейли, напитки и закуски",
            iconName: "Wine",
            actionUrl: "#bar",
          },
        ],
      },
      {
        id: "wellness",
        title: "Спа и отдых",
        items: [
          {
            id: "w1",
            title: "Спа и массаж",
            subtitle: "Турецкий хаммам, сауна и ароматерапия",
            iconName: "Sparkles",
            actionUrl: "#spa",
          },
          {
            id: "w2",
            title: "Открытый бассейн и пляжный клуб",
            subtitle: "Предоставление полотенец и служба спасателей",
            iconName: "Waves",
            actionUrl: "#pool",
          },
          {
            id: "w3",
            title: "Фитнес и тренажерный зал",
            subtitle: "07:00 - 23:00 / Современные тренажеры",
            iconName: "Dumbbell",
            actionUrl: "#fitness",
          },
        ],
      },
      {
        id: "services",
        title: "Услуги отеля и информация",
        items: [
          {
            id: "s1",
            title: "Уборка номера и полотенца",
            subtitle: "Дополнительные подушки, одеяла и принадлежности",
            iconName: "Bed",
            actionUrl: "#housekeeping",
          },
          {
            id: "s2",
            title: "Прачечная и химчистка",
            subtitle: "Экспресс-стирка, глажка и бережный уход",
            iconName: "Shirt",
            actionUrl: "#laundry",
          },
          {
            id: "s3",
            title: "Трансфер и городские экскурсии",
            subtitle: "Встреча в аэропорту и VIP-автомобили",
            iconName: "Car",
            actionUrl: "#transfer",
          },
        ],
      },
    ],
    activities: [
      {
        id: "a1",
        title: "Живой DJ-сет у бассейна",
        time: "16:00 - 18:30",
        location: "Главный открытый бассейн",
        category: "Развлечения",
      },
      {
        id: "a2",
        title: "Игры для детей в Kids Club",
        time: "17:00 - 19:00",
        location: "Детский клуб",
        category: "Для всей семьи",
      },
      {
        id: "a3",
        title: "Джазовый вечер и живой вокал",
        time: "20:30 - 23:00",
        location: "Панорамный лаундж-бар",
        category: "Музыка",
      },
    ],
  },
};

