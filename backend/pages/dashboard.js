import { createClient } from '@supabase/supabase-js'
import React from 'react'
import { useRouter } from 'next/router'

import Header from 'components/header'
import StatsPerRepoPerWeek from 'components/stats_per_repo_per_week'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_CLIENT_KEY)

export default function Dashboard() {
  const [ prStatsPerRepoPerWeek, setPrStatsPerRepoPerWeek ] = React.useState([]);

  const router = useRouter()

  React.useEffect(() => {
    if (supabase.auth.user()) {
      loadPrStatsPerWeek().then(setPrStatsPerRepoPerWeek)
    }
  }, [ supabase.auth.user() ])


  return (
    <div>
      <Header />

      <StatsPerRepoPerWeek
        repoStats={prStatsPerRepoPerWeek}
        view={router.query.view || 'merge_throughput'}
      />

    </div>
  )
}

async function loadPrStatsPerWeek () {
  const res = await supabase.from('v2_pr_stats_per_repo_per_week').select().order('owned_by').order('repo_name')
  console.log(res)
  if (res.error !== null) throw res.error;

  return res.data;
}
