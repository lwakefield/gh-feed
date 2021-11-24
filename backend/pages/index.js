import React from 'react'
import Link from 'next/link'

import Header from 'components/header'

export default function Home() {
  return (
    <React.Fragment>
      <Header />
      <Link href="/dashboard">Dashboard</Link>
    </React.Fragment>
  )
}
