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

// Helper to normalize social handles - returns URL as-is or extracts username
const normalizeHandle = (input: string): string => {
  const trimmed = input.trim()
  // If it's already a URL, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  // Strip leading @ if present
  return trimmed.replace(/^@/, '')
}

// Check if input is already a full URL
const isUrl = (input: string): boolean => {
  const trimmed = input.trim()
  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
}

// Social platform URL builders - handles usernames, @usernames, or full URLs
export const SOCIAL_URLS = {
  telegram: (handle: string) => isUrl(handle) ? handle : `https://t.me/${normalizeHandle(handle)}`,
  twitter: (handle: string) => isUrl(handle) ? handle : `https://x.com/${normalizeHandle(handle)}`,
  farcaster: (handle: string) => isUrl(handle) ? handle : `https://warpcast.com/${normalizeHandle(handle)}`,
  tiktok: (handle: string) => isUrl(handle) ? handle : `https://tiktok.com/@${normalizeHandle(handle)}`,
  youtube: (handle: string) => isUrl(handle) ? handle : `https://youtube.com/@${normalizeHandle(handle)}`,
  twitch: (handle: string) => isUrl(handle) ? handle : `https://twitch.tv/${normalizeHandle(handle)}`,
  instagram: (handle: string) => isUrl(handle) ? handle : `https://instagram.com/${normalizeHandle(handle)}`,
  email: (email: string) => email.startsWith('mailto:') ? email : `mailto:${email.trim()}`,
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
