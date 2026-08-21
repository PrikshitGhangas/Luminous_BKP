'use client';

import React, { useState, useMemo } from 'react';
import { CampusLocation, Incident, TimeFilter } from '@/lib/types';
import { CAMPUS_LOCATIONS } from '@/lib/constants/demo-data';
import { SeverityBadge } from '@/components/shared/severity-badge';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
  Eye,
  Compass,
} from 'lucide-react';

interface CampusMapInteractiveProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectLocation?: (location: CampusLocation) => void;
  severityFilter?: string;
  timeFilter?: TimeFilter;
  className?: string;
}

export function CampusMapInteractive({
  incidents,
  selectedIncident,
  onSelectIncident,
  onSelectLocation,
  severityFilter = 'all',
  timeFilter = '30days',
  className = '',
}: CampusMapInteractiveProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeSector, setActiveSector] = useState<string>('all');
  const [hoveredNode, setHoveredNode] = useState<CampusLocation | null>(null);
  const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);
  const [activeLayers, setActiveLayers] = useState<{
    incidents: boolean;
    patrols: boolean;
    sensors: boolean;
    evacuation: boolean;
  }>({
    incidents: true,
    patrols: true,
    sensors: false,
    evacuation: false,
  });

  // Filter incidents based on timeFilter and severityFilter
  const filteredIncidents = useMemo(() => {
    const now = Date.now();
    return incidents.filter((inc) => {
      // Severity check
      if (severityFilter !== 'all' && inc.severity !== severityFilter.toLowerCase()) {
        return false;
      }

      // Time filter check
      const incTime = new Date(inc.created_at).getTime();
      const diffHours = (now - incTime) / (1000 * 60 * 60);

      if (timeFilter === 'today' && diffHours > 24) return false;
      if (timeFilter === '7days' && diffHours > 24 * 7) return false;
      if (timeFilter === '30days' && diffHours > 24 * 30) return false;

      return true;
    });
  }, [incidents, severityFilter, timeFilter]);

  // Map incidents to locations
  const locationIncidentMap = useMemo(() => {
    const map: Record<string, Incident[]> = {};
    CAMPUS_LOCATIONS.forEach((loc) => {
      map[loc.id] = filteredIncidents.filter((inc) => {
        const incLoc = inc.location_name.toLowerCase();
        const locName = loc.name.toLowerCase();
        return incLoc.includes(locName) || locName.includes(incLoc) || inc.location_id === loc.id;
      });
    });
    return map;
  }, [filteredIncidents]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 1.8));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.8));
  const handleResetZoom = () => setZoomLevel(1);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className={`relative rounded-2xl border border-[#AEB0B7] bg-white overflow-hidden shadow-md flex flex-col ${className}`}>
      {/* Map HUD Header */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 border-b border-[#D0D1D6] bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAB308]/15 border border-[#EAB308]/40 text-[#B45309]">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-[#202226] uppercase">
                GEOSPATIAL CAMPUS MAP
              </span>
              <span className="flex h-2 w-2 rounded-full bg-[#EAB308] animate-pulse" />
              <span className="text-[10px] text-[#555960] hidden sm:inline">
                GRID: 10 SECTORS SYNCED
              </span>
            </div>
            <span className="text-[10px] text-[#555960]">
              Live Vector Telemetry · 10 Strategic Campus Facilities
            </span>
          </div>
        </div>

        {/* Sector Filter & Layer Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sector Buttons */}
          <div className="hidden lg:flex items-center gap-1 bg-[#E7E8EB] p-1 rounded-lg border border-[#D0D1D6] text-[11px]">
            {['all', 'Academic', 'Residential', 'Services', 'Administration'].map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSector(sec)}
                className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                  activeSector === sec
                    ? 'bg-[#EAB308] text-[#202226] font-bold'
                    : 'text-[#555960] hover:text-[#202226]'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Layer Toggle Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleLayer('patrols')}
              title="Toggle Security Patrols"
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-mono transition-colors ${
                activeLayers.patrols
                  ? 'bg-[#10B981]/15 border-[#10B981] text-[#067a4f]'
                  : 'bg-white border-[#D0D1D6] text-[#555960]'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[10px]">Patrols</span>
            </button>
            <button
              onClick={() => toggleLayer('sensors')}
              title="Toggle CCTV & Sensors"
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-mono transition-colors ${
                activeLayers.sensors
                  ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-[#1d4ed8]'
                  : 'bg-white border-[#D0D1D6] text-[#555960]'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[10px]">CCTV</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white border border-[#D0D1D6] rounded-lg p-0.5">
            <button
              onClick={handleZoomIn}
              className="p-1 text-[#555960] hover:text-[#B45309] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-[#555960] hover:text-[#B45309] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-[#555960] hover:text-[#B45309] transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Vector Canvas — Premium Light Security Map */}
      <div className="relative flex-1 min-h-[460px] sm:min-h-[520px] w-full overflow-hidden bg-[#E7E8EB] select-none">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#D0D1D6_1px,transparent_1px),linear-gradient(to_bottom,#D0D1D6_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-60 pointer-events-none" />

        {/* Vector SVG Map Container with Smooth Zoom/Pan Transform */}
        <div
          className="relative w-full h-full transition-transform duration-300 ease-out origin-center flex items-center justify-center p-4"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 1000 680"
            className="w-full h-full max-h-[640px] overflow-visible"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(32,34,38,0.12))' }}
          >
            <defs>
              {/* Light Surface Gradients */}
              <linearGradient id="gradAcademic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#D4D5DA" />
              </linearGradient>
              <linearGradient id="gradEngCritical" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#EFEFEF" />
              </linearGradient>
              <linearGradient id="gradResidential" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#D4D5DA" />
              </linearGradient>
              <linearGradient id="gradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E7E8EB" />
              </linearGradient>
              <linearGradient id="gradSports" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#DDF0EA" />
              </linearGradient>
              <linearGradient id="gradPath" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C7C8CE" />
                <stop offset="100%" stopColor="#AEB0B7" />
              </linearGradient>

              {/* Glowing Filters (kept subtle) */}
              <filter id="glowRed" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glowGold" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* CAMPUS BOUNDARY & ROAD NETWORKS */}
            {/* Outer Perimeter Ring Road */}
            <rect
              x="50"
              y="40"
              width="900"
              height="600"
              rx="40"
              fill="none"
              stroke="#B7B9C0"
              strokeWidth="24"
              strokeLinejoin="round"
            />
            <rect
              x="50"
              y="40"
              width="900"
              height="600"
              rx="40"
              fill="none"
              stroke="#EAB308"
              strokeWidth="1.5"
              strokeDasharray="8 8"
              opacity="0.5"
            />

            {/* Inner Boulevard Network */}
            {/* Horizontal Main Avenue */}
            <path
              d="M 60 360 L 940 360"
              stroke="url(#gradPath)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 60 360 L 940 360"
              stroke="#EAB308"
              strokeWidth="1.5"
              strokeDasharray="12 12"
              opacity="0.5"
            />

            {/* Vertical Central Walkway */}
            <path
              d="M 500 50 L 500 630"
              stroke="url(#gradPath)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 500 50 L 500 630"
              stroke="#EAB308"
              strokeWidth="1.5"
              strokeDasharray="12 12"
              opacity="0.5"
            />

            {/* Diagonal Connecting Paths */}
            <path d="M 300 220 L 500 360 L 800 200" stroke="#B7B9C0" strokeWidth="12" strokeLinecap="round" />
            <path d="M 180 520 L 340 440 L 500 360 L 620 420 L 820 540" stroke="#B7B9C0" strokeWidth="12" strokeLinecap="round" />

            {/* Central University Plaza / Roundabout */}
            <circle cx="500" cy="360" r="48" fill="#D4D5DA" stroke="#EAB308" strokeWidth="2" />
            <circle cx="500" cy="360" r="32" fill="#C7C8CE" stroke="#AEB0B7" strokeWidth="1.5" />
            <circle cx="500" cy="360" r="12" fill="#EAB308" opacity="0.8" />
            <text x="500" y="364" textAnchor="middle" fill="#202226" fontSize="9" fontWeight="bold" fontFamily="monospace">
              PLAZA
            </text>

            {/* Green Spaces & Canopy Accents */}
            <g opacity="0.7">
              {/* North Green Quad */}
              <rect x="580" y="100" width="120" height="90" rx="16" fill="#E5F3EC" stroke="#9CCFB4" strokeWidth="1" />
              <text x="640" y="150" textAnchor="middle" fill="#067a4f" fontSize="10" fontFamily="monospace" opacity="0.7">
                NORTH PARK
              </text>
              {/* West Lawn */}
              <circle cx="160" cy="240" r="45" fill="#E5F3EC" stroke="#9CCFB4" strokeWidth="1" />
              {/* South Garden */}
              <rect x="680" y="390" width="90" height="70" rx="14" fill="#E5F3EC" stroke="#9CCFB4" strokeWidth="1" />
            </g>

            {/* 10 STRATEGIC CAMPUS BUILDINGS */}

            {/* 1. ENGINEERING BLOCK (BLOCK D) — Top Left */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-eng')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-eng'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-eng') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group transition-all"
            >
              {/* Building base */}
              <rect x="230" y="165" width="160" height="120" rx="12" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="220"
                y="150"
                width="160"
                height="120"
                rx="12"
                fill="url(#gradEngCritical)"
                stroke="#DC2626"
                strokeWidth="2.5"
                className="group-hover:stroke-[#EAB308] transition-colors"
                filter="url(#glowRed)"
                opacity="0.95"
              />
              {/* Floor accent lines */}
              <line x1="235" y1="190" x2="365" y2="190" stroke="#DC2626" strokeWidth="1" opacity="0.3" />
              <line x1="235" y1="225" x2="365" y2="225" stroke="#DC2626" strokeWidth="1" opacity="0.3" />
              {/* Building Label */}
              <rect x="235" y="162" width="46" height="18" rx="4" fill="#FDE8E8" />
              <text x="258" y="175" textAnchor="middle" fill="#B91C1C" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ENG-D
              </text>
              <text x="300" y="210" textAnchor="middle" fill="#202226" fontSize="13" fontWeight="bold">
                Engineering Block
              </text>
              <text x="300" y="230" textAnchor="middle" fill="#555960" fontSize="10" fontFamily="monospace">
                Block D · Labs &amp; Computing
              </text>
              <text x="300" y="252" textAnchor="middle" fill="#DC2626" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ⚠ 2 ACTIVE HAZARDS
              </text>
            </g>

            {/* 2. LIBRARY — Top Center */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-lib')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-lib'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-lib') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect x="425" y="115" width="130" height="95" rx="12" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="415"
                y="105"
                width="130"
                height="95"
                rx="12"
                fill="url(#gradAcademic)"
                stroke="#EAB308"
                strokeWidth="1.5"
                className="group-hover:stroke-[#B45309] transition-colors"
              />
              <rect x="428" y="115" width="50" height="18" rx="4" fill="#FFFFFF" stroke="#D0D1D6" strokeWidth="1" />
              <text x="453" y="128" textAnchor="middle" fill="#B45309" fontSize="9" fontWeight="bold" fontFamily="monospace">
                LIB-01
              </text>
              <text x="480" y="155" textAnchor="middle" fill="#202226" fontSize="13" fontWeight="bold">
                Library
              </text>
              <text x="480" y="175" textAnchor="middle" fill="#555960" fontSize="10" fontFamily="monospace">
                Central Commons
              </text>
            </g>

            {/* 3. HOSTEL A — Top Right */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-hostel-a')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-hostel-a'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-hostel-a') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect x="735" y="115" width="130" height="95" rx="12" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="725"
                y="105"
                width="130"
                height="95"
                rx="12"
                fill="url(#gradResidential)"
                stroke="#AEB0B7"
                strokeWidth="1.5"
                className="group-hover:stroke-[#EAB308] transition-colors"
              />
              <rect x="738" y="115" width="50" height="18" rx="4" fill="#FFFFFF" stroke="#D0D1D6" strokeWidth="1" />
              <text x="763" y="128" textAnchor="middle" fill="#1d4ed8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                HST-A
              </text>
              <text x="790" y="155" textAnchor="middle" fill="#202226" fontSize="13" fontWeight="bold">
                Hostel A
              </text>
              <text x="790" y="175" textAnchor="middle" fill="#555960" fontSize="10" fontFamily="monospace">
                North Student Tower
              </text>
            </g>

            {/* 4. MAIN BLOCK — Center */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-main')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-main'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-main') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect x="425" y="245" width="150" height="100" rx="14" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="415"
                y="235"
                width="150"
                height="100"
                rx="14"
                fill="url(#gradAcademic)"
                stroke="#EAB308"
                strokeWidth="2"
                className="group-hover:stroke-[#B45309] transition-colors"
              />
              <rect x="428" y="245" width="46" height="18" rx="4" fill="#FFFFFF" stroke="#EAB308" strokeWidth="1" />
              <text x="451" y="258" textAnchor="middle" fill="#B45309" fontSize="9" fontWeight="bold" fontFamily="monospace">
                MB-01
              </text>
              <text x="490" y="285" textAnchor="middle" fill="#202226" fontSize="14" fontWeight="bold">
                Main Block
              </text>
              <text x="490" y="305" textAnchor="middle" fill="#555960" fontSize="10" fontFamily="monospace">
                Lecture Complex &amp; Halls
              </text>
            </g>

            {/* 5. HOSTEL B — Middle Right */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-hostel-b')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-hostel-b'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-hostel-b') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect x="765" y="275" width="130" height="95" rx="12" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="755"
                y="265"
                width="130"
                height="95"
                rx="12"
                fill="url(#gradResidential)"
                stroke="#F59E0B"
                strokeWidth="1.5"
                className="group-hover:stroke-[#EAB308] transition-colors"
              />
              <rect x="768" y="275" width="50" height="18" rx="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1" />
              <text x="793" y="288" textAnchor="middle" fill="#B45309" fontSize="9" fontWeight="bold" fontFamily="monospace">
                HST-B
              </text>
              <text x="820" y="315" textAnchor="middle" fill="#202226" fontSize="13" fontWeight="bold">
                Hostel B
              </text>
              <text x="820" y="335" textAnchor="middle" fill="#B45309" fontSize="10" fontFamily="monospace">
                1 Warning Event
              </text>
            </g>

            {/* 6. CAFETERIA — Middle-Lower Right */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-cafe')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-cafe'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-cafe') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect x="585" y="425" width="120" height="90" rx="12" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="575"
                y="415"
                width="120"
                height="90"
                rx="12"
                fill="url(#gradAcademic)"
                stroke="#AEB0B7"
                strokeWidth="1.5"
                className="group-hover:stroke-[#EAB308] transition-colors"
              />
              <rect x="588" y="425" width="50" height="18" rx="4" fill="#FFFFFF" />
              <text x="613" y="438" textAnchor="middle" fill="#067a4f" fontSize="9" fontWeight="bold" fontFamily="monospace">
                CAF-01
              </text>
              <text x="635" y="465" textAnchor="middle" fill="#202226" fontSize="13" fontWeight="bold">
                Cafeteria
              </text>
              <text x="635" y="485" textAnchor="middle" fill="#555960" fontSize="10" fontFamily="monospace">
                Food Court &amp; Terrace
              </text>
            </g>

            {/* 7. SPORTS COMPLEX — Bottom Right */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-sports')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-sports'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-sports') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect x="765" y="485" width="140" height="110" rx="14" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="755"
                y="475"
                width="140"
                height="110"
                rx="14"
                fill="url(#gradSports)"
                stroke="#10B981"
                strokeWidth="1.5"
                className="group-hover:stroke-[#EAB308] transition-colors"
              />
              <rect x="768" y="485" width="50" height="18" rx="4" fill="#ECFDF5" />
              <text x="793" y="498" textAnchor="middle" fill="#067a4f" fontSize="9" fontWeight="bold" fontFamily="monospace">
                SPT-01
              </text>
              <text x="825" y="530" textAnchor="middle" fill="#202226" fontSize="13" fontWeight="bold">
                Sports Complex
              </text>
              <text x="825" y="550" textAnchor="middle" fill="#067a4f" fontSize="10" fontFamily="monospace">
                Arena &amp; Gymnasium
              </text>
            </g>

            {/* 8. MEDICAL CENTER — Lower Center */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-med')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-med'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-med') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect x="295" y="425" width="120" height="90" rx="12" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="285"
                y="415"
                width="120"
                height="90"
                rx="12"
                fill="url(#gradAcademic)"
                stroke="#DC2626"
                strokeWidth="1.5"
                className="group-hover:stroke-[#EAB308] transition-colors"
              />
              <rect x="298" y="425" width="50" height="18" rx="4" fill="#FDE8E8" />
              <text x="323" y="438" textAnchor="middle" fill="#B91C1C" fontSize="9" fontWeight="bold" fontFamily="monospace">
                MED-01
              </text>
              <text x="345" y="465" textAnchor="middle" fill="#202226" fontSize="13" fontWeight="bold">
                Medical Center
              </text>
              <text x="345" y="485" textAnchor="middle" fill="#B91C1C" fontSize="10" fontFamily="monospace">
                24/7 Trauma Clinic
              </text>
            </g>

            {/* 9. PARKING — Bottom Left */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-parking')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-parking'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-parking') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect x="135" y="485" width="130" height="95" rx="12" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="125"
                y="475"
                width="130"
                height="95"
                rx="12"
                fill="url(#gradAcademic)"
                stroke="#AEB0B7"
                strokeWidth="1.5"
                className="group-hover:stroke-[#EAB308] transition-colors"
              />
              <rect x="138" y="485" width="50" height="18" rx="4" fill="#F0F1F2" />
              <text x="163" y="498" textAnchor="middle" fill="#555960" fontSize="9" fontWeight="bold" fontFamily="monospace">
                PRK-N
              </text>
              <text x="190" y="525" textAnchor="middle" fill="#202226" fontSize="13" fontWeight="bold">
                Parking
              </text>
              <text x="190" y="545" textAnchor="middle" fill="#555960" fontSize="10" fontFamily="monospace">
                North &amp; South Decks
              </text>
            </g>

            {/* 10. ADMINISTRATIVE BLOCK — Bottom Center */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-admin')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-admin'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-admin') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect x="425" y="515" width="160" height="100" rx="14" fill="#FFFFFF" opacity="0.6" />
              <rect
                x="415"
                y="505"
                width="160"
                height="100"
                rx="14"
                fill="url(#gradAdmin)"
                stroke="#EAB308"
                strokeWidth="2"
                className="group-hover:stroke-[#B45309] transition-colors"
                filter="url(#glowGold)"
              />
              <rect x="428" y="515" width="56" height="18" rx="4" fill="#EAB308" />
              <text x="456" y="528" textAnchor="middle" fill="#202226" fontSize="9" fontWeight="bold" fontFamily="monospace">
                ADM-HQ
              </text>
              <text x="495" y="555" textAnchor="middle" fill="#202226" fontSize="13" fontWeight="bold">
                Administrative Block
              </text>
              <text x="495" y="575" textAnchor="middle" fill="#B45309" fontSize="10" fontFamily="monospace">
                Security Operations &amp; HQ
              </text>
            </g>

            {/* DYNAMIC INCIDENT PINS & RADAR PULSES */}
            {activeLayers.incidents &&
              filteredIncidents.map((incident) => {
                // Find matching location coords
                const matchedLocation = CAMPUS_LOCATIONS.find((l) =>
                  incident.location_name.toLowerCase().includes(l.name.toLowerCase()) ||
                  l.name.toLowerCase().includes(incident.location_name.toLowerCase()) ||
                  incident.location_id === l.id
                );

                if (!matchedLocation) return null;

                // Scale percentage coords (0-100) to SVG canvas (1000x680)
                const pinX = (matchedLocation.coordinates.x / 100) * 1000;
                const pinY = (matchedLocation.coordinates.y / 100) * 680;
                const isSelected = selectedIncident?.id === incident.id;
                const isCritical = incident.severity === 'critical';
                const isHigh = incident.severity === 'high';

                return (
                  <g
                    key={incident.id}
                    transform={`translate(${pinX}, ${pinY})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIncident(incident);
                    }}
                    onMouseEnter={() => setHoveredIncident(incident)}
                    onMouseLeave={() => setHoveredIncident(null)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Radar Wave for CRITICAL */}
                    {isCritical && (
                      <>
                        <circle cx="0" cy="0" r="32" fill="#DC2626" opacity="0.15">
                          <animate attributeName="r" values="16;44;16" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="0" cy="0" r="22" fill="#DC2626" opacity="0.25">
                          <animate attributeName="r" values="12;32;12" dur="2s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}

                    {/* Double Pulse for HIGH */}
                    {isHigh && (
                      <circle cx="0" cy="0" r="24" fill="#F59E0B" opacity="0.2">
                        <animate attributeName="r" values="14;28;14" dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Pin Outer Ring */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 18 : 14}
                      fill={
                        isCritical
                          ? '#DC2626'
                          : isHigh
                          ? '#F59E0B'
                          : incident.severity === 'medium'
                          ? '#3B82F6'
                          : '#10B981'
                      }
                      stroke={isSelected ? '#EAB308' : '#FFFFFF'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200"
                    />

                    {/* Pin Icon Glyph */}
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {isCritical ? '!' : isHigh ? '▲' : '●'}
                    </text>

                    {/* Quick Floating Tag */}
                    <g transform="translate(0, -22)" className="pointer-events-none">
                      <rect
                        x="-45"
                        y="-14"
                        width="90"
                        height="18"
                        rx="4"
                        fill="#FFFFFF"
                        stroke={isCritical ? '#DC2626' : isHigh ? '#F59E0B' : '#EAB308'}
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="-2"
                        textAnchor="middle"
                        fill={isCritical ? '#DC2626' : isHigh ? '#B45309' : '#B45309'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {incident.severity.toUpperCase()}
                      </text>
                    </g>
                  </g>
                );
              })}

            {/* SECURITY PATROL UNITS OVERLAY */}
            {activeLayers.patrols && (
              <g className="pointer-events-none">
                {/* Officer Sharma at Block D */}
                <g transform="translate(290, 240)">
                  <circle cx="0" cy="0" r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="18" fill="#10B981" opacity="0.2">
                    <animate attributeName="r" values="10;22;10" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <text x="14" y="4" fill="#067a4f" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    UNIT-ALPHA (Sharma)
                  </text>
                </g>
                {/* Officer Ramos at Main Block */}
                <g transform="translate(530, 270)">
                  <circle cx="0" cy="0" r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="14" y="4" fill="#067a4f" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    UNIT-BRAVO (Ramos)
                  </text>
                </g>
                {/* Perimeter Patrol at Parking */}
                <g transform="translate(180, 520)">
                  <circle cx="0" cy="0" r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x="14" y="4" fill="#067a4f" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    PERIMETER-MOBILE
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Hover Inspector Tooltip Overlay */}
        {hoveredIncident ? (
          <div className="absolute bottom-4 left-4 z-30 max-w-sm rounded-xl border border-[#EAB308] bg-white p-3 text-xs text-[#202226] shadow-lg animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2 border-b border-[#D0D1D6] pb-1.5">
              <span className="text-[11px] font-bold text-[#B45309]">
                {hoveredIncident.incident_number}
              </span>
              <SeverityBadge severity={hoveredIncident.severity} size="sm" isAiClassified />
            </div>
            <p className="font-bold text-xs mt-1.5 text-[#202226]">{hoveredIncident.title}</p>
            <p className="text-[11px] text-[#555960] mt-0.5 line-clamp-2">{hoveredIncident.description}</p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#555960] pt-1.5 border-t border-[#D0D1D6]">
              <span>📍 {hoveredIncident.location_name}</span>
              <span className="text-[#B45309] font-bold">Click marker to inspect →</span>
            </div>
          </div>
        ) : hoveredNode ? (
          <div className="absolute bottom-4 left-4 z-30 max-w-xs rounded-xl border border-[#AEB0B7] bg-white p-3 text-xs text-[#202226] shadow-lg animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#D0D1D6] pb-1">
              <span className="font-bold text-[#202226]">{hoveredNode.name}</span>
              <span className="text-[10px] text-[#555960]">({hoveredNode.code})</span>
            </div>
            <div className="mt-1.5 text-[11px] text-[#555960] space-y-0.5">
              <p>Sector: {hoveredNode.sector}</p>
              <p>Stationed: {hoveredNode.officerStationed}</p>
              <p className="text-amber-600">Risk Level: {hoveredNode.riskLevel.toUpperCase()}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Map Legend Footer */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#D0D1D6] bg-white px-4 py-2.5 text-[11px] text-[#555960]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-[#202226]">SEVERITY PINS:</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626] animate-ping" />
            <span className="text-[#DC2626] font-bold">CRITICAL</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-[#B45309]">HIGH</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
            <span className="text-[#1d4ed8]">MEDIUM</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            <span className="text-[#067a4f]">LOW</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[#555960]">
          <span>Interactive: Click any pin or building to dispatch &amp; triage</span>
        </div>
      </div>
    </div>
  );
}