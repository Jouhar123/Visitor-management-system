"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { CalendarDays, BarChart3, TrendingUp } from "lucide-react";

const VisitStats = () => {
  const [daily, setDaily] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      
      console.log("Fetching today's visits for date:", todayStr);
      const todayRes = await fetch(`/api/visitor/filter?date=${todayStr}`);
      const todayVisits = await todayRes.json();
      console.log("Today's visits:", todayVisits);
      setDaily(todayVisits.length);

      console.log("Fetching all visits...");
      const allRes = await fetch(`/api/visitor/filter`);
      const allVisits = await allRes.json();
      console.log("All visits count:", allVisits.length);
      console.log("Sample visit:", allVisits[0]);

      // Monthly stats - use visit.createdAt, not visitor.createdAt
      const monthly = Array(12).fill(0);
      const now = new Date();
      allVisits.forEach(visit => {
        if (visit.createdAt) {
          const date = new Date(visit.createdAt);
          if (date.getFullYear() === now.getFullYear()) {
            monthly[date.getMonth()] += 1;
          }
        }
      });
      
      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyResult = monthly.map((count, idx) => ({
        month: monthLabels[idx],
        count,
      }));
      setMonthlyData(monthlyResult);
      console.log("Monthly data:", monthlyResult);

      // Yearly stats - use visit.createdAt
      const yearlyMap = new Map();
      allVisits.forEach(visit => {
        if (visit.createdAt) {
          const year = new Date(visit.createdAt).getFullYear();
          yearlyMap.set(year, (yearlyMap.get(year) || 0) + 1);
        }
      });
      const yearlyResult = Array.from(yearlyMap.entries()).map(([year, count]) => ({
        year: String(year),
        count,
      }));
      setYearlyData(yearlyResult.sort((a, b) => a.year - b.year));
      console.log("Yearly data:", yearlyResult);

    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md p-4 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white shadow-md p-4 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-red-50 to-white p-6 rounded-xl mb-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Stats</h3>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-xl mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Visits */}
        <div className="bg-white shadow-md p-4 rounded-xl transform transition hover:scale-[1.02] border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-md font-semibold text-gray-700">Today's Visits</h2>
            <CalendarDays className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-4xl font-bold text-blue-600 text-center">{daily}</div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="bg-white shadow-md p-4 rounded-xl transform transition hover:scale-[1.02] border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-md font-semibold text-gray-700">
              Monthly Visits ({new Date().getFullYear()})
            </h2>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Yearly Area Chart */}
        <div className="bg-white shadow-md p-4 rounded-xl col-span-1 md:col-span-2 transform transition hover:scale-[1.01] border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-md font-semibold text-gray-700">Yearly Visit Trends</h2>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={yearlyData}>
              <defs>
                <linearGradient id="colorVisit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorVisit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VisitStats;
