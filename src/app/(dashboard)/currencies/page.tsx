import { PrismaClient } from '@prisma/client'

import CurrenciesView from '@views/currencies'

const prisma = new PrismaClient()

async function getCurrencies() {
  const currencies = await prisma.currency.findMany({ orderBy: { name: 'asc' } })

  
return currencies
}

const CurrenciesPage = async () => {
  const currencies = await getCurrencies()

  
return <CurrenciesView initialData={currencies} />
}

export default CurrenciesPage
