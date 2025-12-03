import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Proyecto',
    plural: 'Proyectos',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'featured', 'updatedAt'],
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
      name: 'category',
      type: 'relationship',
      label: 'Categoría',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      label: 'Etiquetas',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
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
          label: 'Servicios Ofrecidos',
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
    // Case Study Content
    {
      name: 'caseStudy',
      type: 'group',
      label: 'Caso de Estudio',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Título del Caso de Estudio',
          localized: true,
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Contenido',
          localized: true,
        },
      ],
    },
    // Image Gallery
    {
      name: 'gallery',
      type: 'array',
      label: 'Galería de Imágenes',
      minRows: 1,
      maxRows: 1,
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
    // Learning Section
    {
      name: 'learnings',
      type: 'group',
      label: 'Aprendizajes',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Título de Aprendizajes',
          defaultValue: 'Nuestros Aprendizajes',
          localized: true,
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Contenido de Aprendizajes',
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
          name: 'website',
          type: 'text',
          label: 'Sitio Web',
        },
        {
          name: 'logo',
          type: 'upload',
          label: 'Logo del Cliente',
          relationTo: 'media',
        },
      ],
    },
    // Project Metrics
    {
      name: 'metrics',
      type: 'array',
      label: 'Métricas del Proyecto',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Etiqueta',
          required: true,
          localized: true,
        },
        {
          name: 'value',
          type: 'text',
          label: 'Valor',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Descripción',
          localized: true,
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
