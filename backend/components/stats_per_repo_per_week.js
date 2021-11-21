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
          <Link
            href={{ query: { ...router.query, view: 'merge_throughput' } }}
            children="Merge Throughput"
          />
        </div>
        <div className={`text-blue-500 ${view === 'p90_time_to_merge' && 'underline'}`}>
          <Link
            href={{ query: { ...router.query, view: 'p90_time_to_merge' } }}
            children="p90 Time To Merge"
          />
        </div>
        <div className={`text-blue-500 ${view === 'p50_time_to_merge' && 'underline'}`}>
          <Link
            href={{ query: { ...router.query, view: 'p50_time_to_merge' } }}
            children="p50 Time To Merge"
          />
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns: `repeat(${backbone.length + 2}, 100px)`}}>
        <div className="col-start-1 col-span-2" children="" />
        {backbone.map((v) =>
          <div className="font-bold" children={DateFns.format(v, 'yyyy/MM/dd')} />
        )}
        {repoStats.map((repo, repoIdx) =>
          <React.Fragment>
            <div
              className="font-bold col-start-1 col-span-2"
              style={{ gridRowStart: 3 + repoIdx }}
            >
              <Link
                href={`/${repo.owned_by}/${repo.repo_name}`}
                children={`${repo.owned_by}/${repo.repo_name}`}
              />
            </div>
            {repo.stats.map(stats =>
            <div
              className=""
              style={{
                gridRowStart: 3 + repoIdx,
                gridColumnStart: 3 + DateFns.differenceInWeeks(new Date(stats.date), backbone[0])
              }}
              children={views[view].val(stats)}
            />
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  )
}
