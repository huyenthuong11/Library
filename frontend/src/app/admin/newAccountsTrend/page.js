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

export default function NewAccountsChart() {
  const [newAccountsTrend, setNewAccountsTrend] = useState([]);
  useEffect(() => {
    const getNewAccountsTrend = async () => {
      try {
        const response = await api.get("/admin/newAccountsTrend");
        const data = response.data;
        setNewAccountsTrend(data);
      } catch (err) {
        console.error("Failed to get borrow history", err);
      }
    };
    getNewAccountsTrend();
  }, []);

  const chartData = newAccountsTrend
  .map((item) => ({
    date: item._id,
    readerSum: item.readerSum
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
                dataKey="readerSum"
                name="Người dùng mới"
                stroke="#1441b5"
                strokeWidth={2}
                dot={false}
              />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}