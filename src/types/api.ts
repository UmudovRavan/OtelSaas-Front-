// 🏨 Hotel QR SaaS — Shared API Types & DTOs

export enum SubscriptionStatus {
  Active = 1,
  Trial = 2,
  Suspended = 3,
  Expired = 4,
}

export enum NotificationChannel {
  None = 0,
  Email = 1,
  Telegram = 2,
  Both = 3,
}

export enum LinkType {
  StandardUrl = 1,
  Phone = 2,
  Email = 3,
  WhatsApp = 4,
  Telegram = 5,
  PdfMenu = 6,
  Flipbook = 7,
  GoogleReview = 8,
  TripAdvisor = 9,
  Booking = 10,
  Location = 11,
}

export enum InquiryStatus {
  New = 1,
  InProgress = 2,
  Resolved = 3,
  Archived = 4,
}

export enum ThemeMode {
  Dark = 1,
  Light = 2,
  System = 3,
}

export enum AnalyticsEventType {
  ProfileView = 1,
  LinkClick = 2,
  VCardDownload = 3,
  InquirySubmitted = 4,
  QrCodeScan = 5,
  OrderSubmitted = 6,
  ReviewSubmitted = 7,
  CatalogItemView = 8,
}

export enum HubType {
  HotelInfo = 1,
  FoodAndBeverage = 2,
  SpaAndWellness = 3,
  Entertainment = 4,
  Contacts = 5,
  DailySpecials = 6,
  Custom = 7,
}

export enum CatalogItemType {
  InfoArticle = 1,
  MenuProduct = 2,
  SpaService = 3,
  ActivityOffer = 4,
  SpecialDeal = 5,
}

export enum OrderType {
  RoomService = 1,
  RestaurantTable = 2,
  SpaReservation = 3,
  ActivityBooking = 4,
}

export enum OrderStatus {
  New = 1,
  Accepted = 2,
  Preparing = 3,
  Completed = 4,
  Cancelled = 5,
}

export interface LocalizedText {
  az: string;
  en?: string | null;
  ru?: string | null;
}

// ======================== Public Portal DTOs ========================

export interface PublicStory {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  bannerImageUrl?: string | null;
  badgeText?: string | null;
  actionUrl?: string | null;
  displayOrder: number;
  externalId?: number | null;
  videoUrl?: string | null;
  buttonText?: string | null;
  titleTr?: LocalizedText | null;
  captionTr?: LocalizedText | null;
  buttonTr?: LocalizedText | null;
}

export interface PublicHubSummary {
  id: string;
  code: string;
  hubType: HubType;
  kicker?: string | null;
  title: string;
  subtitle?: string | null;
  iconKey?: string | null;
  coverImageUrl?: string | null;
  displayOrder: number;
  externalId?: number | null;
  displayMode: 'categories' | 'filter_items' | 'direct_items' | string;
  kickerTr?: LocalizedText | null;
  titleTr?: LocalizedText | null;
  subtitleTr?: LocalizedText | null;
}

export interface PublicCatalogCategory {
  id: string;
  hubId: string;
  parentCategoryId?: string | null;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  iconKey?: string | null;
  workingHours?: string | null;
  internalExtension?: string | null;
  layoutStyle: string;
  displayOrder: number;
  itemsCount: number;
  externalId?: number | null;
  collapseIfSingleItem: boolean;
  singleItemId?: string | null;
  singleItemExternalId?: number | null;
  targetUrl?: string | null;
  actionType?: string | null;
  actionValue?: string | null;
  titleTr?: LocalizedText | null;
  subtitleTr?: LocalizedText | null;
}

export interface PublicCatalogItem {
  id: string;
  hubId: string;
  categoryId?: string | null;
  itemType: CatalogItemType;
  title: string;
  description?: string | null;
  badge?: string | null;
  filterTag?: string | null;
  price?: number | null;
  oldPrice?: number | null;
  currency: string;
  portionOrDuration?: string | null;
  bulletPoints: string[];
  imageUrl?: string | null;
  isOrderable: boolean;
  isFeaturedInDailySpecials: boolean;
  actionLabel?: string | null;
  actionUrl?: string | null;
  displayOrder: number;
  externalId?: number | null;
  categoryExternalId?: number | null;
  hubExternalId?: number | null;
  subtitle?: string | null;
  iconKey?: string | null;
  actionType?: string | null;
  actionValue?: string | null;
  discountPercent: number;
  costPrice: number;
  prepTimeMinutes?: number | null;
  noServiceFee: boolean;
  titleTr?: LocalizedText | null;
  subtitleTr?: LocalizedText | null;
  descriptionTr?: LocalizedText | null;
  badgeTr?: LocalizedText | null;
  categoryNameTr?: LocalizedText | null;
  actionLabelTr?: LocalizedText | null;
  modifierGroups?: any[] | null;
}

export interface PublicDepartmentContact {
  id: string;
  title: string;
  subtitle?: string | null;
  phoneNumber?: string | null;
  internalExtension?: string | null;
  whatsAppNumber?: string | null;
  email?: string | null;
  workingHours?: string | null;
  iconKey?: string | null;
  displayOrder: number;
  titleTr?: LocalizedText | null;
  subtitleTr?: LocalizedText | null;
}

export interface PublicHubDetail {
  id: string;
  code: string;
  hubType: HubType;
  kicker?: string | null;
  title: string;
  subtitle?: string | null;
  iconKey?: string | null;
  coverImageUrl?: string | null;
  categories: PublicCatalogCategory[];
  directItems: PublicCatalogItem[];
  departmentContacts?: PublicDepartmentContact[] | null;
  externalId?: number | null;
  displayMode: string;
  kickerTr?: LocalizedText | null;
  titleTr?: LocalizedText | null;
  subtitleTr?: LocalizedText | null;
}

export interface PublicCatalogCategoryDetail {
  id: string;
  hubId: string;
  hubTitle: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  workingHours?: string | null;
  internalExtension?: string | null;
  layoutStyle: string;
  subCategories: PublicCatalogCategory[];
  items: PublicCatalogItem[];
  externalId?: number | null;
  hubExternalId?: number | null;
  hubCode?: string | null;
  titleTr?: LocalizedText | null;
  subtitleTr?: LocalizedText | null;
  hubTitleTr?: LocalizedText | null;
}

export interface PublicCategory {
  id: string;
  title: string;
  layoutType: string;
  displayOrder: number;
  links: PublicLink[];
}

export interface PublicLink {
  id: string;
  title: string;
  linkType: LinkType;
  actionUrl?: string | null;
  iconKey?: string | null;
  isCustomIcon: boolean;
  openInNewTab: boolean;
  displayOrder: number;
}

export interface PublicActivity {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: string;
  endTime?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  date?: string | null;
}

export interface PublicHotelPortal {
  name: string;
  slug: string;
  bio?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  primaryColor: string;
  themeMode: ThemeMode;
  phone?: string | null;
  email?: string | null;
  whatsApp?: string | null;
  telegram?: string | null;
  address?: string | null;
  mapUrl?: string | null;
  categories: PublicCategory[];
  activities?: PublicActivity[] | null;
  subtitle?: string | null;
  starRating?: number | null;
  stories?: PublicStory[] | null;
  hubs?: PublicHubSummary[] | null;
  dailySpecials?: PublicCatalogItem[] | null;
  departmentContacts?: PublicDepartmentContact[] | null;
  tagline?: string | null;
  subtitleTr?: LocalizedText | null;
  taglineTr?: LocalizedText | null;
  bioTr?: LocalizedText | null;
  currencyCode: string;
  serviceFeePercent: number;
  themePreset: string;
  themeStyle: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  tikTokUrl?: string | null;
  tripAdvisorUrl?: string | null;
  bookingUrl?: string | null;
}

export interface UniPosProduct {
  id: number;
  guidId: string;
  name: string;
  nameTr: LocalizedText;
  price: number;
  costPrice: number;
  timer?: number | null;
  image?: string | null;
  ingredient?: string | null;
  discount: number;
  noServiceFee: boolean;
  categoryId: number;
  categoryGuidId?: string | null;
  categoryName: string;
  categoryNameTr: LocalizedText;
  ordering: number;
  qrIcon?: string | null;
  qrBadge: LocalizedText;
  qrActionType?: string | null;
  qrActionValue?: string | null;
  infoOnly: boolean;
  modifierGroups: any[];
}

export interface PublicFullCatalog {
  restaurant: string;
  serviceFee: number;
  currency: string;
  products: UniPosProduct[];
  categories: PublicCatalogCategory[];
  hubs: PublicHubSummary[];
  stories: PublicStory[];
}

// ======================== Public Request DTOs ========================

export interface SubmitOrderItemRequest {
  catalogItemId?: string | null;
  itemTitle: string;
  quantity: number;
  unitPrice: number;
  specialInstruction?: string | null;
}

export interface SubmitOrderRequest {
  orderType: OrderType;
  roomOrTableNumber: string;
  guestName: string;
  phoneNumber: string;
  notes?: string | null;
  items: SubmitOrderItemRequest[];
}

export interface SubmitReviewRequest {
  rating: number;
  guestName?: string | null;
  roomNumber?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  comment?: string | null;
}

export interface SubmitInquiryRequest {
  fullName: string;
  phoneNumber: string;
  roomNumber: string;
  message: string;
}

// ======================== Admin DTOs ========================

export interface GuestOrderItem {
  id: string;
  catalogItemId?: string | null;
  itemTitle: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialInstruction?: string | null;
}

export interface GuestOrder {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  roomOrTableNumber: string;
  guestName: string;
  phoneNumber: string;
  notes?: string | null;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  isEmailSent: boolean;
  isTelegramSent: boolean;
  createdAtUtc: string;
  items: GuestOrderItem[];
}

export interface GuestReview {
  id: string;
  rating: number;
  guestName?: string | null;
  roomNumber?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  comment?: string | null;
  isResolved: boolean;
  isTelegramAlertSent: boolean;
  createdAtUtc: string;
}

export interface DepartmentContact {
  id: string;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  subtitleAz?: string | null;
  subtitleEn?: string | null;
  subtitleRu?: string | null;
  title?: string;
  subtitle?: string | null;
  phoneNumber?: string | null;
  internalExtension?: string | null;
  whatsAppNumber?: string | null;
  email?: string | null;
  workingHours?: string | null;
  iconKey?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateDepartmentContactDto {
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  subtitleAz?: string | null;
  subtitleEn?: string | null;
  subtitleRu?: string | null;
  phoneNumber?: string | null;
  internalExtension?: string | null;
  whatsAppNumber?: string | null;
  email?: string | null;
  workingHours?: string | null;
  iconKey?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface HotelStory {
  id: string;
  externalId?: number | null;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  descriptionAz?: string | null;
  descriptionEn?: string | null;
  descriptionRu?: string | null;
  imageUrl?: string | null;
  bannerImageUrl?: string | null;
  videoUrl?: string | null;
  badgeText?: string | null;
  buttonTextAz?: string | null;
  buttonTextEn?: string | null;
  buttonTextRu?: string | null;
  actionUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  title?: string;
  description?: string | null;
  buttonText?: string | null;
}

export interface CreateHotelStoryDto {
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  descriptionAz?: string | null;
  descriptionEn?: string | null;
  descriptionRu?: string | null;
  videoUrl?: string | null;
  badgeText?: string | null;
  buttonTextAz?: string | null;
  buttonTextEn?: string | null;
  buttonTextRu?: string | null;
  actionUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  externalId?: number | null;
}

export interface HotelHub {
  id: string;
  externalId?: number | null;
  code: string;
  hubType: HubType;
  kickerAz?: string | null;
  kickerEn?: string | null;
  kickerRu?: string | null;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  subtitleAz?: string | null;
  subtitleEn?: string | null;
  subtitleRu?: string | null;
  iconKey?: string | null;
  coverImageUrl?: string | null;
  displayOrder: number;
  displayMode?: string;
  isActive: boolean;
  title?: string;
  subtitle?: string | null;
}

export interface CreateHotelHubDto {
  code: string;
  hubType: HubType;
  kickerAz?: string | null;
  kickerEn?: string | null;
  kickerRu?: string | null;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  subtitleAz?: string | null;
  subtitleEn?: string | null;
  subtitleRu?: string | null;
  iconKey?: string | null;
  displayOrder?: number;
  displayMode?: string;
  isActive?: boolean;
}

export interface CatalogCategory {
  id: string;
  externalId?: number | null;
  hubId: string;
  parentCategoryId?: string | null;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  subtitleAz?: string | null;
  subtitleEn?: string | null;
  subtitleRu?: string | null;
  imageUrl?: string | null;
  iconKey?: string | null;
  workingHours?: string | null;
  internalExtension?: string | null;
  layoutStyle?: string;
  displayOrder: number;
  collapseIfSingleItem?: boolean;
  targetUrl?: string | null;
  actionType?: string | null;
  actionValue?: string | null;
  isActive: boolean;
  title?: string;
  subtitle?: string | null;
  code?: string | null;
}

export interface CreateCatalogCategoryDto {
  hubId: string;
  parentCategoryId?: string | null;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  subtitleAz?: string | null;
  subtitleEn?: string | null;
  subtitleRu?: string | null;
  iconKey?: string | null;
  workingHours?: string | null;
  internalExtension?: string | null;
  layoutStyle?: string;
  displayOrder?: number;
  collapseIfSingleItem?: boolean;
  targetUrl?: string | null;
  actionType?: string | null;
  actionValue?: string | null;
  isActive?: boolean;
}

export interface CatalogItem {
  id: string;
  externalId?: number | null;
  hubId: string;
  categoryId?: string | null;
  itemType: CatalogItemType;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  subtitleAz?: string | null;
  subtitleEn?: string | null;
  subtitleRu?: string | null;
  descriptionAz?: string | null;
  descriptionEn?: string | null;
  descriptionRu?: string | null;
  badgeAz?: string | null;
  badgeEn?: string | null;
  badgeRu?: string | null;
  filterTag?: string | null;
  price?: number | null;
  oldPrice?: number | null;
  costPrice?: number;
  discountPercent?: number;
  currency?: string;
  portionOrDuration?: string | null;
  prepTimeMinutes?: number | null;
  noServiceFee?: boolean;
  bulletPointsAz?: string | null;
  bulletPointsEn?: string | null;
  bulletPointsRu?: string | null;
  imageUrl?: string | null;
  isOrderable: boolean;
  isFeaturedInDailySpecials: boolean;
  actionLabelAz?: string | null;
  actionLabelEn?: string | null;
  actionLabelRu?: string | null;
  actionType?: string | null;
  actionValue?: string | null;
  actionUrl?: string | null;
  iconKey?: string | null;
  displayOrder: number;
  isActive: boolean;
  title?: string;
  description?: string | null;
  badge?: string | null;
}

export interface CreateCatalogItemDto {
  hubId: string;
  categoryId?: string | null;
  itemType: CatalogItemType;
  titleAz: string;
  titleEn?: string | null;
  titleRu?: string | null;
  subtitleAz?: string | null;
  subtitleEn?: string | null;
  subtitleRu?: string | null;
  descriptionAz?: string | null;
  descriptionEn?: string | null;
  descriptionRu?: string | null;
  badgeAz?: string | null;
  badgeEn?: string | null;
  badgeRu?: string | null;
  filterTag?: string | null;
  price?: number | null;
  oldPrice?: number | null;
  costPrice?: number;
  discountPercent?: number;
  currency?: string;
  portionOrDuration?: string | null;
  prepTimeMinutes?: number | null;
  noServiceFee?: boolean;
  bulletPointsAz?: string | null;
  bulletPointsEn?: string | null;
  bulletPointsRu?: string | null;
  isOrderable?: boolean;
  isFeaturedInDailySpecials?: boolean;
  actionLabelAz?: string | null;
  actionLabelEn?: string | null;
  actionLabelRu?: string | null;
  actionType?: string | null;
  actionValue?: string | null;
  actionUrl?: string | null;
  iconKey?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface NotificationSettingsDto {
  preferredChannel: NotificationChannel;
  notificationEmail?: string | null;
  telegramChatId?: string | null;
  customSmtpHost?: string | null;
  customSmtpPort?: number | null;
  customSmtpUsername?: string | null;
  customSmtpSenderName?: string | null;
  hasCustomSmtpPassword?: boolean;
  isTelegramConnected: boolean;
  isEmailConnected: boolean;
}

export interface UpdateNotificationSettingsDto {
  preferredChannel: NotificationChannel;
  notificationEmail?: string | null;
  telegramChatId?: string | null;
  customSmtpHost?: string | null;
  customSmtpPort?: number | null;
  customSmtpUsername?: string | null;
  customSmtpPassword?: string | null;
  customSmtpSenderName?: string | null;
}

// ======================== DTO Aliases & Extra Interfaces ========================
export type PublicHotelPortalDto = PublicHotelPortal;
export type PublicHubDetailDto = PublicHubDetail;
export type PublicCatalogCategoryDetailDto = PublicCatalogCategoryDetail;
export type PublicCatalogItemDto = PublicCatalogItem;
export type PublicFullCatalogDto = PublicFullCatalog;
export type PublicActivityDto = PublicActivity;
export type SubmitInquiryRequestDto = SubmitInquiryRequest;
export type SubmitOrderRequestDto = SubmitOrderRequest;
export type GuestOrderDto = GuestOrder;
export type SubmitReviewRequestDto = SubmitReviewRequest;

export type HotelStoryDto = HotelStory;
export type UpdateHotelStoryDto = CreateHotelStoryDto;
export type HotelHubDto = HotelHub;
export type UpdateHotelHubDto = CreateHotelHubDto;
export type CatalogCategoryDto = CatalogCategory;
export type UpdateCatalogCategoryDto = CreateCatalogCategoryDto;
export type CatalogItemDto = CatalogItem;
export type UpdateCatalogItemDto = CreateCatalogItemDto;
export type DepartmentContactDto = DepartmentContact;
export type UpdateDepartmentContactDto = CreateDepartmentContactDto;
export type GuestReviewDto = GuestReview;

export interface InquiryDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  roomNumber: string;
  message: string;
  isResolved: boolean;
  status?: number | string;
  createdAtUtc: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  note?: string | null;
}

export interface ConnectTelegramBotRequestDto {
  botToken: string;
}

export interface ConnectTelegramBotResponseDto {
  success: boolean;
  botUsername?: string | null;
  message?: string | null;
}

export interface ConnectEmailRequestDto {
  notificationEmail?: string;
  email?: string;
}

export interface ConnectEmailResponseDto {
  success: boolean;
  message?: string | null;
}

