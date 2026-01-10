export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[10%] top-[-10%] h-[520px] w-[900px] rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute right-[0%] top-[0%] h-[520px] w-[900px] rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute left-[45%] bottom-[-20%] h-[620px] w-[900px] rounded-full bg-green-600/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1160px] px-5 py-6">
        {/* Nav */}
        <header className="sticky top-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[26px] border border-slate-900/10 bg-white/70 px-4 py-3 shadow-[0_10px_22px_rgba(2,6,23,.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-blue-600 to-sky-500 shadow-[0_10px_20px_rgba(37,99,235,.20)]" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Smart Laundry System</div>
              <div className="text-xs text-slate-500">Web app — Home page</div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <a
              className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-900/5 hover:text-slate-900"
              href="#features"
            >
              Features
            </a>
            <a
              className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-900/5 hover:text-slate-900"
              href="#roles"
            >
              Roles
            </a>
            <a
              className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-900/5 hover:text-slate-900"
              href="#shops"
            >
              Shops
            </a>

            <button className="rounded-[14px] border border-slate-900/10 bg-white/85 px-3 py-2 text-sm shadow-sm hover:-translate-y-[1px] hover:shadow-md transition">
              Login
            </button>
            <button className="rounded-[14px] border border-blue-700/30 bg-gradient-to-br from-blue-600 to-sky-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:-translate-y-[1px] hover:shadow-md transition">
              Create order
            </button>
          </nav>
        </header>

        {/* Hero */}
        <section className="mt-4 overflow-hidden rounded-[26px] border border-slate-900/10 bg-white/70 shadow-[0_18px_55px_rgba(2,6,23,.12)]">
          <div className="grid gap-5 p-6 lg:grid-cols-[1.15fr_.85fr]">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Fast ordering • Live tracking • Pickup & delivery
              </div>

              <h1 className="mt-3 text-[38px] font-semibold leading-[1.08] tracking-[-0.6px]">
                Clean clothes, without the hassle.
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Find nearby laundry shops, place an order in minutes, and track
                status from pickup to delivery. Built for customers, laundry
                businesses, drivers, and admins.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-[14px] border border-blue-700/30 bg-gradient-to-br from-blue-600 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:-translate-y-[1px] hover:shadow-md transition">
                  Start an order
                </button>
                <a
                  href="#shops"
                  className="rounded-[14px] border border-slate-900/10 bg-white/85 px-4 py-2 text-sm shadow-sm hover:-translate-y-[1px] hover:shadow-md transition"
                >
                  Browse shops
                </a>
                <a
                  href="#roles"
                  className="rounded-[14px] border border-slate-900/10 bg-white/85 px-4 py-2 text-sm shadow-sm hover:-translate-y-[1px] hover:shadow-md transition"
                >
                  I am a business
                </a>
              </div>

              {/* Search */}
              <div className="mt-5 flex items-center gap-2 rounded-[18px] border border-slate-900/10 bg-white/85 p-3 shadow-[0_10px_22px_rgba(2,6,23,.08)]">
                <input
                  className="w-full rounded-[14px] border border-slate-900/10 bg-[#f6f7fb]/90 px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search laundry shop (name, area, street)…"
                />
                <button className="whitespace-nowrap rounded-[14px] border border-blue-700/30 bg-gradient-to-br from-blue-600 to-sky-500 px-4 py-3 text-sm font-medium text-white hover:shadow-md transition">
                  Search
                </button>
              </div>

              {/* Mini feature cards */}
              <div className="mt-4 grid gap-3 lg:grid-cols-4">
                <MiniCard
                  code="01"
                  title="Create order"
                  desc="Select services, schedule pickup or dropoff."
                />
                <MiniCard
                  code="02"
                  title="Track status"
                  desc="PLACED → CONFIRMED → IN_PROCESS → READY → COMPLETED."
                />
                <MiniCard
                  code="03"
                  title="Pay easily"
                  desc="Cash, card, bank transfer, or KHQR."
                />
                <MiniCard
                  code="04"
                  title="Review shops"
                  desc="Rate your experience and help others."
                />
              </div>
            </div>

            {/* Right */}
            <aside
              id="shops"
              className="rounded-[26px] border border-slate-900/10 bg-white/70 p-4 shadow-[0_10px_22px_rgba(2,6,23,.08)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">Nearby shops</div>
                <div className="rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-xs text-slate-500">
                  Phnom Penh (demo)
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <ShopRow
                  name="FreshFold Laundry"
                  meta="Wash • Dry • Iron • ★ 4.6"
                  status="OPEN"
                />
                <ShopRow
                  name="CleanWave Express"
                  meta="Wash • Dryclean • ★ 4.2"
                  status="CLOSED"
                />
                <ShopRow
                  name="UrbanClean"
                  meta="Wash • Iron • ★ 4.4"
                  status="OPEN"
                />
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold">Quick actions</div>
                <div className="mt-3 grid gap-2">
                  <button className="w-full rounded-[14px] border border-blue-700/30 bg-gradient-to-br from-blue-600 to-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:shadow-md transition">
                    Create laundry order
                  </button>
                  <button className="w-full rounded-[14px] border border-slate-900/10 bg-white/85 px-4 py-2.5 text-sm hover:shadow-md transition">
                    Track an order
                  </button>
                  <button className="w-full rounded-[14px] border border-slate-900/10 bg-white/85 px-4 py-2.5 text-sm hover:shadow-md transition">
                    Register your business
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mt-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800/90">
            Platform highlights
          </h2>
          <div className="grid gap-3 lg:grid-cols-3">
            <FeatureCard
              icon="UI"
              title="Simple flow"
              desc="Browse shops → select services → schedule → confirm."
            />
            <FeatureCard
              icon="API"
              title="Clear statuses"
              desc="Order, payment, and delivery statuses are separated."
            />
            <FeatureCard
              icon="📣"
              title="Notifications"
              desc="Get updates when your order is confirmed or delivered."
            />
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="mt-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800/90">
            Built for every role
          </h2>
          <div className="grid gap-3 lg:grid-cols-4">
            <RoleCard
              title="Customer"
              dotClass="bg-blue-600"
              bullets={[
                "Create laundry orders",
                "Track order status",
                "Review & rating",
              ]}
            />
            <RoleCard
              title="Laundry Business"
              dotClass="bg-green-600"
              bullets={[
                "Accept / reject orders",
                "Update laundry status",
                "Manage services & pricing",
              ]}
            />
            <RoleCard
              title="Driver"
              dotClass="bg-amber-500"
              bullets={[
                "Pickup / dropoff tasks",
                "Update delivery status",
                "Customer contact info",
              ]}
            />
            <RoleCard
              title="Admin"
              dotClass="bg-red-500"
              bullets={[
                "Approve business applications",
                "Manage drivers",
                "Monitor platform",
              ]}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[26px] border border-slate-900/10 bg-white/75 p-5 shadow-[0_18px_55px_rgba(2,6,23,.12)]">
          <div>
            <div className="text-sm font-semibold">
              Ready to try the mock flow?
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Use this homepage for screenshots in your report, then build real
              pages later.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="#features"
              className="rounded-[14px] border border-slate-900/10 bg-white/85 px-4 py-2 text-sm hover:shadow-md transition"
            >
              See features
            </a>
            <button className="rounded-[14px] border border-blue-700/30 bg-gradient-to-br from-blue-600 to-sky-500 px-4 py-2 text-sm font-medium text-white hover:shadow-md transition">
              Create order
            </button>
          </div>
        </section>

        <footer className="py-6 text-center text-xs text-slate-500">
          Homepage mock only • You can reuse this style for Login, Dashboards,
          and Order Tracking pages.
        </footer>
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */

function MiniCard({
  code,
  title,
  desc,
}: {
  code: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-900/10 bg-white/80 p-4 shadow-sm">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-[14px] border border-slate-900/10 bg-[#f6f7fb]/90 font-mono text-xs text-slate-600">
        {code}
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{desc}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-900/10 bg-white/80 p-4 shadow-sm">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-[14px] border border-slate-900/10 bg-[#f6f7fb]/90 font-mono text-xs text-slate-600">
        {icon}
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{desc}</div>
    </div>
  );
}

function RoleCard({
  title,
  dotClass,
  bullets,
}: {
  title: string;
  dotClass: string;
  bullets: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-slate-900/10 bg-white/80 p-4 shadow-sm">
      <div className="absolute -right-20 -top-16 h-44 w-44 rounded-full bg-blue-600/10" />
      <div className="relative flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">{title}</div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f6f7fb]/90 px-3 py-1.5 text-xs text-slate-500">
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          {title === "Customer"
            ? "Web"
            : title === "Laundry Business"
            ? "Dashboard"
            : title === "Driver"
            ? "Delivery"
            : "Control"}
        </div>
      </div>
      <ul className="relative mt-3 list-disc pl-5 text-sm leading-6 text-slate-500">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

function ShopRow({
  name,
  meta,
  status,
}: {
  name: string;
  meta: string;
  status: "OPEN" | "CLOSED";
}) {
  const dotClass = status === "OPEN" ? "bg-green-600" : "bg-amber-500";
  return (
    <div className="flex items-center justify-between gap-3 rounded-[16px] border border-slate-900/10 bg-white/80 p-3">
      <div>
        <div className="text-sm font-semibold">{name}</div>
        <div className="mt-1 text-xs text-slate-500">{meta}</div>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f6f7fb]/90 px-3 py-1.5 text-xs text-slate-500">
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
        {status}
      </div>
    </div>
  );
}
