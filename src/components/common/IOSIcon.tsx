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
  IoGlobeOutline,
  IoStar,
  IoPlay,
  IoBusinessOutline,
  IoFlowerOutline,
  IoGameControllerOutline,
  IoPeopleOutline,
  IoGiftOutline,
  IoChatbubbleEllipsesOutline,
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
    case 'globeoutline':
      return <IoGlobeOutline {...props} />;
    case 'play':
      return <IoPlay {...props} />;
    case 'hotelbuilding':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M10 22v-6.57" />
          <path d="M12 11h.01" />
          <path d="M12 7h.01" />
          <path d="M14 15.43V22" />
          <path d="M15 16a5 5 0 0 0-6 0" />
          <path d="M16 11h.01" />
          <path d="M16 7h.01" />
          <path d="M8 11h.01" />
          <path d="M8 7h.01" />
          <rect x="4" y="2" width="16" height="20" rx="2" />
        </svg>
      );
    case 'clochebell':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z" />
          <path d="M20 16a8 8 0 1 0-16 0" />
          <path d="M12 4v4" />
          <path d="M10 4h4" />
        </svg>
      );
    case 'spaflower':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" />
          <circle cx="12" cy="8" r="2" />
          <path d="M12 10v12" />
          <path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z" />
          <path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z" />
        </svg>
      );
    case 'gamepad':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <line x1="6" x2="10" y1="11" y2="11" />
          <line x1="8" x2="8" y1="9" y2="13" />
          <line x1="15" x2="15.01" y1="12" y2="12" />
          <line x1="18" x2="18.01" y1="10" y2="10" />
          <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
        </svg>
      );
    case 'peoplecontact':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <path d="M16 3.128a4 4 0 0 1 0 7.744" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    case 'giftbox':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M12 7v14" />
          <path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
          <path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5" />
          <rect x="3" y="7" width="18" height="4" rx="1" />
        </svg>
      );
    case 'reviewbubble':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
          <path d="M8 12h.01" />
          <path d="M12 12h.01" />
          <path d="M16 12h.01" />
        </svg>
      );
    case 'tilechevron':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    default:
      // Heç bir cihazda '?' (sual işarəsi) çıxmaması üçün parlaq ulduz/konsyerj ikonu qaytarırıq
      return <IoSparkles {...props} />;
  }
};
