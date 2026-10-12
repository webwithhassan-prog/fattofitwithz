/**
 * admin > Diet plans to send (/admin/diet-plans)
 * Clients whose first day form has arrived but whose diet plan isn't marked as sent yet.
 * For each: a WhatsApp button, a link to the form, and "Mark as sent".
 * Below: the last plans marked as sent (with "Undo").
 */
import Link from "next/link";
import type { AdminViewServerProps } from "payload";
import type { FirstDayForm, Member } from "@/payload-types";
import { AdminPage } from "./AdminPage";
import { setDietPlanSent } from "./dietPlanActions";
import { formatDate } from "../../lib/dates";

const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;
const memberOf = (form: FirstDayForm) => (typeof form.member === "object" ? (form.member as Member) : null);

function MarkButton({ formId, sent, label }: { formId: number; sent: boolean; label: string }) {
  return (
    <form action={setDietPlanSent}>
      <input type="hidden" name="formId" value={formId} />
      <input type="hidden" name="sent" value={sent ? "1" : "0"} />
      <button type="submit" className={sent ? "ftf-btn ftf-btn--primary" : "ftf-btn"}>{label}</button>
    </form>
  );
}

export async function DietPlans(view: AdminViewServerProps) {
  const payload = view.initPageResult.req.payload;
  const [waiting, sent] = await Promise.all([
    payload.find({ collection: "first-day-forms", where: { reviewed: { not_equals: true } }, sort: "updatedAt", limit: 200, depth: 1 }),
    payload.find({ collection: "first-day-forms", where: { reviewed: { equals: true } }, sort: "-updatedAt", limit: 10, depth: 1 }),
  ]);

  return (
    <AdminPage
      view={view}
      title="Diet plans to send"
      intro="Clients who sent their first day form and are waiting for their diet plan. Send it on WhatsApp, then press “Mark as sent”."
    >
      <div className="ftf-cards">
        <div className={`ftf-card${waiting.totalDocs ? " ftf-card--highlight" : ""}`}>
          <span className="ftf-card__label">Diet plans left to send</span>
          <span className="ftf-card__value">{waiting.totalDocs}</span>
          <span className="ftf-card__note">oldest first</span>
        </div>
      </div>

      <section className="ftf-panel">
        <h3>Waiting for a diet plan</h3>
        {waiting.docs.length === 0 ? (
          <p className="ftf-muted">All done: every client who sent a first day form has her diet plan. 🎉</p>
        ) : (
          <ul className="ftf-list">
            {waiting.docs.map((form) => {
              const member = memberOf(form);
              return (
                <li key={form.id} className="ftf-list__row">
                  <div className="ftf-list__main">
                    <b>{member?.displayName ?? form.fullName ?? "Client"}</b>
                    <span className="ftf-sub">
                      {form.currentWeightKg ? `${form.currentWeightKg} kg` : ""}
                      {form.goalWeightKg ? ` → ${form.goalWeightKg} kg` : ""}
                      {form.medicalConditions === "Yes" && form.medicalDetails ? ` · Health: ${form.medicalDetails}` : ""}
                      {` · form sent ${formatDate(form.updatedAt)}`}
                    </span>
                  </div>
                  <div className="ftf-list__actions">
                    {member?.phone ? (
                      <a className="ftf-btn ftf-btn--whatsapp" href={waLink(member.phone)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    ) : null}
                    <Link className="ftf-btn" href={`/admin/collections/first-day-forms/${form.id}`}>Open form</Link>
                    <MarkButton formId={form.id} sent label="Mark as sent" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {sent.docs.length ? (
        <section className="ftf-panel">
          <h3>Recently marked as sent</h3>
          <ul className="ftf-list">
            {sent.docs.map((form) => (
              <li key={form.id} className="ftf-list__row">
                <div className="ftf-list__main">
                  <b>{memberOf(form)?.displayName ?? form.fullName ?? "Client"}</b>
                  <span className="ftf-sub">marked {formatDate(form.updatedAt)}</span>
                </div>
                <div className="ftf-list__actions">
                  <MarkButton formId={form.id} sent={false} label="Undo" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AdminPage>
  );
}
