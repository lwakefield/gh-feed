import * as DateFns from 'date-fns'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { getBackBone, formatPsqlInterval } from 'lib/utils'

export default function StatsPerRepoPerWeek ({ repoStats, view }) {
  let backbone = getBackBone(repoStats)
  const router = useRouter()
  const views = {
    merge_throughput: { val: v => v.merge_throughput, title: 'Merge Throughput' },
    p50_time_to_merge: { val: v => formatPsqlInterval(v.p50_time_to_merge), title: 'p50 Time To Merge' },
    p90_time_to_merge: { val: v => formatPsqlInterval(v.p90_time_to_merge), title: 'p90 Time To Merge' }
  }
  // we want to change the "a" into Links but next/link is annoying and gets in the way
  return (
    <div>
      <div className="grid grid-cols-3">
        <div className={`text-blue-500 ${view === 'merge_throughput' && 'underline'}`}>
          <Link href={{ query: { ...router.query, view: 'merge_throughput' } }}>Merge Throughput</Link>
        </div>
        <div className={`text-blue-500 ${view === 'p90_time_to_merge' && 'underline'}`}>
          <Link href={{ query: { ...router.query, view: 'p90_time_to_merge' } }}>p90 Time To Merge</Link>
        </div>
        <div className={`text-blue-500 ${view === 'p50_time_to_merge' && 'underline'}`}>
          <Link href={{ query: { ...router.query, view: 'p50_time_to_merge' } }}>p50 Time To Merge</Link>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns: `repeat(${backbone.length + 2}, 100px)`}}>
        <div className="col-start-1 col-span-2">&nbsp;</div>
        {backbone.map((v) =>
          <div className="font-bold">{DateFns.format(v, 'yyyy/MM/dd')}</div>
        )}
        {repoStats.map((repo, repoIdx) =>
          <React.Fragment>
            <div
              className="font-bold col-start-1 col-span-2"
              style={{ gridRowStart: 3 + repoIdx }}
            >
              <Link href={`/${repo.owned_by}/${repo.repo_name}`}>{`${repo.owned_by}/${repo.repo_name}`}</Link>
            </div>
            {repo.stats.map(stats =>
            <div
              className=""
              style={{
                gridRowStart: 3 + repoIdx,
                gridColumnStart: 3 + DateFns.differenceInWeeks(new Date(stats.date), backbone[0])
              }}
            >
              {views[view].val(stats)}
            </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  )
}
