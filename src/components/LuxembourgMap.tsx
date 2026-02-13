import luxembourgMap from '@/assets/luxembourg-map.png';
import { MapPin } from 'lucide-react';

// Investment project locations (positions in percentage from top-left of map)
const projectPins = [{
  name: "Luxembourg City",
  x: 52,
  y: 62,
  mw: 12.5
}, {
  name: "Esch-sur-Alzette",
  x: 35,
  y: 79,
  mw: 18.3
}, {
  name: "Differdange",
  x: 28,
  y: 76,
  mw: 8.7
}, {
  name: "Dudelange",
  x: 45,
  y: 82,
  mw: 15.2
}, {
  name: "Ettelbruck",
  x: 48,
  y: 36,
  mw: 9.8
}, {
  name: "Diekirch",
  x: 55,
  y: 32,
  mw: 22.1
}, {
  name: "Wiltz",
  x: 30,
  y: 19,
  mw: 14.6
}, {
  name: "Echternach",
  x: 78,
  y: 46,
  mw: 11.4
}, {
  name: "Grevenmacher",
  x: 75,
  y: 66,
  mw: 7.9
}, {
  name: "Remich",
  x: 68,
  y: 80,
  mw: 13.8
}, {
  name: "Mersch",
  x: 48,
  y: 49,
  mw: 19.2
}, {
  name: "Redange",
  x: 22,
  y: 42,
  mw: 10.5
}, {
  name: "Vianden",
  x: 58,
  y: 22,
  mw: 25.4
}, {
  name: "Clervaux",
  x: 42,
  y: 12,
  mw: 16.7
}, {
  name: "Capellen",
  x: 38,
  y: 64,
  mw: 12.1
}];
export default function LuxembourgMap() {
  return <div className="relative w-full h-[500px] flex items-center justify-center bg-background rounded-lg">
      {/* Map Image */}
      <img src={luxembourgMap} alt="Luxembourg Map" className="h-full w-auto object-contain border-primary-foreground border-0" />
      
      {/* Project Pins Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-auto" style={{
        aspectRatio: '3/4'
      }}>
          {projectPins.map((pin, index) => <div key={index} className="absolute group cursor-pointer" style={{
          left: `${pin.x}%`,
          top: `${pin.y}%`,
          transform: 'translate(-50%, -50%)'
        }}>
              {/* Pin */}
              <div className="relative">
                <MapPin className="w-6 h-6 text-primary drop-shadow-lg transition-transform group-hover:scale-125" fill="currentColor" />
                
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                    <p className="font-semibold text-sm">{pin.name}</p>
                    <p className="text-xs text-muted-foreground">{pin.mw} MW</p>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}