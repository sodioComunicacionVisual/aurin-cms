import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

// Load environment variables
dotenv.config()

async function clearHeroDescriptions() {
  const uri = process.env.DATABASE_URI

  if (!uri) {
    console.error('❌ DATABASE_URI not found in environment variables')
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db()
    const projectsCollection = db.collection('projects')

    // Remove hero.description field from all projects
    const result = await projectsCollection.updateMany(
      { 'hero.description': { $exists: true } },
      { $unset: { 'hero.description': '' } }
    )

    console.log(`✅ Updated ${result.modifiedCount} projects`)
    console.log(`   - Removed hero.description from all documents`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('✅ Connection closed')
  }
}

clearHeroDescriptions()
