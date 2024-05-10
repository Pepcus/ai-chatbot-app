'use server'

import { signIn } from '@/auth'
import { ResultCode, getStringFromBuffer } from '@/lib/utils'
import { z } from 'zod'
import { kv } from '@vercel/kv'
import { getUser } from '../login/actions'
import { AuthError } from 'next-auth'
import pool from '../../lib/db';

export async function createUser(
  name: string,
  email: string,
  hashedPassword: string,
  salt:string,
  role: string
) {
  const existingUser = await getUser(email)

  if (existingUser) {
    return {
      type: 'error',
      resultCode: ResultCode.UserAlreadyExists,
      user: null
    }
  } else {
    try {
      // Create user in the database
      await pool.query(
        'INSERT INTO users (name, email, password, salt, role) VALUES ($1, $2, $3, $4, $5)',
        [name, email, hashedPassword, salt, role]
      );
    } catch (error) {
      console.error('Error creating user:', error);
    }

    return {
      type: 'success',
      resultCode: ResultCode.UserCreated,
      user: {email, role}
    }
  }
}

interface Result {
  type: string
  resultCode: ResultCode
  user: any
}

export async function signup(
  _prevState: Result | undefined,
  formData: FormData
): Promise<Result | undefined> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  const parsedCredentials = z
    .object({
      email: z.string().email(),
      password: z.string().min(6)
    })
    .safeParse({
      email,
      password
    })

  if (parsedCredentials.success) {
    const salt = crypto.randomUUID()

    const encoder = new TextEncoder()
    const saltedPassword = encoder.encode(password + salt)
    const hashedPasswordBuffer = await crypto.subtle.digest(
      'SHA-256',
      saltedPassword
    )
    const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

    try {
      const result = await createUser(name, email, hashedPassword, salt, role)

      if (result.resultCode === ResultCode.UserCreated) {
        await signIn('credentials', {
          email,
          password,
          redirect: false
        })
      }

      return result
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return {
              type: 'error',
              resultCode: ResultCode.InvalidCredentials,
              user: null
            }
          default:
            return {
              type: 'error',
              resultCode: ResultCode.UnknownError,
              user: null
            }
        }
      } else {
        return {
          type: 'error',
          resultCode: ResultCode.UnknownError,
          user: null
        }
      }
    }
  } else {
    return {
      type: 'error',
      resultCode: ResultCode.InvalidCredentials,
      user: null
    }
  }
}
