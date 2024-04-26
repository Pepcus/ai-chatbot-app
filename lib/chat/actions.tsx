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


async function getDetailsFromCustomDataSource(query:string, company:any, role:any) {
  'use server'
  console.log("========custom data source fucntion called=========")
  const API_SERVER_URL = process.env.API_SERVER_URL
  const response = await fetch(`${API_SERVER_URL}/response?company=${company}&query=${query}&role=${role}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const resp = await response.json();
  return resp
}

async function submitUserMessage(content: string, company: string, role: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()
  console.log("========role in submit user message=========", role)
  let prompt:any = null;
  if (role != null) {
    let promptName = role + "_PROMPT"
    prompt = process.env[promptName]
  } else {
    prompt = process.env.GENERIC_PROMPT
  }
  
  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode
  
  const ui = render({
    model: 'gpt-3.5-turbo',
    provider: openai,
    initial: <SpinnerMessage />,
    messages: [
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'assistant',
        content: prompt
      },
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content: prompt
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    functions: {
      getDetailsFromCustomDataSource: {
        parameters: z.object({
          userQuery: z.object({
            description: z.string()
          })
        }),
        render: async function* ({userQuery}) {
          yield (
            <BotCard>
              <ResponseSkeleton />
            </BotCard>
          )
          const resp = await getDetailsFromCustomDataSource(userQuery.description, company, role)
          await sleep(1000)
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'getDetailsFromCustomDataSource',
                content: resp
              }
            ]
          })

          return (
            <BotCard>
              <Response props={resp}/>
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: ui
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
    submitUserMessage,
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
