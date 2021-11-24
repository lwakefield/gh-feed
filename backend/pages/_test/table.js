import React from 'react'

import Header from 'components/header'
import _Table from 'components/table'
import Card from 'components/card'

export default function Table() {
  const x_labels = []
  for (let i = 0; i < 20; i++) x_labels.push(`x${i}`)

  const series = []
  for (let i = 0; i < 20; i++) {
    let values = []
    for (let i = 0; i < 20; i++) values.push(i)
    series.push({ name: `series ${i}`, values })
  }


  return (
    <div>
      <Header />

      <div className="max-w-screen-2xl mx-auto grid col-12 p-2">

        <Card title="Series Title" className="overflow-hidden">
          <_Table x_labels={x_labels} series={series} />
        </Card>
      </div>
    </div>
  )
}
