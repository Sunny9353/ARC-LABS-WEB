# ARC LABS Website — Component-Based React App

## Folder Structure

```
arclabs-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                    ← Entry point (imports global CSS)
    ├── App.jsx                     ← React Router — all routes here
    │
    ├── styles/                     ← ALL CSS files (one per page/component)
    │   ├── global.css              ← Design tokens, resets, shared animations
    │   ├── Navbar.css
    │   ├── Footer.css
    │   ├── Home.css
    │   ├── Programs.css            ← Extract from ProgramsPage.jsx
    │   ├── Products.css            ← Extract from ProductsPage.jsx
    │   ├── LabPackages.css         ← Extract from LabPackagesPage.jsx
    │   ├── CSRPartners.css         ← Extract from CSRPartnersPage.jsx
    │   └── Certification.css
    │
    ├── data/
    │   └── constants.js            ← All shared data: technologies, states, etc.
    │
    ├── utils/
    │   └── helpers.js              ← Pure functions: cert ID, pincode, dates
    │
    ├── components/                 ← Reusable components
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── CertificateCard.jsx     ← Printable certificate display
    │   ├── VerifyPanel.jsx         ← Certificate ID lookup
    │   └── RegisterPanel.jsx       ← 3-step registration form
    │
    └── pages/                      ← One file per route
        ├── Home.jsx
        ├── Programs.jsx
        ├── Products.jsx
        ├── LabPackages.jsx
        ├── CSRPartners.jsx
        └── Certification.jsx
```

## Quick Start

```bash
cd arclabs-app
npm install
npm run dev
# App opens at http://localhost:3000
```

## Routes

| URL            | Page           |
|----------------|----------------|
| `/`            | Home           |
| `/programs`    | Programs       |
| `/products`    | Products       |
| `/lab-packages`| Lab Packages   |
| `/csr-partners`| CSR Partners   |
| `/verify`      | Certification  |

## How to Add Programs / Products / CSR Pages

Each of those 3 pages has its full content in the original files:
- `arclabs-website/ProgramsPage.jsx`
- `arclabs-website/ProductsPage.jsx`
- `arclabs-website/LabPackagesPage.jsx`
- `arclabs-website/CSRPartnersPage.jsx`

**Steps to migrate each:**

1. Open the old file (e.g. `ProductsPage.jsx`)
2. Find the `const css = \`...\`` string at the top
3. Paste that CSS content into a new file: `src/styles/Products.css`
4. In the page file (`src/pages/Products.jsx`):
   - Remove the `const css = ...` variable
   - Remove the `<style>{css}</style>` line
   - Add at top: `import "../styles/Products.css";`
   - Copy all the sub-functions and the main export from the old file
5. Remove any `<style>` or inline css injection

## Key Design Tokens (global.css)

```css
--teal:   #00E8D4   /* primary accent */
--lime:   #7DFF6B   /* success, verified */
--gold:   #FFD166   /* warnings, CSR */
--violet: #A855F7   /* institution type */
--rose:   #FF5C87   /* errors, required */
--amber:  #FFA843   /* basic performance */
--fog:    #7878A0   /* secondary text */
--mist:   #AAABCC   /* tertiary text */
```

## Certification System

- **Register**: 3-step form → generates `ARC` + 4 random chars (e.g. `ARC7K9P`)
- **Verify**: Lookup by certificate ID → renders full digital certificate
- **Storage**: `localStorage` (`arclabs_certs`) — persists across sessions
- **Pincode**: Auto-fetches city/state from India Post API with local map fallback
- **Demo IDs**: `ARC4F2K`, `ARC7K9P`, `ARCM3XQ`

## Certificate Paid-Student Upload Workflow

- **Upload Paid Students**: `/verify` -> `Upload Paid Students`. Google admin sign-in is required. Allowed uploader email: `techarclab@gmail.com`. Upload `.xlsx`, `.xls`, or `.csv` for each workshop/training session.
- **Primary Key**: `Roll No` / `Registration Number` + `Workshop / Session Code`. This allows the same student to attend multiple different workshops without overwriting earlier records.
- **Register**: Students open `/verify` -> `Register Certificate`, enter their roll/registration number and workshop/session code, and can register only if that combined record exists in the uploaded paid-student list and is marked paid.
- **Verify**: Lookup works with Certificate ID. Roll-based lookup for repeated workshops uses `ROLL_SESSIONCODE`.
- **Storage**: Certificate records are stored in Firestore collection `certificates`; paid-student upload records are stored in `certificateEligibleRegistrations`.

### Excel Upload Format

Required column:

- `Roll No` or `Registration Number`

Optional columns:

- `Name` or `Full Name`
- `Phone` or `Mobile`
- `Email`
- `Institution` or `College`
- `Institution Type`
- `Technology`, `Course`, `Program`, or `Workshop`
- `Duration` or `Duration Days`
- `Training Date`
- `Paid`, `Fee Paid`, `Payment Status`, or `Status`

Paid values accepted: `paid`, `yes`, `true`, `1`, `completed`, `success`.
Unpaid values blocked: `unpaid`, `no`, `false`, `0`, `pending`, `failed`.

### How To Upload For Every Workshop

1. Prepare the Excel sheet with one row per paid/registered student.
2. Make sure each row has a unique `Roll No` or `Registration Number`.
3. Create a unique workshop/session code, for example `CMRTC-IOT-JUN2026`.
4. Open the website `/verify` page.
5. Select `Upload Paid Students` and sign in with Google as `techarclab@gmail.com`.
6. Enter the workshop/session code.
7. Choose the Excel/CSV file and check the preview.
8. Click `Upload to Database`.
9. Ask students to open `/verify`, select `Register Certificate`, and enter the same roll/registration number and workshop/session code.

Security note: upload requires Google sign-in as `techarclab@gmail.com` or a Firebase Auth user with custom claim `admin: true`. For stronger protection against fake certificate creation, move certificate registration into a Cloud Function that verifies eligibility and writes both records server-side in one transaction.
