import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";

interface Transaction {
  date: string;
  direction: "buy" | "sell";
  shares: number;
  price_per_share: number;
}

interface Investment {
  project_id: string;
  project_name: string;
  energy_type: string;
  shares: number;
  capacity: number;
  capacity_unit: string;
  first_purchase_date: string;
  days_held: number;
  transaction_history: Transaction[];
  investment: {
    average_purchase_price: number;
    total_cost_basis: number;
    current_price_per_share: number;
    current_value: number;
    gain_loss: number;
    gain_loss_percentage: number;
    annualized_return: number;
  };
  production?: {
    total_kwh: number;
    data_points: number;
    start_date: string;
    end_date: string;
  };
}

export interface PortfolioData {
  user_id: string;
  user_name: string;
  pod_id: string;
  registration_date: string;
  summary: {
    total_projects: number;
    total_shares: number;
    total_investment: number;
    current_value: number;
    total_gain_loss: number;
    total_gain_loss_percentage: number;
    total_production_kwh: number;
    estimated_annual_savings: number;
    payback_years: number | null;
  };
  by_energy_type: {
    [key: string]: {
      shares: number;
      investment: number;
      capacity: number;
      production_kwh: number;
    };
  };
  investments: Investment[];
}

const fetchPortfolio = async (userId: string): Promise<PortfolioData> => {
  const response = await fetch(`${API_BASE_URL}/portfolio/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch portfolio: ${response.status}`);
  }
  return response.json();
};

export const usePortfolio = (userId: string = "user_001") => {
  return useQuery({
    queryKey: ["portfolio", userId],
    queryFn: () => fetchPortfolio(userId),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
};
