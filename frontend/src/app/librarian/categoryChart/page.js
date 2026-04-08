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
  "technology": "#5ad45e", "science": "#11c91a",     
  "education": "#ecdd4e", "exam-prep": "#fee504", 
  "business": "#90CAF9", "economics": "#64B5F6",   
  "history": "#c29c90", "geography": "#a37766",   
  "novel": "#ef3b77", "comics": "#f90657", "art": "#c259d4",         
  "self-help": "#c804eb", "children": "#febd5b",    
  "health": "#53cfc3", "travel": "#02bba8",      
  "cooking": "#ff8864", "others": "#bcd4de"       
};

const categoryList = {
    "history": "Lịch sử", "children": "Trẻ em",
    "business": "Kinh doanh", "science": "Khoa học",
    "technology": "Kỹ thuật", "education": "Giáo dục",
    "exam-prep": "Luyện thi", "comics": "Truyện tranh",
    "health": "Sức khỏe", "travel": "Du lịch", 
    "cooking": "Ẩm thực", "self-help": "Tâm lý",
    "art": "Nghệ thuật", "geography": "Địa lý",
    "novel": "Tiểu thuyết", "others": "Khác"
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
        plugins: {
            legend: {
                position: 'right',
                labels: { usePointStyle: true, padding: 20 }
            },
            title: {
                display: true,
                text: 'Cơ cấu thể loại sách',
                font: { size: 16 }
            }
        }
    };
    return (
            <Pie data={chartData} options={options} />
    );
};