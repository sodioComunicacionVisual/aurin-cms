import { getPayload } from 'payload'
import config from './src/payload.config'

async function seedSinfonicaProject() {
  try {
    // Initialize Payload
    const payload = await getPayload({ config })

    console.log('✅ Payload initialized')

    // 1. Create or get Category
    let categoryDocs = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: 'web-design',
        },
      },
    })

    let category
    if (categoryDocs.docs.length === 0) {
      category = await payload.create({
        collection: 'categories',
        data: {
          name: 'Diseño Web',
          slug: 'web-design',
          description: 'Proyectos de diseño y desarrollo web',
          color: '#d0df00',
        },
        locale: 'es',
      })

      // Add English translation
      await payload.update({
        collection: 'categories',
        id: category.id,
        data: {
          name: 'Web Design',
        },
        locale: 'en',
      })

      console.log('✅ Category created:', category.id)
    } else {
      category = categoryDocs.docs[0]
      console.log('✅ Category found:', category.id)
    }

    // 2. Create Project (Spanish)
    const projectDataEs: any = {
      title: 'Sinfónica de Minería',
      slug: 'sinfonica-mineria',
      status: 'published',
      featured: true,
      publishDate: new Date().toISOString(),
      category: category.id,
      website: 'https://osm.org.mx',
      keywords: [
        { keyword: 'diseño web' },
        { keyword: 'orquesta' },
        { keyword: 'música clásica' },
        { keyword: 'streaming' },
        { keyword: 'e-commerce' },
      ],
      hero: {
        description:
          'La Orquesta Sinfónica de Minería es una de las instituciones musicales más importantes de México, reconocida no solo por el alto nivel de sus integrantes, sino también por la calidad de sus interpretaciones. Con el paso de las décadas, la Sinfónica ha evolucionado y decidió renovar su identidad visual por una más contemporánea, sin dejar de honrar sus raíces.',
        services: [{ name: 'UX/UI' }, { name: 'Desarrollo front/back con integraciones' }],
      },
      gallery: [
        {
          alt: 'Orquesta Sinfónica de Minería - Vista principal',
          caption: 'Página de inicio del sitio web',
        },
        {
          alt: 'Orquesta Sinfónica de Minería - Catálogo de conciertos',
          caption: 'Sistema de gestión de conciertos',
        },
        {
          alt: 'Orquesta Sinfónica de Minería - Mediateca',
          caption: 'Plataforma de streaming con suscripción',
        },
        {
          alt: 'Orquesta Sinfónica de Minería - Tienda online',
          caption: 'E-commerce integrado',
        },
        {
          alt: 'Orquesta Sinfónica de Minería - Sistema de donaciones',
          caption: 'Módulo de donaciones y patrocinios',
        },
      ],
      learnings: {
        title: 'Cada proyecto, una historia distinta. Descúbrelas.',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Ya viste lo que hacemos. El siguiente proyecto a mostrar en esta galería, es el tuyo.',
                  },
                ],
              },
            ],
          },
        },
      },
      client: {
        name: 'Orquesta Sinfónica de Minería',
        industry: 'Cultura y Música',
        website: 'https://osm.org.mx',
      },
      seo: {
        metaTitle: 'Proyectos Aurin: Orquesta Sinfónica de Minería',
        metaDescription:
          'Realizamos el rediseño web de la Orquesta Sinfónica de Minería: música y tecnología en un mismo lugar.',
      },
    }

    // Check if project already exists
    const existingProject = await payload.find({
      collection: 'projects',
      where: {
        slug: {
          equals: 'sinfonica-mineria',
        },
      },
    })

    let project
    if (existingProject.docs.length > 0) {
      // Update existing project
      project = await payload.update({
        collection: 'projects',
        id: existingProject.docs[0].id,
        data: projectDataEs,
        locale: 'es',
      })
      console.log('✅ Project updated (ES):', project.id)
    } else {
      // Create new project
      project = await payload.create({
        collection: 'projects',
        data: projectDataEs,
        locale: 'es',
      })
      console.log('✅ Project created (ES):', project.id)
    }

    // 3. Add English translation
    const projectDataEn: any = {
      title: 'Minería Symphony Orchestra',
      keywords: [
        { keyword: 'web design' },
        { keyword: 'orchestra' },
        { keyword: 'classical music' },
        { keyword: 'streaming' },
        { keyword: 'e-commerce' },
      ],
      hero: {
        description:
          "The Minería Symphony Orchestra is one of Mexico's most important musical institutions, known not only for the outstanding level of its musicians but also for the excellence of its performances. Over the decades, the orchestra has evolved and decided to renew its visual identity to one that feels more contemporary—without losing sight of its roots.",
        services: [
          { name: 'UX/UI Design' },
          { name: 'Front-end/back-end development with custom integrations' },
        ],
      },
      gallery: [
        {
          alt: 'Minería Symphony Orchestra - Main view',
          caption: 'Website homepage',
        },
        {
          alt: 'Minería Symphony Orchestra - Concert catalog',
          caption: 'Concert management system',
        },
        {
          alt: 'Minería Symphony Orchestra - Media library',
          caption: 'Streaming platform with subscription',
        },
        {
          alt: 'Minería Symphony Orchestra - Online store',
          caption: 'Integrated e-commerce',
        },
        {
          alt: 'Minería Symphony Orchestra - Donation system',
          caption: 'Donations and sponsorship module',
        },
      ],
      learnings: {
        title: 'Every project, a unique story. Explore them all.',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: "You've seen what we do. The next story in this gallery could be yours.",
                  },
                ],
              },
            ],
          },
        },
      },
      seo: {
        metaTitle: 'Aurin Projects: Minería Symphony Orchestra',
        metaDescription:
          'We redesigned the website for the Minería Symphony Orchestra: where music and technology come together.',
      },
    }

    await payload.update({
      collection: 'projects',
      id: project.id,
      data: projectDataEn,
      locale: 'en',
    })

    console.log('✅ Project translated (EN):', project.id)
    console.log('\n🎉 ¡Proyecto Sinfónica de Minería creado exitosamente!\n')
    console.log('📝 Puedes ver el proyecto en:')
    console.log('   - Admin: http://localhost:3000/admin/collections/projects/' + project.id)
    console.log('   - Web (ES): http://localhost:4321/proyecto-payload/sinfonica-mineria')
    console.log('   - Web (EN): http://localhost:4321/en/proyecto-payload/sinfonica-mineria')
    console.log('\n✨ El proyecto incluye:')
    console.log('   - 5 keywords/palabras clave')
    console.log('   - 5 imágenes en la galería (placeholders - agrega URLs desde el admin)')
    console.log('   - Website del proyecto: https://osm.org.mx')
    console.log('\n⚠️  Nota: Sube las imágenes reales desde el admin panel para ver el carousel funcionando.')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedSinfonicaProject()
