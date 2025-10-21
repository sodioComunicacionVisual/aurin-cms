'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ADMIN ERROR BOUNDARY]', error)
  }, [error])

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>
        Error en Admin Panel
      </h1>

      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginTop: 0 }}>Detalles del Error:</h2>
        <p><strong>Mensaje:</strong> {error.message}</p>
        {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
      </div>

      <details style={{
        background: '#f5f5f5',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          Stack Trace
        </summary>
        <pre style={{
          overflow: 'auto',
          fontSize: '12px',
          marginTop: '10px'
        }}>
          {error.stack}
        </pre>
      </details>

      <div style={{
        background: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>Problemas comunes en Vercel:</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>
            <strong>Variables de entorno faltantes:</strong> Verifica en Vercel que estén configuradas:
            <ul>
              <li>PAYLOAD_SECRET</li>
              <li>DATABASE_URI (MongoDB Atlas)</li>
              <li>BLOB_READ_WRITE_TOKEN (Vercel Blob Storage)</li>
            </ul>
          </li>
          <li>
            <strong>Conexión a base de datos:</strong> Asegúrate de que MongoDB Atlas permite conexiones
            desde cualquier IP (0.0.0.0/0) o específicamente desde Vercel
          </li>
          <li>
            <strong>Build del proyecto:</strong> Verifica que <code>pnpm run build</code> funcione localmente
          </li>
          <li>
            <strong>Import map:</strong> Asegúrate de que se generó correctamente con <code>payload generate:importmap</code>
          </li>
        </ol>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Intentar de nuevo
        </button>

        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            background: '#757575',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Ir al inicio
        </button>
      </div>
    </div>
  )
}
