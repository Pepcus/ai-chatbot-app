'use client'

import { useActions, useUIState } from 'ai/rsc'

import type { AI } from '@/lib/chat/actions'

interface Stock {
  symbol: string
  price: number
  delta: number
}

export function Stocks({ props: stocks }: { props: Stock[] }) {
  const [, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 overflow-y-scroll pb-4 text-sm sm:flex-row">
        {stocks.map(stock => (
          <button
            key={stock.symbol}
            className="flex cursor-pointer flex-row gap-2 rounded-lg bg-zinc-800 p-2 text-left hover:bg-zinc-700 sm:w-52"
            onClick={async () => {
              const response = await submitUserMessage(`View ${stock.symbol}`)
              setMessages(currentMessages => [...currentMessages, response])
            }}
          >
            <div className="flex flex-col">
              <div className="bold uppercase text-zinc-300">{stock.symbol}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="p-4 text-center text-sm text-zinc-500">
        Note: Data is simulated for illustrative purposes.
      </div>
    </div>
  )
}
