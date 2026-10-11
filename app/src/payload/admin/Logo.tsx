/** Logo on the admin login page, and the small icon at the top of the admin menu. */
/* eslint-disable @next/next/no-img-element -- plain <img>: the admin panel is not the public site */

export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <img src="/images/logo.png" alt="" width={56} height={56} style={{ borderRadius: "50%", background: "#fff" }} />
      <span style={{ fontSize: 22, fontWeight: 600, color: "#a3154f" }}>Fat To Fit With Z</span>
    </div>
  );
}

export function Icon() {
  return <img src="/images/logo.png" alt="Fat To Fit With Z" width={28} height={28} style={{ borderRadius: "50%", background: "#fff" }} />;
}
