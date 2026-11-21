import {
  ArcElement, BarController, BarElement, CategoryScale, Chart,
  DoughnutController, Filler, Legend, LinearScale, LineController,
  LineElement, PointElement, ScatterController, Tooltip,
} from 'chart.js';

Chart.register(
  ArcElement, BarController, BarElement, CategoryScale, DoughnutController,
  Filler, Legend, LinearScale, LineController, LineElement, PointElement,
  ScatterController, Tooltip,
);

export default Chart;
