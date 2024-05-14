import { Session } from '@/lib/types'

export interface WelcomeScreen {
  session?: Session
}

export function WelcomeScreen({ session }: WelcomeScreen) {
  const userString:any = localStorage.getItem('user')
  let company:any = null
  let displayName:any = null
  if (userString != null) {
    company = JSON.parse(userString).company
    if (company === 'TSS') {
      displayName = 'Carolin Smith'
    } else if (company === 'REZ') {
      displayName = 'Jessica Lang'
    }
  }
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
          Hi {session?.user?.name}!! This is {displayName}, your HR manager, how can I help you today?
      </div>
    </div>
  )
}