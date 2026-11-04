import React from 'react';
import {
  IoCall,
  IoNotifications,
  IoWifi,
  IoLogoWhatsapp,
  IoRestaurant,
  IoWine,
  IoSparkles,
  IoWater,
  IoBarbell,
  IoBed,
  IoShirt,
  IoCar,
  IoChevronForward,
  IoTime,
  IoLocation,
  IoSunny,
  IoMoon,
  IoClose,
  IoCheckmark,
  IoCopy,
  IoCalendar,
  IoShareSocial,
  IoHelpCircle,
  IoGlobe,
  IoStar
} from 'react-icons/io5';

import {
  SiBookingdotcom,
  SiTripadvisor,
  SiGooglemaps,
  SiGoogle,
  SiInstagram,
  SiFacebook,
  SiYoutube,
  SiTelegram,
  SiAirbnb,
  SiTiktok,
  SiTrivago
} from 'react-icons/si';

interface IOSIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Official iOS & Brand Icons Pack (Pure Apple iOS & Authentic Brand Standard)
 */
export const IOSIcon: React.FC<IOSIconProps> = ({
  name,
  className = "",
  size = 20,
}) => {
  const props = { size, className };

  switch (name) {
    // Official Brand Logos (from react-icons/si)
    case 'Booking':
    case 'Bookingdotcom':
      return <SiBookingdotcom {...props} />;
    case 'TripAdvisor':
    case 'Tripadvisor':
      return <SiTripadvisor {...props} />;
    case 'Google':
    case 'GoogleMaps':
      return <SiGooglemaps {...props} />;
    case 'GoogleSearch':
      return <SiGoogle {...props} />;
    case 'Instagram':
      return <SiInstagram {...props} />;
    case 'Facebook':
      return <SiFacebook {...props} />;
    case 'Youtube':
    case 'YouTube':
      return <SiYoutube {...props} />;
    case 'Telegram':
      return <SiTelegram {...props} />;
    case 'Airbnb':
      return <SiAirbnb {...props} />;
    case 'Tiktok':
    case 'TikTok':
      return <SiTiktok {...props} />;
    case 'Trivago':
      return <SiTrivago {...props} />;

    // Apple iOS SF / Ionicons Standard
    case 'Phone':
      return <IoCall {...props} />;
    case 'Bell':
    case 'BellConcierge':
      return <IoNotifications {...props} />;
    case 'Wifi':
      return <IoWifi {...props} />;
    case 'MessageCircle':
    case 'Whatsapp':
      return <IoLogoWhatsapp {...props} />;
    case 'Globe':
    case 'Website':
      return <IoGlobe {...props} />;
    case 'Star':
    case 'Review':
      return <IoStar {...props} />;
    case 'Utensils':
    case 'Restaurant':
      return <IoRestaurant {...props} />;
    case 'Wine':
      return <IoWine {...props} />;
    case 'Sparkles':
    case 'Sparkle':
      return <IoSparkles {...props} />;
    case 'Waves':
    case 'Water':
      return <IoWater {...props} />;
    case 'Dumbbell':
    case 'Fitness':
      return <IoBarbell {...props} />;
    case 'Bed':
      return <IoBed {...props} />;
    case 'Shirt':
    case 'Laundry':
      return <IoShirt {...props} />;
    case 'Car':
      return <IoCar {...props} />;
    case 'ChevronRight':
      return <IoChevronForward {...props} />;
    case 'Clock':
      return <IoTime {...props} />;
    case 'MapPin':
      return <IoLocation {...props} />;
    case 'Sun':
      return <IoSunny {...props} />;
    case 'Moon':
      return <IoMoon {...props} />;
    case 'Close':
    case 'X':
      return <IoClose {...props} />;
    case 'Check':
      return <IoCheckmark {...props} />;
    case 'Copy':
      return <IoCopy {...props} />;
    case 'Calendar':
      return <IoCalendar {...props} />;
    case 'Share':
      return <IoShareSocial {...props} />;
    default:
      return <IoHelpCircle {...props} />;
  }
};
