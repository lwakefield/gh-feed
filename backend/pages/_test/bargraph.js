import React from 'react'

import Header from 'components/header'
import _BarGraph from 'components/bargraph'
import Card from 'components/card'

export default function BarGraph() {
  const x_labels = []
  for (let i = 0; i < 100; i++) x_labels.push(`x${i}`)

  const series = []
  for (let i = 0; i < 20; i++) {
    let values = []
    for (let i = 0; i < 100; i++) values.push(Math.floor(Math.random() * 100))
    series.push({ name: `series ${i}`, values })
  }

  return (
    <div>
      <Header />

      <div className="max-w-screen-2xl mx-auto grid col-12 p-2">

        <Card title="Series Title" className="overflow-hidden">
          <div class="overflow-scroll">
            <_BarGraph x_labels={x_labels} values={series[0].values} maxbarheight={25} />
          </div>
        </Card>
      </div>
    </div>
  )
}
