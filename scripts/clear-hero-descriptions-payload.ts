import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function clearHeroDescriptions() {
  try {
    console.log('🚀 Initializing Payload...')

    const payload = await getPayload({ config })

    console.log('✅ Payload initialized')
    console.log('📊 Fetching all projects...')

    // Get all projects
    const { docs: projects } = await payload.find({
      collection: 'projects',
      limit: 1000,
      depth: 0,
    })

    console.log(`📝 Found ${projects.length} projects`)

    let updated = 0

    // Update each project to remove hero.description
    for (const project of projects) {
      if (project.hero?.description) {
        await payload.update({
          collection: 'projects',
          id: project.id,
          data: {
            hero: {
              ...project.hero,
              description: undefined,
            },
          },
        })
        updated++
        console.log(`  ✓ Cleared description from: ${project.title}`)
      }
    }

    console.log(`\n✅ Process completed!`)
    console.log(`   - ${updated} projects updated`)
    console.log(`   - ${projects.length - updated} projects had no description to remove`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

clearHeroDescriptions()
