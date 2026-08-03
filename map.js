const API_URL =
  "https://script.google.com/macros/s/AKfycbyw_cSUkVk7F1wP2vnwcwYs2sg9TuAvwU6kmnBM3taOMySO1ssBOLCpOAmhicke-THZ/exec";

const $ = (selector) => document.querySelector(selector);

let cities = [];
let selected = "";
let query = "";
let type = "all";

function numberValue(value) {
  if (value === null || value === undefined || value === "") {
    return NaN;
  }

  return Number(String(value).replace(/[%,$]/g, "").trim());
}

function normalizeCity(city) {
  return {
    id: String(city.id || city.city_id || "").trim(),
    city: String(city.city || city.display_name || "").trim(),
    state: String(city.state || "").trim(),
    type: String(
      city.type ||
      city.community_type ||
      city.acp_community_type ||
      ""
    ).trim(),
    lat: numberValue(city.lat ?? city.latitude),
    lon: numberValue(city.lon ?? city.lng ?? city.longitude),
    eligible: numberValue(
      city.eligible ??
      city.eligible_youth_share ??
      city.cvap_age_18_29_share
    ),
    actual: numberValue(
      city.actual ??
      city.actual_youth_share ??
      city.voter_age_18_29_share
    ),
    yrr: numberValue(
      city.yrr ??
      city.youth_representation_ratio
    ),
    featured: Boolean(city.featured)
  };
}

function color(yrr) {
  if (yrr >= 1) return "#69b84f";
  if (yrr >= 0.75) return "#ffd31f";
  if (yrr >= 0.5) return "#ff6c2f";
  return "#ef5ba1";
}

function filteredCities() {
  const search = query.trim().toLowerCase();

  return cities.filter((city) => {
    const matchesSearch =
      !search ||
      city.city.toLowerCase().includes(search) ||
      city.state.toLowerCase().includes(search);

    const matchesType =
      type === "all" ||
      city.type === type;

    return matchesSearch && matchesType;
  });
}

function renderMap() {
  const list = filteredCities();

  const trace = {
    type: "scattergeo",
    mode: "markers",

    lat: list.map((city) => city.lat),
    lon: list.map((city) => city.lon),
    text: list.map((city) => `${city.city}, ${city.state}`),

    customdata: list.map((city) => [
      city.id,
      city.yrr,
      city.eligible,
      city.actual,
      city.type
    ]),

    marker: {
      size: list.map((city) => city.id === selected ? 20 : 14),
      color: list.map((city) => color(city.yrr)),
      line: {
        color: "#071a3d",
        width: 1.5
      }
    },

    hovertemplate:
      "<b>%{text}</b>" +
      "<br>YRR: %{customdata[1]:.2f}" +
      "<br>Eligible youth share: %{customdata[2]}%" +
      "<br>Actual youth share: %{customdata[3]}%" +
      "<br>%{customdata[4]}" +
      "<extra></extra>"
  };

  const layout = {
    geo: {
      scope: "usa",

      projection: {
        type: "albers usa"
      },

      showland: true,
      landcolor: "#f8f3e9",

      showsubunits: true,
      subunitcolor: "#071a3d",
      subunitwidth: 1.2,

      showlakes: false,
      bgcolor: "#fbf7ef"
    },

    paper_bgcolor: "#fbf7ef",

    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 0
    },

    dragmode: "pan"
  };

  const config = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      "select2d",
      "lasso2d"
    ]
  };

  Plotly.react("map", [trace], layout, config);

  const map = $("#map");

  if (typeof map.removeAllListeners === "function") {
    map.removeAllListeners("plotly_click");
  }

  map.on("plotly_click", (event) => {
    selected = event.points[0].customdata[0];
    renderMap();
  });
}

async function init() {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(
        data.message || "The API returned an error."
      );
    }

    cities = (data.cities || [])
      .map(normalizeCity)
      .filter((city) =>
        city.id &&
        Number.isFinite(city.lat) &&
        Number.isFinite(city.lon) &&
        Number.isFinite(city.eligible) &&
        Number.isFinite(city.actual) &&
        Number.isFinite(city.yrr)
      );

    if (!cities.length) {
      throw new Error(
        "No publishable city data was returned."
      );
    }

    selected =
      cities.find((city) => city.featured)?.id ||
      cities[0].id;

    const types = [
      ...new Set(
        cities
          .map((city) => city.type)
          .filter(Boolean)
      )
    ].sort();

    $("#typeFilter").insertAdjacentHTML(
      "beforeend",
      types
        .map((cityType) =>
          `<option value="${cityType}">${cityType}</option>`
        )
        .join("")
    );

    $("#citySearch").addEventListener("input", (event) => {
      query = event.target.value;
      renderMap();
    });

    $("#typeFilter").addEventListener("change", (event) => {
      type = event.target.value;
      renderMap();
    });

    renderMap();
  } catch (error) {
    console.error("Who Decides data failed to load:", error);
    $("#mapError").hidden = false;
  }
}

init();
