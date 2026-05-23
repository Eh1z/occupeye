const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const { MongoClient, ObjectId } = require('mongodb')

const envFiles = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '.env.local'),
].filter((filePath) => fs.existsSync(filePath))

dotenv.config({ path: envFiles[0] })
if (envFiles[1]) {
  dotenv.config({ path: envFiles[1], override: true })
}


async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_DIRECT
  if (!mongoUri) {
    console.error('Missing MONGO_URI environment variable. Set it in .env or .env.local and try again.')
    process.exit(1)
  }

  const seedPassword = process.env.SEED_PASSWORD ?? 'ChangeMe123!'
  const { hashPassword } = await import('better-auth/crypto')
  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    const db = client.db()

    // Collection used by Better Auth adapter for users is typically `users` (adapter may be configured differently).
    const usersCol = db.collection('users')

    const now = new Date()

    const seedUsers = [
      {
        email: 'admin@occupeye.com',
        name: 'Site Admin',
        role: 'admin',
        password: process.env.SEED_ADMIN_PASSWORD ?? seedPassword,
        emailVerified: true,
      },
      {
        email: 'lecturer@occupeye.com',
        name: 'Lecturer One',
        role: 'lecturer',
        password: process.env.SEED_LECTURER_PASSWORD ?? seedPassword,
        emailVerified: true,
      },
      {
        email: 'student@occupeye.com',
        name: 'Student One',
        role: 'student',
        password: process.env.SEED_STUDENT_PASSWORD ?? seedPassword,
        emailVerified: true,
      },
    ]

    for (const u of seedUsers) {
      const email = u.email.toLowerCase()
      const userId = (await usersCol.findOne({ email }))?.id ?? new ObjectId().toString()
      const hashedPassword = await hashPassword(u.password)

      const userResult = await usersCol.updateOne(
        { email },
        {
          $set: {
            id: userId,
            email,
            name: u.name,
            role: u.role,
            emailVerified: u.emailVerified,
            updatedAt: now,
          },
          $setOnInsert: {
            id: userId,
            createdAt: now,
          },
        },
        { upsert: true }
      )

      const accountsCol = db.collection('accounts')
      const accountResult = await accountsCol.updateOne(
        { userId, providerId: 'credential' },
        {
          $set: {
            id: (await accountsCol.findOne({ userId, providerId: 'credential' }))?.id ?? new ObjectId().toString(),
            userId,
            accountId: userId,
            providerId: 'credential',
            password: hashedPassword,
            scope: '',
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      )

      if (userResult.upsertedCount > 0 || accountResult.upsertedCount > 0) {
        console.log(`Seeded credentials for: ${u.email}`)
      } else if (userResult.modifiedCount > 0 || accountResult.modifiedCount > 0) {
        console.log(`Updated credentials for: ${u.email}`)
      } else {
        console.log(`User already exists and credentials are current: ${u.email}`)
      }
    }

    console.log('Seeding complete.')
  } catch (err) {
    if (err && err.code === 'ECONNREFUSED' && String(err.hostname || '').includes('_mongodb._tcp')) {
      console.error('Seeding failed: your mongodb+srv URI could not resolve. Use a reachable Atlas URI or set MONGO_URI_DIRECT to a non-SRV connection string.')
    } else {
      console.error('Seeding failed:', err)
    }
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
