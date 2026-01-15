import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create team members
  const alice = await prisma.teamMember.upsert({
    where: { email: 'alice@pipeline.com' },
    update: {},
    create: {
      name: 'Alice Chen',
      email: 'alice@pipeline.com',
    },
  })

  const bob = await prisma.teamMember.upsert({
    where: { email: 'bob@pipeline.com' },
    update: {},
    create: {
      name: 'Bob Martinez',
      email: 'bob@pipeline.com',
    },
  })

  const carol = await prisma.teamMember.upsert({
    where: { email: 'carol@pipeline.com' },
    update: {},
    create: {
      name: 'Carol Johnson',
      email: 'carol@pipeline.com',
    },
  })

  console.log('Created team members:', { alice, bob, carol })

  // Create sample leads
  const leads = [
    {
      name: 'Alex Thompson',
      twitter: 'alexthompson_eth',
      telegram: 'alexthompson',
      farcaster: 'alexthompson',
      stage: 'NEW',
      assigneeId: null,
    },
    {
      name: 'Maya Studios',
      youtube: 'mayastudios',
      tiktok: 'mayastudios',
      twitch: 'maya_studios',
      instagram: 'mayastudios',
      email: 'contact@mayastudios.com',
      stage: 'CONTACTED',
      assigneeId: alice.id,
    },
    {
      name: 'Jordan Smith',
      twitter: 'jordansmith',
      email: 'jordan@example.com',
      stage: 'ENGAGED',
      assigneeId: bob.id,
    },
    {
      name: 'Taylor Reed',
      farcaster: 'taylorreed',
      telegram: 'taylor_reed',
      stage: 'QUALIFIED',
      assigneeId: carol.id,
    },
    {
      name: 'Sam Parker',
      twitter: 'samparker_dev',
      email: 'sam@dev.io',
      stage: 'PROPOSAL',
      assigneeId: alice.id,
    },
  ]

  for (const leadData of leads) {
    const lead = await prisma.lead.create({
      data: leadData,
    })

    // Add a sample note
    if (lead.assigneeId) {
      await prisma.note.create({
        data: {
          content: `Initial contact made via ${leadData.twitter ? 'Twitter' : leadData.telegram ? 'Telegram' : 'email'}. Seems interested in our product.`,
          leadId: lead.id,
          authorId: lead.assigneeId,
        },
      })
    }
  }

  console.log('Created sample leads with notes')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
