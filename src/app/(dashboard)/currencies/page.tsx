import { PrismaClient } from '@prisma/client'

import CurrenciesView from '@views/currencies'

import prisma from '@/libs/prisma'

async function getCurrencies() {
  const currencies = await prisma.currency.findMany({ orderBy: { name: 'asc' } })

  return currencies
}

const CurrenciesPage = async () => {
  const currencies = await getCurrencies()

  return <CurrenciesView initialData={currencies} />
}

export default CurrenciesPage
