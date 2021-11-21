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
    <div className="bg-gray-100 p-2 mb-5 grid col-12">
      { !supabase.auth.user() &&
      <button onClick={login} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded col-start-12">
        Log in
      </button>
      }
      { supabase.auth.user() &&
        <button onClick={logout} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">
          Log out
        </button>
      }
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

async function logout (e) {
  e.preventDefault()
  e.stopPropagation()
  const { error } = await supabase.auth.signOut()
  console.log(user, session, error)
  window.location.reload()
}
