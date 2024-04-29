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
import { Chat } from '@/lib/types'
import { auth } from '@/auth'

async function getDetailsFromCustomDataSource(formData: any) {
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
              <BotMessage content={message.content} />
            </BotCard>
          ) : null
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
