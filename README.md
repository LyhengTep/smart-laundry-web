This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.



```
smart-laundry-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # homepage
│   │   ├── globals.css
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── shops/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── customer/page.tsx
│   │   │   ├── business/page.tsx
│   │   │   ├── driver/page.tsx
│   │   │   └── admin/page.tsx
│   │   │
│   │   └── api/                      # optional route handlers
│   │       ├── shops/route.ts
│   │       └── orders/route.ts
│   │
│   ├── components/
│   │   ├── layout/                   # Navbar/Sidebar/Footer
│   │   ├── ui/                       # Button, Badge, Card...
│   │   └── (domain)/                 # shop/, order/, etc.
│   │
│   ├── lib/                          # helpers, fetch wrapper
│   └── types/                        # TS types: Order, Shop, User
│
├── public/
└── package.json

```