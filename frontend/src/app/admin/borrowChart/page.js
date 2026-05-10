"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { useEffect, useContext, useState } from "react";
import api from "@/lib/axios.js";

export default function BorrowChart() {
  const [borrowRecord, setBorrowRecord] = useState([]);
  useEffect(() => {
    const getBorrowRecord = async () => {
      try {
        const response = await api.get("/chart/getBorrowTrendData");
        const data = response.data;
        setBorrowRecord(data);
      } catch (err) {
        console.error("Failed to get borrow history", err);
      }
    };
    getBorrowRecord();
  }, []);

  const chartData = borrowRecord
  .map((item) => ({
    date: item._id,
    registered: item.registered,
    borrowed: item.borrowed,
    returned: item.returned
  }));

  console.log(chartData);
  return (
    <>
      <div style={{ width: "100%", display: "flex", alignContent:"center", justifyContent:"center", height: "90%", marginTop: "10px" }}>
        <ResponsiveContainer width="95%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                textAnchor="end"
                tick={{ fontSize: 15 }}
              />
              <YAxis/>
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="registered"
                name="Lượt đặt trước"
                stroke="#b8d54e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="borrowed"
                name="Lượt mượn sách"
                stroke="rgb(147, 2, 2)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="returned"
                name="Lượt trả sách"
                stroke="rgb(13, 157, 56)"
                strokeWidth={2}
                dot={false}
              />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}