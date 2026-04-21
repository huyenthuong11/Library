import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CATEGORY_COLORS = {
  technology: "#3b82f6",
  science: "#6366f1",
  mathematics: "#8b5cf6",
  history: "#f59e0b",
  geography: "#22c55e",
  politics: "#ef4444",
  philosophy: "#a855f7",
  psychology: "#ec4899",
  religion: "#f97316",
  business: "#14b8a6",
  finance: "#10b981",
  marketing: "#06b6d4",
  economics: "#0ea5e9",
  education: "#84cc16",
  language: "#65a30d",
  exam_prep: "#facc15",
  literature: "#c084fc",
  novel: "#d946ef",
  children: "#fb7185",
  comics: "#f43f5e",
  self_help: "#e879f9",
  health: "#34d399",
  art: "#a78bfa",
  cooking: "#fb923c",
  travel: "#38bdf8",
  biography: "#475779",
  general: "#64748B",
  others: "#D1D5DB"      
};

const categoryList = {
  technology: "Công nghệ",
  science: "Khoa học",
  mathematics: "Toán học",
  history: "Lịch sử",
  geography: "Địa lý",
  politics: "Chính trị",
  philosophy: "Triết học",
  psychology: "Tâm lý học",
  religion: "Tôn giáo / Tâm linh",
  business: "Kinh doanh",
  finance: "Tài chính / Đầu tư",
  marketing: "Marketing / Bán hàng",
  economics: "Kinh tế học",
  education: "Giáo dục / Học tập",
  language: "Ngôn ngữ / Ngoại ngữ",
  exam_prep: "Luyện thi",
  literature: "Văn học",
  novel: "Tiểu thuyết",
  children: "Thiếu nhi",
  comics: "Truyện tranh / Manga",
  self_help: "Phát triển bản thân",
  health: "Sức khỏe / Y học",
  art: "Nghệ thuật / Thiết kế",
  cooking: "Ẩm thực / Nấu ăn",
  travel: "Du lịch / Khám phá",
  biography: "Tiểu sử / Hồi ký",
  general: "Tổng hợp",
  others: "Khác"
};


export default function CategoryPieChart ({ data }) {
    const chartData = {
        labels: data?.map(item => categoryList[item.label] || categoryList.others),
        datasets: [
            {
                data: data?.map(item => item.value),
                backgroundColor: data?.map(item => CATEGORY_COLORS[item.label] || CATEGORY_COLORS.others),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 20,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: 0
        },
        plugins: {
            legend: {
                position: 'right',
                labels: { 
                    usePointStyle: true,
                    font: {
                        size: 10
                    },
                    boxWidth: 10,

                },
            },
        }
    };
    return (
            <Pie data={chartData} options={options} />
    );
};