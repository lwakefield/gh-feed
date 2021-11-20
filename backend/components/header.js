import React from 'react'
import * as DateFns from 'date-fns'

import supabase from '../lib/supabase'

export default function Header() {
  React.useEffect(() => {
    window.supabase = supabase
    console.log(supabase.auth.user())
    console.log(supabase.auth.session())
    console.log(fetch)

    supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session)
      if (event === 'SIGNED_IN') {
        fetch('/api/syncauth', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session })
        })
      }
    })

  }, [ ])

  return (
    <div class="bg-gray-100 p-2 mb-5 grid col-12">
      <button onClick={login} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded col-start-12">
        Log in
      </button>
    </div>
  )
}

async function login (e) {
  e.preventDefault()
  e.stopPropagation()
  const { user, session, error } = await supabase.auth.signIn({
    provider: 'github',
    scopes: 'user'
  }, {
    // redirectTo: window.location.origin + '/api/postlogin'
  })
  console.log(user, session, error)
}
