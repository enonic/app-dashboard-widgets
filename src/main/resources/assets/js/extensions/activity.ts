import {CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement} from 'chart.js';

Chart.register([
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement
]);

const drawGraph = (activityDataObj: Record<string, number>) => {
  const activity = formatData(activityDataObj);
// set the dimensions and margins of the graph
  new Chart('extension-activity-chart', {
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

(() => {
  const scriptElement = document.querySelector(`script[src*="activity.mjs"]`);

  if (!scriptElement) {
    return;
  }

  const chartDataServiceUrl = scriptElement.getAttribute('data-chart-service-url');

  if (!chartDataServiceUrl) {
    return;
  }

  fetch(chartDataServiceUrl)
    .then((response) => response.json())
    .then((activityDataObj: Record<string, number>) => {
      const existing = document.getElementById('extension-activity-chart');
      if (existing) {
        drawGraph(activityDataObj);
        return;
      }
      const observer = new MutationObserver(() => {
        if (document.getElementById('extension-activity-chart')) {
          observer.disconnect();
          drawGraph(activityDataObj);
        }
      });
      observer.observe(document.body, {childList: true, subtree: true});
    })
    .catch((e) => {
      console.error(e);
    });

})();
