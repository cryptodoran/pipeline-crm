// Pipeline stages - the sacred journey
export const PIPELINE_STAGES = [
  'NEW',
  'CONTACTED',
  'ENGAGED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
] as const

export type PipelineStage = typeof PIPELINE_STAGES[number]

export const STAGE_LABELS: Record<PipelineStage, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  ENGAGED: 'Engaged',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
}

export const STAGE_COLORS: Record<PipelineStage, string> = {
  NEW: 'bg-indigo-500',
  CONTACTED: 'bg-violet-500',
  ENGAGED: 'bg-purple-500',
  QUALIFIED: 'bg-fuchsia-500',
  PROPOSAL: 'bg-pink-500',
  NEGOTIATION: 'bg-rose-500',
  WON: 'bg-green-500',
  LOST: 'bg-slate-500',
}

// Social platform URL builders
export const SOCIAL_URLS = {
  telegram: (handle: string) => `https://t.me/${handle}`,
  twitter: (handle: string) => `https://x.com/${handle}`,
  farcaster: (handle: string) => `https://warpcast.com/${handle}`,
  tiktok: (handle: string) => `https://tiktok.com/@${handle}`,
  youtube: (handle: string) => `https://youtube.com/@${handle}`,
  twitch: (handle: string) => `https://twitch.tv/${handle}`,
  instagram: (handle: string) => `https://instagram.com/${handle}`,
  email: (email: string) => `mailto:${email}`,
} as const

export type SocialPlatform = keyof typeof SOCIAL_URLS

// Lead sources - where leads come from
export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Social Media',
  'Cold Outreach',
  'Event',
  'Inbound',
  'Partner',
  'Other',
] as const

export type LeadSource = typeof LEAD_SOURCES[number]

export const SOURCE_COLORS: Record<string, string> = {
  'Website': 'bg-blue-100 text-blue-700',
  'Referral': 'bg-green-100 text-green-700',
  'Social Media': 'bg-purple-100 text-purple-700',
  'Cold Outreach': 'bg-orange-100 text-orange-700',
  'Event': 'bg-pink-100 text-pink-700',
  'Inbound': 'bg-cyan-100 text-cyan-700',
  'Partner': 'bg-yellow-100 text-yellow-700',
  'Other': 'bg-gray-100 text-gray-700',
}
