const fs = require('fs')
const path = require('path')
const dns = require('dns')
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

async function prepareMongoDns(mongoUri) {
  if (!mongoUri.startsWith('mongodb+srv://')) {
    return
  }

  const hostname = new URL(mongoUri).hostname

  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`)
  } catch (error) {
    const fallbackServers = (process.env.MONGO_DNS_SERVERS ?? '1.1.1.1,8.8.8.8')
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean)

    if (fallbackServers.length > 0) {
      dns.setServers(fallbackServers)
      console.warn(`Using fallback DNS servers for Mongo SRV lookup: ${fallbackServers.join(', ')}`)
    }

    if (error && error.code === 'ENOTFOUND') {
      console.warn(`SRV lookup failed for ${hostname}; retrying with fallback DNS.`)
    }
  }
}


async function main() {
  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) {
    console.error('Missing MONGO_URI environment variable. Set it in .env or .env.local and try again.')
    process.exit(1)
  }

  const seedPassword = process.env.SEED_PASSWORD ?? 'Password123!'
  const { hashPassword } = await import('better-auth/crypto')
  await prepareMongoDns(mongoUri)
  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    const db = client.db()

    const usersCol = db.collection('user')

    const now = new Date()

    const seedUsers = [
      {
        email: 'admin@occupeye.com',
        name: 'Site Admin',
        role: 'admin',
        password: process.env.SEED_ADMIN_PASSWORD ?? seedPassword,
        requestedRole: 'admin',
      },
      {
        email: 'lecturer@occupeye.com',
        name: 'Lecturer One',
        role: 'lecturer',
        password: process.env.SEED_LECTURER_PASSWORD ?? seedPassword,
        requestedRole: 'lecturer',
      },
      {
        email: 'student@occupeye.com',
        name: 'Student One',
        role: 'student',
        password: process.env.SEED_STUDENT_PASSWORD ?? seedPassword,
        requestedRole: 'student',
      },
    ]

    for (const u of seedUsers) {
      const email = u.email.toLowerCase()
      const existingUser = await usersCol.findOne({ email })
      const hashedPassword = await hashPassword(u.password)
      const seedUserId = existingUser?.id && ObjectId.isValid(existingUser.id)
        ? new ObjectId(existingUser.id)
        : existingUser?._id instanceof ObjectId
          ? existingUser._id
          : new ObjectId()

      await usersCol.deleteMany({ email })

      const userDoc = {
        _id: seedUserId,
        name: u.name,
        email,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        role: u.role,
        banned: false,
        requestedRole: u.requestedRole,
      }

      await usersCol.insertOne(userDoc)

      const accountsCol = db.collection('account')
      await accountsCol.deleteMany({
        providerId: 'credential',
        $or: [
          { userId: seedUserId },
          { userId: seedUserId.toHexString() },
          { accountId: seedUserId.toHexString() },
        ],
      })

      await accountsCol.insertOne({
        _id: new ObjectId(),
        accountId: seedUserId.toHexString(),
        providerId: 'credential',
        userId: seedUserId,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      })

      if (!existingUser) {
        console.log(`Seeded credentials for: ${u.email}`)
      } else {
        console.log(`Updated credentials for: ${u.email}`)
      }
    }

    console.log('Seeding complete.')
  } catch (err) {
    if (err && ['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN'].includes(err.code) && String(err.hostname || '').includes('_mongodb._tcp')) {
      console.error('Seeding failed: your mongodb+srv URI could not resolve. Check the SRV host, network access, and Atlas DNS availability.')
    } else {
      console.error('Seeding failed:', err)
    }
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
