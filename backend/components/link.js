import _Link from 'next/link'

export default function Link ({
  className='',
  ...props
}) {
  return <span className={'text-blue-500 hover:text-blue-700 ' + className}>
    <_Link {...props} />
  </span>
}

export function WhiteLink ({
  className='',
  ...props
}) {
  return <span className={'text-white-500 ' + className}>
    <_Link {...props} />
  </span>
}
