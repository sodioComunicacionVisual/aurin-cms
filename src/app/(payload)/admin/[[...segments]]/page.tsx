/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = async ({ params, searchParams }: Args) => {
  console.log('[ADMIN DEBUG] Page loading started')
  console.log('[ADMIN DEBUG] Params:', await params)
  console.log('[ADMIN DEBUG] SearchParams:', await searchParams)
  console.log('[ADMIN DEBUG] Config loaded:', !!config)
  console.log('[ADMIN DEBUG] ImportMap loaded:', !!importMap)
  console.log('[ADMIN DEBUG] Environment:', {
    nodeEnv: process.env.NODE_ENV,
    hasPayloadSecret: !!process.env.PAYLOAD_SECRET,
    hasDatabaseUri: !!process.env.DATABASE_URI,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN
  })

  try {
    console.log('[ADMIN DEBUG] Rendering RootPage...')
    const page = RootPage({ config, params, searchParams, importMap })
    console.log('[ADMIN DEBUG] RootPage rendered successfully')
    return page
  } catch (error) {
    console.error('[ADMIN DEBUG] Error rendering RootPage:', error)
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Admin Panel Debug Error</h1>
        <p>Error loading admin panel:</p>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {error instanceof Error ? error.stack : String(error)}
        </pre>
        <hr />
        <h2>Environment Check:</h2>
        <ul>
          <li>NODE_ENV: {process.env.NODE_ENV}</li>
          <li>PAYLOAD_SECRET: {process.env.PAYLOAD_SECRET ? '✓ Set' : '✗ Missing'}</li>
          <li>DATABASE_URI: {process.env.DATABASE_URI ? '✓ Set' : '✗ Missing'}</li>
          <li>BLOB_READ_WRITE_TOKEN: {process.env.BLOB_READ_WRITE_TOKEN ? '✓ Set' : '✗ Missing'}</li>
        </ul>
      </div>
    )
  }
}

export default Page
