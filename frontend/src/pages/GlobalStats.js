import React, { useState } from "react";
import { Container } from "react-bootstrap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import "../styles/GlobalStats.css";

const geoUrl =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

// Headline Data
const headlineStat = {
  value: "$1.3 Trillion",
  label: "Estimated Annual Global Cost of Crop Loss",
};

// Charts Data
const lossByRegion = [
  { name: "Asia", Loss: 40 },
  { name: "Africa", Loss: 25 },
  { name: "N. America", Loss: 15 },
  { name: "S. America", Loss: 10 },
  { name: "Europe", Loss: 8 },
  { name: "Oceania", Loss: 2 },
];

const lossByCause = [
  { name: "Pests & Insects", value: 45 },
  { name: "Plant Diseases", value: 30 },
  { name: "Drought & Climate", value: 15 },
  { name: "Other", value: 10 },
];

// Map Data (Crop Health Index)
const mapData = [
  { ISO3: "IND", value: 85 },
  { ISO3: "CHN", value: 90 },
  { ISO3: "PAK", value: 70 },
  { ISO3: "USA", value: 75 },
  { ISO3: "BRA", value: 80 },
  { ISO3: "AUS", value: 60 },
  { ISO3: "CAN", value: 65 },
  { ISO3: "RUS", value: 78 },
];

// Map Color Scale
const colorScale = scaleLinear().domain([0, 100]).range(["#a4fba6", "#2c5f2d"]);
const PIE_COLORS = ["#dc3545", "#ffc107", "#fd7e14", "#6c757d"];

function GlobalStats() {
  const [tooltipContent, setTooltipContent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);

  // === Handle Country Click ===
  const handleCountryClick = (geo) => {
    const isoCode = geo.properties.ISO_A3;
    const data = mapData.find((s) => s.ISO3 === isoCode);
    const countryName = geo.properties.ADMIN || "Unknown";
    const indexValue = data ? data.value : "No Data";
    setSelectedCountry({ name: countryName, value: indexValue });
  };

  return (
    <div className="stats-dashboard">
      <Container fluid>
        <h1 className="stats-title text-center">
          🌍 Global Agricultural Insights
        </h1>

        <div className="stats-grid">
          {/* === HEADLINE + MAP SECTION === */}
          <div className="headline-map-row">
            {/* Headline Card */}
            <div className="stat-card glass-box headline">
              <div className="stat-value">{headlineStat.value}</div>
              <div className="stat-label">{headlineStat.label}</div>
            </div>

            {/* Map Card */}
            <div className="stat-card glass-box map-card">
              <h3 className="chart-title">Crop Health Index by Country</h3>
              <div className="map-container">
                <ComposableMap projectionConfig={{ scale: 140 }}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const isoCode = geo.properties.ISO_A3;
                        const d = mapData.find((s) => s.ISO3 === isoCode);
                        const fillColor = d ? colorScale(d.value) : "#e9ecef";
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fillColor}
                            stroke="#0a0a0a"
                            strokeWidth={0.5}
                            onMouseEnter={() => {
                              const name = geo.properties.ADMIN || "Unknown";
                              const valueText = d
                                ? `Index: ${d.value}`
                                : "No Data";
                              setTooltipContent(`${name} — ${valueText}`);
                            }}
                            onMouseLeave={() => setTooltipContent("")}
                            onClick={() => handleCountryClick(geo)}
                            style={{
                              default: { outline: "none", cursor: "pointer" },
                              hover: {
                                fill: "#00ff99",
                                stroke: "#fff",
                                strokeWidth: 1,
                              },
                              pressed: { fill: "#007bff" },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>

                  {/* === Key Country Labels === */}
                  <Annotation subject={[78, 22]} dx={-10} dy={-15}>
                    <text
                      x="-10"
                      textAnchor="end"
                      fill="#00ffa3"
                      fontSize={10}
                      fontWeight="600"
                    >
                      India
                    </text>
                  </Annotation>
                  <Annotation subject={[103, 35]} dx={-10} dy={-10}>
                    <text
                      x="-10"
                      textAnchor="end"
                      fill="#00ffa3"
                      fontSize={10}
                      fontWeight="600"
                    >
                      China
                    </text>
                  </Annotation>
                  <Annotation subject={[70, 30]} dx={-10} dy={-10}>
                    <text
                      x="-10"
                      textAnchor="end"
                      fill="#00ffa3"
                      fontSize={10}
                      fontWeight="600"
                    >
                      Pakistan
                    </text>
                  </Annotation>
                </ComposableMap>

                {/* Tooltip on Hover */}
                {tooltipContent && (
                  <div className="map-tooltip">{tooltipContent}</div>
                )}
              </div>

              {/* Country Info Card */}
              {selectedCountry && (
                <div className="country-info glass-box">
                  <h4>{selectedCountry.name}</h4>
                  <p>
                    Crop Health Index:{" "}
                    <strong>
                      {selectedCountry.value === "No Data"
                        ? "No Data Available"
                        : selectedCountry.value}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* === CHARTS SECTION === */}
          <div className="charts-row">
            {/* Pie Chart */}
            <div className="stat-card glass-box small-chart">
              <h3 className="chart-title">Primary Causes of Crop Loss</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={lossByCause}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {lossByCause.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "var(--background-secondary)",
                      border: "1px solid var(--border-color)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="stat-card glass-box large-chart">
              <h3 className="chart-title">Estimated Loss by Region (%)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={lossByRegion}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <ReTooltip
                    contentStyle={{
                      backgroundColor: "var(--background-secondary)",
                      border: "1px solid var(--border-color)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Loss" fill="var(--accent-color)" barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default GlobalStats;
