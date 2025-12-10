import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Proyecto',
    plural: 'Proyectos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'projectFilters', 'status', 'featured', 'updatedAt'],
    group: 'Contenido',
  },
  access: {
    read: () => true, // Público para el sitio web
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título del Proyecto',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL Slug',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Borrador',
          value: 'draft',
        },
        {
          label: 'Publicado',
          value: 'published',
        },
        {
          label: 'Archivado',
          value: 'archived',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: '¿Proyecto Destacado?',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      label: 'Fecha de Publicación',
      required: true,
      defaultValue: () => new Date(),
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'projectFilters',
      type: 'select',
      label: 'Filtros de Categoría',
      hasMany: true,
      options: [
        {
          label: 'Diseño UX/UI',
          value: 'diseno-ux-ui',
        },
        {
          label: 'Desarrollo web y de aplicaciones móviles',
          value: 'desarrollo-web-movil',
        },
        {
          label: 'Desarrollo de branding',
          value: 'desarrollo-branding',
        },
        {
          label: 'Marketing digital y redes sociales',
          value: 'marketing-digital',
        },
        {
          label: 'Pruebas de usabilidad',
          value: 'pruebas-usabilidad',
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'Selecciona una o más categorías para filtrar este proyecto. Estas son diferentes a los servicios ofrecidos.',
      },
    },
    {
      name: 'website',
      type: 'text',
      label: 'Sitio Web del Proyecto',
      admin: {
        placeholder: 'https://ejemplo.com',
      },
    },
    {
      name: 'keywords',
      type: 'array',
      label: 'Keywords/Palabras Clave',
      fields: [
        {
          name: 'keyword',
          type: 'text',
          label: 'Palabra Clave',
          required: true,
          localized: true,
        },
      ],
    },
    // Hero Section
    {
      name: 'hero',
      type: 'group',
      label: 'Sección Hero',
      fields: [
        {
          name: 'description',
          type: 'richText',
          label: 'Descripción Breve',
          required: true,
          localized: true,
        },
        {
          name: 'bannerImage',
          type: 'upload',
          label: 'Imagen Principal',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'services',
          type: 'array',
          label: 'Servicios Ofrecidos (Chips Verdes)',
          minRows: 1,
          maxRows: 6,
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Nombre del Servicio',
              required: true,
              localized: true,
            },
          ],
        },
      ],
    },
    // Image Gallery
    {
      name: 'gallery',
      type: 'array',
      label: 'Galería de Imágenes',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          label: 'Imagen',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Texto Alternativo',
          required: true,
          localized: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Descripción (opcional)',
          localized: true,
        },
      ],
    },
    // Client Information
    {
      name: 'client',
      type: 'group',
      label: 'Información del Cliente',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Nombre del Cliente',
          required: true,
        },
        {
          name: 'industry',
          type: 'text',
          label: 'Industria',
        },
        {
          name: 'logo',
          type: 'upload',
          label: 'Logo del Cliente',
          relationTo: 'media',
        },
      ],
    },
    // SEO
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Título',
          localized: true,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Descripción',
          localized: true,
        },
        {
          name: 'ogImage',
          type: 'upload',
          label: 'Imagen Open Graph',
          relationTo: 'media',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        // Convert plain text to Lexical format for hero.description
        if (data.hero?.description && typeof data.hero.description === 'string') {
          const paragraphs = data.hero.description.split('\n\n').filter((p: string) => p.trim())
          data.hero.description = {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              children: paragraphs.map((text: string) => ({
                type: 'paragraph',
                format: '',
                indent: 0,
                version: 1,
                children: [{
                  type: 'text',
                  format: 0,
                  text: text.replace(/\n/g, ' '),
                  version: 1,
                  mode: 'normal',
                  style: '',
                  detail: 0,
                }],
                direction: 'ltr',
              })),
              direction: 'ltr',
            },
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Trigger Astro site rebuild after project changes
        if (operation === 'update' || operation === 'create') {
          const deployHookUrl = process.env.ASTRO_DEPLOY_HOOK_URL;
          if (deployHookUrl) {
            try {
              await fetch(deployHookUrl, { method: 'POST' });
              console.log('Astro site rebuild triggered for project:', doc.title);
            } catch (error) {
              console.error('Failed to trigger Astro rebuild:', error);
            }
          }
        }
      },
    ],
  },
}
