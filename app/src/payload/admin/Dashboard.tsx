/**
 * The admin home page (/admin), replacing Payload's default list of collections.
 *
 *   Website:  visits, checkouts started, payments completed (+ conversion), revenue,
 *             a daily visits chart, top pages and the latest orders
 *   Coaching: active members, new members, check-ins to review, messages, latest check-ins
 *
 * The 7d / 30d / 90d buttons just change ?range= in the address. A server component:
 * every number is read from the database when the page opens. Styles: Dashboard.css.
 */
import Link from "next/link";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { flushStats, statsDay } from "../../lib/stats.server";
import "./Dashboard.css";

const RANGES = [7, 30, 90] as const;
const DAY = 24 * 60 * 60 * 1000;

const QUICK_LINKS = [
  { label: "Members", href: "/admin/collections/members" },
  { label: "First day forms", href: "/admin/collections/first-day-forms" },
  { label: "Follow-up forms", href: "/admin/collections/follow-up-forms" },
  { label: "Orders", href: "/admin/collections/orders" },
  { label: "E-book", href: "/admin/globals/ebook" },
  { label: "Homepage", href: "/admin/globals/homepage" },
  { label: "Prices", href: "/admin/globals/pricing" },
  { label: "Testimonials", href: "/admin/collections/testimonials" },
  { label: "Open website ↗", href: "/", external: true },
];

const formatNumber = (n: number) => n.toLocaleString("en-US");
const shortDate = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function Card({ label, value, note, href }: { label: string; value: React.ReactNode; note?: string; href?: string }) {
  const body = (
    <>
      <span className="ftf-dash__card-label">{label}</span>
      <span className="ftf-dash__card-value">{value}</span>
      {note ? <span className="ftf-dash__card-note">{note}</span> : null}
    </>
  );
  return href ? <Link href={href} className="ftf-dash__card">{body}</Link> : <div className="ftf-dash__card">{body}</div>;
}

/** Reads and adds up every number on the page. Kept out of the component so it is easy to test and debug. */
async function loadOverview(payload: AdminViewServerProps["payload"], range: number) {
  const now = Date.now();
  const sinceDay = statsDay(new Date(now - (range - 1) * DAY)); // e.g. last 30 days including today
  const sinceIso = new Date(`${sinceDay}T00:00:00+05:00`).toISOString(); // midnight, Pakistan time
  const todayIso = new Date(now).toISOString();

  await flushStats(); // include visits counted since the last save

  const [stats, orders, newMembers, activeMemberships, toReview, messages, latestCheckIns] = await Promise.all([
    payload.find({ collection: "site-stats", where: { date: { greater_than_equal: sinceDay } }, limit: 20000, depth: 0, pagination: false }),
    payload.find({
      collection: "orders",
      where: { and: [{ status: { equals: "paid" } }, { createdAt: { greater_than_equal: sinceIso } }] },
      sort: "-createdAt",
      limit: 1000,
      depth: 1,
    }),
    payload.count({ collection: "members", where: { createdAt: { greater_than_equal: sinceIso } } }),
    payload.count({ collection: "memberships", where: { and: [{ status: { equals: "active" } }, { endDate: { greater_than_equal: todayIso } }] } }),
    payload.count({ collection: "follow-up-forms", where: { reviewed: { not_equals: true } } }),
    payload.count({ collection: "contact-messages", where: { createdAt: { greater_than_equal: sinceIso } } }),
    payload.find({ collection: "follow-up-forms", sort: "-createdAt", limit: 5, depth: 1 }),
  ]);

  // ---- website numbers ----
  const perDay = new Map<string, number>();
  const perPage = new Map<string, number>();
  let visits = 0;
  let checkoutsStarted = 0;
  for (const row of stats.docs) {
    if (row.key === "event:checkout-started") {
      checkoutsStarted += row.count;
    } else if (row.key.startsWith("/")) {
      visits += row.count;
      perDay.set(row.date, (perDay.get(row.date) ?? 0) + row.count);
      perPage.set(row.key, (perPage.get(row.key) ?? 0) + row.count);
    }
  }
  const days = Array.from({ length: range }, (_, i) => statsDay(new Date(now - (range - 1 - i) * DAY)));
  const maxDay = Math.max(1, ...days.map((d) => perDay.get(d) ?? 0));
  const topPages = [...perPage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const paid = orders.totalDocs;
  const conversion = checkoutsStarted > 0 ? Math.round((paid / checkoutsStarted) * 100) : 0;
  const revenue = new Map<string, number>();
  for (const order of orders.docs) revenue.set(order.currency, (revenue.get(order.currency) ?? 0) + order.amount);

  return {
    visits, checkoutsStarted, perDay, days, maxDay, topPages, paid, conversion, revenue, orders,
    newMembers: newMembers.totalDocs,
    activeMemberships: activeMemberships.totalDocs,
    toReview: toReview.totalDocs,
    messages: messages.totalDocs,
    latestCheckIns: latestCheckIns.docs,
  };
}

export async function Dashboard({ payload, user, searchParams }: AdminViewServerProps) {
  const rangeParam = Number(searchParams?.range);
  const range = RANGES.includes(rangeParam as (typeof RANGES)[number]) ? rangeParam : 30;
  const {
    visits, checkoutsStarted, perDay, days, maxDay, topPages, paid, conversion, revenue, orders,
    newMembers, activeMemberships, toReview, messages, latestCheckIns,
  } = await loadOverview(payload, range);

  const name = (user && "name" in user && typeof user.name === "string" && user.name) || "";

  return (
    <Gutter className="ftf-dash">
      <header className="ftf-dash__head">
        <div>
          <h1>Overview</h1>
          <p className="ftf-dash__muted">
            Welcome{name ? `, ${name}` : ""}. Showing the last {range} days.
          </p>
        </div>
        <nav className="ftf-dash__range" aria-label="Time period">
          {RANGES.map((r) => (
            <Link key={r} href={`/admin?range=${r}`} aria-current={r === range ? "page" : undefined}>
              {r}d
            </Link>
          ))}
        </nav>
      </header>

      <nav className="ftf-dash__pills" aria-label="Quick links">
        {QUICK_LINKS.map((l) => (
          <Link key={l.label} href={l.href} target={l.external ? "_blank" : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>

      <h2 className="ftf-dash__section">Website</h2>
      <div className="ftf-dash__cards">
        <Card label="Website visits" value={formatNumber(visits)} note="pages viewed" />
        <Card label="Checkouts started" value={formatNumber(checkoutsStarted)} note='pressed "Join now"' />
        <Card label="Payments completed" value={formatNumber(paid)} note={`${conversion}% conversion`} href="/admin/collections/orders" />
        <Card
          label="Revenue"
          value={revenue.size ? [...revenue.entries()].map(([cur, amt]) => <span key={cur} className="ftf-dash__money">{cur} {formatNumber(amt)}</span>) : "—"}
          note="paid orders, by currency"
          href="/admin/collections/orders"
        />
      </div>

      <section className="ftf-dash__panel">
        <h3>Daily visits</h3>
        {visits === 0 ? (
          <p className="ftf-dash__muted">No visits counted yet. Visits appear here as people browse the website.</p>
        ) : (
          <>
            <div className="ftf-dash__chart" role="img" aria-label={`Daily visits over the last ${range} days, highest ${maxDay}`}>
              {days.map((d) => {
                const n = perDay.get(d) ?? 0;
                return <span key={d} className="ftf-dash__bar" style={{ height: `${Math.max(2, (n / maxDay) * 100)}%` }} title={`${shortDate(d)}: ${n} visits`} />;
              })}
            </div>
            <div className="ftf-dash__chart-axis">
              <span>{shortDate(days[0])}</span>
              <span>{shortDate(days[days.length - 1])}</span>
            </div>
          </>
        )}
      </section>

      <div className="ftf-dash__two">
        <section className="ftf-dash__panel">
          <h3>Top pages</h3>
          {topPages.length === 0 ? (
            <p className="ftf-dash__muted">Nothing yet.</p>
          ) : (
            <table className="ftf-dash__table">
              <thead>
                <tr><th>Page</th><th>Views</th></tr>
              </thead>
              <tbody>
                {topPages.map(([page, n]) => (
                  <tr key={page}>
                    <td><a href={page} target="_blank" rel="noopener noreferrer">{page}</a></td>
                    <td>{formatNumber(n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="ftf-dash__panel">
          <h3>Latest orders</h3>
          {orders.docs.length === 0 ? (
            <p className="ftf-dash__muted">No paid orders in this period.</p>
          ) : (
            <table className="ftf-dash__table">
              <thead>
                <tr><th>Order</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {orders.docs.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/collections/orders/${o.id}`}>{o.orderLabel ?? `Order ${o.id}`}</Link>
                      <span className="ftf-dash__sub">{o.member && typeof o.member === "object" ? o.member.displayName ?? o.member.email : o.email}</span>
                    </td>
                    <td>{o.currency} {formatNumber(o.amount)}</td>
                    <td>{shortDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <h2 className="ftf-dash__section">Coaching</h2>
      <div className="ftf-dash__cards">
        <Card label="Active memberships" value={formatNumber(activeMemberships)} href="/admin/collections/memberships?where[status][equals]=active" />
        <Card label="New members" value={formatNumber(newMembers)} note={`last ${range} days`} href="/admin/collections/members" />
        <Card label="Follow-ups to review" value={formatNumber(toReview)} href="/admin/collections/follow-up-forms?where[reviewed][not_equals]=true" />
        <Card label="Contact messages" value={formatNumber(messages)} note={`last ${range} days`} href="/admin/collections/contact-messages" />
      </div>

      <section className="ftf-dash__panel">
        <h3>Latest follow-up forms</h3>
        {latestCheckIns.length === 0 ? (
          <p className="ftf-dash__muted">No follow-up forms yet. They appear here when clients send one.</p>
        ) : (
          <table className="ftf-dash__table">
            <thead>
              <tr><th>Member</th><th>Follow-up</th><th>Mood</th><th>Status</th></tr>
            </thead>
            <tbody>
              {latestCheckIns.map((c) => (
                <tr key={c.id}>
                  <td>{typeof c.member === "object" ? c.member.displayName ?? c.member.email : ""}</td>
                  <td><Link href={`/admin/collections/follow-up-forms/${c.id}`}>{c.title ?? "Follow-up"}</Link></td>
                  <td>{c.mood ?? "—"}</td>
                  <td>{c.reviewed ? <span className="ftf-dash__badge">Reviewed</span> : <span className="ftf-dash__badge ftf-dash__badge--todo">To review</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Gutter>
  );
}
