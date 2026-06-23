'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { SessionData } from '../api/session.api';
import { ArrowUpDown, Monitor, Clock, FileText, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import HedgehogMascot from './HedgehogMascot';

interface SessionTableProps {
  data: SessionData[];
  onSelectSession: (sessionId: string) => void;
  isLoading: boolean;
}

const columnHelper = createColumnHelper<SessionData>();

export default function SessionTable({ data, onSelectSession, isLoading }: SessionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'lastSeen', desc: true }
  ]);

  const columns = [
    columnHelper.accessor('sessionId', {
      header: 'Session ID',
      cell: (info: any) => (
        <span className="font-mono text-xs text-link-teal font-semibold group-hover:underline">
          {info.getValue().substring(0, 8)}...{info.getValue().slice(-6)}
        </span>
      ),
    }),
    columnHelper.accessor('userAgent', {
      header: 'Client / Platform',
      cell: (info: any) => {
        const ua = info.getValue();
        let client = 'Unknown Browser';
        if (ua.includes('Chrome')) client = 'Chrome';
        else if (ua.includes('Firefox')) client = 'Firefox';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) client = 'Safari';
        else if (ua.includes('Edge')) client = 'Edge';

        let os = 'OS';
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Macintosh')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone')) os = 'iOS';

        return (
          <div className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5 text-mute" />
            <span className="text-xs text-ink font-medium">
              {client} <span className="text-[10px] text-mute font-mono">({os})</span>
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('startedAt', {
      header: 'Started At',
      cell: (info: any) => {
        const date = new Date(info.getValue());
        return (
          <div className="flex items-center gap-1.5 text-body">
            <Clock className="h-3.5 w-3.5 text-mute" />
            <span className="text-xs font-mono">{date.toLocaleTimeString()}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('lastSeen', {
      header: 'Last Active',
      cell: (info: any) => {
        const date = new Date(info.getValue());
        return (
          <div className="flex items-center gap-1.5 text-body">
            <Clock className="h-3.5 w-3.5 text-accent-green" />
            <span className="text-xs font-mono">{date.toLocaleTimeString()}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('totalEvents', {
      header: 'Events Count',
      cell: (info: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-accent-blue-soft text-accent-blue border border-accent-blue/15">
          {info.getValue()} events
        </span>
      ),
    }),
    columnHelper.accessor((row: SessionData) => row.pagesVisited.length, {
      id: 'pagesVisitedCount',
      header: 'Pages Visited',
      cell: (info: any) => (
        <div className="flex items-center gap-1.5 text-mute">
          <FileText className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{info.getValue()} paths</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: () => (
        <ArrowRight className="h-4 w-4 text-mute group-hover:text-primary group-hover:translate-x-1 transition-all" />
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-2">
        {/* Dense loading skeletons that look like actual rows */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-12 w-full rounded-md bg-surface-card border border-hairline flex items-center justify-between px-4 animate-pulse"
          >
            <div className="flex gap-4 items-center">
              <div className="h-4 w-24 bg-surface-soft rounded-sm" />
              <div className="h-4 w-32 bg-surface-soft rounded-sm" />
            </div>
            <div className="flex gap-4 items-center">
              <div className="h-4 w-16 bg-surface-soft rounded-sm" />
              <div className="h-4 w-20 bg-surface-soft rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-surface-card border border-hairline rounded-md p-12 text-center flex flex-col items-center justify-center">
        <HedgehogMascot type="empty" size={80} className="mb-4" />
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider">No Active Sessions</h3>
        <p className="text-mute text-xs mt-1 max-w-sm leading-relaxed">
          Make sure your client app is running the tracker SDK and sending interaction telemetry.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-xs font-bold bg-primary text-on-primary rounded-md hover:bg-primary-pressed transition-colors"
        >
          Check Ingestion Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-md border border-hairline bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <tr key={headerGroup.id} className="border-b border-hairline bg-surface-soft/40">
                {headerGroup.headers.map((header: any) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-2.5 text-[10px] font-bold text-mute tracking-wider uppercase cursor-pointer select-none hover:text-ink transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-mute">
                            {sorted === 'asc' ? (
                              <ArrowUp className="h-3 w-3 text-primary" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="h-3 w-3 text-primary" />
                            ) : (
                              <ArrowUpDown className="h-2.5 w-2.5 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-hairline-soft">
            {table.getRowModel().rows.map((row: any) => (
              <tr
                key={row.id}
                onClick={() => onSelectSession(row.original.sessionId)}
                className="group hover:bg-surface-soft/30 cursor-pointer transition-colors"
              >
                {row.getVisibleCells().map((cell: any) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
