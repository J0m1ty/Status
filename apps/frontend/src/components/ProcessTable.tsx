import { useProcesses } from '../store/useProcesses'
import { useMemo, useState } from 'react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useTRPC } from '../utils/trpc';
import { useAuth } from '../store/useAuth';
import { useMutation } from '@tanstack/react-query';
import { Button } from 'react-aria-components';
import { ProcessStatus } from '../../../backend/src/pm2/api';

const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

export default function ProcessTable() {
    const trpc = useTRPC();
    const data = useProcesses(s => s.processes);
    const isAdmin = !!useAuth(s => s.token);

    const [restartingPid, setRestartingPid] = useState<number | null>(null);
    const restart = useMutation({
        ...trpc.restart.mutationOptions(),
        onSuccess: () => {
            setRestartingPid(null);
        },
        onError: (error) => {
            setRestartingPid(null);
            alert(error.message ?? 'Failed to restart process');
        }
    });

    const columns = useMemo<ColumnDef<ProcessStatus>[]>(
        () => {
            const base: ColumnDef<ProcessStatus>[] = [
                { header: 'Name', accessorKey: 'name' },
                { header: 'PID', accessorKey: 'pid' },
                { header: 'Status', accessorKey: 'status' },
                { header: 'Uptime', accessorFn: r => formatUptime(r.uptime) },
                { header: 'CPU %', accessorKey: 'cpu' },
                { header: 'Mem (MB)', accessorFn: r => (r.memory / 1_048_576).toFixed(1) },
            ]
            if (isAdmin) {
                base.push({
                    id: 'actions',
                    header: '',
                    cell: ({ row }) => (
                        <Button
                            className="w-24 px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                            isDisabled={restartingPid === row.original.pid}
                            onPress={() => {
                                setRestartingPid(row.original.pid);
                                restart.mutate(row.original.pm_id);
                            }}
                        >
                            {restartingPid === row.original.pid ? 'Restarting...' : 'Restart'}
                        </Button>
                    ),
                })
            }

            return base;
        },
        [isAdmin, restart.isPending],
    )

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm bg-white">
                <thead className="bg-white">
                    {table.getHeaderGroups().map(hg => (
                        <tr key={hg.id}>
                            {hg.headers.map(h => (
                                <th key={h.id} className="px-4 py-3 text-left font-medium text-gray-600">
                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {table.getRowModel().rows.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50">
                            {r.getVisibleCells().map(c => (
                                <td key={c.id} className="px-4 py-3">
                                    {flexRender(c.column.columnDef.cell, c.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
