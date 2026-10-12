/**
 * The admin home page (/admin): SALES OF THE LAST 30 DAYS + the coach's to-do list.
 *
 *   To do:  diet plans to send, follow-ups to review, open client issues, website messages, active clients
 *   Sales:  revenue (per currency), paid orders, programs and e-books sold, website visits
 *           a daily orders chart and the full sales log (every order of the 30 days)
 *
 * A server component: every number is read from the database when the page opens.
 * Styles: src/app/(payload)/custom.css (classes start with "ftf-").
 */
import Link from "next/link";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { flushStats, statsDay } from "../../lib/stats.server";

const DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

const formatNumber = (n: number) => n.toLocaleString("en-US");
const shortDate = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });

function StatCard({ label, value, note, href, highlight }: { label: string; value: React.ReactNode; note?: string; href?: string; highlight?: boolean }) {
  const body = (
    <>
      <span className="ftf-card__label">{label}</span>
      <span className="ftf-card__value">{value}</span>
      {note ? <span className="ftf-card__note">{note}</span> : null}
    </>
  );
  const className = `ftf-card${highlight ? " ftf-card--highlight" : ""}`;
  return href ? <Link href={href} className={className}>{body}</Link> : <div className={className}>{body}</div>;
}

/** Reads and adds up every number on the page. Kept out of the component so it is easy to debug. */
async function loadOverview(payload: AdminViewServerProps["payload"]) {
  const now = Date.now();
  const firstDay = statsDay(new Date(now - (DAYS - 1) * DAY)); // 30 days including today (Pakistan time)
  const sinceIso = new Date(`${firstDay}T00:00:00+05:00`).toISOString();
  const todayIso = new Date(now).toISOString();

  await flushStats(); // include visits counted since the last save

  const [orders, stats, dietPlans, followUps, issues, activeClients, messages] = await Promise.all([
    payload.find({
      collection: "orders",
      where: { and: [{ status: { in: ["paid", "refunded"] } }, { createdAt: { greater_than_equal: sinceIso } }] },
      sort: "-createdAt",
      limit: 1000,
      depth: 1,
    }),
    payload.find({ collection: "site-stats", where: { date: { greater_than_equal: firstDay } }, limit: 20000, depth: 0, pagination: false }),
    payload.count({ collection: "first-day-forms", where: { reviewed: { not_equals: true } } }),
    payload.count({ collection: "follow-up-forms", where: { reviewed: { not_equals: true } } }),
    payload.count({ collection: "client-issues", where: { status: { not_equals: "solved" } } }),
    payload.count({ collection: "memberships", where: { and: [{ status: { equals: "active" } }, { endDate: { greater_than_equal: todayIso } }] } }),
    payload.count({ collection: "contact-messages", where: { createdAt: { greater_than_equal: sinceIso } } }),
  ]);

  const paidOrders = orders.docs.filter((o) => o.status === "paid");
  const revenue = new Map<string, number>();
  for (const o of paidOrders) revenue.set(o.currency, (revenue.get(o.currency) ?? 0) + o.amount);

  // Orders per day for the chart
  const days = Array.from({ length: DAYS }, (_, i) => statsDay(new Date(now - (DAYS - 1 - i) * DAY)));
  const perDay = new Map<string, number>();
  for (const o of paidOrders) {
    const day = statsDay(new Date(o.createdAt));
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }
  const maxDay = Math.max(1, ...days.map((d) => perDay.get(d) ?? 0));

  let visits = 0;
  for (const row of stats.docs) if (row.key.startsWith("/")) visits += row.count;

  return {
    orders: orders.docs,
    paid: paidOrders.length,
    revenue,
    programsSold: paidOrders.filter((o) => o.program).length,
    ebooksSold: paidOrders.filter((o) => o.ebook).length,
    refunds: orders.docs.length - paidOrders.length,
    days,
    perDay,
    maxDay,
    visits,
    todo: { dietPlans: dietPlans.totalDocs, followUps: followUps.totalDocs, issues: issues.totalDocs, messages: messages.totalDocs, activeClients: activeClients.totalDocs },
  };
}

export async function Dashboard({ payload, user }: AdminViewServerProps) {
  const o = await loadOverview(payload);
  const name = (user && "name" in user && typeof user.name === "string" && user.name) || "";
  const conversion = o.visits > 0 ? ((o.paid / o.visits) * 100).toFixed(1) : null;

  return (
    <Gutter className="ftf-page">
      <header className="ftf-page__head">
        <h1>Overview</h1>
        <p className="ftf-muted">Welcome{name ? `, ${name}` : ""}. Sales of the last {DAYS} days and what needs your attention.</p>
      </header>

      <h2 className="ftf-section">To do</h2>
      <div className="ftf-cards">
        <StatCard label="Diet plans to send" value={o.todo.dietPlans} note="first day forms waiting" href="/admin/diet-plans" highlight={o.todo.dietPlans > 0} />
        <StatCard label="Follow-ups to review" value={o.todo.followUps} href="/admin/collections/follow-up-forms?where[reviewed][not_equals]=true" highlight={o.todo.followUps > 0} />
        <StatCard label="Open client issues" value={o.todo.issues} href="/admin/collections/client-issues?where[status][not_equals]=solved" highlight={o.todo.issues > 0} />
        <StatCard label="Website messages" value={o.todo.messages} note={`contact form, last ${DAYS} days`} href="/admin/collections/contact-messages" />
        <StatCard label="Active clients" value={o.todo.activeClients} note="with a running program" href="/admin/collections/members" />
      </div>

      <h2 className="ftf-section">Sales · last {DAYS} days</h2>
      <div className="ftf-cards">
        <StatCard
          label="Revenue"
          value={o.revenue.size ? [...o.revenue.entries()].map(([currency, amount]) => <span key={currency} className="ftf-card__money">{currency} {formatNumber(amount)}</span>) : "—"}
          note="paid orders, by currency"
        />
        <StatCard label="Paid orders" value={o.paid} note={o.refunds ? `${o.refunds} refunded` : "no refunds"} />
        <StatCard label="Programs sold" value={o.programsSold} />
        <StatCard label="E-books sold" value={o.ebooksSold} note="alone or with a program" />
        <StatCard label="Website visits" value={formatNumber(o.visits)} note={conversion ? `${conversion}% became orders` : "counted on the live site"} />
      </div>

      <section className="ftf-panel">
        <h3>Orders per day</h3>
        <div className="ftf-chart" role="img" aria-label={`Paid orders per day over the last ${DAYS} days, highest ${o.maxDay}`}>
          {o.days.map((day) => {
            const n = o.perDay.get(day) ?? 0;
            return (
              <span key={day} className="ftf-chart__col" title={`${shortDate(day)}: ${n} order${n === 1 ? "" : "s"}`}>
                <span className={`ftf-chart__bar${n ? "" : " ftf-chart__bar--empty"}`} style={{ height: `${n ? Math.max(8, (n / o.maxDay) * 100) : 3}%` }} />
              </span>
            );
          })}
        </div>
        <div className="ftf-chart__axis">
          <span>{shortDate(o.days[0])}</span>
          <span>Today</span>
        </div>
      </section>

      <section className="ftf-panel">
        <h3>Sales log</h3>
        {o.orders.length === 0 ? (
          <p className="ftf-muted">No orders in the last {DAYS} days yet. Every payment appears here automatically.</p>
        ) : (
          <div className="ftf-table-wrap">
            <table className="ftf-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Bought</th>
                  <th className="ftf-num">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {o.orders.map((order) => {
                  const member = order.member && typeof order.member === "object" ? order.member : null;
                  return (
                    <tr key={order.id}>
                      <td className="ftf-nowrap">{dateTime(order.createdAt)}</td>
                      <td>
                        {member ? <Link href={`/admin/collections/members/${member.id}`}>{member.displayName ?? member.email}</Link> : order.email}
                        {member ? <span className="ftf-sub">{order.email}</span> : null}
                      </td>
                      <td>
                        <Link href={`/admin/collections/orders/${order.id}`}>{order.orderLabel ?? `Order ${order.id}`}</Link>
                      </td>
                      <td className="ftf-num ftf-nowrap">
                        {order.currency} {formatNumber(order.amount)}
                      </td>
                      <td>
                        <span className={`ftf-badge${order.status === "paid" ? " ftf-badge--good" : " ftf-badge--warn"}`}>{order.status === "paid" ? "Paid" : "Refunded"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Gutter>
  );
}
