# VisualAmeco Frontend

## Overview

VisualAmeco is a web application designed for visualizing and interacting with macroeconomic data sourced from the AMECO database via a backend API. The frontend allows users to dynamically select various data dimensions, view data in charts, perform custom calculations between data series, and customize the appearance of these visualizations.

## Screenshots

![AmecoSelection](https://github.com/user-attachments/assets/0046ae5b-1130-4d34-95f6-535cd124b653)

![AmecoPlot](https://github.com/user-attachments/assets/ca342ced-d594-4685-81a3-ed43e50d910d)


## Key Features

* **Dynamic Data Selection:**
    * Multi-select filters for Countries, Chapters, Subchapters, Variables, and Years.
    * Selected variables persist even if their parent chapter/subchapter context changes.
    * Contextual fetching of available variables based on chapter/subchapter selections.
* **Interactive Charting:**
    * Visualization of selected indicators and user-calculated series using [Recharts](https://recharts.org/).
    * Support for multiple Y-axes (up to 4, with alternating orientation) to display series with different units or scales simultaneously.
    * Lines styled (e.g., dashed) based on their Y-axis group.
* **Data Calculation:**
    * Users can define and display new series based on calculations between existing data series (e.g., Series A / Series B).
* **Chart Customization:**
    * Toggle visibility of data points (dots) on chart lines.
    * Rename Y-axis labels directly on the chart (editable labels).
    * Customize series names displayed in the legend and tooltips.
* **SVG Export:**
    * Download the current chart view (including a reconstructed legend and background) as an SVG image file.
* **State Management:**
    * Utilizes Zustand for sliced, modular global state management (`filterSelectionsStore`, `chartSeriesStore`, `chartUISettingsStore`, `themeStore`).
* **Data Fetching:**
    * Uses React Query (TanStack Query) for managing server state and fetching API data.

## Technology Stack

* **Core:** React (with TypeScript)
* **Charting:** Recharts
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Data Fetching / Server State:** React Query (TanStack Query)
* **Build Tool:** Vite

## Prerequisites

Before you begin, ensure you have the following installed on your system:
* [Node.js](https://nodejs.org/) (which includes npm). It's recommended to use a recent LTS version.
## Getting Started (Local Development)

1.  **Clone the Repository:**
    ```bash
    git clone repository-url
    cd VisualAmecoVisualizerFE
    ```

2.  **Install Dependencies:**
    Using npm:
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    The application requires a backend API to fetch data.
    * Run API via https://github.com/konradeconomics/VisualAmeco

4.  **Run the Development Server:**
    Using npm:
    ```bash
    npm run dev 
    ```

5.  **Access the Application:**
    Once the development server is running, it will output a local URL. Open your web browser and navigate to:
    [http://localhost:5173](http://localhost:5173) (Default for Vite)
    Check your terminal output for the correct URL.
