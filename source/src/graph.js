import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  PointElement,
  BarController,
  BarElement,
  LineElement,
  Legend,
} from "chart.js";

import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  BarController,
  PointElement,
  LineElement,
  BarElement,
  Legend
);

// Draws the words of the two sentences under each x position, one above the
// other, coloring the words at the highlighted (critical) position by condition.
// The highlighted index comes from options.plugins.multiColorLabels.highlight.
const multiColorPlugin = {
  id: "multiColorLabels",
  afterDraw: (chart, _args, options) => {
    const ctx = chart.ctx;
    const xAxis = chart.scales.x;
    const highlight = options.highlight;

    ctx.save();
    xAxis.ticks.forEach((tick, index) => {
      const x = xAxis.getPixelForTick(index);
      const y = xAxis.bottom - 15;
      ctx.textAlign = "center";
      ctx.font = "16px Arial";
      // First sentence's word (high attachment, sorted first)
      if (index === highlight) {
        ctx.fillStyle = "rgb(221, 79, 126)";
      } else {
        ctx.fillStyle = "black";
      }
      ctx.fillText(tick.label[0], x, y);
      if (index === highlight) {
        ctx.fillStyle = "rgb(50, 150, 40)";
      } else {
        ctx.fillStyle = "black";
      }
      // Second sentence's word (low attachment) below it
      ctx.fillText(tick.label[1], x, y + 30);
    });
    ctx.restore();
  },
};

Chart.register(annotationPlugin);

// Position of the disambiguating word in the moderate demo's sentences.
const CRITICAL_WORD_INDEX = 7;

export function clean_data(d) {
  let relevant = d.filter((item) => {
    return item.trial_type == "maze";
  });
  return relevant;
}

export function graph1(c, d) {
  let relevant = d
    .filter((item) => {
      return (
        item.trial_type == "maze" &&
        ["relative_high", "relative_low"].includes(item.type)
      );
    })
    .sort((a, b) => a.type.localeCompare(b.type));
  graph(c, relevant, CRITICAL_WORD_INDEX);
}
export function graph2(c, d) {
  let relevant = d
    .filter((item) => {
      return (
        item.trial_type == "maze" &&
        ["adverb_high", "adverb_low"].includes(item.type)
      );
    })
    .sort((a, b) => a.type.localeCompare(b.type));
  graph(c, relevant, CRITICAL_WORD_INDEX);
}
export function graph(c, d, highlight) {
  const data = clean_data(d);

  const colors = {
    relative_high: "rgb(221, 79, 126)",
    relative_low: "rgb(50, 150, 40)",
    adverb_high: "rgb(221, 79, 126)",
    adverb_low: "rgb(50, 150, 40)",
  };

  const datasets = data.map((item, idx) => ({
    label: item.type,
    data: item.rt,
    borderColor: function () {
      return item.correct.map((val) =>
        val > 0 ? colors[item.type] : "rgb(255,0,0)"
      );
    },
    backgroundColor: colors[item.type],
    tension: 0.1,
    pointRadius: function () {
      return item.correct.map((val) => (val > 0 ? 5 : 10));
    },
    pointBorderWidth: 5,
    pointBackgroundColor: function () {
      return item.correct.map((val) =>
        val > 0 ? colors[item.type] : "rgb(255,0,0)"
      );
    },
    pointHoverRadius: 7,
    words: item.words,
    pointStyle: function () {
      return item.correct.map((val) => (val > 0 ? "circle" : "crossRot"));
    },
  }));

  // Create custom labels showing words from both sentences
  const maxLength = Math.max(...data.map((obj) => obj.words.length));

  const word_labels = Array.from(
    { length: maxLength },
    (_, i) => data.map((obj) => obj.words[i] || "")
  );

  // Shade the critical region up to the slowest RT shown.
  const maxRt = Math.max(...data.flatMap((obj) => obj.rt));

  Chart.defaults.font.size = 16; // Default is 12

  const chart = new Chart(c, {
    type: "line",
    data: {
      labels: word_labels,
      datasets: datasets,
    },
    plugins: [multiColorPlugin],
    options: {
      responsive: true,
      layout: { padding: { bottom: 40, right: 100 } },
      plugins: {
        multiColorLabels: { highlight: highlight },
        legend: {
          display: true,
          position: "top",
        },
        annotation: {
          annotations: {
            box1: {
              type: "box",
              xMin: highlight - 0.5,
              xMax: highlight + 0.5,
              yMin: 0,
              yMax: maxRt,
              backgroundColor: "rgba(100, 99, 132, 0.2)",
              borderColor: "rgb(100, 99, 132)",
              borderWidth: 1,
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "",
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
            font: { size: 16 },
            display: false,
          },
        },
        y: {
          title: {
            display: true,
            text: "Reaction Time (ms)",
          },
          beginAtZero: true,
        },
      },
    },
  });
}
