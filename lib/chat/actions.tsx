import 'server-only'

import {
  createAI,
  getAIState
} from 'ai/rsc'

import {
  BotCard,
  BotMessage
} from '@/components/utils'

import {
  nanoid, sleep
} from '@/lib/utils'
import { saveChat, getChatById } from '@/app/actions'
import { Chat } from '@/lib/types'
import { auth } from '@/auth'

async function getDetailsFromCustomDataSource(company: any, query:any, chatId: any) {
  'use server'
  try {
    const API_SERVER_URL = process.env.API_SERVER_URL
    const API_CLIENT_SECRET = process.env.API_CLIENT_SECRET
    const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT
    const existingChat = await getChatById(chatId);
    console.log("===chatId===========", chatId);
    let context = {};
    if (existingChat) {
      context = [...existingChat.messages, {"role": "user", "content": query}]
    } else {
      context = [{"role": "system", "content": SYSTEM_PROMPT}, 
                 {"role": "user", "content": query}
                ]
    }
    let resp: any = null;
    try {
      const response = await fetch(`${API_SERVER_URL}/api/response?company=${company}&query=${query}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CLIENT_SECRET}`
        },
        body: JSON.stringify(context)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      resp = await response.json();
    } catch (error) {
      console.error('There was a problem with your fetch operation:', error);
    }
    console.log("===resp===========", resp);
    const session = await auth()

    if (session && session.user) {
      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = query.substring(0, 100)

      const messages = []
      if (!existingChat) {
        messages.push({
          role: 'system',
          content: SYSTEM_PROMPT
        })
      }
      messages.push({
        role: 'user',
        content: query
      })
      messages.push({
        role: 'assistant',
        content: resp
      })
      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages: messages,
        path
      }

      await saveChat(chat)
    }

    return {
      id: nanoid(),
      display: (
        <BotCard>
          <BotMessage content={resp} />
        </BotCard>
      )
    };
  } catch (error) {
    console.error('Error occurred while fetching data:', error);
    // Handle error appropriately, e.g., show error message to user
    throw error; // Rethrow the error for the caller to handle
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
})
