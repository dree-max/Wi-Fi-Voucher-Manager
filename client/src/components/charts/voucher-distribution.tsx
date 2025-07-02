import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface VoucherDistributionProps {
  data?: number[];
  labels?: string[];
}

export default function VoucherDistribution({ 
  data = [45, 35, 20], 
  labels = ['Premium', 'Standard', 'Basic'] 
}: VoucherDistributionProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(99, 102, 241)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="h-64">
      <Doughnut options={options} data={chartData} />
    </div>
  );
}
