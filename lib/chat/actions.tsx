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
} from '@/components/events'

import { z } from 'zod'
import { Response } from '@/components/responses/response'
import { ResponseSkeleton } from '@/components/responses/response-skeleton'

import {
  nanoid, sleep
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/events/message'
import { Chat } from '@/lib/types'
import { auth } from '@/auth'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})



async function getDetailsFromEmployeeHandbook(query: string) {
  'use server'

  const API_SERVER_URL = process.env.API_SERVER_URL
  let companyId = null
  const session = await auth()
  if (session && session.user) {
    console.log("===============email=============", session?.user?.email)
    const email = session?.user?.email
    
    if (email == 'deepak.nigam@example.com') {
      companyId = 999
    } else {
      companyId = 1265
    }
  } else {
    companyId = 439
  }
  console.log("===============companyId=============", companyId)

  const response = await fetch(`${API_SERVER_URL}/response?companyId=${companyId}&query=${query}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const resp = await response.json();
  return resp
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

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
        content: `\
        You are an HR conversation bot and you can assist users with various HR-related tasks and inquiries.
        
        You and the user can discuss HR processes, policies, and best practices.

        If the user asks any question related to HR domain, employee handbook, HR processes, call hackthon_function to display the relevant content.

        If the user asks subsequent questions related to HR domain, employee handbook, HR processes, call 'hackthon_function' again and pass user's query as an argument to it. Do this until user changes the topic. Do not add anthing from your side.

        If you are not sure about any question, call 'get_details_from_employee_handbook' and pass user's query as an argument to it.

        Additionally, you can engage in conversation with users and offer support as needed.`
      },
      {
        role: 'assistant',
        content: `\
        You are an HR conversation bot and you can assist users with various HR-related tasks and inquiries.
        
        You and the user can discuss HR processes, policies, and best practices.

        If the user asks any question related to HR domain, employee handbook, HR processes, call hackthon_function to display the relevant content.

        If the user asks subsequent questions related to HR domain, employee handbook, HR processes, call 'hackthon_function' again and pass user's query as an argument to it. Do this until user changes the topic. Do not add anthing from your side.

        If you are not sure about any question, call 'get_details_from_employee_handbook' and pass user's query as an argument to it.

        Additionally, you can engage in conversation with users and offer support as needed.`
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
              content: content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    functions: {
      getDetailsFromEmployeeHandbook: {
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
          console.log("==========query before call=======", userQuery)
          const resp = await getDetailsFromEmployeeHandbook(userQuery.description)
          await sleep(1000)
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'function',
                name: 'hackthonFunction',
                content: resp.result
              }
            ]
          })

          return (
            <BotCard>
              <Response props={{description:resp.result}}/>
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
    getDetailsFromEmployeeHandbook
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
         message.name === 'getDetailsFromEmployeeHandbook' ? (
            <BotCard>
              <Response props={JSON.parse(message.content)} />
            </BotCard>
          ) : null
        ) : message.role === 'user' ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        )
    }))
}
