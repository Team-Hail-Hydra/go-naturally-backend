# 🌍 Go Naturally — Backend 🚀

> **⚡ Powering the Future of Eco-Learning with TypeScript & AI**
> 
> A high-performance **Fastify** server with **Prisma ORM**, **JWT authentication**, and **AI-powered environmental tracking** that makes sustainability engaging and measurable.

---

## 📋 Contents

- 🖥️ `server.ts` — Fastify server entrypoint
- 🛣️ `routes/` — Route registration (user routes are registered under `/api/v1`)
- 🎮 `controllers/` — Request handlers
- 🔧 `service/` — Business logic/services
- 🗄️ `prisma/` — Prisma schema and migrations
- 🤖 `generated/prisma` — Generated Prisma client (checked into repo)
- 🛠️ `utils/` — helpers (auth, S3, handler wrappers)

---

## 📋 Requirements

- 🟢 **Node.js** (recommended >= 18)
- 📦 **npm** or **yarn**
- 🐘 **PostgreSQL** database (connection via `DATABASE_URL`)
- ☁️ **Optional**: AWS credentials if using S3 features

---

## 🚀 Quick Start (Development)

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Setup Environment

```bash
cp .env.example .env
# 📝 Edit .env and fill in values (DATABASE_URL, JWT_SECRET, etc.)
```

### 3️⃣ Launch Development Server

```bash
npm run dev
```

🎉 **Server Ready!** Visit `http://localhost:3000/health` to check server status.

---

## 🏭 Production Build

Build the TypeScript and start the compiled app:

```bash
npm run build    # 🔨 Compile TypeScript
npm start        # 🚀 Launch production server
```

---

## ⚙️ Environment Variables

The project includes a `.env.example` with base variables. Add these to your `.env` file:

### 🔧 Core Configuration
- `PORT` — 🌐 Server port (default: `3000`)
- `HOST` — 🏠 Server host (default: `localhost`)
- `NODE_ENV` — 🏷️ Environment (`development` | `production`)

### 🗄️ Database
- `DATABASE_URL` — 🐘 PostgreSQL connection string (required)
- `DIRECT_URL` — 🔗 Direct URL for datasource (optional)

### 🔐 Security
- `JWT_SECRET` — 🔑 Secret for JWT signing
- `CORS_ORIGIN` — 🌐 Comma-separated allowed origins

### 📁 File Upload
- `MAX_FILE_SIZE_MB` — 📊 Maximum upload size (default: 100MB)

### ☁️ AWS S3 Configuration
- `AWS_ACCESS_KEY_ID` — 🔑 AWS Access Key
- `AWS_SECRET_ACCESS_KEY` — 🔒 AWS Secret Key
- `AWS_REGION` — 🌍 AWS Region
- `S3_BUCKET_NAME` — 🪣 S3 Bucket Name

---

## 🗄️ Prisma Database

Prisma powers our database layer with PostgreSQL. The schema lives at `prisma/schema.prisma`.

```bash
npx prisma generate  # 🔄 Generate Prisma client
```

💡 **Tip**: Ensure `DATABASE_URL` is set before running migrations!

---

## 📡 API Reference

### 🔗 Base URL: `/api/v1`

---

### 👥 **User Management**

#### 🆕 Create User Profile
```http
POST /user
```
🔐 **Auth Required** | 📝 **Body**: `{ userId, fullName, email, role, profilePic }`

#### 👤 Get User Profile
```http
GET /user/:userId
```
🔐 **Auth Required** | ✅ **Returns**: Profile + linked organizations

---

### 🏢 **Organization Management**

#### 🏫 Create Organization
```http
POST /org/:orgType
```
🔐 **Auth Required** | 🏷️ **Types**: `School` or `NGO`
📝 **Body**: `{ name, phoneNo, email }`

#### 🤝 Join Organization
```http
POST /org/join/:orgType
```
🔐 **Auth Required** | 📝 **Body**: `{ organization_code }`

---

### 🎉 **Event Management**

#### 🌱 Create NGO Event
```http
POST /ngo/event
```
🔐 **Auth Required** | 📝 **Body**: `{ title, description, date, latitude, longitude, ngoId }`

#### 🏫 Create School Event
```http
POST /school/event
```
🔐 **Auth Required** | 📝 **Body**: `{ title, description, date, latitude, longitude, schoolId }`

#### ✋ Apply for NGO Event
```http
POST /ngo/event/apply
```
🔐 **Auth Required** | 📝 **Body**: `{ userId, eventId }`

#### ✋ Apply for School Event
```http
POST /school/event/apply
```
🔐 **Auth Required** | 📝 **Body**: `{ eventId }`

#### 📋 Get Event Applications
```http
GET /school/event/applications/:eventId
```
🔐 **Auth Required** | 🔢 **Query**: `page` (optional)

#### 📅 Get NGO Events
```http
GET /ngo/events
```
🔐 **Auth Required** | 🔢 **Query**: `page`, `ngoId` (optional)

#### 📅 Get School Events
```http
GET /school/events
```
🔐 **Auth Required** | 🔢 **Query**: `page`, `schoolId` (required)

---

### 🌿 **Plant Tracking**

#### 📸 Upload Plant Image
```http
POST /plants/upload
```
🔐 **Auth Required** | 📁 **Content-Type**: `multipart/form-data`
📝 **Fields**: `plantName`, `latitude`, `longitude`, `image files`

🤖 **AI Features**: Automatic rarity classification + EcoPoints rewards!

#### 🌱 Get Student's Plants
```http
GET /plants/student
```
🔐 **Auth Required** | 🔢 **Query**: `page` (optional)

---

### 🐾 **Animal Tracking**

#### 📸 Upload Animal Image
```http
POST /animal/upload
```
🔐 **Auth Required** | 📁 **Content-Type**: `multipart/form-data`

🤖 **AI Magic**: Auto-detects animal name, description, lifespan & rarity!

#### 🦎 Get Student's Animals
```http
GET /animals/student
```
🔐 **Auth Required** | 🔢 **Query**: `page` (optional)

---

### 🗑️ **Litter Management**

#### 🧹 Upload Cleanup Images
```http
POST /litter/upload
```
🔐 **Auth Required** | 📁 **Content-Type**: `multipart/form-data`
📝 **Fields**: `latitude`, `longitude`, `beforeImg`, `afterImg`

#### 📊 Get School Litter Reports
```http
GET /litters/school/:schoolId
```
🔐 **Auth Required** | 🔢 **Query**: `page` (optional)

#### 🗑️ Get Student's Litter Reports
```http
GET /litters/student
```
🔐 **Auth Required** | 🔢 **Query**: `page` (optional)

---

### 🏆 **Gamification**

#### ⭐ Add EcoPoints
```http
POST /eco-points/add
```
🔐 **Auth Required** | 📝 **Body**: `{ userId, points, litterId }`

#### 🥇 Get Leaderboard
```http
GET /leaderboard
```
🌐 **Public Endpoint** | 🏆 **Returns**: Top 10 students by EcoPoints

---

### 🗺️ **Map Integration**

#### 📍 Get Map Markers
```http
GET /markers
```
🌐 **Public Endpoint** | 🗺️ **Returns**: Plants, litter & animal locations for map display

---

## 💡 Pro Tips & Notes

- 🔄 **Prisma Client**: Pre-generated client included! Run `npx prisma generate` after schema changes
- 📁 **File Uploads**: Max size controlled by `MAX_FILE_SIZE_MB` in `.env`
- 🌐 **CORS**: Configure `CORS_ORIGIN` for production deployments
- 🚀 **Performance**: Built with Fastify for lightning-fast API responses
- 🔒 **Security**: JWT authentication with role-based access control
- 🤖 **AI Integration**: Powered by Google Gemini AI for smart environmental insights

---
## Demo Video
[![Youtube Video](https://github.com/user-attachments/assets/83a5c5d2-5a9d-47db-baae-af84da3f0608)](https://www.youtube.com/watch?v=Ibk7X8G6O_I)
---

## 🆘 Support & Contact

- 🐛 **Issues**: Open an [issue](https://github.com/Team-Hail-Hydra/go-naturally-backend/issues)
- 🔒 **Security**: Contact maintainers directly for sensitive inquiries
- 💬 **Questions**: Join our community discussions

---

## 🏆 Why Choose Go Naturally Backend?

> **🌟 Enterprise-Grade API for Environmental Impact**
> 
> Built with modern TypeScript, robust authentication, AI-powered insights, and scalable architecture. Ready to power the next generation of sustainability platforms.

### ✨ **Key Features**
- 🚀 **High Performance**: Fastify-powered API
- 🔐 **Secure**: JWT authentication & role-based access
- 🤖 **AI-Powered**: Smart plant/animal recognition
- 🗄️ **Reliable**: PostgreSQL with Prisma ORM
- ☁️ **Cloud-Ready**: S3 integration for file storage
- 📱 **Mobile-Friendly**: RESTful API design
- 🌍 **Scalable**: Built for global environmental initiatives

---

**🌱 Go Naturally — Backend** provides a scalable, maintainable API for the Go Naturally platform, supporting community-driven ecological tracking and event organization. With robust authentication, file handling, and database integration, it's ready to power your next sustainability initiative.

**Built with 💚 by Team Hail Hydra | Smart India Hackathon 2025**
