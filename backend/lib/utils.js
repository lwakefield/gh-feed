import * as DateFns from 'date-fns'

export function getBackBone (prStatsPerRepoPerWeek) {
  let backbone = []
  let minDate = null
  let maxDate = null
  for (const { stats } of prStatsPerRepoPerWeek) {
    if (minDate === null && maxDate === null) {
      minDate = stats[0].date
      maxDate = stats[stats.length - 1].date
      continue
    }
    if (stats[0].date < minDate)                minDate = stats[0].date
    if (stats[stats.length - 1].date > maxDate) maxDate = stats[stats.length - 1].date
  }
  backbone = DateFns.eachWeekOfInterval({ start: new Date(minDate), end: new Date(maxDate) })

  return backbone
}

export function formatPsqlInterval (interval) {
  const [ hours, minutes, seconds ] = interval.split(':').map(Number)
  return DateFns.formatDuration({ hours, minutes, seconds })
    .replace(' seconds', 's')
    .replace(' minutes', 'm')
    .replace(' hours', 'h')
    .replace(' days', 'd')
}

export function psqlIntervalToSeconds (interval) {
  if (!interval) return interval
  const [ hours, minutes, seconds ] = interval.split(':').map(Number)
  return ( hours * 60 * 60 ) + ( minutes * 60 ) + seconds
}

export function formatInterval (start, stop) {
  return DateFns.formatDuration({ seconds: (start - stop) / 1000 })
    .replace(' seconds', 's')
    .replace(' minutes', 'm')
    .replace(' hours', 'h')
    .replace(' days', 'd')
}

export function prepareSeriesForTable (_series, key) {
  const backbone = getBackBone(_series)
  const x_labels = backbone.map(v => DateFns.format(v, 'yy/MM/dd'))

  const series = _series.map(v => {
    const name = `${v.owned_by}/${v.repo_name}`
    const buffer = new Array(
      DateFns.differenceInWeeks(new Date(v.stats[0].date), backbone[0])
    ).fill(null)
    const values = buffer.concat(v.stats.map(v => v[key]))
    return { name, values }
  })

  return { x_labels, series }
}

export function lerp(v0, v1, t) {
  return v0 + t * (v1 - v0);
}

export function linlin(inmin, inmax, outmin, outmax, x) {
  return lerp(outmin, outmax, pct_bw(inmin, inmax, x))
}

export function pct_bw (v0, v1, x) {
  return (x - v0) / v1
}
