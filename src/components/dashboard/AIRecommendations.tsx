import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Recommendation {
  id: number;
  type: string;
  message: string;
  priority: "high" | "medium" | "low";
  cost: number;
}

const initialRecommendations: Recommendation[] = [
  { id: 1, type: "increase", message: "Consider increasing battery storage by 15% to optimize energy autonomy", priority: "medium", cost: 320 },
  { id: 2, type: "opportunity", message: "New solar project available matching your profile - 8.2% expected return", priority: "high", cost: 450 },
  { id: 3, type: "optimize", message: "Your wind energy allocation could be increased for better diversification", priority: "low", cost: 280 },
];

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);

  const handleAccept = (rec: Recommendation) => {
    toast.success(`Recommendation accepted! ${rec.message} (€${rec.cost})`, {
      description: "This optimization will be applied to your portfolio",
    });
    setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
  };

  const handleReject = (id: number) => {
    toast.info("Recommendation dismissed");
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h2 className="text-xl font-bold">Smart Recommendations</h2>
        </div>
        <p className="text-sm text-muted-foreground pl-10">
          Our AI continuously analyzes your portfolio performance, new investment opportunities, and your energy consumption patterns to suggest optimal portfolio adjustments.
        </p>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <AlertCircle
                className={`w-5 h-5 mt-0.5 shrink-0 ${
                  rec.priority === "high" ? "text-primary" : rec.priority === "medium" ? "text-accent" : "text-muted-foreground"
                }`}
              />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm mb-1">{rec.message}</p>
                  <p className="text-xs text-muted-foreground">Estimated cost: €{rec.cost}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAccept(rec)} className="bg-primary hover:bg-primary-dark">Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(rec.id)}>Reject</Button>
                </div>
              </div>
              <Badge variant={rec.priority === "high" ? "default" : "outline"} className={rec.priority === "high" ? "bg-primary shrink-0" : "shrink-0"}>
                {rec.priority}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No new recommendations at this time</p>
          <p className="text-xs mt-1">Check back later for AI-powered optimization suggestions</p>
        </div>
      )}
    </Card>
  );
}
