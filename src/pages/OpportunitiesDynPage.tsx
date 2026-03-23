import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sun, Battery, Wind, MapPin, TrendingUp, Leaf, Clock, Loader2, AlertCircle, BarChart3, Map, ArrowRight, Handshake } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { usePortfolio } from "@/hooks/usePortfolio";

interface Project {
  id: string;
  name: string;
  description?: string;
  energy: string;
  capacity: {
    value: number;
    unit: string;
  };
  capacity_per_share: {
    value: number;
    unit: string;
  };
  start_supply: string;
  location: {
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  shares: {
    total: number;
    price: number;
    available: number;
    sold: number;
  };
  status: string;
  forecast: {
    return: number;
    co2_savings_per_share: number;
    annual_production_per_share?: number;
  };
  specs?: Record<string, any>;
}

const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw error;
  }
};

export default function OpportunitiesDynPage() {
  const [filter, setFilter] = useState<"all" | "solar" | "battery" | "wind">("all");
  const [selectedMapProject, setSelectedMapProject] = useState<Project | null>(null);
  const [selectedGraphProject, setSelectedGraphProject] = useState<Project | null>(null);

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    retry: 1,
  });

  const { data: portfolio } = usePortfolio();


  // Check if user has invested in a project
  const hasInvested = (projectId: string): boolean => {
    if (!portfolio?.investments) return false;
    return portfolio.investments.some(inv => inv.project_id === projectId);
  };

  const filteredProjects = useMemo(
    () => filter === "all" ? projects : projects?.filter((p) => p.energy.toLowerCase() === filter),
    [projects, filter]
  );

  const getIcon = (energy: string) => {
    const lowerEnergy = energy.toLowerCase();
    switch (lowerEnergy) {
      case "solar":
      case "pv":
        return Sun;
      case "battery":
      case "storage":
        return Battery;
      case "wind":
        return Wind;
      default:
        return Sun;
    }
  };

  const getTypeEmoji = (energy: string) => {
    const lowerEnergy = energy.toLowerCase();
    switch (lowerEnergy) {
      case "solar":
      case "pv":
        return "🌞";
      case "battery":
      case "storage":
        return "🔋";
      case "wind":
        return "💨";
      default:
        return "⚡";
    }
  };

  const getAvailabilityBadge = (status?: string, projectId?: string) => {
    // Check if user has invested first
    if (projectId && hasInvested(projectId)) {
      return <Badge className="bg-green-500 hover:bg-green-600">Invested</Badge>;
    }
    
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "available":
      case "active":
        return <Badge className="bg-success">Available</Badge>;
      case "low":
      case "limited":
        return <Badge variant="outline" className="border-accent text-accent">Low Availability</Badge>;
      case "waitlist":
      case "full":
        return <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Waitlist</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatLocation = (location: Project["location"]): string => {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    return parts.join(", ");
  };

  // Mock production data - replace with actual API call
  const getProductionData = (projectId: string) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, idx) => ({
      month,
      production: Math.floor(Math.random() * 5000) + 2000,
      forecast: Math.floor(Math.random() * 5000) + 2000,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Investment Opportunities</h1>
        <p className="text-muted-foreground">
          Browse available renewable energy projects and start investing today
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Available Projects</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Projects
          </Button>
          <Button
            variant={filter === "solar" ? "default" : "outline"}
            onClick={() => setFilter("solar")}
          >
            <Sun className="w-4 h-4 mr-2" />
            Solar
          </Button>
          <Button
            variant={filter === "battery" ? "default" : "outline"}
            onClick={() => setFilter("battery")}
          >
            <Battery className="w-4 h-4 mr-2" />
            Battery
          </Button>
          <Button
            variant={filter === "wind" ? "default" : "outline"}
            onClick={() => setFilter("wind")}
          >
            <Wind className="w-4 h-4 mr-2" />
            Wind
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold">Failed to load projects</h3>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Projects Grid */}
      {filteredProjects && filteredProjects.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const Icon = getIcon(project.energy);
            const isWaitlist = project.status.toLowerCase() === "waitlist" || project.status.toLowerCase() === "full";
            const availableShares = project.shares.available;
            
            return (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all group">
                {/* Project Image/Icon */}
                <div className="h-32 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center text-6xl">
                  {getTypeEmoji(project.energy)}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{project.name}</h3>
                      {getAvailabilityBadge(project.status, project.id)}
                    </div>
                    <button
                      onClick={() => setSelectedMapProject(project)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="underline">{formatLocation(project.location)}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{project.capacity_per_share.value} {project.capacity_per_share.unit}</span>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Return</span>
                      </div>
                      <div className="font-bold text-primary">{project.forecast.return}%</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Leaf className="w-4 h-4" />
                        <span>CO₂ Saved</span>
                      </div>
                      <div className="font-bold">{project.forecast.co2_savings_per_share}t/year</div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">Price per Share</span>
                      <span className="text-2xl font-bold text-primary">€{project.shares.price.toLocaleString()}</span>
                    </div>
                    
                    {/* Shares Availability Gauge */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Shares Available</span>
                        <span className="font-medium">{availableShares} / {project.shares.total}</span>
                      </div>
                      <Progress 
                        value={(availableShares / project.shares.total) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Production Graph Button */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedGraphProject(project)}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Production
                    </Button>

                    {isWaitlist ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Clock className="w-4 h-4 mr-2" />
                        Join Waitlist
                      </Button>
                    ) : (
                      <Link to="/confirmation" state={{ projectId: project.id, project }}>
                        <Button className="w-full bg-primary hover:bg-primary-dark group-hover:scale-105 transition-transform">
                          Invest Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects && filteredProjects.length === 0 && !isLoading && (
        <Card className="p-12">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No projects found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new opportunities
            </p>
          </div>
        </Card>
      )}

      {/* Map Dialog */}
      <Dialog open={!!selectedMapProject} onOpenChange={() => setSelectedMapProject(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              {selectedMapProject?.name} - Location
            </DialogTitle>
          </DialogHeader>
          {selectedMapProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">City</div>
                  <div className="font-medium">{selectedMapProject.location.city}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Country</div>
                  <div className="font-medium">{selectedMapProject.location.country}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Latitude</div>
                  <div className="font-medium">{selectedMapProject.location.coordinates.latitude}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Longitude</div>
                  <div className="font-medium">{selectedMapProject.location.coordinates.longitude}</div>
                </div>
              </div>
              
              {/* Embedded Map */}
              <div className="w-full h-96 bg-muted rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedMapProject.location.coordinates.longitude - 0.05},${selectedMapProject.location.coordinates.latitude - 0.05},${selectedMapProject.location.coordinates.longitude + 0.05},${selectedMapProject.location.coordinates.latitude + 0.05}&layer=mapnik&marker=${selectedMapProject.location.coordinates.latitude},${selectedMapProject.location.coordinates.longitude}`}
                  allowFullScreen
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${selectedMapProject.location.coordinates.latitude}&mlon=${selectedMapProject.location.coordinates.longitude}#map=15/${selectedMapProject.location.coordinates.latitude}/${selectedMapProject.location.coordinates.longitude}`, '_blank')}
                >
                  Open in OpenStreetMap
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`https://www.google.com/maps?q=${selectedMapProject.location.coordinates.latitude},${selectedMapProject.location.coordinates.longitude}`, '_blank')}
                >
                  Open in Google Maps
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Production Graph Dialog */}
      <Dialog open={!!selectedGraphProject} onOpenChange={() => setSelectedGraphProject(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {selectedGraphProject?.name} - Production Data
            </DialogTitle>
          </DialogHeader>
          {selectedGraphProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Total Capacity</div>
                  <div className="font-medium">{selectedGraphProject.capacity.value} {selectedGraphProject.capacity.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Per Share</div>
                  <div className="font-medium">{selectedGraphProject.capacity_per_share.value} {selectedGraphProject.capacity_per_share.unit}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Energy Type</div>
                  <div className="font-medium capitalize">{selectedGraphProject.energy}</div>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getProductionData(selectedGraphProject.id)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="production" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Actual Production"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Forecast"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                Production data shown is for demonstration purposes. Actual data will be fetched from the API.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Partnership Opportunities */}
      <div className="space-y-6 mt-16">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Partnership Opportunities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Beyond investing, we're looking for partners to expand renewable energy infrastructure
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-6 hover:shadow-xl transition-all border-2 hover:border-accent">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Land Owners</h3>
              <p className="text-muted-foreground">
                Have land suitable for renewable energy projects? Partner with us to develop solar, wind, or battery installations.
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>Long-term sustainable land use</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>Recurring revenue opportunities</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>Contribute to renewable energy transition</span>
              </li>
            </ul>
            <Button size="lg" className="w-full" variant="outline">
              Learn More
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
          <Card className="p-8 space-y-6 hover:shadow-xl transition-all border-2 hover:border-primary">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Handshake className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Cooperatives</h3>
              <p className="text-muted-foreground">
                Propose your renewable energy projects and connect with investors. Find operational partners to bring your vision to life.
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Access to investment capital</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Strong operational partnerships</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Support from renewable energy experts</span>
              </li>
            </ul>
            <Button size="lg" className="w-full">
              Submit Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
