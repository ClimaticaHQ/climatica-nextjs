<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
  <img src="./src/assets/climatica-logo.svg" alt="Climatica Logo" width="50" style="flex-shrink: 0;" />
  <h1 style="margin: 0; padding: 0; line-height: 1.2;">Climatica – Global Climate Explorer</h1>
</div>

**Climatica** is an interactive web application that allows you to explore, analyze, and compare climate data from around the world. Whether you're a student studying climate patterns, a researcher analyzing weather trends, or simply curious about climate statistics in different regions, Climatica provides powerful tools to visualize and understand global climate data.

## <span style="background-color: #0F6E56; padding: 5px 15px">Table of Contents</span>

- [Features](#-features)
- [Installation for Regular Users](#-installation-for-regular-users)
- [Installation for Developers](#-installation-for-developers)
- [License](#-license)

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Features</span>

### City Climate Statistics

- **Search for any city worldwide** and instantly see detailed climate information
- **Monthly temperature and precipitation charts** with visual graphs
- **Key statistics displayed**: Average high/low temperatures, total precipitation, data resolution
- **Interactive map** showing the selected city's location
- **One-click geolocation** – use your current location to see local climate data

### Compare Cities

- **Compare up to two cities side-by-side** to see climate differences
- **Statistical comparison cards** showing which city is warmer, wetter, etc.
- **Overlaid charts** for easy visual comparison of temperature and precipitation patterns
- **Monthly breakdown** to spot seasonal differences

### Compare Periods

- **Compare two climate periods for the same city** to visualize change over time
- **Side-by-side charts** for temperature and precipitation across different 30-year baselines
- **Difference indicators** highlighting how the climate has shifted between periods

### Regional Heatmap Analysis

- **Draw custom regions** (bounding boxes or polygons) on an interactive map
- **Heatmap visualization** showing temperature or precipitation distribution
- **Bulk statistics** for selected regions – minimum, maximum, average, median, and standard deviation
- **Regional climate profile** – mean temperature, annual precipitation, aridity index
- **Data density information** – see how many data points were analyzed

### Flexible Data Controls

- **Climate periods**: View historical climate data from different 30-year periods (1951–2020)
- **Weather data**: Access actual recorded weather data from 1951 to 2024
- **Multiple climate variables**: Temperature (max, min, average), Precipitation, Solar Radiation, Wind Speed, Vapor Pressure
- **Grid resolutions**: Choose data detail level (10m, 5m, 2.5m, 30s) based on your needs
- **Monthly filtering**: Analyze specific months or all months combined

### Multilingual Support

- **English, Spanish, and Ukrainian** – seamless language switching
- Entire interface translated – search, charts, statistics, buttons

### Export Your Analysis

- **Save climate charts as images** (PNG format)
- **Download statistical data** for further analysis in spreadsheets or analysis tools

---

## <span style="background-color: #0F6E56; padding: 5px 15px">Installation for Regular Users</span>

This section is for people who just want to use the application. **No coding knowledge required!**

### Setup Instructions

#### Step 1: Install Node.js (One Time Only)

Node.js is software that runs the application on your computer. You only need to install it once.

1. Go to [nodejs.org](https://nodejs.org/)
2. Click the **LTS (Long Term Support)** button – the larger green button
3. Download and run the installer
4. Follow the installation wizard – just click "Next" for all defaults
5. Restart your computer after installation

**Verify it worked**: Open Terminal (Mac) or Command Prompt (Windows) and type:

```bash
node --version
```

You should see a version number like `v20.10.0`. If it works, move to Step 2!

#### Step 2: Get the Application Files

1. Download this project as a ZIP file from GitHub
2. Unzip it to a folder on your computer (e.g., `Desktop` or `Documents`)
3. Remember where you saved it

#### Step 3: Configure Environment Variables

1. In the project folder, create a file named `.env.local`
2. Add the following content (replace the placeholder with your actual WorldClim API key):

```env
WORLDCLIM_API_KEY=your-worldclim-api-key
```

#### Step 4: Run the Application

1. **Open Terminal/Command Prompt**
   - **Mac**: Press `Cmd + Space`, type "terminal", press Enter
   - **Windows**: Press `Win + R`, type "cmd", press Enter

2. **Navigate to the application folder** by typing:

   ```bash
   cd path/to/climatica-next-app
   ```

   Replace `path/to/climatica-next-app` with your actual folder location.

   Example on Mac:

   ```bash
   cd ~/Desktop/climatica-next-app
   ```

   Example on Windows:

   ```bash
   cd C:\Users\YourName\Downloads\climatica-next-app
   ```

3. **Install dependencies** (first time only, takes 1-2 minutes):

   ```bash
   npm install
   ```

4. **Start the application**:

   ```bash
   npm run dev
   ```

5. **Open in your browser**: You'll see a message like:
   ```
   Local:   http://localhost:3000
   ```
   Click that link or paste it in your browser. The application will open!

#### Step 5: Stop the Application

When you're done, press `Ctrl+C` (or `Cmd+C` on Mac) in Terminal/Command Prompt.

#### Running Again Next Time

Next time you want to use the application, just repeat Step 4 (the `npm run dev` part). You don't need to run `npm install` again.

### <mark style="padding: 2px 12px">Troubleshooting for Regular Users</mark>

**"Command not found"**  
Make sure you've installed Node.js and restarted your computer.

**"Port 3000 is already in use"**  
The application is already running elsewhere. Try again in 5 seconds or restart your computer.

**"npm: command not found"**  
Node.js didn't install correctly. Uninstall it and reinstall from [nodejs.org](https://nodejs.org/).

**"Nothing shows up in the browser"**  
Wait 10 seconds for the application to fully load, then refresh the browser (Cmd+R or Ctrl+R).

---

## <span style="background-color: #1D9E75; padding: 5px 15px">Installation for Developers</span>

This section is for developers who want to work on the code.

### Prerequisites

- **Node.js** v18+ ([nodejs.org](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **Git** (for cloning the repository)
- A code editor like [VS Code](https://code.visualstudio.com/)

### Setup Instructions

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd climatica-next-app
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# WorldClim API key — server-only, never exposed to the browser
WORLDCLIM_API_KEY=your-worldclim-api-key

# Optional: backend URL override (defaults work for local dev)
NEXT_PUBLIC_BASE_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_BASE_API_PREFIX=/api

# Optional: Upstash Redis for API response caching
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> **Note**: `WORLDCLIM_API_KEY` has no `NEXT_PUBLIC_` prefix — it is server-only and never sent to the browser. All external API calls go through Next.js Route Handlers in `src/app/api/`.

**Getting a WorldClim API Key**:

1. Visit [worldclim.org](https://www.worldclim.org/)
2. Register for an account
3. Copy your API key
4. Paste it in `.env.local` above

#### Step 4: Start Development

```bash
npm run dev
```

Development server runs at `http://localhost:3000` with hot reload enabled.

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format

# Check everything (type-check + lint + format:check)
npm run check
```

### Project Structure

```
climatica-next-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # Route Handlers (server-side API proxy)
│   │   │   ├── worldclim/        # WorldClim API proxy endpoints
│   │   │   └── cities/           # City search endpoints
│   │   ├── climate-statistics/   # City climate statistics page
│   │   ├── compare-cities/       # Side-by-side city comparison page
│   │   ├── compare-periods/      # Climate period comparison page
│   │   ├── heat-map/             # Regional heatmap analysis page
│   │   ├── layout.tsx            # Root layout (Navbar, Sidebar, Providers)
│   │   ├── page.tsx              # Root redirect
│   │   └── providers.tsx         # TanStack Query + i18n providers
│   ├── api/                      # API services & axios configuration
│   │   ├── services/             # WorldClim & Wikidata service calls
│   │   └── axiosConfig.ts        # HTTP client setup
│   ├── components/               # Shared UI components
│   │   ├── Navbar/               # Top navigation
│   │   ├── Sidebar/              # Filter controls
│   │   ├── LeafletMap/           # Interactive map (imperative Leaflet)
│   │   └── ...                   # Other shared components
│   ├── features/                 # Feature-specific components
│   │   ├── CompareCities/
│   │   ├── ComparePeriods/
│   │   └── HeatMap/
│   ├── hooks/                    # Custom React hooks
│   │   ├── data/                 # Data fetching hooks (TanStack Query)
│   │   └── ui/                   # UI state hooks
│   ├── stores/                   # Zustand state management
│   │   └── filtersStore.ts       # Filter selections (dataset, period, variables)
│   ├── constants/                # Static values (*.constant.ts)
│   ├── enums/                    # TypeScript enums (*.enum.ts)
│   ├── types/                    # TypeScript type definitions (*.type.ts)
│   ├── utils/                    # Utility functions (*.util.ts)
│   ├── validators/               # Zod validation schemas
│   ├── i18n/                     # Internationalization (en, es, uk)
│   ├── libs/                     # Third-party library wrappers
│   └── styles/                   # Global CSS & design tokens
├── .example.env                  # Example environment variables
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.js              # ESLint configuration
├── prettier.config.js            # Prettier configuration
└── package.json                  # Dependencies & scripts
```

### Key Technologies

| Technology                  | Purpose                           |
| --------------------------- | --------------------------------- |
| **Next.js 16**              | Full-stack framework (App Router) |
| **React 19**                | UI framework                      |
| **TypeScript**              | Type-safe JavaScript              |
| **TanStack Query v4**       | Data fetching & caching           |
| **Zustand v5**              | Client state management           |
| **Tailwind CSS v4**         | Styling                           |
| **Leaflet + React Leaflet** | Interactive maps                  |
| **Recharts**                | Data visualization                |
| **i18next**                 | Multilingual support              |
| **Axios**                   | HTTP client                       |
| **Zod**                     | Schema validation                 |
| **Upstash Redis**           | Server-side API response cache    |

### Data Flow

```
Component
   ↓
Custom Hook (src/hooks/)
   ↓
TanStack Query (caching, staleTime: Infinity for WorldClim)
   ↓
API Service (src/api/services/)
   ↓
Axios → Next.js Route Handler (src/app/api/)
   ↓
WorldClim / Wikidata APIs
```

**Key Rules**:

- Components **never** import services directly – always go through hooks
- All data fetching uses `useQuery` with `staleTime: Infinity`
- External API calls go through Next.js Route Handlers – the WorldClim API key never reaches the browser
- Server state via TanStack Query, UI filter state via Zustand, navigation/selection state via URL search params

### Architecture Notes

- **Server vs. Client Components**: Pages default to server components; `"use client"` is added only when hooks, events, or browser APIs are needed
- **Leaflet Maps**: All Leaflet components use `dynamic(() => import(...), { ssr: false })` and imperative initialization with a `if (mapRef.current) return` guard to prevent double-initialization
- **Environment Variables**: All env vars are validated with Zod in `src/env.ts`. Never read `process.env` directly — use `GLOBAL_CONFIG` from `src/app/globalConfig.ts`

### Code Standards

**Naming Conventions**:

- Types: `T` prefix — `TClimatePeriod`
- Component props: `Props` suffix — `SearchBarProps`
- Enums: `E` prefix — `EDataset`
- Files: PascalCase for components, camelCase for utilities

**File Placement Rules**:

- Types → `*.type.ts` files only
- Enums → `*.enum.ts` files in `src/enums/`
- Constants → `*.constant.ts` files in `src/constants/`
- Utilities → `*.util.ts` files

**Quality Checks**:

```bash
npm run check   # Runs type-check, lint, format:check
```

**Git Commit Format**:

```
type(scope): message

Examples:
feat(sidebar): add precipitation toggle
fix(map): resolve marker offset
refactor(hooks): simplify useGetClimateData
```

### External APIs

**WorldClim Climate Data**

- Base: `https://scrapi.gsic.uva.es/apis/worldclim`
- Auth: Bearer token (`WORLDCLIM_API_KEY` — server-only)
- Data: Global climate & weather grids (1951–2024)
- Accessed via Route Handlers in `src/app/api/worldclim/`

**Wikidata**

- Base: `https://www.wikidata.org/w/api.php` + SPARQL endpoint
- Auth: None required
- Data: City search, geolocation reverse lookup, population data

### Developer Troubleshooting

**`npm install` fails**

```bash
npm cache clean --force
npm install
```

**Port 3000 already in use**

```bash
npm run dev -- --port 3001
```

**TypeScript errors**  
In VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

**Browser cache issues**  
Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

**WorldClim API returns 401**  
Check that `WORLDCLIM_API_KEY` is set in `.env.local` (not `.env`) and restart the dev server.

---

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

---

## Author

**Andrii Kononenko** (wastardy)  
Email: wastardy.k@gmail.com

---

## Need Help?

### For Regular Users

- Check your internet connection
- Try restarting the application
- Make sure Node.js was installed correctly
- Clear your browser cache and refresh

### For Developers

- Review browser console errors (F12)
- Verify environment variables in `.env.local`
- Ensure internet connection for API calls
- Check that the WorldClim API key is valid and has no surrounding whitespace

---

**Last Updated**: May 2026  
**Current Version**: 1.0.0
