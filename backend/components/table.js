import React from 'react'

export default function Table ({ x_labels, series, formatValue = (v) => v }) {
  return (
    <div className="grid overflow-scroll max-h-96" style={{gridTemplateColumns: `repeat(${x_labels.length + 2}, 100px)`}}>

      <div
        className="col-start-1 col-span-2 sticky left-0 top-0 z-20 bg-white border-r border-b border-gray-200"
      >&nbsp;</div>

      {x_labels.map((v) => <div className="font-bold sticky top-0 bg-white border-b border-gray-200 px-2" key={v}>{v}</div>)}

      {series.map((s, idx) =>
        <React.Fragment key={s.name}>
          <div
            className="font-bold col-start-1 col-span-2 sticky left-0 bg-white text-right border-r border-gray-200 px-2"
            style={{ gridRowStart: 3 + idx }}
          >
            {s.name}
          </div>

          {
            s.values.map((v, k) =>
              v !== null && <div
                key={k}
                style={{
                  gridRowStart: 3 + idx,
                  gridColumnStart: 3 + k
                }}
                className="px-2"
              >{formatValue(v)}</div>
            )
          }
        </React.Fragment>
      )}
    </div>
  )
}
