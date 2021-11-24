import React from 'react'

import * as Utils from 'lib/utils'

export default function BarGraph ({
  x_labels,
  show_labels = true,
  skip_labels = 5,
  values,
  show_bars = true,
  maxbarheight = 200,
  barwidth = 10,
  bargap = 1,
  paddingX = 15,
  paddingY = 5,
  parseValue = (v) => v,
  className = '',
}) {
  const min = Math.min(...values.map(parseValue))
  const max = Math.max(...values.map(parseValue))
  let svgheight = paddingY * 2
  if (show_bars) svgheight += maxbarheight
  if (show_labels) svgheight += 20
  let label_offset = paddingY
  if (show_bars) label_offset += maxbarheight
  return (
    <svg
      height={svgheight}
      width={values.length * (barwidth + bargap) + paddingX * 2}
      className={'fill-current text-blue-500 ' + className}
    >
      {show_bars && values.map((v, idx) =>
        v !== null && <rect
          key={"bar-"+idx}
          width={barwidth}
          height={Math.floor(Utils.linlin(min, max, 2, maxbarheight, parseValue(v)))}
          x={paddingX + idx * (barwidth + bargap)}
          y={paddingY + maxbarheight - Math.floor(Utils.linlin(min, max, 2, maxbarheight, parseValue(v)))}
        />
      )}
      {show_labels && x_labels.map((v, idx) =>
        (idx % skip_labels === 0) && <React.Fragment key={"label-"+idx}>
          {/*<line
            x1={padding + idx * (barwidth + bargap) + (barwidth + bargap)/2}
            x2={padding + idx * (barwidth + bargap) + (barwidth + bargap)/2}
            y1={label_offset + 1}
            y2={label_offset + 3}
            stroke="black"
          />*/}
          <text
            textAnchor="middle"
            x={paddingX + (idx) * (barwidth + bargap) + (barwidth + bargap)/2}
            y={label_offset + 15}
            fontSize={8}
          >{v}</text>
        </React.Fragment>
      )}
    </svg>
  )
}
