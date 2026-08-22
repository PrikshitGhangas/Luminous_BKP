'use client';

import React, { useState, useMemo } from 'react';
import { CAMPUS_LOCATIONS } from '@/lib/constants/demo-data';
import { CampusLocation } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MAP_VECTOR_PATH } from '@/components/safety/campus-map-interactive';
import {
  MapPin,
  Search,
  X,
  GraduationCap,
  Home,
  Dumbbell,
  Building2,
  UtensilsCrossed,
  HeartPulse,
  Car,
  BookOpen,
  Cpu,
  Clock,
  Layers,
  Phone,
  User,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

// Specific icon, category and styling per building ID
const BUILDING_VISUALS: Record<
  string,
  {
    icon: React.ReactNode;
    categoryLabel: string;
    badgeStyle: string;
    accentColor: string;
  }
> = {
  'loc-block-f': {
    icon: <Cpu className="h-4 w-4" />,
    categoryLabel: 'Engineering & Advanced Labs',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentColor: '#4F46E5',
  },
  'loc-block-c': {
    icon: <Home className="h-4 w-4" />,
    categoryLabel: 'Student Residence Tower C',
    badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#9333EA',
  },
  'loc-block-b': {
    icon: <Home className="h-4 w-4" />,
    categoryLabel: 'Student Residence Tower B',
    badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#9333EA',
  },
  'loc-ab3-north': {
    icon: <GraduationCap className="h-4 w-4" />,
    categoryLabel: 'Lecture Halls & Faculty Suites',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#2563EB',
  },
  'loc-ab4': {
    icon: <BookOpen className="h-4 w-4" />,
    categoryLabel: 'Central Academic & Study Commons',
    badgeStyle: 'bg-violet-50 text-violet-700 border-violet-200',
    accentColor: '#7C3AED',
  },
  'loc-ab3-south': {
    icon: <GraduationCap className="h-4 w-4" />,
    categoryLabel: 'Classrooms & Seminar Halls',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#2563EB',
  },
  'loc-ab1': {
    icon: <Building2 className="h-4 w-4" />,
    categoryLabel: 'Dean Offices & Administration',
    badgeStyle: 'bg-slate-100 text-slate-700 border-slate-300',
    accentColor: '#475569',
  },
  'loc-cricket': {
    icon: <Dumbbell className="h-4 w-4" />,
    categoryLabel: 'Athletics & Sports Pavilion',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#059669',
  },
  'loc-pond': {
    icon: <Sparkles className="h-4 w-4" />,
    categoryLabel: 'Eco Pond & Lakeside Park',
    badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200',
    accentColor: '#0D9488',
  },
  'loc-admin': {
    icon: <Building2 className="h-4 w-4" />,
    categoryLabel: 'Administrative Block & Headquarters',
    badgeStyle: 'bg-blue-50 text-blue-900 border-blue-300',
    accentColor: '#1E3A8A',
  },
  'loc-block-d': {
    icon: <GraduationCap className="h-4 w-4" />,
    categoryLabel: 'Academic & Facilities Complex',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
    accentColor: '#D97706',
  },
  'loc-block-e': {
    icon: <Building2 className="h-4 w-4" />,
    categoryLabel: 'Grand Auditorium & Arts Center',
    badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: '#E11D48',
  },
  'loc-med': {
    icon: <HeartPulse className="h-4 w-4" />,
    categoryLabel: '24/7 Health Clinic & Emergency Care',
    badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: '#E11D48',
  },
};

export default function CampusMapPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('loc-ab4');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);

  const sectors = useMemo(
    () => Array.from(new Set(CAMPUS_LOCATIONS.map((l) => l.sector))),
    []
  );

  const filteredLocations = useMemo(() => {
    return CAMPUS_LOCATIONS.filter((loc) => {
      const matchesSector = sectorFilter === 'ALL' || loc.sector === sectorFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesSector;

      const visual = BUILDING_VISUALS[loc.id];
      const matchesSearch =
        loc.name.toLowerCase().includes(q) ||
        loc.code.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        loc.buildingType.toLowerCase().includes(q) ||
        visual?.categoryLabel.toLowerCase().includes(q) ||
        loc.facilities?.some((f) => f.toLowerCase().includes(q)) ||
        loc.amenities?.some((a) => a.toLowerCase().includes(q)) ||
        loc.inCharge?.toLowerCase().includes(q);

      return matchesSector && matchesSearch;
    });
  }, [searchQuery, sectorFilter]);

  const selectedBuilding = useMemo(
    () => CAMPUS_LOCATIONS.find((l) => l.id === selectedLocationId) || CAMPUS_LOCATIONS[0],
    [selectedLocationId]
  );

  const selectedVisual = BUILDING_VISUALS[selectedBuilding?.id || 'loc-ab4'] || {
    icon: <Building2 className="h-4 w-4" />,
    categoryLabel: selectedBuilding?.buildingType || 'Facility',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#2563EB',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#8a6d1a]" />
            Campus Map &amp; Facility Directory
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            Interactive university campus layout, building locations, department directories, and operational hours.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#667085]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] font-medium text-[#1F2933]">
            <Building2 className="h-3.5 w-3.5 text-[#8a6d1a]" />
            13 Master Blueprint Facilities
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 font-medium text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            All Facilities Operational
          </span>
        </div>
      </div>

      {/* Search & Sector Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#667085]" />
          <Input
            placeholder="Search buildings, lecture halls, labs, mess, clinic, or facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs border-[#D6D8D5] bg-white rounded-xl shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 p-0.5 rounded text-[#667085] hover:text-[#1F2933] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSectorFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              sectorFilter === 'ALL'
                ? 'bg-[#1F2933] text-white shadow-xs'
                : 'bg-white border border-[#D6D8D5] text-[#667085] hover:text-[#1F2933]'
            }`}
          >
            All Sectors ({CAMPUS_LOCATIONS.length})
          </button>
          {sectors.map((sec) => {
            const count = CAMPUS_LOCATIONS.filter((l) => l.sector === sec).length;
            return (
              <button
                key={sec}
                onClick={() => setSectorFilter(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  sectorFilter === sec
                    ? 'bg-[#1F2933] text-white shadow-xs'
                    : 'bg-white border border-[#D6D8D5] text-[#667085] hover:text-[#1F2933]'
                }`}
              >
                {sec} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Vector Map (Left 7 Cols) + Building Details & Directory (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Vector Architectural Campus Map */}
        <Card className="lg:col-span-7 flex flex-col overflow-hidden">
          <CardHeader className="p-3.5 border-b border-[#D6D8D5] bg-[#F7F8F6] flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#8a6d1a]" />
              <span className="text-xs font-bold text-[#1F2933]">Campus Architectural Overview</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
                className="p-1 rounded bg-white border border-[#D6D8D5] text-[#667085] hover:text-[#1F2933] cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
                className="p-1 rounded bg-white border border-[#D6D8D5] text-[#667085] hover:text-[#1F2933] cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded bg-white border border-[#D6D8D5] text-[#667085] hover:text-[#1F2933] cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 relative bg-[#EBECE8] overflow-hidden min-h-[540px] flex items-center justify-center">
            {/* Subtle background coordinate grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#D6D8D5_1px,transparent_1px),linear-gradient(to_bottom,#D6D8D5_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40 pointer-events-none" />

            {/* Scalable Vector Canvas */}
            <div
              className="relative w-full h-full p-4 transition-transform duration-200 ease-out flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox="0 0 1024 819"
                className="w-full h-full max-h-[620px] overflow-visible select-none drop-shadow-xs"
              >
                <defs>
                  <filter id="campusLabelShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* Base Campus Plate */}
                <rect
                  x="2"
                  y="2"
                  width="1020"
                  height="815"
                  rx="16"
                  fill="#FFFFFF"
                  stroke="#D6D8D5"
                  strokeWidth="1.5"
                />

                {/* Master Architectural Vector Blueprint Trace */}
                <g id="campus-vector-structures">
                  <path
                    d={MAP_VECTOR_PATH}
                    fill="#1E293B"
                    stroke="#1E293B"
                    strokeWidth="0.2"
                    fillRule="evenodd"
                  />
                </g>

                {/* Animated Security Patrol Routes & Breadcrumbs */}
                <g id="campus-security-patrol-routes" opacity="0.85">
                  {/* Route Alpha: Central Commons -> AB1 -> Block D */}
                  <path
                    d="M 570 438 L 658 678 L 622 782"
                    fill="none"
                    stroke="#3F8F68"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  {/* Route Bravo: Residence Quarters -> Medical Center */}
                  <path
                    d="M 454 154 L 570 154 L 551 260"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />

                  {/* Officer Vikram Sharma Marker (Central Area) */}
                  <g transform="translate(614, 558)">
                    <circle r="12" fill="#3F8F68" opacity="0.2" className="animate-ping" />
                    <circle r="7" fill="#3F8F68" stroke="#FFFFFF" strokeWidth="2" />
                    <rect x="10" y="-10" width="88" height="18" rx="4" fill="#1F2933" />
                    <text x="54" y="2.5" fill="#FFFFFF" fontSize="7.5" fontWeight="700" textAnchor="middle">
                      🛡️ Officer Vikram (Patrol)
                    </text>
                  </g>

                  {/* Officer Ramesh Ramos Marker (North Post) */}
                  <g transform="translate(510, 207)">
                    <circle r="12" fill="#2563EB" opacity="0.2" className="animate-ping" />
                    <circle r="7" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                    <rect x="10" y="-10" width="88" height="18" rx="4" fill="#1F2933" />
                    <text x="54" y="2.5" fill="#FFFFFF" fontSize="7.5" fontWeight="700" textAnchor="middle">
                      🛡️ Officer Ramos (North)
                    </text>
                  </g>
                </g>

                {/* Interactive Facility Markers & Labels */}
                {CAMPUS_LOCATIONS.map((bldg) => {
                  const visual = BUILDING_VISUALS[bldg.id] || {
                    icon: <Building2 className="h-4 w-4" />,
                    categoryLabel: bldg.buildingType,
                    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
                    accentColor: '#2563EB',
                  };

                  const posX = (bldg.coordinates.x / 100) * 1024;
                  const posY = (bldg.coordinates.y / 100) * 819;
                  const isSelected = selectedLocationId === bldg.id;
                  const isHovered = hoveredBuildingId === bldg.id;
                  const isFiltered = filteredLocations.some((l) => l.id === bldg.id);
                  const labelWidth = Math.max(bldg.name.length * 7.5 + 46, 95);

                  return (
                    <g
                      key={bldg.id}
                      onClick={() => setSelectedLocationId(bldg.id)}
                      onMouseEnter={() => setHoveredBuildingId(bldg.id)}
                      onMouseLeave={() => setHoveredBuildingId(null)}
                      className="cursor-pointer transition-all duration-150"
                      opacity={isFiltered ? 1 : 0.25}
                    >
                      {/* Facility Location Pin */}
                      <g transform={`translate(${posX}, ${posY})`}>
                        {isSelected && (
                          <circle
                            r="20"
                            fill={visual.accentColor}
                            opacity="0.2"
                          />
                        )}
                        <circle
                          r={isSelected ? 10 : 8}
                          fill={isSelected ? visual.accentColor : '#FFFFFF'}
                          stroke={isSelected ? '#FFFFFF' : visual.accentColor}
                          strokeWidth={isSelected ? 2.5 : 2}
                        />
                        <circle
                          r="3"
                          fill={isSelected ? '#FFFFFF' : visual.accentColor}
                        />
                      </g>

                      {/* Interactive Facility Label Box */}
                      <g
                        transform={`translate(${posX + 14}, ${posY - 12})`}
                        filter="url(#campusLabelShadow)"
                      >
                        <rect
                          x="0"
                          y="0"
                          width={labelWidth}
                          height="24"
                          rx="6"
                          fill={isSelected ? visual.accentColor : isHovered ? '#1F2933' : '#FFFFFF'}
                          stroke={isSelected ? '#FFFFFF' : isHovered ? '#1F2933' : '#D6D8D5'}
                          strokeWidth={isSelected ? 1.5 : 1}
                        />
                        {/* Facility Code Chip */}
                        <rect
                          x="3"
                          y="3"
                          width="32"
                          height="18"
                          rx="4"
                          fill={isSelected ? 'rgba(255,255,255,0.25)' : isHovered ? 'rgba(255,255,255,0.15)' : '#F0F1EF'}
                        />
                        <text
                          x="19"
                          y="15.5"
                          textAnchor="middle"
                          fill={isSelected || isHovered ? '#FFFFFF' : '#1F2933'}
                          fontSize="8.5"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {bldg.code}
                        </text>
                        {/* Facility Name Text */}
                        <text
                          x="40"
                          y="16"
                          fill={isSelected || isHovered ? '#FFFFFF' : '#1F2933'}
                          fontSize="10"
                          fontWeight="700"
                        >
                          {bldg.name}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Right: Selected Building Details Inspector & Directory List */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Selected Building Details Card */}
          {selectedBuilding && (
            <Card className="border-[#D6D8D5] shadow-xs">
              <CardHeader className="p-4 border-b border-[#D6D8D5] bg-[#F7F8F6]">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedVisual.badgeStyle}`}>
                        {selectedVisual.icon}
                        {selectedVisual.categoryLabel}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-[#D6D8D5] font-bold text-[#1F2933]">
                        {selectedBuilding.code}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-[#1F2933] mt-1">
                      {selectedBuilding.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5 text-xs">
                {/* Description */}
                <p className="text-[#667085] leading-relaxed">
                  {selectedBuilding.description}
                </p>

                {/* Core Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Operating Hours */}
                  <div className="p-2.5 rounded-lg border border-[#D6D8D5] bg-white space-y-1">
                    <span className="text-[11px] font-bold text-[#1F2933] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#8a6d1a]" /> Operating Hours
                    </span>
                    <p className="text-[11px] text-[#667085] font-medium leading-tight">
                      {selectedBuilding.operatingHours}
                    </p>
                  </div>

                  {/* Floor Structure */}
                  <div className="p-2.5 rounded-lg border border-[#D6D8D5] bg-white space-y-1">
                    <span className="text-[11px] font-bold text-[#1F2933] flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-[#2563EB]" /> Building Structure
                    </span>
                    <p className="text-[11px] text-[#667085] font-medium leading-tight">
                      {selectedBuilding.floors}
                    </p>
                  </div>

                  {/* Desk Contact */}
                  <div className="p-2.5 rounded-lg border border-[#D6D8D5] bg-white space-y-1">
                    <span className="text-[11px] font-bold text-[#1F2933] flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" /> Desk Contact
                    </span>
                    <p className="text-[11px] text-[#667085] font-medium leading-tight">
                      {selectedBuilding.contactExt}
                    </p>
                  </div>

                  {/* Coordinator In Charge */}
                  <div className="p-2.5 rounded-lg border border-[#D6D8D5] bg-white space-y-1">
                    <span className="text-[11px] font-bold text-[#1F2933] flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-600" /> Coordinator In-Charge
                    </span>
                    <p className="text-[11px] text-[#667085] font-medium leading-tight truncate" title={selectedBuilding.inCharge}>
                      {selectedBuilding.inCharge}
                    </p>
                  </div>
                </div>

                {/* Key Facilities Inside */}
                {selectedBuilding.facilities && selectedBuilding.facilities.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[#1F2933] uppercase tracking-wider block">
                      Departments &amp; Facilities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBuilding.facilities.map((fac, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#F0F1EF] border border-[#D6D8D5] text-[11px] text-[#1F2933] font-medium"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {selectedBuilding.amenities && selectedBuilding.amenities.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-[#F0F1EF]">
                    <span className="text-[11px] font-bold text-[#1F2933] uppercase tracking-wider block">
                      Building Amenities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBuilding.amenities.map((am, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-[#D6D8D5] text-[11px] text-[#667085]"
                        >
                           {am}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Directory List of All Matching Buildings */}
          <Card className="border-[#D6D8D5] shadow-xs flex-1">
            <CardHeader className="p-3.5 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-[#1F2933] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#8a6d1a]" />
                All Campus Buildings
              </CardTitle>
              <span className="text-xs text-[#8A9199]">
                {filteredLocations.length} of {CAMPUS_LOCATIONS.length} shown
              </span>
            </CardHeader>
            <CardContent className="p-2.5 max-h-[300px] overflow-y-auto space-y-1.5">
              {filteredLocations.map((bldg) => {
                const visual = BUILDING_VISUALS[bldg.id];
                const isSelected = selectedLocationId === bldg.id;

                return (
                  <div
                    key={bldg.id}
                    onClick={() => setSelectedLocationId(bldg.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all text-xs flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-[#1F2933] bg-[#F7F8F6] shadow-xs'
                        : 'border-[#D6D8D5] bg-white hover:bg-[#F7F8F6]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 border ${visual?.badgeStyle}`}
                      >
                        {visual?.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F2933] truncate">{bldg.name}</p>
                        <p className="text-[11px] text-[#667085] truncate font-mono">{bldg.code} · {bldg.floors?.split('(')[0]}</p>
                      </div>
                    </div>

                    <span className="text-[10px] text-[#8A9199] shrink-0 font-medium">
                      {bldg.operatingHours?.split('(')[0]?.trim()}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campus Quick Information Footers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Campus Coverage</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">10 Facilities</span>
            <span className="text-xs text-[#667085]">across 5 active zones</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">24/7 Medical &amp; First Aid Desk</span>
          <div className="flex items-center gap-2 mt-1">
            <Phone className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-bold text-[#1F2933]">080-2360-0108 / Ext 108</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Main Campus Gates</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-[#1F2933]">5:30 AM – 11:30 PM</span>
            <span className="text-xs text-[#667085]">Checkpost Ext: 112</span>
          </div>
        </div>
      </div>
    </div>
  );
}
