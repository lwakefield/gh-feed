import { createClient } from '@supabase/supabase-js'
import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <Link href="/dashboard" children="Dashboard" />
  )
}
