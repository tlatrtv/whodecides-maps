const trace = {
    x: [1, 2, 3, 4],
    y: [10, 15, 13, 17],
    mode: "lines+markers",
    type: "scatter"
};

const layout = {
    title: "Who Decides Plotly Test"
};

Plotly.newPlot("map", [trace], layout);
