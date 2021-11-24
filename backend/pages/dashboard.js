import { createClient } from '@supabase/supabase-js'
import React from 'react'
import { useRouter } from 'next/router'
import { parse } from 'cookie'

import Header from 'components/header'
import GridBarGraph from 'components/gridbargraph'
import Table from 'components/table'
import Link from 'components/link'
import Card from 'components/card'
import * as Utils from 'lib/utils'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_CLIENT_KEY)

export default function Dashboard({ prStatsPerRepoPerWeek }) {
  const router = useRouter()

  const throughputSeries = Utils.prepareSeriesForTable(prStatsPerRepoPerWeek, 'merge_throughput')
  const p90Series        = Utils.prepareSeriesForTable(prStatsPerRepoPerWeek, 'p90_time_to_merge')
  const p50Series        = Utils.prepareSeriesForTable(prStatsPerRepoPerWeek, 'p50_time_to_merge')

  const view = router.query.view || 'graph'

  return (
    <div>
      <Header />

      <div className="max-w-screen-2xl mx-auto grid col-12 p-2">

        <div className="flex justify-end">
          <span className="font-semibold mr-2">View:</span>
          <Link className={`mr-2 ${view === 'table' && 'underline'}`} href={{ query: {...router.query, view: 'table'} }}>Table</Link>
          <Link className={`     ${view === 'graph' && 'underline'}`} href={{ query: { ...router.query, view: 'graph'} }}>Graph</Link>
        </div>

        <Card title="Merge Throughput" className="overflow-hidden">
          {view === 'table' && <Table {...throughputSeries} />}
          {view === 'graph' && <GridBarGraph {...throughputSeries} />}
        </Card>
        <Card title="p90 Time To Merge" className="overflow-hidden">
          {view === 'table' && <Table {...p90Series} formatValue={Utils.formatPsqlInterval} />}
          {view === 'graph' && <GridBarGraph {...p90Series} parseValue={Utils.psqlIntervalToSeconds} />}
        </Card>
        <Card title="p50 Time To Merge" className="overflow-hidden">
          {view === 'table' && <Table {...p50Series} formatValue={Utils.formatPsqlInterval} />}
          {view === 'graph' && <GridBarGraph {...p50Series} parseValue={Utils.psqlIntervalToSeconds} />}
        </Card>
      </div>

    </div>
  )
}

async function loadPrStatsPerWeek () {
  const res = await supabase.from('v2_pr_stats_per_repo_per_week').select().order('owned_by').order('repo_name')
  if (res.error !== null) throw res.error;

  return res.data;
}

export async function getServerSideProps (context) {
  const { sb_token } = parse(context.req.headers.cookie)
  supabase.auth.setAuth(sb_token)

  return {
    props: {
      prStatsPerRepoPerWeek: await loadPrStatsPerWeek()
    }
  }
}
