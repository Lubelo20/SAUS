# SAUS Admin CMS — Setup Guide

## Prerequisites

- Node.js v18+
- PostgreSQL 14+
- npm or yarn

---

## 1. Database

```bash
# Create the database
psql -U postgres -c "CREATE USER saus_user WITH PASSWORD 'your_password';"
psql -U postgres -c "CREATE DATABASE saus_cms OWNER saus_user;"
```

---

## 2. Backend

```bash
cd saus-admin/server
npm install

# Copy and edit .env
cp ../.env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET

# Push schema to database
npx prisma db push

# Seed initial admin user
npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('Admin@SAUS2025!', 12);
  await prisma.user.create({
    data: {
      name: 'Super Administrator',
      email: 'admin@saus.org.za',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
      department: 'Secretariat',
      isActive: true,
    }
  });
  console.log('Admin user created: admin@saus.org.za / Admin@SAUS2025!');
  await prisma.\$disconnect();
}
main();
"

# Start dev server (port 4000)
npm run dev
```

---

## 3. Frontend

```bash
cd saus-admin/client
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local

# Start dev server (port 3000)
npm run dev
```

---

## 4. Access the CMS

Open: **http://localhost:3000**

Login with:
- Email: `admin@saus.org.za`
- Password: `Admin@SAUS2025!`

> **Change the password immediately after first login.**

---

## 5. Production Deployment

### Backend
```bash
cd server
npm run build
NODE_ENV=production node dist/index.js
# Or use PM2:
pm2 start dist/index.js --name saus-api
```

### Frontend
```bash
cd client
NEXT_PUBLIC_API_URL=https://api.admin.saus.org.za/api npm run build
npm run start
# Or use PM2:
pm2 start npm --name saus-cms -- start
```

### Nginx (example)
```nginx
server {
    server_name admin.saus.org.za;
    location / { proxy_pass http://localhost:3000; }
}
server {
    server_name api.admin.saus.org.za;
    client_max_body_size 50M;
    location / { proxy_pass http://localhost:4000; }
}
```

---

## 6. Role Permissions

| Role         | Publish | Edit | Delete | Users | Settings |
|--------------|---------|------|--------|-------|----------|
| SUPER_ADMIN  | ✅      | ✅   | ✅     | ✅    | ✅       |
| SECRETARIAT  | ✅      | ✅   | ✅     | ✅    | ✅       |
| MARKETING    | ✅      | ✅   | ❌     | ❌    | ❌       |
| MEDIA        | ✅      | ✅   | ❌     | ❌    | ❌       |
| EDITOR       | ✅      | ✅   | ✅     | ❌    | ❌       |
| CONTRIBUTOR  | ❌      | ✅   | ❌     | ❌    | ❌       |

---

## 7. File Structure

```
saus-admin/
├── server/               # Express API (Node.js + TypeScript)
│   ├── prisma/schema.prisma    # Full DB schema
│   ├── src/
│   │   ├── index.ts            # Server entry
│   │   ├── middleware/auth.ts  # JWT + RBAC
│   │   └── routes/             # news, events, campaigns, media, documents, users, settings
│   └── uploads/                # Uploaded files (gitignored in production)
└── client/               # Next.js 14 Dashboard (TypeScript + Tailwind)
    └── src/
        ├── app/
        │   ├── login/          # Login page
        │   └── dashboard/      # All CMS pages
        └── components/
            └── layout/         # Sidebar + Header
```

---

Developed by **Lubelo Tech Solutions** for the South African Union of Students (SAUS).
