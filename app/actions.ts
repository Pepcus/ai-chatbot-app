'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'
import pool from '../lib/db';

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }
  try {
    let result = await pool.query(`SELECT * FROM chat where user_id=$1`, [userId]);
    return result.rows as Chat[]
  } catch (error) {
    console.error('Error in fetching chats.', error);
  }
  return []
}

export async function getChat(id: string, userId: any) {
  let chat = null;
  try {
    const result = await pool.query(`SELECT * FROM chat where id=$1 and user_id=$2`, [id, userId]);
    chat = result.rows[0]
  } catch (error) {
    console.error('Error in fetching chats.', error);
  }

  if (!chat || (userId && chat.user_id !== userId)) {
    return null
  }

  return chat
}

export async function getChatById(id: string) {
  let chat = null;
  try {
    const result = await pool.query(`SELECT * FROM chat where id=$1`, [id]);
    chat = result.rows[0]
  } catch (error) {
    console.error('Error in fetching chats.', error);
  }

  if (!chat) {
    return null
  }
  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }
  
  try {
    const result = await pool.query(`Delete FROM chat where id=$1 and user_id=$2`, [id, session.user?.id]);
  } catch (error) {
    console.error('Error in fetching chats.', error);
  }

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  try {
    const result = await pool.query(`Delete FROM chat where user_id=$1`, [session.user?.id]);
  } catch (error) {
    console.error('Error in fetching chats.', error);
  }
  
  revalidatePath('/')
  return redirect('/')
}

export async function saveChat(chat: Chat) {
  const session = await auth()
  console.log("=======chat.messages=========" + JSON.stringify(chat.messages))
  if (session && session.user) {
    try {
      let existingChat = await getChat(chat.id, chat.userId)
      if (existingChat != null) {
        let existing = existingChat.messages
        let newChat = chat.messages
        console.log("=======existingChat.messages=========" + JSON.stringify(existingChat.messages))
        await pool.query( `UPDATE chat SET messages = $1 WHERE id = $2 AND user_id = $3`, [[...existing, ...newChat], chat.id, chat.userId]);
      } else {
        await pool.query(
          `INSERT INTO chat (id, title, created_at, user_id, path, messages, share_path) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [chat.id, chat.title, chat.createdAt, chat.userId, chat.path, chat.messages, chat.sharePath]
        );
      }
    } catch (error) {
      console.error('Error in chat creation/updation:', error);
    }
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
