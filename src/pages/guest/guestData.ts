export interface HotelServiceLink {
  id: string;
  title: string;
  subtitle?: string;
  iconName: string;
  badge?: string;
  actionUrl?: string;
  isExternal?: boolean;
}

export interface ServiceCategory {
  id: string;
  title: string;
  items: HotelServiceLink[];
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  location: string;
  category: string;
}

export interface HotelData {
  name: string;
  stars: number;
  description: string;
  coverImage: string;
  logo: string;
  phone: string;
  whatsapp: string;
  wifi: {
    ssid: string;
    pass: string;
  };
  address: string;
  mapUrl: string;
  categories: ServiceCategory[];
  activities: ActivityItem[];
}

export const defaultHotelData: HotelData = {
  name: "Hotel & Resort Baku",
  stars: 5,
  description: "Xoş gəlmisiniz! Sizin rahatlığınız və unudulmaz istirahətiniz üçün 24/7 xidmətinizdəyik.",
  coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80",
  phone: "+994 12 599 00 00",
  whatsapp: "994501234567",
  wifi: {
    ssid: "HotelResort_Guest",
    pass: "BakuResort2026",
  },
  address: "Neftçilər prospekti 102, Bakı",
  mapUrl: "https://maps.google.com",
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
          subtitle: "24 saat otağınıza çatdırılma",
          iconName: "BellConcierge",
          badge: "24/7",
          actionUrl: "#room-service",
        },
        {
          id: "d3",
          title: "Lounge & Kokteyl Bar",
          subtitle: "Xüsusi içkilər və qəlyanaltılar",
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
          title: "Fitness Mərkəzi",
          subtitle: "07:00 - 23:00 / Peşəkar avadanlıqlar",
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
          subtitle: "Əlavə yastıq, yorğan və ləvazimatlar",
          iconName: "Sparkle",
          actionUrl: "#housekeeping",
        },
        {
          id: "s2",
          title: "Paltaryuyan & Quru Təmizləmə",
          subtitle: "Ekspres xidmət mövcuddur",
          iconName: "Shirt",
          actionUrl: "#laundry",
        },
        {
          id: "s3",
          title: "Transfer & Şəhər Turları",
          subtitle: "Hava limanı qarşılama və VIP turlar",
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
};

