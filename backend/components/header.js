import React from 'react'

import supabase from 'lib/supabase'
import { WhiteLink as Link } from 'components/link'

export default function Header() {
  React.useEffect(() => {
    window.supabase = supabase

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
    <div className="p-2 mb-5 bg-blue-500">
      <div className="max-w-screen-2xl mx-auto grid items-center col-12">
        { !supabase.auth.user() &&
          <Link className="text-white" href="/">About</Link>
        }
        { supabase.auth.user() &&
          <Link className="text-white" href="/dashboard">Dashboard</Link>
        }
        { !supabase.auth.user() &&
        <button onClick={login} className="text-white font-bold py-1 px-2 col-start-12">
          Log in
        </button>
        }
        { supabase.auth.user() &&
          <button onClick={logout} className="text-white font-bold py-1 px-2 col-start-12">
            Log out
          </button>
        }
      </div>
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
    redirectTo: window.location.origin + '/dashboard'
  })
  console.log(user, session, error)
}

async function logout (e) {
  e.preventDefault()
  e.stopPropagation()
  const { error } = await supabase.auth.signOut()
  window.location = '/'
}
