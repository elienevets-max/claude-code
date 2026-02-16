// =============================================================================
// King of Sparklers Growth Operating System - Type Definitions
// =============================================================================

/** Dream 100 CRM Contact */
export interface Contact {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  linkedin: string;
  category: ContactCategory;
  status: ContactStatus;
  touches: Touch[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactCategory = 'nightclub' | 'hotel' | 'wedding' | 'event';

export type ContactStatus =
  | 'prospect'
  | 'contacted'
  | 'sample_sent'
  | 'meeting'
  | 'proposal'
  | 'won'
  | 'lost';

export interface Touch {
  touchNumber: number;
  date: string;
  type: string;
  notes: string;
  responded: boolean;
}

/** Quarterly Rock (EOS-style goal) */
export interface Rock {
  id: string;
  title: string;
  description: string;
  quarter: Quarter;
  year: number;
  progress: number; // 0-100
  status: RockStatus;
  owner: string;
  dueDate: string;
}

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export type RockStatus = 'on_track' | 'behind' | 'at_risk' | 'completed';

/** Key Performance Indicator */
export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  period: string;
  category: string;
}

/** StoryBrand BrandScript */
export interface BrandScript {
  id: string;
  hero: string;
  externalProblem: string;
  internalProblem: string;
  philosophicalProblem: string;
  guide: string;
  empathy: string;
  authority: string;
  plan: BrandScriptStep[];
  directCta: string;
  transitionalCta: string;
  failure: string;
  success: string;
  createdAt: string;
}

export interface BrandScriptStep {
  step: number;
  description: string;
}

/** Seasonal Peak Period */
export interface SeasonalPeak {
  id: string;
  name: string;
  peakStart: string;
  peakEnd: string;
  preloadWeeks: number;
  checklistItems: SeasonalChecklistItem[];
}

export interface SeasonalChecklistItem {
  id: string;
  task: string;
  category: string;
  completed: boolean;
  dueDate: string;
}

/** Customer Value Journey Stage */
export interface JourneyCustomer {
  id: string;
  name: string;
  email: string;
  company: string;
  stage: JourneyStage;
  notes: string;
  lastAction: string;
  createdAt: string;
}

export type JourneyStage =
  | 'aware'
  | 'engage'
  | 'subscribe'
  | 'convert'
  | 'excite'
  | 'ascend'
  | 'advocate'
  | 'promote';

/** Venue Safety Certification */
export interface SafetyCertification {
  id: string;
  venueName: string;
  venueAddress: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  certificationNumber: string;
  certifiedDate: string;
  expiryDate: string;
  status: CertificationStatus;
  checklistItems: CertificationChecklistItem[];
}

export type CertificationStatus = 'pending' | 'audit' | 'certified' | 'expired';

export interface CertificationChecklistItem {
  id: string;
  item: string;
  completed: boolean;
}

/** Content Calendar Item */
export interface ContentItem {
  id: string;
  title: string;
  pillar: ContentPillar;
  platform: string;
  audience: string;
  status: ContentStatus;
  scheduledDate: string;
  brief: string;
  createdAt: string;
}

export type ContentPillar = 'safety' | 'inspiration' | 'education';

export type ContentStatus = 'idea' | 'drafted' | 'scheduled' | 'published';

/** Standard Operating Procedure */
export interface SOP {
  id: string;
  title: string;
  category: SOPCategory;
  steps: SOPStep[];
  version: string;
  lastUpdated: string;
}

export type SOPCategory =
  | 'fulfillment'
  | 'customer_service'
  | 'b2b_outreach'
  | 'inventory'
  | 'social_media'
  | 'general';

export interface SOPStep {
  id: string;
  instruction: string;
  videoUrl?: string;
  completed: boolean;
}

/** Dream 100 Outreach Template */
export interface OutreachTemplate {
  id: string;
  touchNumber: number;
  subject: string;
  body: string;
  channel: OutreachChannel;
}

export type OutreachChannel = 'email' | 'phone' | 'linkedin' | 'mail';

// ---------------------------------------------------------------------------
// TikTok Shop
// ---------------------------------------------------------------------------

/** TikTok Shop Product Listing */
export interface TikTokShopProduct {
  id: string;
  name: string;
  sku: string;
  category: TikTokProductCategory;
  price: number;
  commissionRate: number;
  status: TikTokProductStatus;
  sampleStatus: TikTokSampleStatus;
  tiktokUrl: string;
  notes: string;
  createdAt: string;
}

export type TikTokProductCategory =
  | 'wedding'
  | 'nightclub'
  | 'event'
  | 'holiday'
  | 'vip'
  | 'starter';

export type TikTokProductStatus = 'draft' | 'active' | 'paused' | 'out_of_stock';

export type TikTokSampleStatus = 'none' | 'requested' | 'received' | 'filming';

/** TikTok Shop Video Content */
export interface TikTokShopVideo {
  id: string;
  productId: string;
  title: string;
  hook: string;
  format: TikTokVideoFormat;
  status: TikTokVideoStatus;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  ordersGenerated: number;
  gmvGenerated: number;
  postedDate: string;
  notes: string;
  createdAt: string;
}

export type TikTokVideoFormat =
  | 'showcase'
  | 'tutorial'
  | 'unboxing'
  | 'behind_scenes'
  | 'testimonial'
  | 'trending';

export type TikTokVideoStatus = 'idea' | 'scripted' | 'filmed' | 'editing' | 'posted';

/** TikTok Shop Performance Metrics */
export interface TikTokShopMetric {
  id: string;
  date: string;
  period: TikTokMetricPeriod;
  totalGmv: number;
  totalOrders: number;
  totalViews: number;
  totalVideosPosted: number;
  commissionEarned: number;
  topProduct: string;
  notes: string;
}

export type TikTokMetricPeriod = 'daily' | 'weekly' | 'monthly';
