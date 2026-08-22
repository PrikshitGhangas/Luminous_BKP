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
    <div className={`relative rounded-xl border border-[#D6D8D5] bg-white overflow-hidden shadow-xs flex flex-col ${className}`}>
      {/* Map Header */}
      <div className="relative z-20 flex items-center justify-between gap-2 border-b border-[#D6D8D5] bg-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0F1EF] border border-[#D6D8D5] text-[#1F2933]">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-[#1F2933]">
                Campus Map Overview
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[11px] text-[#667085]">
              Real-time facility locations &amp; active beacons
            </span>
          </div>
        </div>

        {/* Working Zoom Controls */}
        <div className="flex items-center gap-1 bg-[#F7F8F6] border border-[#D6D8D5] rounded-lg p-0.5">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-[#667085] hover:text-[#1F2933] transition-colors rounded hover:bg-white cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-[#667085] hover:text-[#1F2933] transition-colors rounded hover:bg-white cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-[#667085] hover:text-[#1F2933] transition-colors rounded hover:bg-white cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
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
              rx="32"
              fill="#F9FAF9"
              stroke="#D6D8D5"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Pathways & Walkways */}
            <path
              d="M 60 360 L 940 360"
              fill="none"
              stroke="#E2E4E0"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 500 50 L 500 630"
              fill="none"
              stroke="#E2E4E0"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Connecting Diagonal Walkways */}
            <path
              d="M 300 220 L 500 360 L 800 200"
              fill="none"
              stroke="#E2E4E0"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 180 520 L 340 440 L 500 360 L 620 420 L 820 540"
              fill="none"
              stroke="#E2E4E0"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Central University Plaza */}
            <circle cx="500" cy="360" r="42" fill="#FFFFFF" stroke="#D6D8D5" strokeWidth="2" />
            <circle cx="500" cy="360" r="28" fill="#F0F1EF" stroke="#D6D8D5" strokeWidth="1" />
            <text x="500" y="364" textAnchor="middle" fill="#667085" fontSize="10" fontWeight="600">
              Central Plaza
            </text>

            {/* Landscaped Green Zones */}
            <rect x="590" y="90" width="110" height="80" rx="16" fill="#F0FDF4" stroke="#DCFCE7" strokeWidth="1" />
            <text x="645" y="135" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="500">
              North Gardens
            </text>

            <circle cx="160" cy="240" r="38" fill="#F0FDF4" stroke="#DCFCE7" strokeWidth="1" />
            <text x="160" y="244" textAnchor="middle" fill="#166534" fontSize="10" fontWeight="500">
              West Lawn
            </text>

            {/* CAMPUS BUILDINGS (Clean Modern SaaS Cards) */}

            {/* 1. ENGINEERING BLOCK — Top Left */}
            <g
              onClick={() => {
                const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'loc-eng')!;
                onSelectLocation?.(loc);
                const incs = locationIncidentMap['loc-eng'];
                if (incs?.length > 0) onSelectIncident(incs[0]);
              }}
              onMouseEnter={() => setHoveredNode(CAMPUS_LOCATIONS.find((l) => l.id === 'loc-eng') || null)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer group"
            >
              <rect
                x="220"
                y="150"
                width="160"
                height="110"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] group-hover:shadow-md transition-all"
              />
              <text x="300" y="200" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Engineering Block
              </text>
              <text x="300" y="222" textAnchor="middle" fill="#667085" fontSize="10">
                Labs &amp; Computing
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
              <rect
                x="420"
                y="105"
                width="150"
                height="95"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] transition-all"
              />
              <text x="495" y="150" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Central Library
              </text>
              <text x="495" y="170" textAnchor="middle" fill="#667085" fontSize="10">
                Study Commons
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
              <rect
                x="725"
                y="105"
                width="140"
                height="95"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] transition-all"
              />
              <text x="795" y="150" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Hostel Block A
              </text>
              <text x="795" y="170" textAnchor="middle" fill="#667085" fontSize="10">
                Student Residence
              </text>
            </g>

            {/* 4. MAIN ACADEMIC BLOCK — Center */}
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
              <rect
                x="415"
                y="235"
                width="160"
                height="100"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] transition-all"
              />
              <text x="495" y="280" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Main Academic Block
              </text>
              <text x="495" y="300" textAnchor="middle" fill="#667085" fontSize="10">
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
              <rect
                x="745"
                y="265"
                width="140"
                height="95"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] transition-all"
              />
              <text x="815" y="310" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Hostel Block B
              </text>
              <text x="815" y="330" textAnchor="middle" fill="#667085" fontSize="10">
                Student Residence
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
              <rect
                x="575"
                y="415"
                width="130"
                height="90"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] transition-all"
              />
              <text x="640" y="460" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Cafeteria
              </text>
              <text x="640" y="480" textAnchor="middle" fill="#667085" fontSize="10">
                Food Court &amp; Dining
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
              <rect
                x="745"
                y="465"
                width="140"
                height="100"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] transition-all"
              />
              <text x="815" y="515" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Sports Complex
              </text>
              <text x="815" y="535" textAnchor="middle" fill="#667085" fontSize="10">
                Gymnasium &amp; Arena
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
              <rect
                x="285"
                y="415"
                width="130"
                height="90"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] transition-all"
              />
              <text x="350" y="460" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Medical Center
              </text>
              <text x="350" y="480" textAnchor="middle" fill="#667085" fontSize="10">
                Health &amp; First Aid
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
              <rect
                x="125"
                y="465"
                width="130"
                height="95"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] transition-all"
              />
              <text x="190" y="510" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Campus Parking
              </text>
              <text x="190" y="530" textAnchor="middle" fill="#667085" fontSize="10">
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
              <rect
                x="420"
                y="495"
                width="160"
                height="100"
                rx="14"
                fill="#FFFFFF"
                stroke="#D6D8D5"
                strokeWidth="1.5"
                className="group-hover:stroke-[#1F2933] transition-all"
              />
              <text x="500" y="540" textAnchor="middle" fill="#1F2933" fontSize="13" fontWeight="bold">
                Administrative Block
              </text>
              <text x="500" y="560" textAnchor="middle" fill="#667085" fontSize="10">
                Security &amp; Admin HQ
              </text>
            </g>

            {/* DYNAMIC INCIDENT PINS & BEACONS */}
            {activeLayers.incidents &&
              filteredIncidents.map((incident) => {
                const matchedLocation = CAMPUS_LOCATIONS.find((l) =>
                  incident.location_name.toLowerCase().includes(l.name.toLowerCase()) ||
                  l.name.toLowerCase().includes(incident.location_name.toLowerCase()) ||
                  incident.location_id === l.id
                );

                if (!matchedLocation) return null;

                const pinX = (matchedLocation.coordinates.x / 100) * 1000;
                const pinY = (matchedLocation.coordinates.y / 100) * 680;
                const isSelected = selectedIncident?.id === incident.id;
                const isCritical = incident.severity === 'critical';

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
                    className="cursor-pointer"
                  >
                    {/* Subtle Pulsing Beacon */}
                    {isCritical && (
                      <circle cx="0" cy="0" r="24" fill="#DC2626" opacity="0.2">
                        <animate attributeName="r" values="12;28;12" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Pin Outer Circle */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 14 : 10}
                      fill={isCritical ? '#DC2626' : '#F59E0B'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                  </g>
                );
              })}
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
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#D6D8D5] bg-white px-4 py-2.5 text-xs text-[#667085]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-[#1F2933]">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Active Incident</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Under Review</span>
          </span>
        </div>

        <span className="text-[11px] text-[#667085]">Click any facility to view location details &amp; active logs</span>
      </div>
    </div>
  );
}