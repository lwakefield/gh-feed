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

  try {
    await addToPayloads(req)
    await maybeAddOpenedPr(req)
    await maybeAddMergedPr(req)
  } catch (e) {
    console.log(e)
    return res.status(500).end()
  }

  res.status(201).end()
}

async function addToPayloads (req) {
  const { data, error } = await supabase.from('gh_webhook_payloads')
    .insert([
      {
        headers: req.headers,
        body: req.body
      }
    ])

  if (error) throw error

  console.log(`created gh_webhook_payloads.id=${data[0].id}`)
}

async function maybeAddOpenedPr (req) {
  if (req.headers['x-github-event'] !== 'pull_request') return
  if (req.body.action !== 'opened') return

  const { data, error } = await supabase.from('v2_opened_pull_requests')
    .insert([
      {
        owned_by:            req.body.repository.owner.login,
        repo_name:           req.body.repository.name,
        pull_request_number: req.body.pull_request.number,
        pull_request_title:  req.body.pull_request.title,
        opened_at:           req.body.pull_request.created_at,
        opened_by:           req.body.sender.login
      }
    ])

  if (error) throw error

  console.log(`created v2_opened_pull_requests.id=${data[0].id}`)
}

async function maybeAddMergedPr (req) {
  if (req.headers['x-github-event'] !== 'pull_request') return
  if (req.body.action !== 'closed') return
  if (req.body.pull_request.merged !== true) return

  const { data, error } = await supabase.from('v2_merged_pull_requests')
    .insert([
      {
        owned_by:            req.body.repository.owner.login,
        repo_name:           req.body.repository.name,
        pull_request_number: req.body.pull_request.number,
        pull_request_title:  req.body.pull_request.title,
        merged_at:           req.body.pull_request.merged_at,
        merged_by:           req.body.sender.login,
        num_commits:         req.body.pull_request.commits,
        num_lines_added:     req.body.pull_request.additions,
        num_lines_deleted:   req.body.pull_request.deletions,
        num_changed_files:   req.body.pull_request.changed_files,
        num_comments:        req.body.pull_request.comments,
      }
    ])

  if (error) throw error

  console.log(`created v2_merged_pull_requests.id=${data[0].id}`)
}
