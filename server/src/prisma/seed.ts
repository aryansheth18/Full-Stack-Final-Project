import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data in correct relational order
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Admin@2026!', 10);
  const ownerPasswordHash = await bcrypt.hash('Owner@2026!', 10);
  const userPasswordHash = await bcrypt.hash('User@2026!', 10);

  // 1. Create System Administrator (Name 20-60 chars)
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Executive', // 30 chars
      email: 'admin@storerating.com',
      password: defaultPasswordHash,
      address: '100 Global Headquarters Blvd, Suite 500, Metropolis, NY 10001',
      role: 'ADMIN',
    },
  });
  console.log('✅ Created Admin user:', admin.email);

  // 2. Create Store Owners (Names 20-60 chars)
  const owner1 = await prisma.user.create({
    data: {
      name: 'Alexander Christopher Hamilton', // 30 chars
      email: 'alexander.hamilton@stores.com',
      password: ownerPasswordHash,
      address: '742 Evergreen Terrace, Sector 4, Springfield, OR 97477',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Dr. Elizabeth Montgomery Vance', // 30 chars
      email: 'elizabeth.vance@stores.com',
      password: ownerPasswordHash,
      address: '221B Baker Street, Flat 2A, Marylebone, London NW1 6XE',
      role: 'STORE_OWNER',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Jonathan Edward Henderson Jr.', // 29 chars
      email: 'jonathan.henderson@stores.com',
      password: ownerPasswordHash,
      address: '456 Tech Boulevard, Innovation District, Austin, TX 78701',
      role: 'STORE_OWNER',
    },
  });
  console.log('✅ Created 3 Store Owners');

  // 3. Create Normal Users (Names 20-60 chars)
  const user1 = await prisma.user.create({
    data: {
      name: 'Samantha Victoria Richardson', // 28 chars
      email: 'user@storerating.com', // Primary demo user account
      password: userPasswordHash,
      address: '123 Market Street, Apartment 4B, San Francisco, CA 94105',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Benjamin Nathaniel Sullivan', // 27 chars
      email: 'benjamin.sullivan@gmail.com',
      password: userPasswordHash,
      address: '888 Skyline Way, Penthouse 12, Seattle, WA 98101',
      role: 'USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Charlotte Sophia Kensington', // 27 chars
      email: 'charlotte.kensington@outlook.com',
      password: userPasswordHash,
      address: '350 Fifth Avenue, Floor 44, New York, NY 10118',
      role: 'USER',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Oliver Maximilian Sterling', // 26 chars
      email: 'oliver.sterling@yahoo.com',
      password: userPasswordHash,
      address: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
      role: 'USER',
    },
  });
  console.log('✅ Created 4 Normal Users');

  // 4. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Nexus Electronics & Gadgets Emporium',
      email: 'support@nexuselectronics.com',
      address: '100 Silicon Way, Tech Park Phase 2, San Jose, CA 95134',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Artisan Gourmet Organic Coffee Roasters',
      email: 'hello@artisancoffeeroasters.com',
      address: '42 Espresso Avenue, Downtown Arts District, Portland, OR 97201',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Apex Fitness Gear & Performance Apparel',
      email: 'info@apexfitnessgear.com',
      address: '77 Athletic Way, Olympic Village, Denver, CO 80202',
      ownerId: owner3.id,
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: 'Green Leaf Botanical Books & Plant Cafe',
      email: 'contact@greenleafbooks.com',
      address: '15 Harmony Lane, Garden District, Seattle, WA 98103',
      ownerId: null, // Unassigned store available for admin management
    },
  });

  const store5 = await prisma.store.create({
    data: {
      name: 'Lumina Home Decor & Lighting Studio',
      email: 'care@luminahomedecor.com',
      address: '920 Design Corridor, Suite 10, Chicago, IL 60611',
      ownerId: null,
    },
  });
  console.log('✅ Created 5 Stores');

  // 5. Create Ratings (Ratings between 1 and 5)
  await prisma.rating.createMany({
    data: [
      { rating: 5, userId: user1.id, storeId: store1.id },
      { rating: 4, userId: user2.id, storeId: store1.id },
      { rating: 5, userId: user3.id, storeId: store1.id },
      { rating: 4, userId: user4.id, storeId: store1.id },

      { rating: 5, userId: user1.id, storeId: store2.id },
      { rating: 5, userId: user2.id, storeId: store2.id },
      { rating: 4, userId: user3.id, storeId: store2.id },

      { rating: 3, userId: user2.id, storeId: store3.id },
      { rating: 4, userId: user3.id, storeId: store3.id },
      { rating: 4, userId: user4.id, storeId: store3.id },

      { rating: 5, userId: user1.id, storeId: store4.id },
      { rating: 4, userId: user4.id, storeId: store4.id },

      { rating: 4, userId: user2.id, storeId: store5.id },
      { rating: 3, userId: user3.id, storeId: store5.id },
    ],
  });
  console.log('✅ Seeded 14 Initial Store Ratings');

  console.log('\n✨ Database seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials for Instant Testing:');
  console.log('👑 Admin:       admin@storerating.com         / Admin@2026!');
  console.log('🏪 Store Owner: alexander.hamilton@stores.com / Owner@2026!');
  console.log('👤 Normal User: user@storerating.com          / User@2026!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
