import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default async function handler(req, res) {
  if (req.method.toLowerCase() !== 'post') {
    console.error('incorrect method')
    return res.status(404).end()
  }

  if (req.headers['content-type'] !== 'application/json') {
    console.error('incorrect content-type')
    return res.status(400).end()
  }

  if (typeof req.body !== 'object') {
    console.error('incorrect body')
    return req.status(400).end()
  }

  const { data, error } = await supabase.from('gh_webhook_payloads')
    .insert([
      {
        headers: req.headers,
        body: req.body
      }
    ])

  if (error) {
    console.error(error)
    return res.status(500).end()
  }

  console.log(`created id=${data[0].id}`)
  res.status(201).end()
}
