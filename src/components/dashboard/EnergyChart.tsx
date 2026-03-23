import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Loader2, Info, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, Area, ComposedChart } from "recharts";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";

interface LoadCurveData {
  timestamp: string;
  value: string;
}

interface LoadCurveResponse {
  data: LoadCurveData[];
  page?: number;
  page_size?: number;
  total?: number;
}

interface ProductionData {
  timestamp: string;
  value: string;
}

interface ProductionResponse {
  data: ProductionData[];
}

const formatDateForAPI = (date: Date): string => date.toISOString().split("T")[0];

const fetchLoadCurveByDate = async (podNumber: string, date: Date): Promise<LoadCurveResponse> => {
  const url = `${API_BASE_URL}/loadcurve/${podNumber}?date=${formatDateForAPI(date)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch load curve data");
  return response.json();
};

const fetchLoadCurveByDateRange = async (
  podNumber: string,
  fromDate: Date,
  toDate: Date,
  pageSize: number = 1000
): Promise<LoadCurveResponse> => {
  const url = `${API_BASE_URL}/loadcurve/${podNumber}?from_date=${formatDateForAPI(fromDate)}&to_date=${formatDateForAPI(toDate)}&page_size=${pageSize}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch load curve data");
  return response.json();
};

const fetchLoadCurveMonthly = async (podNumber: string, year: number): Promise<LoadCurveResponse> => {
  const url = `${API_BASE_URL}/loadcurve/${podNumber}/monthly?year=${year}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch monthly load curve data");
  const result = await response.json();
  return Array.isArray(result) ? { data: result } : result;
};

const fetchProductionByDate = async (projectId: string, date: Date): Promise<ProductionResponse> => {
  const url = `${API_BASE_URL}/projects/${projectId}/production?date=${formatDateForAPI(date)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch production data for project ${projectId}`);
  return response.json();
};

const fetchProductionByDateRange = async (
  projectId: string,
  fromDate: Date,
  toDate: Date,
  pageSize: number = 1000
): Promise<ProductionResponse> => {
  const url = `${API_BASE_URL}/projects/${projectId}/production?from_date=${formatDateForAPI(fromDate)}&to_date=${formatDateForAPI(toDate)}&page_size=${pageSize}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch production data for project ${projectId}`);
  return response.json();
};

const fetchProductionMonthly = async (projectId: string, year: number): Promise<ProductionResponse> => {
  const url = `${API_BASE_URL}/projects/${projectId}/production/monthly?year=${year}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch monthly production data for project ${projectId}`);
  const result = await response.json();
  return Array.isArray(result) ? { data: result } : result;
};

const aggregateByDay = <T extends { timestamp: string; value: string }>(data: T[]): T[] => {
  const dailyData = new Map<string, { sum: number; count: number }>();
  data.forEach((item) => {
    const dayKey = new Date(item.timestamp).toISOString().split("T")[0];
    const entry = dailyData.get(dayKey) ?? { sum: 0, count: 0 };
    entry.sum += parseFloat(item.value);
    entry.count += 1;
    dailyData.set(dayKey, entry);
  });
  return Array.from(dailyData.entries()).map(([dayKey, { sum, count }]) => ({
    timestamp: dayKey + "T12:00:00Z",
    value: (sum / count).toFixed(2),
  })) as T[];
};

type TimePeriod = "day" | "week" | "month" | "year";

const getDateRange = (date: Date, period: TimePeriod): { fromDate: Date; toDate: Date } => {
  const fromDate = new Date(date);
  const toDate = new Date(date);
  switch (period) {
    case "day":
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      break;
    case "week": {
      const dayOfWeek = fromDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      fromDate.setDate(fromDate.getDate() + diff);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setDate(fromDate.getDate() + 6);
      toDate.setHours(23, 59, 59, 999);
      break;
    }
    case "month":
      fromDate.setDate(1);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setMonth(toDate.getMonth() + 1, 0);
      toDate.setHours(23, 59, 59, 999);
      break;
    case "year":
      fromDate.setMonth(0, 1);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setMonth(11, 31);
      toDate.setHours(23, 59, 59, 999);
      break;
  }
  return { fromDate, toDate };
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const getActualDateLabel = (data: LoadCurveData[] | undefined, period: TimePeriod): string => {
  if (!data || data.length === 0) return "No data";
  const firstDate = new Date(data[0].timestamp);
  switch (period) {
    case "day":
      return firstDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    case "week":
      return `Week ${getWeekNumber(firstDate)}, ${firstDate.getFullYear()}`;
    case "month":
      return firstDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "year":
      return firstDate.getFullYear().toString();
    default:
      return firstDate.toLocaleDateString();
  }
};

const buildRangeQuery = async <T extends { data: unknown[] }>(
  fetcher: (from: Date, to: Date, size: number) => Promise<T>,
  fromDate: Date,
  toDate: Date
): Promise<T> => {
  const midDate = new Date(fromDate);
  midDate.setDate(15);
  const midDateEnd = new Date(midDate);
  midDateEnd.setDate(midDate.getDate() + 1);
  const [firstHalf, secondHalf] = await Promise.all([
    fetcher(fromDate, midDate, 1000),
    fetcher(midDateEnd, toDate, 1000),
  ]);
  return { ...firstHalf, data: [...firstHalf.data, ...secondHalf.data] } as T;
};

export default function EnergyChart() {
  const [selectedPod] = useState("00011");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("day");
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 8, 20));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const navigatePeriod = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    const m = direction === "prev" ? -1 : 1;
    switch (timePeriod) {
      case "day": newDate.setDate(newDate.getDate() + m); break;
      case "week": newDate.setDate(newDate.getDate() + 7 * m); break;
      case "month": newDate.setMonth(newDate.getMonth() + m); break;
      case "year": newDate.setFullYear(newDate.getFullYear() + m); break;
    }
    setSelectedDate(newDate);
  };

  const { data: rawLoadCurveData, isLoading: isLoadingChart, error: chartError } = useQuery({
    queryKey: ["loadcurve", selectedPod, selectedDate, timePeriod],
    queryFn: async () => {
      if (timePeriod === "year") return fetchLoadCurveMonthly(selectedPod, selectedDate.getFullYear());
      const { fromDate, toDate } = getDateRange(selectedDate, timePeriod);
      if (timePeriod === "day") return fetchLoadCurveByDate(selectedPod, selectedDate);
      if (timePeriod === "week") return fetchLoadCurveByDateRange(selectedPod, fromDate, toDate, 1000);
      return buildRangeQuery((from, to, size) => fetchLoadCurveByDateRange(selectedPod, from, to, size), fromDate, toDate);
    },
  });

  const { data: rawWindData } = useQuery({
    queryKey: ["production", "00015", selectedDate, timePeriod],
    queryFn: async () => {
      if (timePeriod === "year") return fetchProductionMonthly("00015", selectedDate.getFullYear());
      const { fromDate, toDate } = getDateRange(selectedDate, timePeriod);
      if (timePeriod === "day") return fetchProductionByDate("00015", selectedDate);
      if (timePeriod === "week") return fetchProductionByDateRange("00015", fromDate, toDate, 1000);
      return buildRangeQuery((from, to, size) => fetchProductionByDateRange("00015", from, to, size), fromDate, toDate);
    },
  });

  const { data: rawPvData } = useQuery({
    queryKey: ["production", "00012", selectedDate, timePeriod],
    queryFn: async () => {
      if (timePeriod === "year") return fetchProductionMonthly("00012", selectedDate.getFullYear());
      const { fromDate, toDate } = getDateRange(selectedDate, timePeriod);
      if (timePeriod === "day") return fetchProductionByDate("00012", selectedDate);
      if (timePeriod === "week") return fetchProductionByDateRange("00012", fromDate, toDate, 1000);
      return buildRangeQuery((from, to, size) => fetchProductionByDateRange("00012", from, to, size), fromDate, toDate);
    },
  });

  const loadCurveData = rawLoadCurveData
    ? { ...rawLoadCurveData, data: timePeriod === "month" ? aggregateByDay(rawLoadCurveData.data) : rawLoadCurveData.data }
    : undefined;

  const windProductionData = rawWindData
    ? { ...rawWindData, data: timePeriod === "month" ? aggregateByDay(rawWindData.data) : rawWindData.data }
    : undefined;

  const pvProductionData = rawPvData
    ? { ...rawPvData, data: timePeriod === "month" ? aggregateByDay(rawPvData.data) : rawPvData.data }
    : undefined;

  const consumptionChartData = (() => {
    if (!loadCurveData?.data) return [];
    const normalizeTimestamp = (ts: string) => {
      const date = new Date(ts);
      if (timePeriod === "year") return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1)).toISOString();
      return date.toISOString();
    };
    const windMap = new Map(windProductionData?.data.map((item) => [normalizeTimestamp(item.timestamp), parseFloat(item.value)]) ?? []);
    const pvMap = new Map(pvProductionData?.data.map((item) => [normalizeTimestamp(item.timestamp), parseFloat(item.value)]) ?? []);

    return loadCurveData.data.map((item, index) => {
      const date = new Date(item.timestamp);
      let formattedTimestamp: string;
      switch (timePeriod) {
        case "day":
          formattedTimestamp = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
          break;
        case "week":
          formattedTimestamp = index % 16 === 0 ? date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }) : "";
          break;
        case "month":
          formattedTimestamp = date.toLocaleDateString("en-US", { day: "numeric" });
          break;
        case "year":
          formattedTimestamp = date.toLocaleDateString("en-US", { month: "short" });
          break;
        default:
          formattedTimestamp = date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit" });
      }
      const normalizedTimestamp = normalizeTimestamp(item.timestamp);
      return {
        timestamp: formattedTimestamp,
        Consumption: parseFloat(item.value),
        Wind: windMap.get(normalizedTimestamp) ?? 0,
        PV: pvMap.get(normalizedTimestamp) ?? 0,
        fullDate: date,
      };
    });
  })();

  return (
    <Card className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Energy Consumption</h2>
          <p className="text-muted-foreground">Real-time consumption data from your POD</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  defaultMonth={selectedDate}
                  onSelect={(date) => { if (date) { setSelectedDate(date); setIsCalendarOpen(false); } }}
                  captionLayout="dropdown-buttons"
                  fromYear={2020}
                  toYear={2030}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex gap-1">
                {(["day", "week", "month", "year"] as TimePeriod[]).map((p) => (
                  <Button
                    key={p}
                    variant="outline"
                    size="sm"
                    onClick={() => setTimePeriod(p)}
                    className={timePeriod === p ? "bg-primary text-white" : ""}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigatePeriod("prev")} disabled={isLoadingChart}>
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm font-medium px-3 min-w-[180px] text-center">
              {getActualDateLabel(loadCurveData?.data, timePeriod)}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigatePeriod("next")} disabled={isLoadingChart}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="h-96">
        {isLoadingChart && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {chartError && (
          <div className="flex items-center justify-center h-full text-red-500">
            <div className="text-center">
              <Info className="w-8 h-8 mx-auto mb-2" />
              <p>Unable to load consumption data</p>
            </div>
          </div>
        )}
        {loadCurveData && !isLoadingChart && (
          <ResponsiveContainer width="100%" height="100%">
            {timePeriod === "month" || timePeriod === "year" ? (
              <BarChart
                data={consumptionChartData.map((item) => {
                  const totalProduction = item.Wind + item.PV;
                  const windUsed = Math.min(item.Wind, item.Consumption);
                  const pvUsed = Math.min(item.PV, Math.max(0, item.Consumption - windUsed));
                  return {
                    ...item,
                    WindUsed: windUsed,
                    PVUsed: pvUsed,
                    GridImport: Math.max(0, item.Consumption - totalProduction),
                    Excess: Math.max(0, totalProduction - item.Consumption),
                  };
                })}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis label={{ value: "kWh (avg)", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const totalProd = data.Wind + data.PV;
                      const coverage = (totalProd / data.Consumption) * 100;
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold mb-2">{data.timestamp}</p>
                          <p className="text-sm font-semibold">Consumption: {data.Consumption.toFixed(2)} kWh</p>
                          <p className="text-sm text-blue-500">Wind: {data.Wind.toFixed(2)} kWh</p>
                          <p className="text-sm text-orange-500">PV: {data.PV.toFixed(2)} kWh</p>
                          {data.GridImport > 0 && <p className="text-sm text-gray-500">Grid Import: {data.GridImport.toFixed(2)} kWh</p>}
                          {data.Excess > 0 && <p className="text-sm text-green-500">Excess Export: {data.Excess.toFixed(2)} kWh</p>}
                          <p className="text-sm font-semibold mt-1">Self-Coverage: {Math.min(100, coverage).toFixed(1)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="WindUsed" fill="#3b82f6" name="Wind" stackId="bar" />
                <Bar dataKey="PVUsed" fill="#f97316" name="PV" stackId="bar" />
                <Bar dataKey="GridImport" fill="#94a3b8" name="Grid Import" stackId="bar" />
                <Bar dataKey="Excess" fill="#22c55e" name="Excess Export" stackId="bar" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <ComposedChart data={consumptionChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  angle={timePeriod === "day" ? 0 : -45}
                  textAnchor={timePeriod === "day" ? "middle" : "end"}
                  height={timePeriod === "day" ? 50 : 80}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  interval={timePeriod === "day" ? "preserveStartEnd" : 0}
                />
                <YAxis label={{ value: "kWh", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Area type="monotone" dataKey="Wind" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.6} name="Wind" stackId="1" />
                <Area type="monotone" dataKey="PV" fill="#f97316" stroke="#f97316" fillOpacity={0.6} name="PV" stackId="1" />
                <Line type="monotone" dataKey="Consumption" stroke="hsl(var(--primary))" name="Consumption" strokeWidth={2} dot={false} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
