'use client'

import dynamic from 'next/dynamic'
import { ResponseSkeleton } from '../responses/response-skeleton'

export { spinner } from './spinner'
export { BotCard, BotMessage, SystemMessage } from './message'

const Response = dynamic(() => import('../responses/response').then(mod => mod.Response), {
  ssr: false,
  loading: () => <ResponseSkeleton />
})

export { Response }
