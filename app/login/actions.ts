'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { ResultCode } from '@/lib/utils'
import pool from '../../lib/db';


export async function getUser(email: string) {
  let user = null;
  try {
    const query = `SELECT * FROM users where email='${email}'`;
    const result = await pool.query(query);
    user = result.rows[0]
  } catch (error) {
    console.error('Error in fetching users.', error);
  }
  return user
}

interface Result {
  type: string
  resultCode: ResultCode
  user: any
}

export async function authenticate(
  _prevState: Result | undefined,
  formData: FormData
): Promise<Result | undefined> {
  try {
    const email = formData.get('email')
    const password = formData.get('password')

     // Define the techmanager credentials
     const techManagerCredentials = {
      email: process.env.TECH_MANAGER_EMAIL,
      password: process.env.TECH_MANAGER_PASSWORD
    }

    // Check if the credentials match the techmanager credentials
    if (email === techManagerCredentials.email && password === techManagerCredentials.password) {
      // Direct to the invoice screen for techmanager
      return {
        type: 'success',
        resultCode: ResultCode.UserLoggedIn,
        user: {
          email: techManagerCredentials.email,
          password: techManagerCredentials.password,
          company: 'Pepcus',
          role: 'techmanager',
          redirect: '/invoice' // Custom field to indicate redirection
        }
      }
    }

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
      await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      const { company } = await getUser(parsedCredentials.data.email);

      return {
        type: 'success',
        resultCode: ResultCode.UserLoggedIn,
        user: {email, company}
      }
    } else {
      return {
        type: 'error',
        resultCode: ResultCode.InvalidCredentials,
        user: null
      }
    }
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
    }
  }
}
