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
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        { !supabase.auth.user() &&
        <React.Fragment>
          <div>
            <Link className="text-white" href="/">About</Link>
          </div>
          <div>
            <Link className="text-white" href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GH_APP_NAME}/installations/new`}>
              Install
            </Link>
            <button onClick={login} className="text-white font-bold py-1 px-2">
              Log in
            </button>
          </div>
        </React.Fragment>
        }
        { supabase.auth.user() &&
          <React.Fragment>
            <div>
              <Link className="text-white" href="/dashboard">Dashboard</Link>
            </div>
            <div>
              <Link className="text-white" href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GH_APP_NAME}/installations/new`}>
                Install
              </Link>
              <button onClick={logout} className="text-white font-bold py-1 px-2">
                Log out
              </button>
            </div>
          </React.Fragment>
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
