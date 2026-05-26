# 🇨🇲 CamerBus — Cameroon's Transport Super-App

A nationwide bus booking and logistics platform for Cameroon. Built with **PHP 8+ MVC backend** and **React Native Expo** frontend.

---

## 📱 Mobile App Features

| Feature | Details |
|---|---|
| 🌍 Bilingual | English & French, switchable at any time |
| 🔍 Route Search | Search intercity trips by city + date |
| 💺 Seat Map | Interactive visual bus seat picker (real-time) |
| 💳 Payment | MTN MoMo / Orange Money / Bank — upload proof screenshot |
| 🎫 QR Tickets | Verified QR tickets generated after payment approval |
| 📦 Parcels | Send packages between branches, track with timeline |
| 🔔 Notifications | Push + in-app: payment approved/rejected, parcel updates |
| 👤 Multi-role | User · Branch Admin · Company Admin · Super Admin |

---

## 🏗️ Architecture

```
CamerBus/
├── backend/                   # PHP 8+ MVC REST API
│   ├── config/                # DB, JWT, env loader
│   ├── controllers/           # 13 controllers (Auth, Booking, Payment…)
│   ├── database/              # Schema SQL + seed data
│   ├── helpers/               # Response, JWT, QR, ImageUpload, PriceCalc
│   ├── middleware/            # Auth, CORS, Role
│   └── routes/api.php         # Route dispatcher (match expression)
│
└── mobile/                    # React Native Expo (TypeScript)
    ├── app/                   # Expo Router file-based screens
    │   ├── index.tsx          # Language selection (onboarding)
    │   ├── (auth)/            # Login, Register
    │   └── (main)/            # Tab navigator + all app screens
    │       ├── home.tsx
    │       ├── companies/     # List + detail
    │       ├── search/        # Schedule results
    │       ├── booking/       # Seats → Summary
    │       ├── payment/       # Method → Instructions → Upload → Pending
    │       ├── tickets/       # My tickets list + QR detail
    │       ├── parcels/       # List + Send + Track
    │       ├── tracking/      # Parcel tracking timeline
    │       ├── notifications/ # In-app notifications
    │       └── profile/       # Profile + Settings
    ├── constants/             # Colors, design tokens, app data
    ├── locales/               # en.json + fr.json (full bilingual)
    ├── services/              # Axios API client + all endpoint wrappers
    └── store/                 # Zustand stores (Auth, Language, Booking)
```

---

## 🚀 Getting Started

### Backend (PHP)

1. **Requirements**: PHP 8.1+, MySQL 8+, Apache/Nginx with mod_rewrite

2. **Setup**:
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE camerbus CHARACTER SET utf8mb4;"

# Import schema & seed data
mysql -u root -p camerbus < backend/database/camerbus_schema.sql
mysql -u root -p camerbus < backend/database/seed_cities.sql
mysql -u root -p camerbus < backend/database/seed_companies.sql
mysql -u root -p camerbus < backend/database/seed_data.sql
```

3. **Configure** `backend/.env`:
```env
DB_HOST=localhost
DB_NAME=camerbus
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=your-super-secret-key-change-this
```

4. **Virtual Host**: Point document root to `backend/`, enable `.htaccess`

5. **Test**: `GET http://localhost/camerbus-api/api/health` → `{"success":true}`

---

### Mobile App (Expo)

1. **Requirements**: Node 18+, Expo CLI, Android Studio or Xcode

2. **Install dependencies**:
```bash
cd mobile
npm install --legacy-peer-deps
```

3. **Configure API URL** in `mobile/app.json`:
```json
"extra": {
  "API_BASE_URL": "http://YOUR_PC_IP/camerbus-api"
}
```
> ⚠️ Use your actual LAN IP (e.g. `192.168.1.100`), not `localhost` — mobile devices can't reach your PC's localhost

4. **Run**:
```bash
npx expo start
# Press 'a' for Android, 'i' for iOS, 'w' for Web
```

---

## 🏢 Pre-seeded Transport Companies

| Company | HQ | Routes |
|---|---|---|
| Buca Travel | Buea | Buea–Douala–Yaoundé |
| General Express Voyages | Yaoundé | Nationwide |
| Amour Mezam | Bamenda | Bamenda–Douala–Yaoundé |
| Vatican Express | Bafoussam | West–Centre–Littoral |
| Guarantee Express | Douala | Nationwide |
| Touristique Express | Bafoussam | West–North |
| United Express | Yaoundé | Centre–South-West |
| Musango Voyages | Buea | South-West routes |
| Djeuga Palace | Yaoundé | Yaoundé–North |
| Nkembo Express | Bafoussam | West routes |
| Graceland Express | Bamenda | North-West routes |
| Trans-African Motors | Douala | Long-haul intercity |

---

## 💳 Payment Flow

```
User Selects Seats
        ↓
Choose Payment Method (MTN MoMo / Orange Money / Bank)
        ↓
View payment number & amount to send
        ↓
Make transfer in mobile money app
        ↓
Upload screenshot as proof
        ↓
Admin reviews & approves/rejects
        ↓
✅ QR Ticket generated automatically
        ↓
Show QR code at branch to board
```

---

## 🔐 API Authentication

- **Users**: JWT Bearer tokens (access 24h + refresh 7d)
- **Admins**: Separate `/api/auth/admin-login` endpoint
- **Roles**: `user` · `branch_admin` · `company_admin` · `super_admin`

**Default Super Admin**:
```
Email: admin@camerbus.cm
Password: Admin@123
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/routes/search?from=&to=&date=` | Search schedules |
| GET | `/api/schedules/:id/seats` | Get seat map |
| POST | `/api/bookings` | Create booking |
| POST | `/api/payments/:id/upload-proof` | Upload payment screenshot |
| PUT | `/api/payments/:id/approve` | Admin: approve payment |
| GET | `/api/tickets/:code` | Get QR ticket |
| POST | `/api/tickets/:code/validate` | Branch agent: validate ticket |
| POST | `/api/parcels` | Create parcel shipment |
| GET | `/api/parcels/:tracking` | Track parcel (public) |
| GET | `/api/admin/dashboard` | Admin dashboard stats |

---

## 🎨 Design System

**Cameroon National Colors:**
- 🟢 Primary Green: `#007A33`
- 🟡 Accent Yellow: `#FCD116`
- 🔴 Cameroon Red: `#CE1126`

**Typography**: System fonts with Inter-style weights (700/800 for headings)

**UI Style**: Card-based, glassmorphism-adjacent, Uber/RedBus inspired

---

## 📂 Cameroon Cities Covered

Yaoundé · Douala · Bamenda · Bafoussam · Buea · Limbe · Ngaoundéré · Garoua · Maroua · Kumba · Ebolowa · Bertoua · Kribi · Nkongsamba · Dschang · Mbalmayo · Edéa · Foumban · Sangmélima · Tibati

---

*Built with ❤️ for Cameroon 🇨🇲*
