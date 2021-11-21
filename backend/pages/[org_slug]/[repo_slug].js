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
        <div className="col-span-12 font-bold" children="Pull Requests" />

        <div className="col-span-2 font-semibold" children="Merged At" />
        <div className="col-span-5 font-semibold" children="PR Title" />
        <div className="col-span-1 font-semibold" children="Merged By" />
        <div className="col-span-1 font-semibold" children="Changes" />
        <div className="col-span-1 font-semibold" children="Files" />
        <div className="col-span-1 font-semibold" children="Comments" />
        <div className="col-span-1 font-semibold" children="Time To Merge" />

        {prHistory.map(v =>
          <React.Fragment>
            <div className="col-span-2" children={DateFns.format(new Date(v.merged_at), 'yyyy-MM-dd hh:mm aaa')} />
            <a
              className="col-span-5"
              href={`https://github.com/${v.owned_by}/${v.repo_name}/pull/${v.pull_request_number}`}
              children={v.pull_request_title}
            />
            <div className="col-span-1" children={v.merged_by} />
            <div className="col-span-1" children={`+${v.num_lines_added}/-${v.num_lines_deleted}`} />
            <div className="col-span-1" children={`${v.num_changed_files}`} />
            <div className="col-span-1" children={`${v.num_comments}`} />
            <div className="col-span-1" children={formatPsqlInterval(v.time_to_merge)} />
          </React.Fragment>
        )}
      </div>

      <Link
        href={{ query: {...router.query, after: prHistory[0]?.merged_at} }}
        children="Newer"
      />
      <Link
        href={{ query: { ...router.query, before: prHistory[prHistory.length - 1]?.merged_at} }}
        children="Older"
      />

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
