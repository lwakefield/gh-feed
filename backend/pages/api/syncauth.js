import { serialize } from 'cookie'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default async function handler(req, res) {
  if (req.method.toLowerCase() !== 'post') {
    console.error('incorrect method')
    return res.status(404).end()
  }

  const options = {
    expires: new Date(Date.now() + req.body.session.expires_in * 1000),
    path: '/'
  }

  res.setHeader('set-cookie', serialize('gh_token', req.body.session.provider_token, options))

  await sync_all_memberships(req.body.session)

  res.status(200).end()
}

async function sync_all_memberships (session) {
  let orgs = []
  let page = 1
  while (true) {
    const res = await fetch(`https://api.github.com/user/memberships/orgs?per_page=100&state=active&page=${page}`, {
      headers: {
        accept: 'application/vnd.github.v3+json',
        authorization: `bearer ${session.provider_token}`
      }
    })
    const json = await res.json()
    if (json.length > 0) {
      orgs = [ ...orgs, ...json ]
      page += 1
    } else {
      break
    }
  }

  const org_slugs = orgs.map(v => v.organization.login)

  const { data, error } = await supabase.from('gh_org_memberships')
    .upsert({
      user_id: session.user.id,
      org_slugs,
      updated_at: new Date()
    })

  if (error) throw error
}
