/**
 * Frame for our own admin pages (Diet plans to send, Site photos): Payload's normal admin
 * layout (menu + header) around the page content. Visitors who aren't logged in to the
 * admin are sent to the admin login.
 * Styles for all our admin pages: src/app/(payload)/custom.css (classes start with "ftf-").
 */
import { redirect } from "next/navigation";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";

type Props = { view: AdminViewServerProps; title: string; intro?: string; children: React.ReactNode };

export function AdminPage({ view, title, intro, children }: Props) {
  const { req, permissions, visibleEntities, locale } = view.initPageResult;
  if (!req.user) redirect("/admin/login");

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={view.params}
      payload={req.payload}
      permissions={permissions}
      req={req}
      searchParams={view.searchParams}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <Gutter className="ftf-page">
        <header className="ftf-page__head">
          <h1>{title}</h1>
          {intro ? <p className="ftf-muted">{intro}</p> : null}
        </header>
        {children}
      </Gutter>
    </DefaultTemplate>
  );
}
