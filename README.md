<p align="center">
  <img src="Frontend/src/assets/images/logo1.jpg" alt="AXIOS Logo" width="280" />
</p>

<h1 align="center">AXIOS — Tamper-Proof Land Record Management System</h1>

<p align="center">
  <strong>A blockchain-principles-based land registry that uses Merkle trees, RSA witness signatures, and real‑time integrity verification to make every land record provably immutable.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Dockerized-100%25-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>


---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Our Solution](#our-solution)
3. [System Architecture](#system-architecture)
4. [Integrity Model — How It Works](#integrity-model--how-it-works)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Features](#features)
8. [API Reference](#api-reference)
9. [Getting Started](#getting-started)
10. [Docker Deployment](#docker-deployment)
11. [Environment Variables](#environment-variables)
12. [Screenshots & UI Flow](#screenshots--ui-flow)
13. [Team](#team)

---

## Problem Statement

India's land registry system suffers from:

- **Record tampering** — Manual or database-level alterations go undetected
- **Opaque ownership chains** — Transfer history is buried in paper files
- **No public verifiability** — Citizens have no way to independently confirm a record's authenticity
- **Single point of trust** — The database administrator can silently corrupt data

> **Result:** Fraud, boundary disputes, forged documents, and erosion of public trust in government records.

---

## Our Solution

**AXIOS** implements **blockchain principles without a blockchain** — delivering the same guarantees of immutability, transparency, and multi-party consensus using:

| Principle | How AXIOS Implements It |
|---|---|
| **Immutability** | Every land record is split into 9 semantic blocks, each hashed with SHA-256, then combined into a **Merkle tree**. The root hash is stored alongside the record. |
| **Consensus** | 3 independent **Witness Nodes** digitally sign the Merkle root with RSA-2048 keys. A **majority quorum** (2/3) is required before any write is accepted. |
| **Tamper Detection** | On every read, the system **recomputes** the hash tree from live data and compares it to the stored root — any change, even a single character, is flagged instantly. |
| **Transparency** | A public portal lets any citizen look up a land record and see its cryptographic integrity status — no login required. |
| **Audit Trail** | Every ownership transfer creates a versioned snapshot (owner, transfer details, previous Merkle root) forming an append-only history chain. |

---

## System Architecture

```
                  ┌─────────────────────────────────────────────┐
                  │              FRONTEND (React)               │
                  │        Vite + Tailwind + Motion             │
                  │   Public Portal  │  Admin Dashboard         │
                  └────────┬────────────────┬───────────────────┘
                           │ HTTP/REST      │
                  ┌────────▼────────────────▼───────────────────┐
                  │             BACKEND (Express)               │
                  │                                             │
                  │  Auth ─── Land CRUD ─── Integrity Engine    │
                  │   │           │                │            │
                  │   │     ┌─────▼──────┐   ┌────▼──────┐      │
                  │   │     │ buildPayload│   │merkleUtil │     │
                  │   │     │ (9 blocks)  │   │(SHA-256   │     │
                  │   │     └─────┬──────┘   │ tree)     │      │
                  │   │           │          └────┬──────┘      │
                  │   │           └───────┬───────┘             │
                  │   │                   ▼                     │
                  │   │          ┌─────────────────┐            │
                  │   │          │ Witness Service  │────────┐  │
                  │   │          └─────────────────┘        │   │
                  └───┼────────────────────────────────────┼────┘
                      │                                    │
                      ▼                                    ▼
               ┌──────────┐        ┌───────┐ ┌───────┐ ┌───────┐
               │ MongoDB  │        │Witness│ │Witness│ │Witness│
               │ (Atlas / │        │ Node 1│ │ Node 2│ │ Node 3│
               │  local)  │        │ :7001 │ │ :7002 │ │ :7003 │
               └──────────┘        └───────┘ └───────┘ └───────┘
                                    RSA-2048  RSA-2048  RSA-2048
```

---

## Integrity Model — How It Works

### Step 1: Deterministic Payload Construction

Every land record is decomposed into **9 canonical blocks** by `buildHashPayload()`:

| # | Block | Fields |
|---|-------|--------|
| 1 | `identity` | landId, landType, surveyNumber, village, taluk, district, state |
| 2 | `geo` | geoLatitude, geoLongitude |
| 3 | `area` | acres, guntas, sqFt |
| 4 | `owner` | ownerName, ownerId, ownerType, sharePercentage |
| 5 | `transfer` | transferType, transferDate, registrationNumber, subRegistrarOffice, saleValue |
| 6 | `mutation` | status, requestDate, approvalDate |
| 7 | `loan` | loanActive, bankName, loanAmount |
| 8 | `legal` | courtCase, caseNumber, caseStatus |
| 9 | `typeSpecific` | Dynamic block based on landType (Agricultural / Residential / Commercial / Industrial) |

All values are normalized (dates → ISO strings, nulls explicit, keys sorted alphabetically via canonical JSON) to ensure **deterministic hashing**.

### Step 2: Merkle Tree Construction

```
                       Merkle Root
                      /           \
                Hash(H1:H2)    Hash(H3:H4)
                /       \       /       \
             H(id)   H(geo) H(area) H(owner) ...
              │        │       │        │
           identity   geo    area    owner   ← leaf blocks
```

- Each block is serialized to **canonical JSON** (keys sorted recursively)
- Hashed with **SHA-256** to produce a leaf hash
- Leaves are paired and combined bottom-up: `hash(left + ":" + right)`
- If odd number of leaves, the last leaf is duplicated
- The final single hash = **Merkle Root**
- A `leafHashMap` stores `{ blockName → leafHash }` for per-field tamper detection

### Step 3: Witness Consensus (RSA-2048)

```
Backend ──POST /sign {merkleRoot}──▶ Witness Node 1 ──▶ RSA sign ──▶ signature₁
       ──POST /sign {merkleRoot}──▶ Witness Node 2 ──▶ RSA sign ──▶ signature₂
       ──POST /sign {merkleRoot}──▶ Witness Node 3 ──▶ RSA sign ──▶ signature₃
```

- Each Witness generates its own **RSA-2048 key pair** at boot
- Backend sends the Merkle root to all witnesses in parallel
- **Majority rule**: At least `⌊n/2⌋ + 1` signatures required (2 out of 3)
- All valid signatures are stored with the record
- If majority is not reached → **write is rejected**

### Step 4: Verification on Every Read

Every time a record is fetched (admin or public), the system:

1. Rebuilds the payload from current database values
2. Recomputes the full Merkle tree
3. Compares the new root against the stored root
4. If mismatch → compares individual leaf hashes to identify **exactly which blocks were tampered**
5. Returns tampered block names and their current values for audit

> **This means: if someone modifies even ONE field directly in the database, the system detects it instantly.**

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js 18** | Runtime |
| **Express 5** | REST API framework |
| **MongoDB + Mongoose 9** | Document database with rich schema validation |
| **crypto (Node built-in)** | SHA-256 hashing for Merkle tree |
| **jsonwebtoken** | JWT-based admin authentication |
| **bcryptjs** | Password hashing |
| **PDFKit** | Server-side PDF certificate generation |
| **Axios** | HTTP client for witness communication |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite 6** | Build tool & dev server |
| **React Router 7** | Client-side routing |
| **Tailwind CSS 4** | Utility-first styling |
| **Motion (Framer Motion)** | Page & component animations |
| **Lucide React** | Icon system |
| **i18next** | Internationalization (English, Hindi, Kannada) |
| **Sonner** | Toast notifications |
| **TomTom Maps SDK** | Interactive geo-location map for land parcels |
| **Recharts** | Data visualizations |

### Witness Nodes
| Technology | Purpose |
|---|---|
| **Node.js 18** | Runtime |
| **Express 5** | Lightweight HTTP API |
| **crypto (Node built-in)** | RSA-2048 key generation & digital signing |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker + Docker Compose** | Containerized deployment (6 services) |
| **nginx** | Production static file serving + SPA routing |
| **MongoDB 6.0** | Containerized database with persistent volume |

---

## Project Structure

```
AXIOS/
├── docker-compose.yml          # Orchestrates all 6 services
├── README.md                   # ← You are here
│
├── Backend/
│   ├── Dockerfile
│   ├── server.js               # Express entry point
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register & login (bcrypt + JWT)
│   │   ├── landController.js   # Create, fetch, transfer, recompute
│   │   ├── integrityController.js  # Standalone integrity verification
│   │   └── publicController.js # Public lookup + PDF generation
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT Bearer token guard
│   ├── models/
│   │   ├── admin.js            # Admin user schema
│   │   └── land.js             # 295-line land schema (13+ sub-documents)
│   ├── routes/
│   │   ├── authRoutes.js       # POST /register, /login
│   │   ├── landRoutes.js       # CRUD + transfer + witnesses
│   │   ├── integrityRoutes.js  # GET /verify/:landId
│   │   └── publicRoutes.js     # Public lookup + PDF
│   ├── services/
│   │   ├── pdfService.js       # PDFKit land certificate generator
│   │   └── witnessService.js   # Witness orchestration + majority logic
│   ├── utils/
│   │   ├── buildPayload.js     # 9-block deterministic payload builder
│   │   ├── hashUtil.js         # SHA-256 helper
│   │   └── merkleUtil.js       # Merkle tree builder (canonical JSON)
│   └── assets/                 # Logo, tick/wrong images for PDFs
│
├── Frontend/
│   ├── Dockerfile              # Multi-stage: Vite build → nginx
│   ├── nginx.conf              # SPA fallback configuration
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx            # React entry point
│   │   ├── vite-env.d.ts       # VITE_API_BASE_URL type
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── routes.tsx      # Public + Dashboard route tree
│   │   │   ├── lib/
│   │   │   │   ├── api.ts      # Axios client (auth, admin, public, integrity)
│   │   │   │   ├── auth.tsx    # Auth context + JWT management
│   │   │   │   ├── i18n.ts    # i18next (EN / HI / KN)
│   │   │   │   └── theme.tsx  # Dark/light theme provider
│   │   │   ├── pages/
│   │   │   │   ├── PublicLanding.tsx      # Hero + search + carousel
│   │   │   │   ├── PublicLookup.tsx       # Dedicated public search
│   │   │   │   ├── Login.tsx             # Admin login
│   │   │   │   ├── Register.tsx          # Admin registration
│   │   │   │   ├── Dashboard.tsx         # Admin home (stats + actions)
│   │   │   │   ├── CreateLand.tsx        # 8-step land creation wizard
│   │   │   │   ├── LandDetail.tsx        # Full record view + integrity
│   │   │   │   ├── TransferLand.tsx      # Search → tamper check → transfer
│   │   │   │   ├── TransferredLands.tsx  # Transfer history explorer
│   │   │   │   ├── IntegrityVerify.tsx   # Standalone integrity checker
│   │   │   │   ├── Witnesses.tsx         # Live witness node status
│   │   │   │   ├── PrivacyPolicy.tsx     # Legal page
│   │   │   │   ├── TermsOfService.tsx    # Legal page
│   │   │   │   └── ContactSupport.tsx    # Support contact
│   │   │   └── components/
│   │   │       ├── IntegrityBadge.tsx    # Visual integrity status
│   │   │       ├── LandTypeBadge.tsx     # Color-coded land type
│   │   │       ├── MerkleRootDisplay.tsx # Formatted hash display
│   │   │       ├── WitnessCard.tsx       # Individual witness status
│   │   │       ├── TomTomMap.tsx         # Interactive map component
│   │   │       ├── GlowButton.tsx        # Animated CTA button
│   │   │       ├── ThemeToggle.tsx       # Dark/light switcher
│   │   │       ├── LanguageToggle.tsx    # EN/HI/KN switcher
│   │   │       └── layout/
│   │   │           ├── PublicLayout.tsx   # Public pages shell
│   │   │           └── DashboardLayout.tsx # Authenticated layout
│   │   └── public/
│   │       └── locales/          # i18n translation files
│   │           ├── en/translation.json
│   │           ├── hi/translation.json
│   │           └── kn/translation.json
│
└── Witness/
    ├── Dockerfile
    ├── server.js               # RSA key gen + /sign endpoint
    └── package.json
```

---

## Features

### Public Portal (No Login Required)
- **Land Record Search** — Look up any record by Land ID
- **Integrity Verification** — See real-time Merkle root comparison and tamper status
- **PDF Certificate Download** — Blockchain-verified land certificate with status indicators
- **Interactive Map** — TomTom Maps integration showing land geo-coordinates
- **Multi-Language** — English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ)
- **Dark/Light Theme** — Full theme support

### Admin Dashboard (JWT-Protected)
- **Create Land Records** — 8-step wizard covering all 5 land types with type-specific fields
- **View Full Record Detail** — Complete data view with integrity tab and witness signatures
- **Transfer Ownership** — Pre-transfer tamper check → blocks transfer if record is corrupted
- **Transfer History** — Version-by-version ownership audit trail
- **Witness Monitor** — Live status, latency, and health of all 3 witness nodes
- **Recompute Integrity** — Manual re-hash migration tool for legacy records
- **Quick Search** — Dashboard search bar for instant record lookup

### Security & Integrity
- **Merkle Tree Hashing** — SHA-256 with canonical JSON ordering
- **RSA-2048 Witness Signatures** — 3 independent nodes with majority consensus
- **Per-Block Tamper Detection** — Identifies exactly which data section was modified
- **Pre-Transfer Integrity Gate** — Transfers blocked if any tampering detected
- **JWT Authentication** — bcrypt password hashing + Bearer token protection
- **Versioned History** — Append-only ownership snapshots with previous Merkle roots

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new admin |
| `POST` | `/api/auth/login` | Public | Login → returns JWT |

### Land Records (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/admin/land/create` | JWT | Create land + hash + witness sign |
| `GET` | `/api/admin/land/fetch/:landId` | — | Fetch record with live integrity check |
| `POST` | `/api/admin/land/transfer/:landId` | JWT | Transfer ownership (tamper-gated) |
| `POST` | `/api/admin/land/recompute-integrity/:landId` | JWT | Re-hash existing record |
| `GET` | `/api/admin/land/count` | — | Total land record count |
| `GET` | `/api/admin/land/witnesses` | — | Witness node status + latency |
| `GET` | `/api/admin/land/transferred` | JWT | All transferred land records |
| `GET` | `/api/admin/land/history/:landId` | JWT | Ownership version history |

### Public
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/public/land/:landId` | Public | Public-safe land data + integrity |
| `GET` | `/api/public/land/pdf/:landId` | Public | Download PDF certificate |

### Integrity
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/integrity/verify/:landId` | Public | Standalone integrity verification |

### Witness Nodes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/sign` | Sign a Merkle root with RSA-2048 |

---

## Getting Started

### Prerequisites
- **Node.js 18+** and **npm**
- **MongoDB** (local or Atlas)
- **Docker + Docker Compose** (for containerized deployment)

### Local Development (Without Docker)

**1. Clone the repository**
```bash
git clone <repository-url>
cd AXIOS
```

**2. Backend**
```bash
cd Backend
npm install
```

Create `Backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/axios
PORT=5050
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
WITNESS_SERVERS=http://localhost:7001,http://localhost:7002,http://localhost:7003
```

```bash
npm run dev    # Starts with nodemon on :5050
```

**3. Witness Nodes** (in a separate terminal)
```bash
cd Witness
npm install
npm run start:witnesses    # Starts 3 nodes on :7001, :7002, :7003
```

**4. Frontend** (in a separate terminal)
```bash
cd Frontend
npm install
npm run dev    # Starts Vite dev server on :5173
```

Open **http://localhost:5173** in your browser.

---

## Docker Deployment

The entire stack is containerized with a single command.

### Services Overview

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| `mongo` | MongoDB 6.0 | 27017 | Database with persistent volume |
| `backend` | Node.js 18 Alpine | 5050 | Express API server |
| `frontend` | nginx Alpine | 3000 | Static build served by nginx |
| `witness1` | Node.js 18 Alpine | 7001 | RSA witness node #1 |
| `witness2` | Node.js 18 Alpine | 7002 | RSA witness node #2 |
| `witness3` | Node.js 18 Alpine | 7003 | RSA witness node #3 |

### One-Command Launch

```bash
docker compose up -d --build
```

This will:
1. Pull MongoDB 6.0 image
2. Build Backend, Frontend, and 3 Witness images
3. Start all 6 containers with correct networking
4. Backend waits for MongoDB health check before starting
5. Frontend is built with `VITE_API_BASE_URL=http://localhost:5050`

### Verify Everything Works

```bash
# Check all containers are running
docker compose ps

# Test Backend API
curl http://localhost:5050/test
# → {"message":"Server is working"}

# Test Witnesses
curl http://localhost:7001
# → {"status":"Witness running on 7001"}

# Test Frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# → 200

# View logs
docker compose logs -f
```

### Stop & Clean Up

```bash
docker compose down              # Stop all containers
docker compose down -v           # Stop + delete database volume
```

---

## Environment Variables

### Backend (`Backend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | — | MongoDB connection string |
| `PORT` | `5050` | Backend server port |
| `JWT_SECRET` | — | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `1d` | Token expiration duration |
| `WITNESS_SERVERS` | — | Comma-separated witness URLs |

### Frontend (Build-time via Vite)
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:5050` | Backend API base URL |

### Witness Nodes
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `7001` | Witness server port |

---

## Screenshots & UI Flow

### Application Screenshots

<p align="center">
  <img src="Frontend/src/assets/images/Main page.png" alt="main page" width="280" />
  <img src="Frontend/src/assets/images/Public Land data check.png" alt="public" width="280" />
  <img src="Frontend/src/assets/images/Admin Dashboard.png" alt="dashboard" width="280" />
</p>

### Public Flow
```
Landing Page (Hero + Carousel + Search)
        │
        ▼
  Enter Land ID → See Record Details
        │           ├── Integrity Badge (✅ VALID / ❌ TAMPERED)
        │           ├── Owner Details
        │           ├── Land Area & Type
        │           ├── Transfer Info
        │           ├── Interactive Map (TomTom)
        │           └── Download PDF Certificate
        │
        └── Navigate to /verify → Standalone Integrity Checker
```

### Admin Flow
```
Login (/login) → JWT Token
        │
        ▼
  Dashboard (/dashboard)
        ├── Land Count + Witness Status
        ├── Quick Actions:
        │     ├── Create New Land → 8-step wizard → Hashed + Witness Signed
        │     ├── Search Record → Full Detail View
        │     ├── Transfer Ownership → Tamper Check → Form → Execute
        │     ├── Verify Integrity → Block-level analysis
        │     └── View Transferred Lands → Version History
        │
        └── Witness Monitor → Live status of all 3 nodes
```

### Transfer Security Gate
```
Search by Land ID
        │
        ▼
  ┌─ Integrity Check ───────────────────┐
  │  Recompute Merkle Root from DB      │
  │  Compare with stored root           │
  │                                     │
  │  ✅ MATCH → Proceed to form        │
  │  ❌ MISMATCH → BLOCKED             │
  │     Show tampered blocks:           │
  │     ├── Owner Block ⚠️             │
  │     ├── Transfer Block ⚠️          |
  │     └── Field-level values shown    |
  └─────────────────────────────────────┘
```

---

## Team

| Name | Email |
|------|-------|
| **Sialampalli** | sialampalli2005@gmail.com |
| **Bhuvan S Shetty** | bhuvansshetty90@gmail.com |
| **Chirag** | anandchirag24@gmail.com | 
| **Bhavani K S** | krupaintros@gmail.com |
---

<p align="center">
  <strong>Built with blockchain principles — not a blockchain, but the same guarantees.</strong>
</p>
