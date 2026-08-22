'use client';

import React, { useState } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { Incident } from '@/lib/types';
import { CampusMapInteractive } from '@/components/safety/campus-map-interactive';
import { IncidentDetailsModal } from '@/components/safety/incident-details-modal';
import { IncidentReportModal } from '@/components/safety/incident-report-modal';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CampusMapPage() {
  const { incidents } = useSafety();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleOpenIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#8a6d1a]" />
            <span>Campus Map</span>
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Interactive campus map with facility locations and active incident pins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#111827] font-bold text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Report Incident</span>
          </Button>

          <Button asChild size="sm" variant="outline" className="text-xs border-[#D6D8D5]">
            <Link href="/safety/command-center">
              <span>Command Center</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Interactive Map */}
      <CampusMapInteractive
        incidents={incidents}
        selectedIncident={selectedIncident}
        onSelectIncident={handleOpenIncident}
        className="min-h-[640px]"
      />

      {/* Modals */}
      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={(id) => {
          const inc = incidents.find((i) => i.id === id);
          if (inc) setSelectedIncident(inc);
        }}
      />
    </div>
  );
}
