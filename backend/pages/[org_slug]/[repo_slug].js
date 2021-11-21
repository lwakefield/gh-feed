import { createClient } from '@supabase/supabase-js'
import React from 'react'
import { useRouter } from 'next/router'
import * as DateFns from 'date-fns'
import Link from 'next/link'

import Header from 'components/header'
import StatsPerRepoPerWeek from 'components/stats_per_repo_per_week'
import { getBackBone, formatPsqlInterval } from 'lib/utils'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_CLIENT_KEY)

export default function Dashboard() {
  const [ prStatsPerRepoPerWeek, setPrStatsPerRepoPerWeek ] = React.useState([]);
  const [ prHistory, setPrHistory ] = React.useState([]);

  const router = useRouter()

  React.useEffect(() => {
    if (supabase.auth.user() && router.isReady ) {
      loadPrTimeToMergePerRepoPerWeek(
        router.query.org_slug,
        router.query.repo_slug,
      ).then(setPrStatsPerRepoPerWeek)
      loadPrHistoryPage(
        router.query.org_slug,
        router.query.repo_slug,
        router.query.after || '-infinity',
        router.query.before || 'infinity'
      ).then(setPrHistory)
    }
  }, [ supabase.auth.user(), router ])

  return (
    <div>
      <Header />

      <StatsPerRepoPerWeek
        repoStats={prStatsPerRepoPerWeek}
        view={router.query.view || 'merge_throughput'}
      />

      <div className="grid grid-flow-row auto-rows-max grid-cols-12 gap-4">
        <div className="col-span-12 font-bold">Pull Requests</div>

        <div className="col-span-2 font-semibold">Merged At</div>
        <div className="col-span-5 font-semibold">PR Title</div>
        <div className="col-span-1 font-semibold">Merged By</div>
        <div className="col-span-1 font-semibold">Changes</div>
        <div className="col-span-1 font-semibold">Files</div>
        <div className="col-span-1 font-semibold">Comments</div>
        <div className="col-span-1 font-semibold">Time To Merge</div>

        {prHistory.map(v =>
          <React.Fragment key={`${v.owned_by}/${v.repo_name}/pull/${v.pull_request_number}`}>
            <div className="col-span-2">{DateFns.format(new Date(v.merged_at), 'yyyy-MM-dd hh:mm aaa')}</div>
            <a
              className="col-span-5"
              href={`https://github.com/${v.owned_by}/${v.repo_name}/pull/${v.pull_request_number}`}
            >{v.pull_request_title}</a>
            <div className="col-span-1">{v.merged_by}</div>
            <div className="col-span-1">{`+${v.num_lines_added}/-${v.num_lines_deleted}`}</div>
            <div className="col-span-1">{`${v.num_changed_files}`}</div>
            <div className="col-span-1">{`${v.num_comments}`}</div>
            <div className="col-span-1">{formatPsqlInterval(v.time_to_merge)}</div>
          </React.Fragment>
        )}
      </div>

      <Link href={{ query: {...router.query, after: prHistory[0]?.merged_at} }}>Newer</Link>
      <Link href={{ query: { ...router.query, before: prHistory[prHistory.length - 1]?.merged_at} }}>Older</Link>

    </div>
  )
}

async function loadPrTimeToMergePerRepoPerWeek (org_slug, repo_slug) {
  const res = await supabase.from('v1_pr_stats_per_repo_per_day')
    .select()
    .eq('owned_by', org_slug)
    .eq('repo_name', repo_slug)
  if (res.error !== null) throw res.error;

  return res.data;
}

async function loadPrHistoryPage (org_slug, repo_slug, merged_after='-infinity', merged_before='infinity') {
  const res = await supabase.from('v1_time_to_merge')
    .select()
    .eq('owned_by', org_slug)
    .eq('repo_name', repo_slug)
    .gt('merged_at', merged_after)
    .lt('merged_at', merged_before)
    .order('merged_at', { ascending: false })
    .limit(100)
  if (res.error !== null) throw res.error;

  return res.data;
}
