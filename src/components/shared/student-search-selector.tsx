'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';
import { StudentRecord } from '@/lib/types/academic';

interface StudentSearchSelectorProps {
  students: StudentRecord[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  className?: string;
  placeholder?: string;
}

export function StudentSearchSelector({
  students,
  selectedStudentId,
  onSelectStudent,
  className = '',
  placeholder = 'Search student by name, roll no, or department...',
}: StudentSearchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onSelectStudent(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-3.5 w-3.5 text-[#667085] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedStudent ? `${selectedStudent.name} (${selectedStudent.rollNumber})` : placeholder}
          className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-[#D6D8D5] rounded-xl text-[#1F2933] placeholder:text-[#667085] focus:outline-none focus:border-[#1F2933] focus:ring-1 focus:ring-[#1F2933] transition-all shadow-xs"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-0.5 rounded hover:bg-[#F0F1EF] text-[#667085] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2.5 p-0.5 rounded text-[#667085] hover:text-[#1F2933] cursor-pointer"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Floating Dynamic Results Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-80 sm:w-96 max-h-80 overflow-y-auto rounded-xl border border-[#D6D8D5] bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[11px] font-semibold text-[#667085] border-b border-[#D6D8D5] flex items-center justify-between">
            <span>Student Directory Records ({filteredStudents.length})</span>
            {searchQuery && (
              <span className="text-[10px] font-normal">Filtered by &ldquo;{searchQuery}&rdquo;</span>
            )}
          </div>

          <div className="divide-y divide-[#F0F1EF] mt-1">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#667085]">
                No student records found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredStudents.map((s) => {
                const isSelected = s.id === selectedStudentId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect(s.id)}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F0F1EF] text-[#1F2933]'
                        : 'hover:bg-[#F7F8F6] text-[#1F2933]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-[#1F2933]">{s.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-white text-[#1F2933] border border-[#D6D8D5]">
                          {s.rollNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#667085] truncate max-w-[240px]">
                        {s.department} · CGPA {s.cgpa}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 text-[#1F2933] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
