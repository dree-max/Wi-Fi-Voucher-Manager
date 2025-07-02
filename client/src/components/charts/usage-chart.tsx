import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UsageChartProps {
  data?: number[];
  labels?: string[];
}

export default function UsageChart({ 
  data = [12, 19, 43, 78, 65, 34], 
  labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'] 
}: UsageChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgb(243, 244, 246)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Active Users',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="h-64">
      <Line options={options} data={chartData} />
    </div>
  );
}
