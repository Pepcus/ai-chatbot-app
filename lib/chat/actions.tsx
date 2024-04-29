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
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/utils/message'
import { Chat, ChatMessage } from '@/lib/types'
import { auth } from '@/auth'

async function getDetailsFromCustomDataSource(formData: any, chatId: any) {
  'use server'
  try {
    const API_SERVER_URL = process.env.API_SERVER_URL
    const company = formData.get('company');
    const query = formData.get('query');
    const file = formData.get('file');
    let response: any;

    if (file != 'null' && file != null) {
      console.log("======== POST API called =========");
      response = await fetch(`${API_SERVER_URL}/api/response`, {
        method: 'POST',
        body: formData,
      });
    } else {
      console.log("======== GET API called =========");
      response = await fetch(`${API_SERVER_URL}/api/response?company=${company}&query=${query}`);
    }

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const resp = await response.json();

    const session = await auth()

    if (session && session.user) {
      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = query.substring(0, 100)

      const messages = []
      messages.push({
        id: nanoid(),
        createdAt: new Date(),
        role: 'user',
        content: query
      })
      messages.push({
        id: nanoid(),
        createdAt: new Date(),
        role: 'system',
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
