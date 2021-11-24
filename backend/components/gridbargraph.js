import React from 'react'

import BarGraph from 'components/bargraph'

export default function GridBarGraph ({ x_labels, series, parseValue }) {
  return (
    <div className="grid grid-flow-row auto-rows-max overflow-scroll max-h-96">
      <div className="flex sticky top-0 bg-white z-20 border-b border-gray-200">
        <div style={{ width: '200px' }} className="sticky left-0 bg-white z-20 border-r border-gray-200">&nbsp;</div>
        <BarGraph
          x_labels={x_labels}
          values={x_labels}
          show_bars={false}
        />
      </div>
      {series.map((s) =>
        <div key={s.name} class="flex">
          <div
            className="font-bold sticky items-end left-0 bg-white text-right px-2 z-10 border-r border-gray-200"
            style={{ width: '200px' }}
          >
            {s.name}
          </div>

          <BarGraph
            x_labels={x_labels}
            values={s.values}
            maxbarheight={25}
            parseValue={parseValue}
            show_labels={false}
          />
        </div>
      )}
    </div>
  )
}

