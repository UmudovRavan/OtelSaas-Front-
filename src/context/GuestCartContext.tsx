import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { findFoodItemById, FoodBeverageItem, VenueCategory } from '../data/foodBeverageData';
import { getOfferByIdOrCode } from '../data/dailyOffersData';
import { useFullCatalog } from '../hooks/useHotelData';
import { resolveMediaUrl } from '../utils/media';

export interface DetailedCartItem {
  item: FoodBeverageItem;
  venue: VenueCategory;
  quantity: number;
  subtotal: number;
}

interface GuestCartContextType {
  cart: { [itemId: string]: number };
  addItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  setItemQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  cartItemsDetailed: DetailedCartItem[];
}

const GuestCartContext = createContext<GuestCartContextType | undefined>(undefined);

export const GuestCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<{ [itemId: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('guest_portal_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('guest_portal_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  const addItem = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: current - 1,
      };
    });
  };

  const setItemQuantity = (itemId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: qty,
      };
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const currentSlug = useMemo(() => {
    try {
      const parts = window.location.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        if (parts[0] === 'hotel' && parts[1]) {
          return parts[1];
        }
        if (!['admin', 'superadmin', 'reception', 'login', 'review', 'p', 'c', 'offers', 'cart'].includes(parts[0])) {
          return parts[0];
        }
      }
    } catch {}
    return 'altensor';
  }, []);

  const hasCartItems = useMemo(() => Object.values(cart).some((q) => q > 0), [cart]);
  const { data: fullCatalog } = useFullCatalog(currentSlug, hasCartItems);

  const cartItemsDetailed = useMemo(() => {
    const list: DetailedCartItem[] = [];
    const products = fullCatalog?.products || [];
    const categories = fullCatalog?.categories || [];

    for (const [id, qty] of Object.entries(cart)) {
      if (qty > 0) {
        // 1. Check real backend products first
        const realProduct = products.find(
          (p) => String(p.id) === String(id) || p.guidId === id
        );

        if (realProduct) {
          const cat = categories.find(
            (c) => c.externalId === realProduct.categoryId || c.id === realProduct.categoryGuidId
          );
          list.push({
            item: {
              id: realProduct.guidId || String(realProduct.id),
              name: realProduct.name,
              nameEn: realProduct.nameTr?.en || realProduct.name,
              nameRu: realProduct.nameTr?.ru || realProduct.name,
              price: `${realProduct.price} ₼`,
              priceNum: realProduct.price,
              badge: realProduct.qrBadge?.az || undefined,
              image: realProduct.image ? resolveMediaUrl(realProduct.image) : undefined,
              desc: realProduct.ingredient || undefined,
            },
            venue: {
              id: cat?.id || String(realProduct.categoryId),
              code: String(cat?.externalId || realProduct.categoryId),
              title: cat?.title || realProduct.categoryName || 'Restoran',
              subtitle: cat?.subtitle || '',
              cover: resolveMediaUrl(cat?.imageUrl || realProduct.image, '/media/guest/restaurant-table.webp'),
              hours: cat?.workingHours || '08:00–23:00',
              type: 'restaurant',
              items: [],
            },
            quantity: qty,
            subtotal: realProduct.price * qty,
          });
          continue;
        }

        // 2. Fallback to local files only for altensor / skyhill
        if (currentSlug === 'altensor' || currentSlug === 'skyhill') {
          const found = findFoodItemById(id);
          if (found) {
            list.push({
              item: found.item,
              venue: found.venue,
              quantity: qty,
              subtotal: found.item.priceNum * qty,
            });
            continue;
          }

          const offerFound = getOfferByIdOrCode(id);
          if (offerFound) {
            list.push({
              item: {
                id: offerFound.id,
                name: offerFound.name,
                nameEn: offerFound.nameEn,
                nameRu: offerFound.nameRu,
                price: offerFound.price,
                priceNum: offerFound.priceNum,
                badge: offerFound.badge,
                image: resolveMediaUrl(offerFound.image, '/media/guest/chef-special.webp'),
                desc: offerFound.ingredients,
              },
              venue: {
                id: 'offers',
                code: '4598',
                title: 'Günün təklifləri',
                subtitle: offerFound.subtitle,
                cover: resolveMediaUrl(offerFound.image, '/media/guest/chef-special.webp'),
                hours: 'Bütün gün',
                type: 'restaurant',
                items: [],
              },
              quantity: qty,
              subtotal: offerFound.priceNum * qty,
            });
          }
        }
      }
    }
    return list;
  }, [cart, fullCatalog, currentSlug]);

  const totalCount = useMemo(() => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cartItemsDetailed.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cartItemsDetailed]);

  return (
    <GuestCartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        setItemQuantity,
        clearCart,
        totalCount,
        totalPrice,
        cartItemsDetailed,
      }}
    >
      {children}
    </GuestCartContext.Provider>
  );
};

export const useGuestCart = () => {
  const context = useContext(GuestCartContext);
  if (!context) {
    throw new Error('useGuestCart must be used within a GuestCartProvider');
  }
  return context;
};

