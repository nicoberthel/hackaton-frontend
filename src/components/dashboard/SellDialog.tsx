import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Investment {
  name: string;
  invested: number;
  currentValue: number;
}

interface SellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: Investment | null;
}

export default function SellDialog({ open, onOpenChange, investment }: SellDialogProps) {
  const [sellPercentage, setSellPercentage] = useState("100");

  const getSellAmount = () => {
    if (!investment) return 0;
    return (investment.currentValue * (parseFloat(sellPercentage) || 0)) / 100;
  };

  const handleSell = () => {
    if (!investment) return;
    const percentage = parseFloat(sellPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast.error("Please enter a valid percentage between 1 and 100");
      return;
    }
    toast.success(`Successfully sold ${percentage}% of ${investment.name} for €${getSellAmount().toFixed(2)}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell Portfolio Shares</DialogTitle>
          <DialogDescription>
            How much of your {investment?.name} investment would you like to sell?
          </DialogDescription>
        </DialogHeader>

        {investment && (
          <div className="space-y-6 py-4">
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Value</span>
                <span className="font-bold">€{investment.currentValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Investment</span>
                <span className="font-medium">€{investment.invested.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Gain</span>
                <span className="font-bold text-success">
                  +€{(investment.currentValue - investment.invested).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sell-percentage">Percentage to Sell (%)</Label>
              <div className="flex gap-2">
                <Input
                  id="sell-percentage"
                  type="number"
                  min="1"
                  max="100"
                  value={sellPercentage}
                  onChange={(e) => setSellPercentage(e.target.value)}
                  placeholder="100"
                />
                <Button variant="outline" onClick={() => setSellPercentage("100")}>Max</Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
              <div className="flex justify-between items-center">
                <span className="font-medium">You will receive</span>
                <span className="text-2xl font-bold text-primary">€{getSellAmount().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={handleSell}>Confirm Sale</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
