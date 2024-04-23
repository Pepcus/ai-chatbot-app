import { Session } from '@/lib/types'

export interface WelcomeScreen {
  session?: Session
}

export function WelcomeScreen({ session }: WelcomeScreen) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome {session?.user?.name} to the AI Chatbot.
        </h1>
      </div>
    </div>
  )
}