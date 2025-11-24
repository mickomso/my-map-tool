# My Map Tool

A modern web application for visualizing map data, built with Meteor, React, and Mapbox GL.

## Features

- **Interactive Map**: Full-screen map visualization using [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/).
- **Layer Management**:
  - Floating sidebar with expandable layer groups.
  - Toggle visibility for layers and sublayers.
  - Parent/Child visibility propagation (toggling a parent toggles all children).
- **State Management**: Powered by [Zustand](https://github.com/pmndrs/zustand) for efficient, global state handling.
- **UI Components**: Built with [Material UI (MUI)](https://mui.com/) for a polished look and feel.
- **Configuration**: Easy setup via `settings.json` for Mapbox tokens and default views.
- **Automated Versioning**: Semantic-release integration.

## Tech Stack

- **Framework**: Meteor v3
- **Frontend**: React 18
- **Map Library**: React Map GL (Mapbox wrapper)
- **State Management**: Zustand
- **UI Library**: Material UI (MUI) v6
- **Linting**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js (v20 recommended)
- Meteor installed (`npm install -g meteor`)
- A [Mapbox Access Token](https://account.mapbox.com/)

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    meteor npm install
    ```

### Configuration

Create or update `settings.json` in the root directory. You **must** provide your Mapbox Access Token here.

```json
{
  "public": {
    "mapbox": {
      "accessToken": "YOUR_MAPBOX_ACCESS_TOKEN_HERE",
      "defaultCenter": {
        "lng": -3.7038,
        "lat": 40.4168
      },
      "defaultZoom": 12,
      "styleURL": "mapbox://styles/mapbox/streets-v12"
    }
  }
}
```

### Running the App

Start the development server with the settings file:

```bash
npm start
# OR
meteor run --settings settings.json
```

The application will be available at `http://localhost:3000`.

## Project Structure

- `client/` - Client-side code (React components, stores, styles).
  - `components/` - UI components (Map, Sidebar).
  - `stores/` - Zustand stores (layerStore).
  - `imports/` - Shared imports.
- `server/` - Server-side code.
- `settings.json` - Configuration file (ignored by git, use example).

## Versioning

This project uses **semantic-release** with **conventional commits**.

- `feat:` New feature (Minor version)
- `fix:` Bug fix (Patch version)
- `chore:` Maintenance (No version change)

Example: `git commit -m "feat: add sidebar layer control"`
