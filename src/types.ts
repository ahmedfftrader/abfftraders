export type ImageHeightVariant = 'nom' | 'big' | 'tall' | 'bag' | 'custom';

export interface FreeFireItem {
  id: string;
  title: string;
  level: string;
  details: string[];
  price: string;
  originalPrice?: string;
  imageUrl: string;
  imageHeightStyle: ImageHeightVariant;
  badges: string[];
  guildStatus?: string;
  isSoldOut: boolean;
  whatsappCustomText?: string;
  createdAt: number;
}

export interface AnnouncementConfig {
  enabled: boolean;
  text: string;
  marquee: boolean;
  tag: string;
}

export interface ContactConfig {
  whatsappNumber: string;
  whatsappDisplay: string;
  tiktokUrl: string;
  paymentNumber: string;
  paymentName: string;
  paymentMethods: string;
  deliverySecurityNote: string;
  logoUrl: string;
  brandName: string;
  brandTagline: string;
}

export interface HeroConfig {
  headingLine1: string;
  headingLine2: string;
  subtitle: string;
  badgeText: string;
}

export interface StoreState {
  items: FreeFireItem[];
  announcement: AnnouncementConfig;
  contact: ContactConfig;
  hero: HeroConfig;
  adminPin: string;
}
