import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import api from "@/lib/axios";
export default function LibraryChart() {
    const [data, setData] = useState([]);
    const getData = async () => {
        try {
            const response = await api.get("chart/conversionStats");
            const data = response.data;
            console.log(data);
            setData(data);
        } catch (err) {
            console.error("Failed to get data", err);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    const chartData = [{
        name: "Thống kê mượn sách",
        "webConversion": data.webConversion,
        "walkIn": data.walkIn,
        "expired": data.expired,
        "cancel": data.cancel
    }];

    console.log("report:", chartData);

    return (
        <>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} margin={{ top: 8, right: 30, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                    <Tooltip
                        wrapperStyle={{ outline: 'none', zIndex: 1000 }}
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            padding: '8px 12px',
                            fontSize: '12px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Legend 
                        verticalAlign="top" 
                        iconType="circle" 
                        iconSize={6}  
                        wrapperStyle={{ 
                            paddingBottom: '10px',
                            fontSize: '12px'
                        }} 
                    />
                    <Bar dataKey="cancel" name="Đăng ký mượn - Hủy" fill='#ff0606' radius={[4, 4, 0, 0]} barSize={60}/>
                    <Bar dataKey="webConversion" name = "Mượn qua Web - Đến lấy" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={60} />
                    <Bar dataKey="walkIn" name = "Mượn trực tiếp" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={60} />
                    <Bar dataKey="expired" name="Đơn đặt hết hạn" fill="#f87171" radius={[4, 4, 0, 0]} barSize={60} />
                </BarChart>
            </ResponsiveContainer>
        </>
    )
}