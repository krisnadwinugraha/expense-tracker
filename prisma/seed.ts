// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

import prisma from '@/libs/prisma'

async function main() {
  console.log('🌱 Starting seed...')

  // ============================================
  // 1. CREATE PERMISSIONS
  // ============================================
  console.log('📝 Creating permissions...')

  const permissionsData = [
    // Account permissions
    { action: 'read', subject: 'accounts' },
    { action: 'create', subject: 'accounts' },
    { action: 'update', subject: 'accounts' },
    { action: 'delete', subject: 'accounts' },
    { action: 'read', subject: 'all-accounts' },

    // Transaction permissions
    { action: 'read', subject: 'transactions' },
    { action: 'create', subject: 'transactions' },
    { action: 'update', subject: 'transactions' },
    { action: 'delete', subject: 'transactions' },
    { action: 'read', subject: 'all-transactions' },

    // Category permissions
    { action: 'read', subject: 'categories' },
    { action: 'create', subject: 'categories' },
    { action: 'update', subject: 'categories' },
    { action: 'delete', subject: 'categories' },

    // User management permissions
    { action: 'read', subject: 'users' },
    { action: 'create', subject: 'users' },
    { action: 'update', subject: 'users' },
    { action: 'delete', subject: 'users' },

    // Settings permissions
    { action: 'read', subject: 'settings' },
    { action: 'update', subject: 'settings' },

    // Reports permissions
    { action: 'read', subject: 'reports' },
    { action: 'read', subject: 'all-reports' }
  ]

  const permissions = await Promise.all(
    permissionsData.map(p =>
      prisma.permission.upsert({
        where: { action_subject: { action: p.action, subject: p.subject } },
        update: {},
        create: p
      })
    )
  )

  console.log(`✅ Created ${permissions.length} permissions`)

  // ============================================
  // 2. CREATE ROLES
  // ============================================
  console.log('👥 Creating roles...')

  // Admin Role - Full access
  const adminPermissions = permissions.map(p => ({ id: p.id }))
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      permissions: { connect: adminPermissions }
    }
  })

  // Manager Role - Can view all data, manage accounts and transactions
  const managerPermissions = permissions
    .filter(
      p =>
        (p.subject.includes('accounts') ||
          p.subject.includes('transactions') ||
          p.subject.includes('reports') ||
          p.subject === 'categories') &&
        p.action !== 'delete'
    )
    .map(p => ({ id: p.id }))

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      permissions: { connect: managerPermissions }
    }
  })

  // User Role - Can only manage own data
  const userPermissions = permissions
    .filter(
      p =>
        (p.subject === 'accounts' ||
          p.subject === 'transactions' ||
          p.subject === 'categories' ||
          p.subject === 'reports') &&
        !p.subject.includes('all-') &&
        p.action !== 'delete'
    )
    .map(p => ({ id: p.id }))

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      permissions: { connect: userPermissions }
    }
  })

  console.log('✅ Created 3 roles: admin, manager, user')

  // ============================================
  // 3. CREATE CURRENCIES
  // ============================================
  console.log('💰 Creating currencies...')

  const currencies = await Promise.all([
    prisma.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: { code: 'USD', name: 'US Dollar', symbol: '$' }
    }),
    prisma.currency.upsert({
      where: { code: 'EUR' },
      update: {},
      create: { code: 'EUR', name: 'Euro', symbol: '€' }
    }),
    prisma.currency.upsert({
      where: { code: 'GBP' },
      update: {},
      create: { code: 'GBP', name: 'British Pound', symbol: '£' }
    }),
    prisma.currency.upsert({
      where: { code: 'IDR' },
      update: {},
      create: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' }
    }),
    prisma.currency.upsert({
      where: { code: 'JPY' },
      update: {},
      create: { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
    })
  ])

  console.log(`✅ Created ${currencies.length} currencies`)

  // ============================================
  // 4. CREATE USERS
  // ============================================
  console.log('👤 Creating users...')

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: await hash('admin123', 10),
      roles: { connect: [{ id: adminRole.id }] }
    }
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Manager User',
      password: await hash('manager123', 10),
      roles: { connect: [{ id: managerRole.id }] }
    }
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: await hash('user123', 10),
      roles: { connect: [{ id: userRole.id }] }
    }
  })

  console.log('✅ Created 3 users')

  // ============================================
  // 5. CREATE CATEGORIES
  // ============================================
  console.log('📂 Creating categories...')

  const categoryData = [
    // Income categories
    { name: 'Salary', type: 'income', icon: '💼', userId: adminUser.id },
    { name: 'Freelance', type: 'income', icon: '💻', userId: adminUser.id },
    { name: 'Investment', type: 'income', icon: '📈', userId: adminUser.id },
    { name: 'Gift', type: 'income', icon: '🎁', userId: adminUser.id },

    // Expense categories
    { name: 'Food & Dining', type: 'expense', icon: '🍔', userId: adminUser.id },
    { name: 'Transportation', type: 'expense', icon: '🚗', userId: adminUser.id },
    { name: 'Shopping', type: 'expense', icon: '🛍️', userId: adminUser.id },
    { name: 'Entertainment', type: 'expense', icon: '🎬', userId: adminUser.id },
    { name: 'Bills & Utilities', type: 'expense', icon: '⚡', userId: adminUser.id },
    { name: 'Healthcare', type: 'expense', icon: '🏥', userId: adminUser.id },
    { name: 'Education', type: 'expense', icon: '📚', userId: adminUser.id },
    { name: 'Travel', type: 'expense', icon: '✈️', userId: adminUser.id },

    // Manager categories
    { name: 'Salary', type: 'income', icon: '💼', userId: managerUser.id },
    { name: 'Food & Dining', type: 'expense', icon: '🍔', userId: managerUser.id },
    { name: 'Transportation', type: 'expense', icon: '🚗', userId: managerUser.id },

    // Regular user categories
    { name: 'Salary', type: 'income', icon: '💼', userId: regularUser.id },
    { name: 'Food & Dining', type: 'expense', icon: '🍔', userId: regularUser.id },
    { name: 'Shopping', type: 'expense', icon: '🛍️', userId: regularUser.id }
  ]

  const categories = await Promise.all(categoryData.map(cat => prisma.category.create({ data: cat })))

  console.log(`✅ Created ${categories.length} categories`)

  // ============================================
  // 6. CREATE ACCOUNTS
  // ============================================
  console.log('🏦 Creating accounts...')

  // Admin accounts
  const adminChecking = await prisma.account.create({
    data: {
      name: 'Main Checking',
      balance: 15000,
      userId: adminUser.id,
      currencyId: currencies[0].id // USD
    }
  })

  const adminSavings = await prisma.account.create({
    data: {
      name: 'Savings Account',
      balance: 50000,
      userId: adminUser.id,
      currencyId: currencies[0].id
    }
  })

  const adminCredit = await prisma.account.create({
    data: {
      name: 'Credit Card',
      balance: -2500,
      userId: adminUser.id,
      currencyId: currencies[0].id
    }
  })

  // Manager accounts
  const managerChecking = await prisma.account.create({
    data: {
      name: 'Primary Account',
      balance: 8000,
      userId: managerUser.id,
      currencyId: currencies[3].id // IDR
    }
  })

  const managerSavings = await prisma.account.create({
    data: {
      name: 'Emergency Fund',
      balance: 25000000,
      userId: managerUser.id,
      currencyId: currencies[3].id
    }
  })

  // Regular user accounts
  const userChecking = await prisma.account.create({
    data: {
      name: 'Checking',
      balance: 3500,
      userId: regularUser.id,
      currencyId: currencies[0].id
    }
  })

  const userSavings = await prisma.account.create({
    data: {
      name: 'Savings',
      balance: 12000,
      userId: regularUser.id,
      currencyId: currencies[0].id
    }
  })

  console.log('✅ Created 7 accounts')

  // ============================================
  // 7. CREATE TRANSACTIONS
  // ============================================
  console.log('💳 Creating transactions...')

  const now = new Date()
  const getDate = (daysAgo: number) => {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    return date
  }

  // Admin transactions
  const adminIncomeCategory = categories.find(c => c.userId === adminUser.id && c.type === 'income')
  const adminFoodCategory = categories.find(c => c.userId === adminUser.id && c.name === 'Food & Dining')
  const adminTransportCategory = categories.find(c => c.userId === adminUser.id && c.name === 'Transportation')
  const adminShoppingCategory = categories.find(c => c.userId === adminUser.id && c.name === 'Shopping')

  await prisma.transaction.createMany({
    data: [
      // Income
      {
        userId: adminUser.id, // Added userId
        accountId: adminChecking.id,
        categoryId: adminIncomeCategory!.id,
        amount: 5000,
        type: 'income',
        description: 'Monthly Salary',
        date: getDate(30)
      },
      {
        userId: adminUser.id, // Added userId
        accountId: adminChecking.id,
        categoryId: adminIncomeCategory!.id,
        amount: 5000,
        type: 'income',
        description: 'Monthly Salary',
        date: getDate(60)
      },

      // Expenses
      {
        userId: adminUser.id, // Added userId
        accountId: adminChecking.id,
        categoryId: adminFoodCategory!.id,
        amount: -45.5,
        type: 'expense',
        description: 'Grocery Shopping',
        date: getDate(2)
      },
      {
        userId: adminUser.id, // Added userId
        accountId: adminChecking.id,
        categoryId: adminFoodCategory!.id,
        amount: -28.75,
        type: 'expense',
        description: 'Restaurant Dinner',
        date: getDate(5)
      },
      {
        userId: adminUser.id, // Added userId
        accountId: adminChecking.id,
        categoryId: adminTransportCategory!.id,
        amount: -60,
        type: 'expense',
        description: 'Gas Station',
        date: getDate(7)
      },
      {
        userId: adminUser.id, // Added userId
        accountId: adminCredit.id,
        categoryId: adminShoppingCategory!.id,
        amount: -150,
        type: 'expense',
        description: 'Online Shopping',
        date: getDate(10)
      },
      {
        userId: adminUser.id, // Added userId
        accountId: adminChecking.id,
        categoryId: adminFoodCategory!.id,
        amount: -32.5,
        type: 'expense',
        description: 'Lunch with Team',
        date: getDate(15)
      },
      {
        userId: adminUser.id, // Added userId
        accountId: adminChecking.id,
        categoryId: adminTransportCategory!.id,
        amount: -50,
        type: 'expense',
        description: 'Uber Rides',
        date: getDate(20)
      }
    ]
  })

  // Manager transactions
  const managerIncomeCategory = categories.find(c => c.userId === managerUser.id && c.type === 'income')
  const managerFoodCategory = categories.find(c => c.userId === managerUser.id && c.name === 'Food & Dining')
  const managerTransportCategory = categories.find(c => c.userId === managerUser.id && c.name === 'Transportation')

  await prisma.transaction.createMany({
    data: [
      {
        userId: managerUser.id, // Added userId
        accountId: managerChecking.id,
        categoryId: managerIncomeCategory!.id,
        amount: 12000000,
        type: 'income',
        description: 'Monthly Salary',
        date: getDate(25)
      },
      {
        userId: managerUser.id, // Added userId
        accountId: managerChecking.id,
        categoryId: managerFoodCategory!.id,
        amount: -150000,
        type: 'expense',
        description: 'Weekly Groceries',
        date: getDate(3)
      },
      {
        userId: managerUser.id, // Added userId
        accountId: managerChecking.id,
        categoryId: managerTransportCategory!.id,
        amount: -200000,
        type: 'expense',
        description: 'Gas',
        date: getDate(8)
      },
      {
        userId: managerUser.id, // Added userId
        accountId: managerChecking.id,
        categoryId: managerFoodCategory!.id,
        amount: -85000,
        type: 'expense',
        description: 'Coffee Shop',
        date: getDate(12)
      }
    ]
  })

  // Regular user transactions
  const userIncomeCategory = categories.find(c => c.userId === regularUser.id && c.type === 'income')
  const userFoodCategory = categories.find(c => c.userId === regularUser.id && c.name === 'Food & Dining')
  const userShoppingCategory = categories.find(c => c.userId === regularUser.id && c.name === 'Shopping')

  await prisma.transaction.createMany({
    data: [
      {
        userId: regularUser.id, // Added userId
        accountId: userChecking.id,
        categoryId: userIncomeCategory!.id,
        amount: 3500,
        type: 'income',
        description: 'Salary',
        date: getDate(28)
      },
      {
        userId: regularUser.id, // Added userId
        accountId: userChecking.id,
        categoryId: userFoodCategory!.id,
        amount: -25,
        type: 'expense',
        description: 'Lunch',
        date: getDate(1)
      },
      {
        userId: regularUser.id, // Added userId
        accountId: userChecking.id,
        categoryId: userShoppingCategory!.id,
        amount: -75,
        type: 'expense',
        description: 'Clothes',
        date: getDate(6)
      },
      {
        userId: regularUser.id, // Added userId
        accountId: userChecking.id,
        categoryId: userFoodCategory!.id,
        amount: -40,
        type: 'expense',
        description: 'Dinner',
        date: getDate(14)
      }
    ]
  })

  console.log('✅ Created sample transactions')

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n✨ Seed completed successfully!\n')
  console.log('📊 Summary:')
  console.log(`   - ${permissions.length} permissions`)
  console.log('   - 3 roles (admin, manager, user)')
  console.log(`   - ${currencies.length} currencies`)
  console.log('   - 3 users')
  console.log(`   - ${categories.length} categories`)
  console.log('   - 7 accounts')
  console.log('   - Multiple transactions\n')

  console.log('🔐 Demo Login Credentials:')
  console.log('   Admin:   admin@example.com / admin123')
  console.log('   Manager: manager@example.com / manager123')
  console.log('   User:    user@example.com / user123\n')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
