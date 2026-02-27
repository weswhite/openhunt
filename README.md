# OpenHunt

Colorado big game draw odds and preference point data, searchable and free.

Built from publicly available [CPW draw recap PDFs](https://cpw.state.co.us/learn/Pages/BigGameStatistics.aspx).

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Frontend

```bash
npm install
npm run dev
```

Runs on [http://localhost:5180](http://localhost:5180).

### Server

```bash
cd server
npm install
npm run ingest   # parse CPW PDFs and populate the database
npm run dev
```

Runs on [http://localhost:3001](http://localhost:3001). The frontend proxies `/api` requests to the server in development.

### Docker

```bash
cd server
docker compose up
```

## Project Structure

```
src/               # React frontend (Vite + Tailwind)
server/
  src/
    routes/        # Express API routes
    db/            # Drizzle ORM schema + SQLite
    ingest/        # PDF parsing and data ingestion
```

## Data

All data comes from Colorado Parks & Wildlife public draw recap PDFs. The SQLite database is not checked in — run `npm run ingest` in the server directory to build it from source.

## License

[MIT](LICENSE)
