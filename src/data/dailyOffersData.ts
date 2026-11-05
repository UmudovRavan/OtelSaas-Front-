export interface DailyOfferItem {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  nameRu?: string;
  subtitle: string;
  badge: string;
  price: string;
  priceNum: number;
  image: string;
  categoryName: string;
  ingredients: string;
  isInfoOnly?: boolean;
  ordering: number;
}

export const dailyOffers: DailyOfferItem[] = [
  {
    id: '43230',
    code: '43230',
    name: 'Günün menyusu',
    nameEn: "Today's Menu",
    nameRu: 'Меню дня',
    subtitle: 'SHIRVAN',
    badge: 'Yalnız bu gün',
    price: '35.00 ₼',
    priceNum: 35,
    image: '/media/guest/plate.webp',
    categoryName: 'Bu günün təklifləri',
    ingredients: 'SHIRVAN\nAşpazın seçimi: salat, isti yemək və desert.',
    isInfoOnly: false,
    ordering: 1,
  },
  {
    id: '43231',
    code: '43231',
    name: 'Qəhvə və desert',
    nameEn: 'Coffee & Dessert',
    nameRu: 'Кофе и десерт',
    subtitle: 'SAQI',
    badge: 'Xüsusi təklif',
    price: '9.00 ₼',
    priceNum: 9,
    image: '/media/guest/coffee-cake.webp',
    categoryName: 'Bu günün təklifləri',
    ingredients: 'SAQI\nİstənilən qəhvə + günün tortu.',
    isInfoOnly: false,
    ordering: 2,
  },
  {
    id: '43232',
    code: '43232',
    name: 'SPA günü paketi',
    nameEn: 'SPA Day Package',
    nameRu: 'Пакет «SPA-день»',
    subtitle: 'MARAL SPA',
    badge: 'Bu həftə',
    price: '180.00 ₼',
    priceNum: 180,
    image: '/media/guest/massage.webp',
    categoryName: 'Bu günün təklifləri',
    ingredients: 'MARAL SPA\nHovuz, sauna, hamam + 60 dəq. masaj.',
    isInfoOnly: false,
    ordering: 3,
  },
  {
    id: '43233',
    code: '43233',
    name: 'Uşaq fəaliyyəti',
    nameEn: 'Kids Activity',
    nameRu: 'Детские занятия',
    subtitle: 'Uşaq oyun otağı',
    badge: 'Həftəsonu xüsusi',
    price: '',
    priceNum: 0,
    image: '/media/guest/kids-room.webp',
    categoryName: 'Bu günün təklifləri',
    ingredients: 'Uşaq oyun otağı\nRəsm, əl işləri və mini-disko — 11:00 və 16:00.',
    isInfoOnly: true,
    ordering: 4,
  },
  {
    id: '43234',
    code: '43234',
    name: 'Gün batımı yürüşü',
    nameEn: 'Sunset Hike',
    nameRu: 'Прогулка на закате',
    subtitle: 'Bələdçi ilə · 18:30',
    badge: 'Bu axşam',
    price: '20.00 ₼',
    priceNum: 20,
    image: '/media/guest/mountain-sunset.webp',
    categoryName: 'Bu günün təklifləri',
    ingredients: 'Bələdçi ilə · 18:30\nMənzərə nöqtəsində isti çay.',
    isInfoOnly: false,
    ordering: 5,
  },
];

export const getOfferByIdOrCode = (idOrCode: string): DailyOfferItem | undefined => {
  return dailyOffers.find((o) => o.id === idOrCode || o.code === idOrCode);
};

