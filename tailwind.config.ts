import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pipeline stage colors
        'stage-new': '#6366f1',
        'stage-contacted': '#8b5cf6',
        'stage-engaged': '#a855f7',
        'stage-qualified': '#d946ef',
        'stage-proposal': '#ec4899',
        'stage-negotiation': '#f43f5e',
        'stage-won': '#22c55e',
        'stage-lost': '#64748b',
      },
    },
  },
  plugins: [],
}
export default config
