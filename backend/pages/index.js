import { createClient } from '@supabase/supabase-js'
import React from 'react'
import * as DateFns from 'date-fns'
import styles from '../styles/Home.module.css'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_CLIENT_KEY)

export default function Home() {
  const [ prTimeToMerges, setPrTimeToMerges ] = React.useState([]);
  const [ prStatsPerRepoPerWeek, setPrStatsPerRepoPerWeek ] = React.useState([]);

  React.useEffect(() => {
    window.supabase = supabase
    console.log(supabase.auth.user())
    console.log(supabase.auth.session())
    console.log(fetch)
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session)
      if (event === 'SIGNED_IN') {
        fetch('/api/syncauth', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session })
        })
      }
      loadPrTimeToMerges().then(setPrTimeToMerges)
      loadPrTimeToMergePerRepoPerWeek().then(setPrStatsPerRepoPerWeek)
    })

    if (supabase.auth.user()) {
      loadPrTimeToMerges().then(setPrTimeToMerges)
      loadPrTimeToMergePerRepoPerWeek().then(setPrStatsPerRepoPerWeek)
    }

  }, [])

  let daysForStats = []
  if (prStatsPerRepoPerWeek) {
    let minDate = null
    let maxDate = null
    for (const { stats } of prStatsPerRepoPerWeek) {
      if (minDate === null && maxDate === null) {
        maxDate = stats[0].date
        minDate = stats[stats.length - 1].date
        continue
      }
      if (stats[0].date > maxDate)                maxDate = stats[0].date
      if (stats[stats.length - 1].date < minDate) minDate = stats[stats.length - 1].date
    }
    daysForStats = DateFns.eachDayOfInterval({ start: new Date(minDate), end: new Date(maxDate) })
  }

  return (
    <div className={styles.container}>
      <button onClick={login} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Log in
      </button>

      <div class="grid" style={{gridTemplateColumns: `repeat(${daysForStats.length + 2}, 100px)`}}>
        <div class="col-span-12 font-bold" children="Pull Requests: Stats Per Day" />
        <div class="col-start-1 col-span-2" children="" />
        {daysForStats.map((v) =>
          <div class="font-bold" children={DateFns.format(v, 'yyyy/MM/dd')} />
        )}
        {prStatsPerRepoPerWeek.map((repo, repoIdx) =>
          <React.Fragment>
            <div
              class="font-bold col-start-1 col-span-2"
              style={{ gridRowStart: 3 + repoIdx }}
              children={`${repo.owned_by}/${repo.repo_name}`}
            />
            {repo.stats.map(stats =>
            <div
              class=""
              style={{
                gridRowStart: 3 + repoIdx,
                gridColumnStart: 3 + DateFns.differenceInDays(new Date(stats.date), daysForStats[0])
              }}
              children={formatPsqlInterval(stats.p90_time_to_merge)}
            />
            )}
          </React.Fragment>
        )}
      </div>

      <div class="grid grid-flow-row auto-rows-max grid-cols-12 gap-4">
        <div class="col-span-12 font-bold" children="Pull Requests: Time To Merge" />

        <div class="col-span-3 font-semibold" children="merged_at" />
        <div class="col-span-4 font-semibold" children="repository" />
        <div class="col-span-5 font-semibold" children="time_to_merge" />
        {prTimeToMerges.map(v => [
            <div class="col-span-3" children={v.merged_at} />,
            <a
              class="col-span-4"
              href={`https://github.com/${v.owned_by}/${v.repo_name}/pull/${v.pull_request_number}`}
              children={`https://github.com/${v.owned_by}/${v.repo_name}/pull/${v.pull_request_number}`}
            />,
            <div class="col-span-5" children={v.time_to_merge} />,
          ]
        ).flat() }
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
    // redirectTo: window.location.origin + '/api/postlogin'
  })
  console.log(user, session, error)
}

async function loadPrTimeToMerges () {
  const res = await supabase.from('v1_time_to_merge').select().order('merged_at', { ascending: false })
  if (res.error !== null) throw res.error;

  return res.data;
}

async function loadPrTimeToMergePerRepoPerWeek () {
  const res = await supabase.from('v1_pr_stats_per_repo_per_week').select().order('owned_by').order('repo_name')
  if (res.error !== null) throw res.error;

  return res.data;
}

function formatPsqlInterval (interval) {
  const [ hours, minutes, seconds ] = interval.split(':').map(Number)
  return DateFns.formatDuration({ hours, minutes, seconds })
    .replace(' seconds', 's')
    .replace(' minutes', 'm')
    .replace(' hours', 'h')
    .replace(' days', 'd')
}
