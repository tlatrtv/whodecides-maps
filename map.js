const trace = {
    type: "scattergeo",

    mode: "markers",

    lon: [-118.2437],

    lat: [34.0522],

    text: ["Los Angeles"],

    hovertemplate:
        "<b>%{text}</b><extra></extra>",

    marker: {
        size: 12,
        color: "#2b6cb0",
        line: {
            color: "white",
            width: 1
        }
    }
};

const layout = {

    title: "Who Decides",

    geo: {
        scope: "usa",

        projection: {
            type: "albers usa"
        },

        showland: true,

        landcolor: "#f5f5f5",

        subunitcolor: "#cccccc",

        countrycolor: "#999999",

        showsubunits: true,

        showcountries: false,

        lakecolor: "#ffffff",

        showlakes: true
    },

    margin: {
        l: 0,
        r: 0,
        t: 50,
        b: 0
    }
};

Plotly.newPlot("map", [trace], layout, {
    responsive: true
});
