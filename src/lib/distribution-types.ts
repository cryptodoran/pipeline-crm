// Distribution types - shared between server and client
export const DISTRIBUTION_TYPES = [
  'ADVISOR_TOKENS',
  'REVENUE_SHARE',
  'TOKEN_ALLOCATION',
  'FEE',
  'OTHER',
] as const

export type DistributionType = (typeof DISTRIBUTION_TYPES)[number]

export const DISTRIBUTION_TYPE_LABELS: Record<string, string> = {
  ADVISOR_TOKENS: 'Advisor Tokens',
  REVENUE_SHARE: 'Revenue Share',
  TOKEN_ALLOCATION: 'Token Allocation',
  FEE: 'Fee',
  OTHER: 'Other',
}
