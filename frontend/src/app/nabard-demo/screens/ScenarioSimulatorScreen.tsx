"use client";

import React from "react";
import {
  Filter,
  Download,
  RefreshCw,
  Briefcase,
  ShieldAlert,
  Clock,
  IndianRupee,
  Sparkles,
  CloudRain,
  TrendingUp,
  Landmark,
  FileText,
  ThermometerSun,
  Leaf,
  Tags,
  ShoppingCart,
  Users,
  ArrowRight,
  Shield,
  AlertTriangle,
  Building,
  CloudLightning,
  DownloadCloud,
  CheckCircle2,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, CartesianGrid } from "recharts";
import { Screen } from "../GramPulseApp";
import { useMutation } from "@tanstack/react-query";
import apiClient from "../services/apiClient";
import { useState } from "react";

interface Props {
  navigateTo: (s: Screen, ent?: string) => void;
}

// Reusable slider row component for negative impacts
const SliderRow = ({
  icon: Icon,
  color,
  label,
  sub,
  min,
  max,
  unit,
  value,
  onChange,
}: any) => {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 w-[240px]">
        <div
          className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${color.bg} ${color.text}`}
        >
          <Icon size={12} />
        </div>
        <div>
          <div className="text-[11px] font-bold text-gray-900 leading-tight">
            {label}
          </div>
          <div className="text-[9px] text-gray-500">{sub}</div>
        </div>
      </div>

      <div className="flex-1 px-4 flex items-center justify-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full max-w-[200px] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </div>

      <div
        className={`w-[80px] text-center text-[11px] font-bold ${value < 0 ? "text-red-500" : value > 0 ? "text-green-500" : "text-gray-500"}`}
      >
        {value > 0 ? "+" : ""}
        {value}
        {unit}
      </div>
      <div className="w-[80px] text-right text-[11px] font-bold text-gray-900">
        {value > 0 ? "+" : ""}
        {value}
        {unit}
      </div>
    </div>
  );
};

// Mini Line Chart Component for Negative Trends
const MiniTrendChart = ({ data, dataKeyBase, dataKeyScen }: any) => (
  <div className="h-[90px] w-full mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="2 2"
          vertical={false}
          stroke="#f3f4f6"
        />
        <Line
          type="monotone"
          dataKey={dataKeyBase}
          stroke="#9ca3af"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey={dataKeyScen}
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 2.5, fill: "#ef4444", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default function ScenarioSimulatorScreen({ navigateTo }: Props) {
  const [hasRun, setHasRun] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [scenarioType, setScenarioType] = useState("CLIMATE_SHOCK");
  const [variables, setVariables] = useState({
    rainfallDeviation: -20,
    temperatureIncrease: 2,
    cropYieldImpact: -15,
    commodityPriceChange: -10,
    inputCostChange: 12,
    ruralWageRate: 8,
  });

  const handleScenarioChange = (type: string) => {
    setScenarioType(type);
    if (type === "CLIMATE_SHOCK") {
      setVariables({
        rainfallDeviation: -20,
        temperatureIncrease: 2,
        cropYieldImpact: -15,
        commodityPriceChange: -10,
        inputCostChange: 12,
        ruralWageRate: 8,
      });
    } else if (type === "MARKET_SHOCK") {
      setVariables({
        rainfallDeviation: 0,
        temperatureIncrease: 0,
        cropYieldImpact: 0,
        commodityPriceChange: -30,
        inputCostChange: 20,
        ruralWageRate: 0,
      });
    } else if (type === "ECONOMIC_SHOCK") {
      setVariables({
        rainfallDeviation: 0,
        temperatureIncrease: 0,
        cropYieldImpact: 0,
        commodityPriceChange: -15,
        inputCostChange: 25,
        ruralWageRate: -5,
      });
    } else {
      setVariables({
        rainfallDeviation: 0,
        temperatureIncrease: 0,
        cropYieldImpact: 0,
        commodityPriceChange: 0,
        inputCostChange: 0,
        ruralWageRate: 0,
      });
    }
  };

  const setVar = (key: string, val: number) => {
    setVariables((prev) => ({ ...prev, [key]: val }));
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      const headers = "Metric,Base,Scenario,Change\n";
      let csv = headers;

      const reportData = resData?.data?.scenarioData || SCENARIO_DATA;
      reportData.forEach((row: any) => {
        csv += `"${row.metric}","${row.base}","${row.scen}","${row.change}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "grampulse_scenario_report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setIsGeneratingReport(false);
    }, 800);
  };

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.copilotSimulate({
        scenarioType,
        variables,
        horizonMonths: 12,
      }),
    onSuccess: () => setHasRun(true),
  });

  const resData: any = mutation.data;
  const MINI_CHART_DATA = resData?.data?.miniChartData || [];
  const DISTRICTS_DATA = resData?.data?.districtsData || [];
  const SCENARIO_DATA = resData?.data?.scenarioData || [];
  const SUMMARY = resData?.data?.summary || { message: "", bullets: [] };

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      {/* 1. Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
            AI Copilot <span className="text-gray-300">{">"}</span>{" "}
            <span className="text-gray-900">Scenario Simulator</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">
            Scenario Simulator
          </h1>
          <p className="text-[12px] text-gray-500">
            Model the impact of changes across variables and see AI-powered
            outcome projections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <Filter size={14} /> Filters
          </button>
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <Download size={14} /> Export
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-1.5 border border-transparent rounded-xl px-4 py-2 text-[12px] font-semibold text-white bg-[#0f766e] hover:bg-[#0f766e]/90 shadow-sm transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={14}
              className={isGeneratingReport ? "animate-spin" : ""}
            />{" "}
            {isGeneratingReport ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Main Two-Column Split */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input & Config (6 cols) */}
        <div className="col-span-6 space-y-6">
          {/* Section 1: Select Scenario Type */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[13px] font-bold text-gray-900 mb-4">
              1. Select Scenario Type
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <div
                onClick={() => handleScenarioChange("CLIMATE_SHOCK")}
                className={`${scenarioType === "CLIMATE_SHOCK" ? "border-2 border-green-500 bg-green-50/50" : "border border-gray-100 hover:border-green-200"} rounded-xl p-3 relative cursor-pointer transition-colors`}
              >
                {scenarioType === "CLIMATE_SHOCK" && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={10} />
                  </div>
                )}
                <CloudRain size={18} className="text-blue-500 mb-2" />
                <div className="text-[11px] font-bold text-gray-900 mb-1">
                  Climate Shock
                </div>
                <div className="text-[9px] text-gray-500 leading-tight">
                  Extreme weather, rainfall deficit / excess
                </div>
              </div>
              <div
                onClick={() => handleScenarioChange("MARKET_SHOCK")}
                className={`${scenarioType === "MARKET_SHOCK" ? "border-2 border-green-500 bg-green-50/50" : "border border-gray-100 hover:border-green-200"} rounded-xl p-3 relative cursor-pointer transition-colors`}
              >
                {scenarioType === "MARKET_SHOCK" && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={10} />
                  </div>
                )}
                <TrendingUp size={18} className="text-emerald-500 mb-2" />
                <div className="text-[11px] font-bold text-gray-900 mb-1">
                  Market Shock
                </div>
                <div className="text-[9px] text-gray-500 leading-tight">
                  Commodity price changes, demand shift
                </div>
              </div>
              <div
                onClick={() => handleScenarioChange("ECONOMIC_SHOCK")}
                className={`${scenarioType === "ECONOMIC_SHOCK" ? "border-2 border-green-500 bg-green-50/50" : "border border-gray-100 hover:border-green-200"} rounded-xl p-3 relative cursor-pointer transition-colors`}
              >
                {scenarioType === "ECONOMIC_SHOCK" && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={10} />
                  </div>
                )}
                <Landmark size={18} className="text-purple-500 mb-2" />
                <div className="text-[11px] font-bold text-gray-900 mb-1">
                  Economic Shock
                </div>
                <div className="text-[9px] text-gray-500 leading-tight">
                  Interest rate, inflation, fuel price changes
                </div>
              </div>
              <div
                onClick={() => handleScenarioChange("POLICY_CHANGE")}
                className={`${scenarioType === "POLICY_CHANGE" ? "border-2 border-green-500 bg-green-50/50" : "border border-gray-100 hover:border-green-200"} rounded-xl p-3 relative cursor-pointer transition-colors`}
              >
                {scenarioType === "POLICY_CHANGE" && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={10} />
                  </div>
                )}
                <FileText size={18} className="text-blue-500 mb-2" />
                <div className="text-[11px] font-bold text-gray-900 mb-1">
                  Policy Change
                </div>
                <div className="text-[9px] text-gray-500 leading-tight">
                  Subsidy, credit policy, compliance change
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Adjust Key Variables */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-[13px] font-bold text-gray-900 mb-4">
              2. Adjust Key Variables
            </h2>

            <div className="flex items-center text-[10px] font-semibold text-gray-400 border-b border-gray-100 pb-2 mb-2">
              <div className="w-[240px]">Variable</div>
              <div className="flex-1"></div>
              <div className="w-[80px] text-center">Change from Base</div>
              <div className="w-[80px] text-right">Value in Scenario</div>
            </div>

            <SliderRow
              icon={CloudRain}
              color={{ bg: "bg-blue-50", text: "text-blue-600" }}
              label="Rainfall Deviation"
              sub="Seasonal rainfall change"
              min={-100}
              max={100}
              unit="%"
              value={variables.rainfallDeviation}
              onChange={(v: number) => setVar("rainfallDeviation", v)}
            />
            <SliderRow
              icon={ThermometerSun}
              color={{ bg: "bg-orange-50", text: "text-orange-600" }}
              label="Temperature Increase"
              sub="Avg. temp change"
              min={-5}
              max={10}
              unit="°C"
              value={variables.temperatureIncrease}
              onChange={(v: number) => setVar("temperatureIncrease", v)}
            />
            <SliderRow
              icon={Leaf}
              color={{ bg: "bg-green-50", text: "text-green-600" }}
              label="Crop Yield Impact"
              sub="Estimated yield change"
              min={-100}
              max={100}
              unit="%"
              value={variables.cropYieldImpact}
              onChange={(v: number) => setVar("cropYieldImpact", v)}
            />
            <SliderRow
              icon={Tags}
              color={{ bg: "bg-indigo-50", text: "text-indigo-600" }}
              label="Commodity Price"
              sub="Avg. price change"
              min={-100}
              max={100}
              unit="%"
              value={variables.commodityPriceChange}
              onChange={(v: number) => setVar("commodityPriceChange", v)}
            />
            <SliderRow
              icon={ShoppingCart}
              color={{ bg: "bg-purple-50", text: "text-purple-600" }}
              label="Input Cost"
              sub="Fertilizer, seeds, fuel"
              min={-100}
              max={100}
              unit="%"
              value={variables.inputCostChange}
              onChange={(v: number) => setVar("inputCostChange", v)}
            />
            <SliderRow
              icon={Users}
              color={{ bg: "bg-pink-50", text: "text-pink-600" }}
              label="Rural Wage Rate"
              sub="Change in wage rate"
              min={-100}
              max={100}
              unit="%"
              value={variables.ruralWageRate}
              onChange={(v: number) => setVar("ruralWageRate", v)}
            />

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setHasRun(false);
                  mutation.reset();
                  handleScenarioChange(scenarioType);
                }}
                className="text-[11px] font-bold text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg px-4 py-2"
              >
                Reset to Base
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="text-[11px] font-bold text-white bg-green-700 hover:bg-green-800 disabled:opacity-50 transition-colors rounded-lg px-6 py-2 shadow-sm flex items-center gap-1"
              >
                {mutation.isPending ? "Running..." : "Run Simulation"}{" "}
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Section 3: AI Scenario Summary */}
          {hasRun && (
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-purple-600" />
                <h2 className="text-[13px] font-bold text-gray-900">
                  AI Scenario Summary
                </h2>
              </div>
              <p className="text-[12px] text-gray-700 mb-3 font-medium">
                {SUMMARY.message}
              </p>
              <ul className="space-y-1.5 mb-4">
                {SUMMARY.bullets.map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span className="text-[11px] text-gray-600">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button className="text-[11px] font-bold text-purple-700 hover:text-purple-800 flex items-center justify-end gap-1 ml-auto">
                  View AI Explanation <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Output & Impact (6 cols) */}
        {hasRun ? (
          <div className="col-span-6 space-y-6">
            {/* Section 4: Scenario Impact Overview */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-1">
                3. Scenario Impact Overview
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-gray-100 rounded-lg p-3 bg-red-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Shield size={12} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600">
                      Overall Risk Score
                    </span>
                  </div>
                  <div className="text-[18px] font-bold text-red-600 leading-none mb-1">
                    {resData?.data?.scenario?.riskScore?.toFixed(0) || 68}{" "}
                    <span className="text-[12px] font-semibold text-gray-400">
                      /100
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                    {resData?.data?.scenarioData?.[0]?.change || ""}
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-3 bg-red-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Clock size={12} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600">
                      Stress Survival Score
                    </span>
                  </div>
                  <div className="text-[18px] font-bold text-red-600 leading-none mb-1">
                    {resData?.data?.scenario?.stressSurvivalScore?.toFixed(1) ||
                      82}
                  </div>
                  <div className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                    ↓{" "}
                    {82 -
                      (
                        resData?.data?.scenario?.stressSurvivalScore || 82
                      ).toFixed(1)}{" "}
                    pts
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-3 bg-red-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-orange-50 flex items-center justify-center text-orange-600">
                      <IndianRupee size={12} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600">
                      Stressed Exposure at Risk
                    </span>
                  </div>
                  <div className="text-[18px] font-bold text-red-600 leading-none mb-1">
                    ₹{resData?.data?.scenarioData?.[1]?.scen || "18.6"} Cr
                  </div>
                  <div className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                    {resData?.data?.scenarioData?.[1]?.change || ""}
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-3 bg-red-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-red-50 flex items-center justify-center text-red-600">
                      <AlertTriangle size={12} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600">
                      RED EWS Enterprises
                    </span>
                  </div>
                  <div className="text-[18px] font-bold text-red-600 leading-none mb-1">
                    {resData?.data?.scenario?.enterprisesAtRisk || 341}
                  </div>
                  <div className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                    ↑{" "}
                    {Math.max(
                      0,
                      (resData?.data?.scenario?.enterprisesAtRisk || 341) - 341,
                    )}
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-3 bg-red-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center text-purple-600">
                      <Building size={12} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600">
                      Cashflow Stressed (AMBER)
                    </span>
                  </div>
                  <div className="text-[18px] font-bold text-red-600 leading-none mb-1">
                    {Math.floor(
                      (resData?.data?.scenario?.enterprisesAtRisk || 341) * 1.5,
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                    Est. Volume
                  </div>
                </div>
                <div className="border border-gray-100 rounded-lg p-3 bg-red-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                      <CloudLightning size={12} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600">
                      Portfolio PD (Avg.)
                    </span>
                  </div>
                  <div className="text-[18px] font-bold text-red-600 leading-none mb-1">
                    {(
                      ((resData?.data?.scenario?.enterprisesAtRisk || 341) /
                        3250) *
                      100 *
                      0.8
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                    Proxy calculated
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Key Impact Trends */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 mb-4">
                4. Key Impact Trends
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-[9px] font-bold text-gray-700 text-center mb-1">
                    Overall Risk Trend (/100)
                  </div>
                  <MiniTrendChart
                    data={MINI_CHART_DATA}
                    dataKeyBase="base"
                    dataKeyScen="scenario"
                  />
                  <div className="flex items-center justify-between mt-1 px-4 text-[7px] text-gray-400 font-semibold">
                    <span>Now</span>
                    <span>+6M</span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-gray-700 text-center mb-1">
                    Stressed Exposure Trend (₹ Cr)
                  </div>
                  <MiniTrendChart
                    data={MINI_CHART_DATA}
                    dataKeyBase="baseECL"
                    dataKeyScen="scenECL"
                  />
                  <div className="flex items-center justify-between mt-1 px-4 text-[7px] text-gray-400 font-semibold">
                    <span>Now</span>
                    <span>+6M</span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-gray-700 text-center mb-1">
                    RED EWS Enterprises Trend
                  </div>
                  <MiniTrendChart
                    data={MINI_CHART_DATA}
                    dataKeyBase="baseHR"
                    dataKeyScen="scenHR"
                  />
                  <div className="flex items-center justify-between mt-1 px-4 text-[7px] text-gray-400 font-semibold">
                    <span>Now</span>
                    <span>+6M</span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-gray-700 text-center mb-1">
                    Cashflow Stress Trend
                  </div>
                  <MiniTrendChart
                    data={MINI_CHART_DATA}
                    dataKeyBase="baseCS"
                    dataKeyScen="scenCS"
                  />
                  <div className="flex items-center justify-between mt-1 px-4 text-[7px] text-gray-400 font-semibold">
                    <span>Now</span>
                    <span>+6M</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 border-t-2 border-dashed border-gray-400"></div>
                  <span className="text-[9px] font-medium text-gray-500">
                    Base
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 border-t-2 border-solid border-red-500"></div>
                  <span className="text-[9px] font-medium text-gray-900">
                    Scenario
                  </span>
                </div>
              </div>
            </div>

            {/* Section 6: Top Districts */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 mb-3">
                5. Top Districts Most Affected
              </h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 text-[10px] font-semibold text-gray-400">
                      District
                    </th>
                    <th className="py-2 text-[10px] font-semibold text-gray-400 text-center">
                      Risk Change
                    </th>
                    <th className="py-2 text-[10px] font-semibold text-gray-400 text-center">
                      Repayment Rate Change
                    </th>
                    <th className="py-2 text-[10px] font-semibold text-gray-400 text-center">
                      High Risk Enterprises Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DISTRICTS_DATA.map((d: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-1.5 text-[11px] font-semibold text-gray-900">
                        {d.dist}
                      </td>
                      <td className="py-1.5 text-[11px] font-bold text-red-500 text-center">
                        {d.risk}
                      </td>
                      <td className="py-1.5 text-[11px] font-bold text-red-500 text-center">
                        {d.rep}
                      </td>
                      <td className="py-1.5 text-[11px] font-bold text-red-500 text-center">
                        {d.hr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="text-[10px] font-bold text-green-700 mt-2 flex items-center gap-1 hover:text-green-800">
                View full district impact <ArrowRight size={10} />
              </button>
            </div>
          </div>
        ) : (
          <div className="col-span-6 flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
            <Sparkles size={32} className="text-gray-300 mb-3" />
            <h3 className="text-[14px] font-bold text-gray-500 mb-1">
              No Simulation Run
            </h3>
            <p className="text-[11px] text-gray-400">
              Adjust the variables on the left and click "Run Simulation" to see
              the projected impact.
            </p>
          </div>
        )}
      </div>

      {/* 7. Bottom Table */}
      {hasRun && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mt-6">
          <h2 className="text-[13px] font-bold text-gray-900 mb-4">
            7. Scenario Comparison{" "}
            <span className="text-[11px] font-semibold text-gray-400">
              (Base vs Selected Scenario)
            </span>
          </h2>

          <div className="flex items-center gap-6 mb-4 text-[11px] font-bold text-gray-900">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>Base
              (Current)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>Scenario
              (Climate Shock)
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 text-[11px] font-bold text-gray-500 w-1/6">
                  Metric
                </th>
                {SCENARIO_DATA.map((col: any, i: number) => (
                  <th
                    key={i}
                    className="py-2 text-[11px] font-bold text-gray-500 text-center"
                  >
                    {col.metric}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="py-3 text-[11px] font-bold text-gray-900">
                  Base
                </td>
                {SCENARIO_DATA.map((col: any, i: number) => (
                  <td
                    key={i}
                    className="py-3 text-[11px] font-semibold text-gray-600 text-center"
                  >
                    {col.base}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-50 bg-red-50/20">
                <td className="py-3 text-[11px] font-bold text-gray-900">
                  Scenario
                </td>
                {SCENARIO_DATA.map((col: any, i: number) => (
                  <td
                    key={i}
                    className="py-3 text-[11px] font-bold text-green-600 text-center"
                  >
                    {col.scen}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 text-[11px] font-bold text-gray-900">
                  Change
                </td>
                {SCENARIO_DATA.map((col: any, i: number) => (
                  <td
                    key={i}
                    className="py-3 text-[11px] font-bold text-red-500 text-center"
                  >
                    {col.change}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <button className="text-[11px] font-bold text-indigo-700 flex items-center gap-1.5 hover:text-indigo-800">
              Download Comparison <DownloadCloud size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
