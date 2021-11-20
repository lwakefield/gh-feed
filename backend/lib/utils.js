import * as DateFns from 'date-fns'

export function getBackBone (prStatsPerRepoPerWeek) {
  let backbone = []
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


