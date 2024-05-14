
export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: ChatMessage[]
  sharePath?: string
}

export interface ChatMessage {
  role: string
  content: string
}


export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session extends User {
  user: {
    id: string
    email: string
    name: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  name: string
  email: string
  password: string
  salt: string
  company: string
}
