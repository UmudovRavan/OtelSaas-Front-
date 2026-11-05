import React from 'react';
import {
  IoCall,
  IoMail,
  IoBook,
  IoCafe,
  IoDocumentText,
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
  IoGlobe,
  IoStar,
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
  SiTrivago,
} from 'react-icons/si';

interface IOSIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Official iOS & Brand Icons Pack (Case-insensitive, supports all backend & frontend icon keys,
 * never renders a '?' question mark icon on any device)
 */
export const IOSIcon: React.FC<IOSIconProps> = ({
  name,
  className = '',
  size = 20,
}) => {
  const props = { size, className };
  const key = (name || '').trim().toLowerCase().replace(/[\s_-]+/g, '');

  switch (key) {
    // Official Brand Logos (from react-icons/si)
    case 'booking':
    case 'bookingdotcom':
    case 'bookingcom':
      return <SiBookingdotcom {...props} />;
    case 'tripadvisor':
      return <SiTripadvisor {...props} />;
    case 'google':
    case 'googlemaps':
    case 'googlereview':
    case 'maps':
      return <SiGooglemaps {...props} />;
    case 'googlesearch':
      return <SiGoogle {...props} />;
    case 'instagram':
    case 'insta':
      return <SiInstagram {...props} />;
    case 'facebook':
    case 'fb':
      return <SiFacebook {...props} />;
    case 'youtube':
    case 'yt':
      return <SiYoutube {...props} />;
    case 'telegram':
    case 'tg':
      return <SiTelegram {...props} />;
    case 'airbnb':
      return <SiAirbnb {...props} />;
    case 'tiktok':
      return <SiTiktok {...props} />;
    case 'trivago':
      return <SiTrivago {...props} />;

    // Apple iOS SF / Ionicons Standard
    case 'phone':
    case 'call':
    case 'tel':
    case 'telephone':
      return <IoCall {...props} />;
    case 'mail':
    case 'email':
    case 'envelope':
    case 'contact':
      return <IoMail {...props} />;
    case 'bell':
    case 'bellconcierge':
    case 'concierge':
    case 'roomservice':
    case 'notification':
      return <IoNotifications {...props} />;
    case 'wifi':
    case 'internet':
      return <IoWifi {...props} />;
    case 'messagecircle':
    case 'whatsapp':
    case 'wa':
    case 'chat':
      return <IoLogoWhatsapp {...props} />;
    case 'globe':
    case 'website':
    case 'web':
    case 'link':
    case 'url':
      return <IoGlobe {...props} />;
    case 'star':
    case 'review':
    case 'rating':
      return <IoStar {...props} />;
    case 'utensils':
    case 'restaurant':
    case 'food':
    case 'dining':
    case 'foodmenu':
    case 'kitchen':
      return <IoRestaurant {...props} />;
    case 'menu':
    case 'book':
    case 'flipbook':
      return <IoBook {...props} />;
    case 'pdf':
    case 'file':
    case 'document':
      return <IoDocumentText {...props} />;
    case 'wine':
    case 'bar':
    case 'barmenu':
    case 'drink':
    case 'drinks':
    case 'cocktail':
    case 'lounge':
      return <IoWine {...props} />;
    case 'coffee':
    case 'cafe':
    case 'breakfast':
      return <IoCafe {...props} />;
    case 'sparkles':
    case 'sparkle':
    case 'spa':
    case 'wellness':
    case 'massage':
    case 'housekeeping':
    case 'clean':
      return <IoSparkles {...props} />;
    case 'waves':
    case 'water':
    case 'pool':
    case 'beach':
    case 'sea':
    case 'swim':
      return <IoWater {...props} />;
    case 'dumbbell':
    case 'fitness':
    case 'gym':
    case 'sport':
    case 'yoga':
      return <IoBarbell {...props} />;
    case 'bed':
    case 'room':
    case 'rooms':
    case 'hotel':
    case 'suite':
      return <IoBed {...props} />;
    case 'shirt':
    case 'laundry':
    case 'drycleaning':
      return <IoShirt {...props} />;
    case 'car':
    case 'taxi':
    case 'transfer':
    case 'transport':
    case 'tour':
      return <IoCar {...props} />;
    case 'chevronright':
    case 'arrowright':
      return <IoChevronForward {...props} />;
    case 'clock':
    case 'time':
      return <IoTime {...props} />;
    case 'mappin':
    case 'location':
    case 'address':
    case 'pin':
      return <IoLocation {...props} />;
    case 'sun':
    case 'light':
      return <IoSunny {...props} />;
    case 'moon':
    case 'dark':
      return <IoMoon {...props} />;
    case 'close':
    case 'x':
      return <IoClose {...props} />;
    case 'check':
    case 'checkmark':
      return <IoCheckmark {...props} />;
    case 'copy':
      return <IoCopy {...props} />;
    case 'calendar':
    case 'event':
    case 'events':
    case 'schedule':
      return <IoCalendar {...props} />;
    case 'share':
      return <IoShareSocial {...props} />;
    default:
      // Heç bir cihazda '?' (sual işarəsi) çıxmaması üçün parlaq ulduz/konsyerj ikonu qaytarırıq
      return <IoSparkles {...props} />;
  }
};
