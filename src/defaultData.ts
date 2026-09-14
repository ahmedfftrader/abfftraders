import { StoreState, FreeFireItem } from './types';

// Persistent in-memory registry for item sold-out status across all sessions and fallbacks
const soldOutRegistry = new Map<string, boolean>();

export const registerSoldOutStatus = (id: string, isSoldOut: boolean) => {
  soldOutRegistry.set(id, isSoldOut);
};

export const getSoldOutStatus = (id: string, defaultStatus: boolean = false): boolean => {
  return soldOutRegistry.has(id) ? Boolean(soldOutRegistry.get(id)) : defaultStatus;
};

export const applySoldOutRegistry = (items: FreeFireItem[]): FreeFireItem[] => {
  return items.map((item) => ({
    ...item,
    isSoldOut: soldOutRegistry.has(item.id)
      ? Boolean(soldOutRegistry.get(item.id))
      : Boolean(item.isSoldOut),
  }));
};

export const DEFAULT_STORE_STATE: StoreState = {
  adminPin: 'opahmimetr1x',
  announcement: {
    enabled: true,
    text: '🔥 MEGA DEAL: Verified Free Fire IDs & Guilds Available! Fast WhatsApp Transfer | Trusted by Pak Top Creators ⚡',
    marquee: true,
    tag: 'OFFER 🔥',
  },
  hero: {
    headingLine1: 'Free Fire IDs',
    headingLine2: 'Listed',
    subtitle: 'We Are Verified With Pak Top Creators ALHUMDULLILAH! 💯',
    badgeText: '⚡ 100% SAFE & TRUSTED STORE ⚡',
  },
  contact: {
    whatsappNumber: '923132478759',
    whatsappDisplay: '+92 313 2478759',
    tiktokUrl: 'https://www.tiktok.com/@ahmed_bhai05',
    paymentNumber: '03403782084',
    paymentName: 'Iram Sabeen',
    paymentMethods: 'Easypaisa / Jazzcash',
    deliverySecurityNote:
      'Agar ID Sale krni hai to First Security Then Payment process. Buying par Payment SS ke baad ID mil jaye gi. 🔥',
    logoUrl: 'https://i.ibb.co/67pk7bC9/304173.png',
    brandName: 'AHMED BHAI',
    brandTagline: 'Buy & Sell Game IDs & Resources',
  },
  items: [
    {
      id: 'ff-item-1',
      title: 'RARE ID',
      level: 'Lv. 65',
      guildStatus: 'Solo Verified Account',
      badges: ['RARE', 'POPULAR'],
      details: [
        '✅ 250+ LOADED VAULT',
        '✅ 40 LUSH EMOTES',
        '✅ 3 ENTRY + 7 EVO GUNS',
      ],
      price: 'Rs. 6,000',
      originalPrice: 'Rs. 7,500',
      imageUrl: 'https://i.ibb.co/TD0HY5YL/IMG-20260906-WA0005.jpg',
      imageHeightStyle: 'nom',
      isSoldOut: false,
      whatsappCustomText: 'Mujhe RARE ID LENI HAI',
      createdAt: 1710000000000,
    },
    {
      id: 'ff-item-2',
      title: 'OLD ID',
      level: 'Lv. 70',
      guildStatus: 'Single Link Pure Old',
      badges: ['OLD ACCOUNT'],
      details: [
        '✅ 330 LOADED VAULT',
        '✅ AK ALMOST LVL 5',
        '✅ 1 ENTRY + 42 LUSH EMOTES',
        '✅ RATE OF FIRE SKINS + SINGLE LINK',
      ],
      price: 'Rs. 4,000',
      originalPrice: 'Rs. 5,500',
      imageUrl: 'https://i.ibb.co/ccrQKQCX/IMG-20260906-WA0007.jpg',
      imageHeightStyle: 'tall',
      isSoldOut: false,
      whatsappCustomText: 'MUJHE OLD ID BUY KRNI HAI',
      createdAt: 1710000001000,
    },
    {
      id: 'ff-item-3',
      title: 'LEVEL 6 GUILD',
      level: 'Lv. 6',
      guildStatus: 'Level 6 Active Guild',
      badges: ['GUILD', 'HIGH DEMAND'],
      details: [
        '✅ 43 SPACE',
        '✅ TEAM CS:name',
        '✅ HIGH DEMAND',
      ],
      price: 'Rs. 2,500',
      originalPrice: 'Rs. 3,500',
      imageUrl: 'https://i.ibb.co/Q7q2J8g4/IMG-20260906-WA0003-1.jpg',
      imageHeightStyle: 'bag',
      isSoldOut: false,
      whatsappCustomText: 'MUJHE GUILD Player LA NI HAI',
      createdAt: 1710000002000,
    },
    {
      id: 'ff-item-4',
      title: 'Exclusive VIP ID',
      level: 'Lv. 67',
      guildStatus: 'VIP Loaded Collection',
      badges: ['VIP', 'EXCLUSIVE'],
      details: [
        '✅ 300 LOADED VAULT & COMBINATION',
        '✅ 3000+ DIAMONDS💎 CLAIMABLE',
        '✅ 2 ENTRY + 54 TOP EMOTES',
        '✅ 16 EVO GUNS WITH TOPS',
      ],
      price: 'Rs. 16,500',
      originalPrice: 'Rs. 19,000',
      imageUrl: 'https://i.ibb.co/JFvVvrs2/IMG-20260906-WA0009.jpg',
      imageHeightStyle: 'big',
      isSoldOut: false,
      whatsappCustomText: 'MUJHE VIP ID LENI HAI',
      createdAt: 1710000003000,
    },
  ],
};

export const getFallbackStoreState = (): StoreState => {
  return {
    ...DEFAULT_STORE_STATE,
    items: applySoldOutRegistry(DEFAULT_STORE_STATE.items),
  };
};
