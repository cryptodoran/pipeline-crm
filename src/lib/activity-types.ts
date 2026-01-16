// Activity types with their display info - separate file to avoid 'use server' issues
export const ACTIVITY_TYPES = {
  CALL: { label: 'Made a call', icon: 'phone', color: 'blue' },
  EMAIL: { label: 'Sent email', icon: 'mail', color: 'purple' },
  LEFT_VM: { label: 'Left voicemail', icon: 'voicemail', color: 'amber' },
  NO_ANSWER: { label: 'No answer', icon: 'phone-off', color: 'gray' },
  MEETING: { label: 'Had meeting', icon: 'users', color: 'green' },
  FOLLOW_UP: { label: 'Follow-up scheduled', icon: 'calendar', color: 'indigo' },
  NOTE: { label: 'Added note', icon: 'file-text', color: 'slate' },
  STAGE_CHANGE: { label: 'Stage changed', icon: 'arrow-right', color: 'cyan' },
  ASSIGNMENT: { label: 'Assigned', icon: 'user-plus', color: 'pink' },
  CREATED: { label: 'Lead created', icon: 'plus', color: 'emerald' },
  DM_SENT: { label: 'Sent DM', icon: 'message-circle', color: 'sky' },
  PROPOSAL_SENT: { label: 'Sent proposal', icon: 'file', color: 'orange' },
} as const

export type ActivityType = keyof typeof ACTIVITY_TYPES
