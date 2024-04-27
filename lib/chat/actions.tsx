import 'server-only'

import {
  createAI,
  getMutableAIState,
  getAIState,
  render,
  createStreamableValue
} from 'ai/rsc'
import OpenAI from 'openai'

import {
  BotCard,
  BotMessage
} from '@/components/utils'

import { string, z } from 'zod'
import { Response } from '@/components/responses/response'
import { ResponseSkeleton } from '@/components/responses/response-skeleton'

import {
  nanoid, sleep
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/utils/message'
import { Chat } from '@/lib/types'
import { auth } from '@/auth'
import { getUser } from '@/app/login/actions'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

async function getDetailsFromCustomDataSource(query:string, company:any) {
  'use server'
  
  console.log("========custom data source fucntion called=========")
  const API_SERVER_URL = process.env.API_SERVER_URL
  const response = await fetch(`${API_SERVER_URL}/response?company=${company}&query=${query}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const resp = await response.json();
  return {
    id: nanoid(),
    display:
       <BotCard>
         <Response props={resp}/>
       </BotCard>
  }
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id: string
  name?: string
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode 
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    getDetailsFromCustomDataSource
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  unstable_onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  unstable_onSetAIState: async ({ state, done }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'function' ? (
         message.name === 'getDetailsFromCustomDataSource' ? (
            <BotCard>
              <Response props={message.content} />
            </BotCard>
          ) : null
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
