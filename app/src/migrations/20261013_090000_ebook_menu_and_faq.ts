import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Content update for the "simplify" release (no table changes):
 * 1. adds "E-book" (/ebook) to the main menu, after Testimonials
 * 2. updates the FAQ "How do I access my membership?" (diet plan now comes on WhatsApp)
 *
 * Run it AFTER the new code is live, so the menu never links to a page that doesn't exist yet.
 * The page cache is not refreshed from the command line: save anything in /admin afterwards
 * (or wait an hour) to see the change on the live site.
 */
const FAQ_QUESTION = 'How do I access my membership?'
const FAQ_ANSWER =
  'After joining a program you can log in to your member area. There you fill in your first day form, ' +
  'send follow-up forms and watch the recorded workout sessions. Your personalized diet plan is sent to you on WhatsApp.'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const context = { skipRevalidate: true }

  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
  const nav = (settings.nav ?? []).map(({ label, href }) => ({ label, href }))
  if (!nav.some((item) => item.href === '/ebook')) {
    const afterTestimonials = nav.findIndex((item) => item.href === '/testimonials') + 1
    const at = afterTestimonials > 0 ? afterTestimonials : nav.length
    nav.splice(at, 0, { label: 'E-book', href: '/ebook' })
    await payload.updateGlobal({ slug: 'site-settings', data: { nav }, req, context })
  }

  await payload.update({
    collection: 'faqs',
    where: { question: { equals: FAQ_QUESTION } },
    data: { answer: FAQ_ANSWER },
    req,
    context,
  })
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
  const nav = (settings.nav ?? []).filter((item) => item.href !== '/ebook').map(({ label, href }) => ({ label, href }))
  await payload.updateGlobal({ slug: 'site-settings', data: { nav }, req, context: { skipRevalidate: true } })
}
