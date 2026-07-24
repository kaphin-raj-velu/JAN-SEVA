import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Filter, MapPin, Search, Sparkles, Layers } from 'lucide-react';
import { Complaint } from '../types';

interface LiveMapModuleProps {
  complaints: Complaint[];
  onSelectComplaint: (id: string) => void;
  onNavigateToTracking: (id: string) => void;
}

export const LiveMapModule: React.FC<LiveMapModuleProps> = ({
  complaints,
  onSelectComplaint,
  onNavigateToTracking,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [citySearch, setCitySearch] = useState<string>('');

  const filteredComplaints = complaints.filter((c) => {
    if (selectedDept !== 'All' && !c.department.toLowerCase().includes(selectedDept.toLowerCase())) return false;
    if (selectedCategory !== 'All' && c.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedStatus !== 'All' && c.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    if (citySearch && !c.location.city.toLowerCase().includes(citySearch.toLowerCase()) && !c.location.address.toLowerCase().includes(citySearch.toLowerCase())) return false;
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default centered near Bengaluru / India
      const map = L.map(mapContainerRef.current).setView([15.9129, 78.9629], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Janseva Portal',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Refresh Markers
    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      filteredComplaints.forEach((item) => {
        // Color coding
        let markerColor = '#DC2626'; // Red for Pending
        if (item.status === 'Resolved' || item.status === 'Closed') {
          markerColor = '#16A34A'; // Green
        } else if (item.status === 'In Progress' || item.status === 'Officer Accepted' || item.status === 'Inspection') {
          markerColor = '#F59E0B'; // Orange
        }

        const customHtmlIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="
            background-color: ${markerColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([item.location.lat, item.location.lng], { icon: customHtmlIcon });

        const popupContent = `
          <div style="font-family: Inter, sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-size: 10px; font-weight: bold; color: ${markerColor}; font-family: monospace;">${item.id}</div>
            <div style="font-size: 13px; font-weight: bold; color: #202124; margin-top: 2px;">${item.title}</div>
            <div style="font-size: 11px; color: #5F6368; margin-top: 2px;">${item.location.address}, ${item.location.city}</div>
            <div style="margin-top: 8px; font-size: 11px;">
              <span style="background: #F8F9FA; padding: 2px 6px; border-radius: 4px; border: 1px solid #DADCE0;">
                Dept: ${item.department}
              </span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          onSelectComplaint(item.id);
        });

        markersLayerRef.current?.addLayer(marker);
      });

      // Fit bounds if markers exist
      if (filteredComplaints.length > 0) {
        const group = L.featureGroup(
          filteredComplaints.map((c) => L.marker([c.location.lat, c.location.lng]))
        );
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.3));
      }
    }
  }, [filteredComplaints]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Title & Filters */}
      <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Geospatial Intelligence
            </span>
            <h2 className="text-2xl font-extrabold text-[#202124] font-heading tracking-tight mt-0.5">
              Live National Grievance Map
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Resolved
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> In Progress
            </span>
            <span className="flex items-center gap-1.5 text-red-700">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Pending
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#5F6368]" />
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Filter by city e.g. Bengaluru..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DADCE0] text-xs font-medium focus:border-[#2563EB] focus:outline-hidden"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs font-medium bg-white focus:border-[#2563EB] focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Road">Road & Potholes</option>
            <option value="Water">Water & Sewage</option>
            <option value="Garbage">Garbage & Sanitation</option>
            <option value="Electricity">Electricity & Cables</option>
            <option value="Health">Public Health</option>
            <option value="Safety">Safety & Hazards</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#DADCE0] text-xs font-medium bg-white focus:border-[#2563EB] focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Resolved">Resolved</option>
            <option value="In Progress">In Progress</option>
            <option value="AI Verified">Pending (AI Verified)</option>
          </select>

          <div className="flex items-center justify-end">
            <span className="text-xs font-bold text-[#2563EB]">
              Showing {filteredComplaints.length} Marker Pins
            </span>
          </div>

        </div>
      </div>

      {/* Map Element Container */}
      <div className="rounded-3xl border border-[#DADCE0] overflow-hidden shadow-lg h-[520px] relative">
        <div ref={mapContainerRef} className="w-full h-full z-10" />
      </div>

      {/* Selected Marker Quick Action Cards below */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {filteredComplaints.slice(0, 3).map((item) => (
          <div
            key={item.id}
            onClick={() => {
              onSelectComplaint(item.id);
              onNavigateToTracking(item.id);
            }}
            className="p-4 rounded-2xl bg-white border border-[#DADCE0] hover:border-blue-300 transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#202124] font-mono">{item.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {item.status}
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#202124] line-clamp-1">{item.title}</h4>
            <p className="text-[11px] text-[#5F6368]">{item.location.address}, {item.location.city}</p>
          </div>
        ))}
      </div>

    </div>
  );
};
