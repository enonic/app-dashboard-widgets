import {CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement} from 'chart.js';

Chart.register([
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement
]);

const drawGraph = (canvas: HTMLCanvasElement, activityDataObj: Record<string, number>) => {
  const activity = formatData(activityDataObj);
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: activity.labels,
      datasets: [{
        label: 'Items modified',
        data: activity.data,
        borderColor: '#b5c9e3',
        backgroundColor: 'rgba(181, 201, 227, 0.3)',
        fill: 'start',
        pointRadius: 0
      }]
    },
    options: {
      plugins: {
        filler: {
          propagate: false,
        },
        legend: {
          display: false
        }
      },
      interaction: {
        intersect: false,
      },
      elements: {
        line: {
          tension: 0.4
        }
      },
      scales: {
        y: {
          min: 0,
          suggestedMax: 10,
          display: true,
          grid: {
            display: false
          },
          ticks: {
            color: '#ffffff'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#ffffff'
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    }
  });
};

const formatData = (activityData: Record<string, number>) => {
  const labels = [];
  const data = [];

  Object.keys(activityData).forEach((key: string) => {
    const dateParts: string[] = key.split('-');
    labels.push(`${dateParts[2]}/${dateParts[1]}`);
    data.push(activityData[key]);
  });

  return {
    data,
    labels
  };
};

class ActivityChart extends HTMLElement {
  connectedCallback() {
    const chartDataServiceUrl = this.getAttribute('data-chart-service-url');

    if (!chartDataServiceUrl) {
      return;
    }

    const canvas = this.querySelector<HTMLCanvasElement>('canvas');

    if (!canvas) {
      return;
    }

    fetch(chartDataServiceUrl)
      .then((response) => response.json())
      .then((activityDataObj: Record<string, number>) => drawGraph(canvas, activityDataObj))
      .catch((e) => {
        console.error(e);
      });
  }
}

if (!customElements.get('activity-chart')) {
  customElements.define('activity-chart', ActivityChart);
}
