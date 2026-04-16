'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase-server'

export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard?authToast=login')
}
