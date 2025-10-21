<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Tutorial Completo: Configuración de Payload CMS 3.0 con Next.js, MongoDB y Vercel Blob Storage

## Guía Exhaustiva para Despliegue Separado con Astro

Este tutorial te guiará paso a paso en la configuración completa de Payload CMS 3.0 como backend independiente, usando Next.js, MongoDB Atlas, Vercel Blob Storage para imágenes, y consumiendo el contenido desde un proyecto Astro separado.[^1][^2][^3]

***

## Tabla de Contenidos

1. Requisitos del Sistema
2. Instalación y Configuración Inicial
3. Configuración de MongoDB Atlas
4. Configuración de Payload CMS
5. Configuración de Colecciones
6. Integración con Vercel Blob Storage
7. Autenticación y Control de Acceso
8. Hooks y Personalización Avanzada
9. Despliegue en Vercel
10. Consumo desde Astro
11. Errores Comunes y Soluciones
12. Mejores Prácticas

***

## 1. Requisitos del Sistema

Versiones necesarias para asegurar compatibilidad :[^3]

- **Node.js**: 20.9.0 o superior
- **Next.js**: 15.0.0 o superior
- **Payload CMS**: 3.0.0 o superior
- **MongoDB**: 6.0 o superior
- **Gestor de paquetes**: pnpm (recomendado), npm o yarn

***

## 2. Instalación y Configuración Inicial

### Opción A: Crear Proyecto Nuevo con CLI

Ejecuta el siguiente comando para crear un nuevo proyecto :[^4][^3]

```bash
npx create-payload-app@latest
```

**Respuestas recomendadas durante la instalación:**

- **Nombre del proyecto**: `mi-cms-blog`
- **Template**: Blank Template
- **Base de datos**: MongoDB
- **Gestor de paquetes**: pnpm


### Opción B: Añadir a Proyecto Next.js Existente

#### Paso 1: Instalar Dependencias Principales

```bash
pnpm add payload @payloadcms/next @payloadcms/richtext-lexical sharp graphql
```

**Nota**: Si usas npm, puede ser necesario el flag `--legacy-peer-deps` :[^5][^3]

```bash
npm install --legacy-peer-deps payload @payloadcms/next @payloadcms/richtext-lexical sharp graphql
```


#### Paso 2: Instalar Adaptador de MongoDB

```bash
pnpm add @payloadcms/db-mongodb
```


#### Paso 3: Instalar Vercel Blob Storage

```bash
pnpm add @payloadcms/storage-vercel-blob
```


### Dependencias Completas en package.json

Tu archivo `package.json` debe incluir estas versiones :[^6][^5]

```json
{
  "name": "mi-cms-blog",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "cross-env NODE_OPTIONS=\"--no-deprecation\" next dev",
    "build": "cross-env NODE_OPTIONS=--no-deprecation next build",
    "start": "cross-env NODE_OPTIONS=--no-deprecation next start",
    "lint": "next lint",
    "payload": "payload",
    "generate:types": "payload generate:types",
    "generate:importmap": "payload generate:importmap"
  },
  "dependencies": {
    "payload": "^3.0.0",
    "@payloadcms/next": "^3.0.0",
    "@payloadcms/richtext-lexical": "^3.0.0",
    "@payloadcms/db-mongodb": "^3.0.0",
    "@payloadcms/storage-vercel-blob": "^3.0.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "sharp": "^0.33.0",
    "graphql": "^16.8.1",
    "cross-env": "^7.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.3.0"
  }
}
```


***

## 3. Configuración de MongoDB Atlas

### Paso 1: Crear Cuenta y Cluster

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) y crea una cuenta gratuita
2. Crea un nuevo cluster (M0 gratuito es suficiente para desarrollo)
3. Selecciona la región más cercana a tu ubicación

### Paso 2: Configurar Usuario de Base de Datos

1. Ve a **Database Access** en el menú lateral
2. Clic en **Add New Database User**
3. Configuración recomendada :[^7][^8]
    - **Authentication Method**: Password
    - **Username**: `payload-admin`
    - **Password**: Genera una contraseña segura (guárdala)
    - **Database User Privileges**: Read and write to any database
    - **Built-in Role**: `readWriteAnyDatabase`

### Paso 3: Configurar Network Access

1. Ve a **Network Access**
2. Clic en **Add IP Address**
3. Para desarrollo: Selecciona **Allow Access from Anywhere** (`0.0.0.0/0`)
4. Para producción en Vercel: No es necesario configurar IPs específicas

**⚠️ IMPORTANTE**: En producción, considera limitar el acceso a rangos IP específicos.[^7]

### Paso 4: Obtener Connection String

1. Ve a **Database** > **Connect**
2. Selecciona **Drivers**
3. Copia el connection string que se verá así:
```
mongodb+srv://payload-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```


### Paso 5: Formatear Connection String

Modifica el connection string para especificar el nombre de la base de datos :[^8]

```
mongodb+srv://payload-admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/blog-cms?retryWrites=true&w=majority
```

**Componentes del connection string**:

- `payload-admin`: Tu usuario
- `TU_PASSWORD`: Tu contraseña (reemplaza `<password>`)
- `blog-cms`: Nombre de tu base de datos (reemplaza `test`)
- `retryWrites=true&w=majority`: Opciones de conexión

**Nota**: Si no especificas el nombre de la base de datos (después del `/`), Payload creará una base de datos llamada `test` por defecto.[^8]

***

## 4. Configuración de Payload CMS

### Estructura de Directorios

Crea la siguiente estructura en tu proyecto :[^9][^3]

```
mi-cms-blog/
├── src/
│   ├── app/
│   │   ├── (payload)/
│   │   │   ├── admin/
│   │   │   │   └── [[...segments]]/
│   │   │   │       └── page.tsx
│   │   │   ├── api/
│   │   │   │   └── [...slug]/
│   │   │   │       └── route.ts
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── collections/
│   │   ├── Media.ts
│   │   ├── Posts.ts
│   │   ├── Categories.ts
│   │   └── Users.ts
│   ├── fields/
│   │   └── slug.ts
│   ├── payload.config.ts
│   └── payload-types.ts (auto-generado)
├── .env
├── .env.local
├── next.config.mjs
├── package.json
└── tsconfig.json
```


### Archivo: `src/app/(payload)/admin/[[...segments]]/page.tsx`

Este archivo maneja el panel de administración :[^3]

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../../../importMap'

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

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, importMap, params, searchParams })

export default Page
```


### Archivo: `src/app/(payload)/api/[...slug]/route.ts`

Este archivo expone la REST API :[^2][^3]

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const OPTIONS = REST_OPTIONS(config)
```


### Archivo: `src/app/(payload)/layout.tsx`

Layout para el panel de administración :[^3]

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import '@payloadcms/next/css'
import configPromise from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from '../../importMap'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) => (
  <RootLayout config={configPromise} importMap={importMap}>
    {children}
  </RootLayout>
)

export default Layout
```


### Archivo: `.env.local`

Configura tus variables de entorno :[^10]

```env
# MongoDB
DATABASE_URI=mongodb+srv://payload-admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/blog-cms?retryWrites=true&w=majority

# Payload
PAYLOAD_SECRET=tu-secreto-super-seguro-aqui-minimo-32-caracteres
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Vercel Blob (se configurará más adelante)
BLOB_READ_WRITE_TOKEN=
```

**Generar PAYLOAD_SECRET seguro**:

```bash
openssl rand -base64 32
```


### Archivo: `payload.config.ts`

Configuración principal de Payload :[^11][^1][^3]

```typescript
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Importar colecciones
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Nombre de tu aplicación
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Mi Blog CMS',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },

  // Colecciones
  collections: [Users, Media, Posts, Categories],

  // Editor de texto enriquecido
  editor: lexicalEditor(),

  // Secreto para JWT
  secret: process.env.PAYLOAD_SECRET || '',

  // TypeScript
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // Base de datos MongoDB
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    // Opciones de conexión recomendadas
    connectOptions: {
      maxPoolSize: 10, // Límite de conexiones simultáneas
      minPoolSize: 2,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 5000,
    },
  }),

  // Plugin de Vercel Blob Storage
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      clientUploads: true, // Importante para archivos grandes
      addRandomSuffix: true, // Evita colisiones de nombres
    }),
  ],

  // Sharp para procesamiento de imágenes
  sharp,

  // Configuración de rutas
  routes: {
    admin: '/admin',
    api: '/api',
  },

  // CORS para tu frontend Astro
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:4321', // Puerto de Astro en desarrollo
    process.env.ASTRO_URL || '', // URL de producción de Astro
  ].filter(Boolean),

  // CSRF protection
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:4321',
    process.env.ASTRO_URL || '',
  ].filter(Boolean),
})
```


### Archivo: `next.config.mjs`

Configuración de Next.js :[^12]

```javascript
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración esencial para Payload
  experimental: {
    reactCompiler: false,
  },
  
  // Dominios de imágenes permitidos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
}

export default withPayload(nextConfig)
```


***

## 5. Configuración de Colecciones

### Colección: Users

Archivo: `src/collections/Users.ts` :[^13][^14]

```typescript
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Habilita autenticación
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'roles'],
  },
  access: {
    // Solo admins pueden ver todos los usuarios
    read: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) {
        return true
      }
      // Los usuarios pueden ver solo su propio perfil
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    // Solo admins pueden crear usuarios
    create: ({ req: { user } }) => user?.roles?.includes('admin'),
    // Los usuarios pueden actualizar solo su propio perfil
    update: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) {
        return true
      }
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    // Solo admins pueden eliminar usuarios
    delete: ({ req: { user } }) => user?.roles?.includes('admin'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['editor'],
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Author',
          value: 'author',
        },
      ],
      required: true,
      access: {
        // Solo admins pueden cambiar roles
        create: ({ req: { user } }) => user?.roles?.includes('admin'),
        update: ({ req: { user } }) => user?.roles?.includes('admin'),
      },
    },
  ],
}
```


### Colección: Media

Archivo: `src/collections/Media.ts` :[^15][^16]

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    // Configuración de imágenes
    staticDir: 'media', // Solo para desarrollo local
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined, // Mantiene aspect ratio
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true, // Público
    create: ({ req: { user } }) => !!user, // Solo usuarios autenticados
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.roles?.includes('admin'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: false,
    },
    {
      name: 'caption',
      type: 'text',
      localized: false,
    },
  ],
}
```


### Helper: Campo Slug

Archivo: `src/fields/slug.ts` :[^17][^18]

```typescript
import type { Field, FieldHook } from 'payload'

const format = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-/]+/g, '')
    .toLowerCase()

const formatSlug =
  (fallback: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    // Si hay valor manual, usarlo
    if (typeof value === 'string' && value.trim()) {
      return format(value)
    }

    // En creación, generar desde el campo fallback
    if (operation === 'create') {
      const fallbackData = (data && data[fallback]) || (originalDoc && originalDoc[fallback])
      if (typeof fallbackData === 'string') {
        return format(fallbackData)
      }
    }

    // En actualización, mantener el slug existente
    if (operation === 'update' && originalDoc?.slug) {
      return originalDoc.slug
    }

    return value
  }

export const slugField = (fieldToUse = 'title', overrides = {}): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Se genera automáticamente desde el título',
  },
  hooks: {
    beforeValidate: [formatSlug(fieldToUse)],
  },
  ...overrides,
})
```


### Colección: Categories

Archivo: `src/collections/Categories.ts`:

```typescript
import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true, // Público
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.roles?.includes('admin'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField('name'),
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
```


### Colección: Posts

Archivo: `src/collections/Posts.ts` :[^19][^20][^9]

```typescript
import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { slugField } from '../fields/slug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'category', 'status', 'publishedAt'],
    preview: (doc) => {
      return `${process.env.ASTRO_URL}/blog/${doc.slug}`
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375, // Auto-guardar cada 375ms
      },
    },
    maxPerDoc: 50,
  },
  access: {
    read: ({ req: { user } }) => {
      // Público: solo posts publicados
      if (!user) {
        return {
          status: {
            equals: 'published',
          },
        }
      }
      // Autenticado: ver todos
      return true
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => user?.roles?.includes('admin'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField('title'),
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          // Puedes agregar features personalizados aquí
        ],
      }),
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description: 'Resumen corto del post (máx. 200 caracteres)',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      hasMany: false,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ user }) => user?.id,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Borrador',
          value: 'draft',
        },
        {
          label: 'Publicado',
          value: 'published',
        },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            // Auto-establecer fecha de publicación cuando el status cambia a "published"
            if (siblingData.status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Tiempo de lectura estimado en minutos',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            // Calcular tiempo de lectura (promedio 200 palabras por minuto)
            if (siblingData.content) {
              const text = JSON.stringify(siblingData.content)
              const wordCount = text.split(/\s+/).length
              return Math.ceil(wordCount / 200)
            }
            return 1
          },
        ],
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Ejemplo: notificar cuando se publica un post
        if (operation === 'update' && doc.status === 'published') {
          // Aquí podrías enviar un webhook a tu frontend Astro
          // o invalidar el cache, etc.
          console.log(`Post publicado: ${doc.title}`)
        }
      },
    ],
  },
}
```


***

## 6. Integración con Vercel Blob Storage

### Configurar Vercel Blob en el Dashboard

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Ve a **Storage** > **Create Database**
3. Selecciona **Blob Storage** > **Continue**
4. Copia el token `BLOB_READ_WRITE_TOKEN` que se genera automáticamente
5. Añádelo a tus variables de entorno en Vercel y en tu `.env.local`[^21][^22]

### Verificación de Configuración

El plugin ya está configurado en `payload.config.ts`. Verifica que esté activo :[^23][^21]

```typescript
plugins: [
  vercelBlobStorage({
    enabled: true,
    collections: {
      media: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
    clientUploads: true, // Permite subidas mayores a 4.5MB
    addRandomSuffix: true, // Evita colisiones
    cacheControlMaxAge: 365 * 24 * 60 * 60, // Cache 1 año
  }),
],
```

**Nota**: El plugin automáticamente gestiona las subidas y sirve las URLs desde Vercel Blob.[^21][^23]

***

## 7. Autenticación y Control de Acceso

### Control de Acceso por Roles

Payload utiliza funciones de acceso granular. Ejemplo avanzado:[^14][^24]

```typescript
// En cualquier colección
access: {
  read: ({ req: { user } }) => {
    // Admins ven todo
    if (user?.roles?.includes('admin')) {
      return true
    }
    
    // Editores ven todo excepto borradores de otros
    if (user?.roles?.includes('editor')) {
      return {
        or: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            author: {
              equals: user.id,
            },
          },
        ],
      }
    }
    
    // Público: solo publicados
    return {
      status: {
        equals: 'published',
      },
    }
  },
  create: ({ req: { user } }) => {
    // Solo usuarios autenticados
    return !!user
  },
  update: ({ req: { user }, id }) => {
    // Admins pueden actualizar todo
    if (user?.roles?.includes('admin')) {
      return true
    }
    
    // Otros solo sus propios documentos
    return {
      author: {
        equals: user?.id,
      },
    }
  },
  delete: ({ req: { user } }) => {
    // Solo admins pueden eliminar
    return user?.roles?.includes('admin')
  },
},
```


***

## 8. Hooks y Personalización Avanzada

### Hooks de Colección

Ejemplo completo de hooks :[^25][^19]

```typescript
hooks: {
  beforeChange: [
    async ({ data, req, operation }) => {
      // Ejecutado antes de guardar
      // Útil para validación o modificación de datos
      
      if (operation === 'create') {
        // Establecer autor automáticamente
        data.author = req.user.id
      }
      
      return data
    },
  ],
  afterChange: [
    async ({ doc, req, operation, previousDoc }) => {
      // Ejecutado después de guardar
      // Útil para notificaciones o sincronización
      
      if (doc.status === 'published' && previousDoc.status !== 'published') {
        // Post recién publicado
        // Aquí podrías:
        // - Enviar webhook a Astro para revalidación
        // - Enviar notificación por email
        // - Actualizar índice de búsqueda
        
        console.log(`Nuevo post publicado: ${doc.title}`)
      }
    },
  ],
  beforeRead: [
    async ({ doc, req }) => {
      // Ejecutado antes de leer
      // Útil para filtrar datos sensibles
      return doc
    },
  ],
  afterRead: [
    async ({ doc, req }) => {
      // Ejecutado después de leer
      // Útil para transformar datos
      return doc
    },
  ],
  beforeDelete: [
    async ({ req, id }) => {
      // Ejecutado antes de eliminar
      // Útil para validaciones
    },
  ],
  afterDelete: [
    async ({ req, id, doc }) => {
      // Ejecutado después de eliminar
      // Útil para limpieza de archivos relacionados
    },
  ],
},
```


***

## 9. Despliegue en Vercel

### Variables de Entorno en Vercel

Configura estas variables en tu proyecto de Vercel :[^26][^12][^10]

```
DATABASE_URI=mongodb+srv://payload-admin:PASSWORD@cluster0.xxxxx.mongodb.net/blog-cms?retryWrites=true&w=majority
PAYLOAD_SECRET=tu-secreto-de-produccion
NEXT_PUBLIC_SERVER_URL=https://tu-cms.vercel.app
ASTRO_URL=https://tu-sitio-astro.vercel.app
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
```


### Comandos de Despliegue

```bash
# Construir tipos
pnpm generate:types

# Build de producción
pnpm build

# Desplegar a Vercel
vercel --prod
```


### Crear Usuario Admin Inicial

Una vez desplegado, crea el primer usuario visitando:

```
https://tu-cms.vercel.app/admin
```

Completa el formulario de registro. El primer usuario siempre obtiene rol de admin automáticamente.[^13]

***

## 10. Consumo desde Astro

### Configuración en Astro

Archivo: `.env` en tu proyecto Astro:

```env
PUBLIC_CMS_URL=https://tu-cms.vercel.app
```


### Servicio de API

Archivo: `src/services/payloadAPI.ts` :[^27][^2]

```typescript
const CMS_URL = import.meta.env.PUBLIC_CMS_URL

interface PayloadResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export interface Post {
  id: string
  title: string
  slug: string
  content: any
  excerpt: string
  featuredImage: {
    id: string
    alt: string
    url: string
    width: number
    height: number
    sizes: {
      thumbnail?: {
        url: string
        width: number
        height: number
      }
      card?: {
        url: string
        width: number
        height: number
      }
      tablet?: {
        url: string
        width: number
        height: number
      }
    }
  }
  category: {
    id: string
    name: string
    slug: string
  }
  author: {
    id: string
    name: string
    email: string
  }
  status: 'draft' | 'published'
  publishedAt: string
  tags: string[]
  readingTime: number
  createdAt: string
  updatedAt: string
}

export async function fetchPosts(params?: {
  limit?: number
  page?: number
  where?: any
}): Promise<PayloadResponse<Post>> {
  const { limit = 10, page = 1, where } = params || {}

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
    depth: '2', // Populate relationships
  })

  if (where) {
    queryParams.append('where', JSON.stringify(where))
  }

  const response = await fetch(`${CMS_URL}/api/posts?${queryParams}`)

  if (!response.ok) {
    throw new Error(`Error fetching posts: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const response = await fetch(
    `${CMS_URL}/api/posts?where[slug][equals]=${slug}&depth=2&limit=1`
  )

  if (!response.ok) {
    throw new Error(`Error fetching post: ${response.statusText}`)
  }

  const data: PayloadResponse<Post> = await response.json()
  return data.docs[^0] || null
}

export async function fetchCategories() {
  const response = await fetch(`${CMS_URL}/api/categories?limit=100`)

  if (!response.ok) {
    throw new Error(`Error fetching categories: ${response.statusText}`)
  }

  return response.json()
}
```


### Página de Blog en Astro

Archivo: `src/pages/blog/index.astro` :[^28]

```astro
---
import { fetchPosts } from '../../services/payloadAPI'
import Layout from '../../layouts/Layout.astro'

const { docs: posts, totalPages, page } = await fetchPosts({
  limit: 12,
  page: 1,
  where: {
    status: {
      equals: 'published',
    },
  },
})
---

<Layout title="Blog">
  <main class="container">
    <h1>Blog</h1>
    
    <div class="posts-grid">
      {posts.map((post) => (
        <article class="post-card">
          <a href={`/blog/${post.slug}`}>
            {post.featuredImage && (
              <img
                src={post.featuredImage.sizes?.card?.url || post.featuredImage.url}
                alt={post.featuredImage.alt}
                width={post.featuredImage.sizes?.card?.width || 768}
                height={post.featuredImage.sizes?.card?.height || 1024}
                loading="lazy"
              />
            )}
            <div class="post-content">
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              
              <div class="post-meta">
                <span class="category">{post.category.name}</span>
                <span class="reading-time">{post.readingTime} min lectura</span>
                <time datetime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          </a>
        </article>
      ))}
    </div>
  </main>
</Layout>

<style>
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .post-card {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s;
  }

  .post-card:hover {
    transform: translateY(-4px);
  }

  .post-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .post-content {
    padding: 1.5rem;
  }

  .post-meta {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #666;
  }
</style>
```


### Página Individual de Post

Archivo: `src/pages/blog/[slug].astro`:

```astro
---
import { fetchPostBySlug, fetchPosts } from '../../services/payloadAPI'
import Layout from '../../layouts/Layout.astro'

export async function getStaticPaths() {
  const { docs: posts } = await fetchPosts({
    limit: 1000,
    where: {
      status: {
        equals: 'published',
      },
    },
  })

  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }))
}

const { post } = Astro.props

// Convertir contenido Lexical a HTML (simplificado)
function lexicalToHTML(content: any): string {
  // Implementación básica - considera usar un parser completo
  // o renderizar con React/Vue si necesitas fidelidad completa
  return JSON.stringify(content)
}
---

<Layout title={post.title}>
  <article class="post">
    {post.featuredImage && (
      <img
        src={post.featuredImage.sizes?.tablet?.url || post.featuredImage.url}
        alt={post.featuredImage.alt}
        class="featured-image"
      />
    )}

    <header>
      <h1>{post.title}</h1>
      
      <div class="meta">
        <span class="category">{post.category.name}</span>
        <span class="author">Por {post.author.name}</span>
        <time datetime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <span class="reading-time">{post.readingTime} min de lectura</span>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div class="tags">
          {post.tags.map((tag) => (
            <span class="tag">{tag}</span>
          ))}
        </div>
      )}
    </header>

    <div class="content" set:html={lexicalToHTML(post.content)} />
  </article>
</Layout>

<style>
  .post {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .featured-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  header {
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    color: #666;
    font-size: 0.875rem;
  }

  .tags {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .tag {
    background: #f0f0f0;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .content {
    line-height: 1.8;
    font-size: 1.125rem;
  }
</style>
```


***

## 11. Errores Comunes y Soluciones

### Error 1: "Cannot connect to MongoDB"

**Síntomas**: No puedes conectarte a la base de datos.[^29][^30]

**Causas comunes**:

1. Connection string mal formateado
2. Contraseña con caracteres especiales sin escapar
3. IP no whitelisteada en MongoDB Atlas
4. Nombre de base de datos incorrecto

**Solución** :[^31][^8]

```env
# ✅ Correcto
DATABASE_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/nombre-db?retryWrites=true&w=majority

# ❌ Incorrecto (falta nombre de DB)
DATABASE_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Si tu contraseña tiene caracteres especiales (`@`, `$`, `%`, etc.), usa `encodeURIComponent()` en JavaScript o escápala manualmente.

### Error 2: "Connection Limit Exceeded" en Vercel

**Síntomas**: Alertas de MongoDB Atlas sobre límites de conexión.[^32]

**Causa**: Funciones serverless de Vercel crean múltiples conexiones.

**Solución** :[^32]

En `payload.config.ts`:

```typescript
db: mongooseAdapter({
  url: process.env.DATABASE_URI || '',
  connectOptions: {
    maxPoolSize: 10, // Límite bajo para serverless
    minPoolSize: 2,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 5000,
  },
}),
```

Considera actualizar a un cluster M2+ en producción para más conexiones.[^32]

### Error 3: "404 on /admin" después de desplegar

**Síntomas**: El panel de administración no carga en producción.[^33]

**Causa**: Rutas de Next.js no configuradas correctamente.

**Solución** :[^33]

1. Verifica que `next.config.mjs` use `withPayload`:
```javascript
import { withPayload } from '@payloadcms/next/withPayload'

export default withPayload(nextConfig)
```

2. Asegúrate de que los archivos en `src/app/(payload)/` estén correctos
3. Regenera el build: `pnpm build`

### Error 4: Imágenes no suben o superan 4.5MB

**Síntomas**: Error al subir archivos grandes.[^34][^35]

**Causa**: Límite de funciones serverless de Vercel.

**Solución** :[^35][^21]

En `payload.config.ts`:

```typescript
plugins: [
  vercelBlobStorage({
    enabled: true,
    collections: {
      media: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
    clientUploads: true, // ✅ IMPORTANTE: Habilita client uploads
  }),
],
```

`clientUploads: true` hace que las subidas vayan directamente de cliente a Blob, bypaseando el límite serverless.

### Error 5: "Sanitization error" o TypeScript errors

**Síntomas**: Errores de validación TypeScript.[^36][^5]

**Causa**: Dependencias incompatibles entre Next.js 15 y Payload 3.

**Solución** :[^5]

```bash
# Si usas npm
npm install --legacy-peer-deps

# Si usas pnpm (recomendado)
pnpm add payload @payloadcms/next --force
```

Actualiza `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  }
}
```


### Error 6: "Blocked unsafe attempt (SSRF)" en Vercel

**Síntomas**: Error al usar funciones de crop/resize de imágenes.[^37]

**Causa**: Vercel bloquea requests internos por seguridad.

**Solución** :[^37]

Desactiva el crop en producción o usa procesamiento client-side:

```typescript
// En tu colección Media
upload: {
  disableLocalStorage: true, // No guardar localmente en producción
  crop: false, // Deshabilitar crop si causa problemas
}
```


### Error 7: Slug no se genera automáticamente

**Síntomas**: Campo slug permanece vacío.[^38][^18][^17]

**Causa**: Payload 3.0 no genera slugs por defecto.

**Solución**: Usa el helper `slugField` mostrado en la sección 5 :[^18]

```typescript
import { slugField } from '../fields/slug'

fields: [
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  slugField('title'), // Genera slug desde title
]
```


***

## 12. Mejores Prácticas

### Seguridad

1. **Nunca expongas `PAYLOAD_SECRET` en el cliente**[^10]
2. **Usa roles para control de acceso** granular[^24][^14]
3. **Habilita CORS solo para dominios específicos**[^11]
4. **Usa HTTPS en producción** siempre
5. **Limita IPs en MongoDB Atlas** en producción[^7]

### Performance

1. **Usa `depth` en queries** para evitar over-fetching[^39][^2]
2. **Implementa cache** en tu frontend Astro[^40]
3. **Optimiza imágenes** con los tamaños correctos[^15]
4. **Limita conexiones MongoDB** en serverless[^32]
5. **Usa ISR o SSG** en Astro cuando sea posible

### Organización

1. **Separa campos reutilizables** en `src/fields/`[^17][^18]
2. **Usa TypeScript** para type-safety[^41]
3. **Documenta tu API** con comentarios
4. **Versionado de contenido** para posts críticos[^9]
5. **Backup regular** de MongoDB[^1]

### Desarrollo

1. **Usa auto-login solo en desarrollo**[^13]
2. **Genera tipos automáticamente**: `pnpm generate:types`[^41]
3. **Hooks para lógica de negocio** compleja[^19][^25]
4. **Testing de access control** antes de producción[^42]

***

## Recursos Adicionales

### Documentación Oficial

- **Payload CMS**: https://payloadcms.com/docs[^3]
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas[^31]
- **Vercel Blob**: https://vercel.com/docs/storage/vercel-blob[^22]
- **Astro**: https://docs.astro.build[^28]


### Comunidad y Soporte

- **Discord de Payload**: https://discord.gg/payload[^8]
- **GitHub Discussions**: https://github.com/payloadcms/payload/discussions[^17]
- **Reddit**: r/PayloadCMS[^43]


### Plantillas y Ejemplos

- **Website Template**: https://github.com/payloadcms/payload/tree/main/templates/website[^44]
- **E-commerce Template**: https://github.com/payloadcms/payload/tree/main/templates/ecommerce[^45]
- **Access Control Demo**: https://github.com/payloadcms/access-control-demo[^42]

***

## Conclusión

Este tutorial te ha guiado a través de la configuración completa de Payload CMS 3.0 con MongoDB, desde la instalación inicial hasta el consumo desde Astro. Has aprendido a configurar colecciones, manejar autenticación, integrar Vercel Blob Storage, y resolver errores comunes.[^2][^27][^1][^3]

Con esta base sólida, puedes construir aplicaciones complejas y escalables, aprovechando la flexibilidad de Payload como CMS headless y la velocidad de Astro como framework frontend.[^40][^28]
<span style="display:none">[^46][^47][^48][^49][^50][^51][^52][^53][^54][^55][^56][^57][^58][^59][^60][^61][^62][^63][^64][^65][^66][^67][^68][^69][^70][^71][^72][^73][^74][^75][^76][^77][^78][^79][^80][^81][^82][^83][^84][^85][^86]</span>

<div align="center">⁂</div>

[^1]: https://payloadcms.com/docs/database/mongodb

[^2]: https://payloadcms.com/docs/rest-api/overview

[^3]: https://payloadcms.com/docs/getting-started/installation

[^4]: https://payloadcms.com/posts/blog/30-beta-install-payload-into-any-nextjs-app-with-one-line

[^5]: https://dev.to/ashujojo/resolving-dependency-error-in-a-nextjs-15-and-payload-cms-3-project-1dgo

[^6]: https://www.reddit.com/r/PayloadCMS/comments/1gk8xnb/newbie_question_about_deploying_the_30/

[^7]: https://www.youtube.com/watch?v=n2f-ZfVfhCI

[^8]: https://payloadcms.com/community-help/discord/default-database-test-can-i-change-the-name-for-production

[^9]: https://payloadcms.com/posts/guides/how-to-set-up-and-customize-collections

[^10]: https://payloadcms.com/docs/configuration/environment-vars

[^11]: https://payloadcms.com/docs/configuration/overview

[^12]: https://payloadcms.com/docs/production/deployment

[^13]: https://payloadcms.com/docs/authentication/overview

[^14]: https://payloadcms.com/docs/access-control/overview

[^15]: https://payloadcms.com/docs/upload/overview

[^16]: https://payloadcms.com/docs/fields/upload

[^17]: https://github.com/payloadcms/payload/discussions/584

[^18]: https://www.buildwithmatija.com/blog/payload-cms-slugs-and-skus

[^19]: https://payloadcms.com/docs/hooks/collections

[^20]: https://payloadcms.com/docs/rich-text/overview

[^21]: https://www.npmjs.com/package/@payloadcms/storage-vercel-blob

[^22]: https://vercel.com/docs/vercel-blob

[^23]: https://payloadcms.com/docs/upload/storage-adapters

[^24]: https://dev.to/aaronksaunders/access-control-in-payload-cms-cheat-sheet-4fn

[^25]: https://www.buildwithmatija.com/blog/payload-cms-hooks-safe-data-manipulation-postgresql

[^26]: https://vercel.com/docs/environment-variables

[^27]: https://payloadcms.com/docs/getting-started/concepts

[^28]: https://docs.astro.build/ar/guides/cms/payload/

[^29]: https://stackoverflow.com/questions/69241722/payload-cms-wont-connect-to-mongo-db

[^30]: https://payloadcms.com/community-help/discord/cannot-connect-to-mongodb-error-when-attempting-local-development

[^31]: https://www.mongodb.com/docs/manual/reference/connection-string/

[^32]: https://stackoverflow.com/questions/79453444/payload-cms-on-next-js-15-serverless-vercel-exceeding-mongodb-atlas-m2-connec

[^33]: https://github.com/payloadcms/payload/discussions/5080

[^34]: https://github.com/payloadcms/payload/discussions/7569

[^35]: https://www.reddit.com/r/PayloadCMS/comments/1iihket/workaround_file_size_limit_vercel/

[^36]: https://payloadcms.com/community-help/discord/sanitization-error-sanitizets

[^37]: https://community.vercel.com/t/blocked-unsafe-attempt-ssrf-error-with-payload-cms-crop-on-vercel/17629

[^38]: https://github.com/payloadcms/payload/issues/7645

[^39]: https://payloadcms.com/docs/queries/overview

[^40]: https://makersden.io/blog/is-payloadcms-with-astros-the-killer-marketing-site-combo-of-2025

[^41]: https://payloadcms.com/docs/typescript/generating-types

[^42]: https://github.com/payloadcms/access-control-demo

[^43]: https://www.reddit.com/r/PayloadCMS/comments/1fqccmn/getting_started_with_payload_v3/

[^44]: https://payloadcms.com/posts/guides/learn-advanced-nextjs-with-payloads-website-template

[^45]: https://www.buildwithmatija.com/blog/how-to-build-ecommerce-with-payload-cms

[^46]: https://www.semanticscholar.org/paper/39f87a20877a44dd658f78987f515cbd1d969395

[^47]: http://arxiv.org/pdf/2401.16274.pdf

[^48]: http://arxiv.org/pdf/2209.15390.pdf

[^49]: https://arxiv.org/pdf/2110.01284.pdf

[^50]: https://www.mdpi.com/2674-113X/3/2/10/pdf?version=1714650477

[^51]: https://www.epj-conferences.org/articles/epjconf/pdf/2024/05/epjconf_chep2024_01051.pdf

[^52]: https://arxiv.org/pdf/2004.08425.pdf

[^53]: http://arxiv.org/pdf/2409.16544.pdf

[^54]: https://arxiv.org/pdf/2111.14946.pdf

[^55]: https://www.mongodb.com/community/forums/t/how-to-connect-mongodb-to-payload-cms/263120

[^56]: https://github.com/payloadcms/payload/issues/11547

[^57]: https://www.youtube.com/watch?v=7IriwzSQA2Y

[^58]: https://payloadcms.com/docs/local-api/overview

[^59]: https://github.com/payloadcms/public-demo

[^60]: https://payloadcms.com/community-help/discord/fetching-from-a-custom-endpoint

[^61]: https://www.linkedin.com/pulse/creating-modern-headless-cms-app-payload-mongodb-nextjs-a-v-csm--nocxc

[^62]: https://payloadcms.com/community-help/discord/vercel-deployment-updates

[^63]: https://computingonline.net/computing/article/view/704

[^64]: https://arxiv.org/html/2409.09923v1

[^65]: http://arxiv.org/pdf/2401.07053.pdf

[^66]: https://arxiv.org/ftp/arxiv/papers/1209/1209.3878.pdf

[^67]: http://arxiv.org/pdf/2309.01805.pdf

[^68]: http://arxiv.org/pdf/1808.01729.pdf

[^69]: https://arxiv.org/pdf/2308.08347.pdf

[^70]: https://arxiv.org/pdf/2502.09222.pdf

[^71]: https://payloadcms.com/docs/hooks/fields

[^72]: https://payloadcms.com/docs/hooks/context

[^73]: https://github.com/payloadcms/payload/discussions/4616

[^74]: https://payloadcms.com/docs/hooks/overview

[^75]: https://www.youtube.com/watch?v=OO-ERLFboYk

[^76]: https://www.youtube.com/watch?v=j0xr7aJJUbk

[^77]: https://oleksii-s.dev/blog/how-to-add-dynamic-data-in-rich-text-using-inline-blocks-in-payload-cms

[^78]: https://payloadcms.com/community-help/discord/unique-slug-generation

[^79]: https://www.buildwithmatija.com/blog/payload-cms-collection-structure-best-practices

[^80]: https://payloadcms.com/docs/rich-text/converters

[^81]: https://payloadcms.com/community-help/github/auto-populate-fields

[^82]: https://payloadcms.com/community-help/discord/add-modify-a-field-in-afterchange-collection-hook

[^83]: https://github.com/payloadcms/payload/discussions/11337

[^84]: https://payloadcms.com/community-help/discord/is-it-possible-to-populate-field-with-the-title-of-a-relation

[^85]: https://github.com/payloadcms/payload/issues/4383

[^86]: https://oleksii-s.dev/blog/how-to-build-inline-rich-text-field-in-payload-cms

