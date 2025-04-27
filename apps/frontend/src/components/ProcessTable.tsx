import { ColumnDef, useReactTable, getCoreRowModel, flexRender, getSortedRowModel, SortingState } from '@tanstack/react-table';
import { useMemo, useState } from "react";
import { useProcesses } from "../store/useProcesses";
import type { ProcessStatus } from '../../../backend/src/types';
import { Button } from 'react-aria-components';
import { useAuth } from '../store/useAuth';
import { Skeleton } from './Skeleton';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from "../utils/trpc";

const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes && parts.length < 2) parts.push(`${minutes}m`);
    if (secs && parts.length < 2) parts.push(`${secs}s`);
    if (parts.length === 0 && secs === 0) return '0s';
    return parts.slice(0, 2).join(' ');
}

const formatCPU = (percent: number) => {
    return `${percent.toFixed(percent % 1 === 0 ? 0 : 1)}%`;
}

const formatMemory = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return `${value.toFixed(1)}${units[i]}`;
}

export const ProcessTable = () => {
    const { processes: data, loading, error } = useProcesses();
    const { authed } = useAuth();
    const [sorting, setSorting] = useState<SortingState>([]);
    const { status: { start, restart, stop } } = useTRPC();

    const startMutation = useMutation(start.mutationOptions());
    const restartMutation = useMutation(restart.mutationOptions());
    const stopMutation = useMutation(stop.mutationOptions());

    const ready = !loading && !error;

    const columns = useMemo<ColumnDef<ProcessStatus>[]>(() => {
        const base: ColumnDef<ProcessStatus>[] = [
            {
                accessorKey: 'name',
                header: 'Process Name',
                cell: ({ getValue }) => loading
                    ? <Skeleton placeholder={'landing-page'} />
                    : String(getValue()),
                enableSorting: ready
            },
            {
                accessorKey: 'pid',
                header: 'PID',
                cell: ({ getValue }) => loading ? <Skeleton placeholder={'0000'} /> : String(getValue()),
                enableSorting: ready
            },
            {
                id: 'uptime',
                accessorFn: row => row.uptime,
                header: 'Uptime',
                cell: ({ row }) => loading
                    ? <Skeleton placeholder={'0d 0h'} />
                    : formatUptime(row.original.uptime),
                enableSorting: ready
            },
            {
                id: 'cpu',
                accessorFn: row => row.cpu,
                header: 'CPU',
                cell: ({ row }) => loading
                    ? <Skeleton placeholder={'0%'} />
                    : formatCPU(row.original.cpu),
                enableSorting: ready
            },
            {
                id: 'memory',
                accessorFn: row => row.memory,
                header: 'Memory',
                cell: ({ row }) => loading
                    ? <Skeleton placeholder={'00.0MB'} />
                    : formatMemory(row.original.memory),
                enableSorting: ready
            }
        ];

        if (authed) {
            base.push({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => loading
                    ? <Skeleton placeholder={'Restart Stop'} />
                    : <div className="flex gap-2 text-blue-500 justify-center">
                        {row.original.status == 'stopped' ? <Button onPress={() => startMutation.mutate(row.original.pm_id)} className="hover:text-slate-600 underline">
                            Start
                        </Button> : null}
                        {row.original.status == 'online' ? <Button onPress={() => restartMutation.mutate(row.original.pm_id)} className="hover:text-slate-600 underline">
                            Restart
                        </Button> : null}
                        {row.original.status == 'online' ? <Button onPress={() => stopMutation.mutate(row.original.pm_id)} className="hover:text-slate-600 underline">
                            Stop
                        </Button> : null}
                    </div>
            });
        }

        return base;
    }, [loading, authed]);

    const table = useReactTable({
        columns,
        data,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full text-md bg-white dark:bg-gray-800 dark:text-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-black dark:border-gray-600 font-bold">
                    {table.getHeaderGroups().map(hg => (
                        <tr key={hg.id}>
                            {hg.headers.map(header => (
                                <th
                                    key={header.id}
                                    colSpan={header.colSpan}
                                    className={`select-none justify-center ${header.column.getCanSort() && ready ? 'hover:bg-gray-200 dark:hover:bg-gray-600' : ''} px-4`}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div className={`flex items-center gap-1 ${header.column.getIndex() == 0 ? "justify-start" : "justify-center"}`}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {ready ? {
                                            asc: <ArrowDownIcon className="size-4" />,
                                            desc: <ArrowUpIcon className="size-4" />
                                        }[header.column.getIsSorted() as string] ?? null : null}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                {error ?
                    <tbody >
                        <tr>
                            <td colSpan={columns.length} className="px-10 py-4 text-center text-red-600 dark:text-red-400">
                                Error loading processes: {error.message}
                            </td>
                        </tr>
                    </tbody>
                    : <tbody className="dark:divide-gray-700">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className={`px-4 py-1 ${cell.column.getIndex() == 0 ? "text-left" : "text-center"}`}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>}
            </table>
        </div>
    )
}

// old:
// export default function ProcessTable() {
//     const trpc = useTRPC();
//     const data = useProcesses(s => s.processes);
//     const isAdmin = !!useAuth(s => s.token);

//     const [restartingPid, setRestartingPid] = useState<number | null>(null);
//     const restart = useMutation({
//         ...trpc.restart.mutationOptions(),
//         onSuccess: () => {
//             setRestartingPid(null);
//         },
//         onError: (error) => {
//             setRestartingPid(null);
//             alert(error.message ?? 'Failed to restart process');
//         }
//     });

//     const columns = useMemo<ColumnDef<ProcessStatus>[]>(
//         () => {
//             const base: ColumnDef<ProcessStatus>[] = [
//                 { header: 'Name', accessorKey: 'name' },
//                 { header: 'PID', accessorKey: 'pid' },
//                 { header: 'Status', accessorKey: 'status' },
//                 { header: 'Uptime', accessorFn: r => formatUptime(r.uptime) },
//                 { header: 'CPU %', accessorKey: 'cpu' },
//                 { header: 'Mem (MB)', accessorFn: r => (r.memory / 1_048_576).toFixed(1) },
//             ]
//             if (isAdmin) {
//                 base.push({
//                     id: 'actions',
//                     header: '',
//                     cell: ({ row }) => (
//                         <Button
//                             className="w-24 px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
//                             isDisabled={restartingPid === row.original.pid}
//                             onPress={() => {
//                                 setRestartingPid(row.original.pid);
//                                 restart.mutate(row.original.pm_id);
//                             }}
//                         >
//                             {restartingPid === row.original.pid ? 'Restarting...' : 'Restart'}
//                         </Button>
//                     ),
//                 })
//             }

//             return base;
//         },
//         [isAdmin, restart.isPending],
//     )

//     const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

//     return (
//         <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
//             <table className="w-full text-sm bg-white">
//                 <thead className="bg-white">
//                     {table.getHeaderGroups().map(hg => (
//                         <tr key={hg.id}>
//                             {hg.headers.map(h => (
//                                 <th key={h.id} className="px-4 py-3 text-left font-medium text-gray-600">
//                                     {flexRender(h.column.columnDef.header, h.getContext())}
//                                 </th>
//                             ))}
//                         </tr>
//                     ))}
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                     {table.getRowModel().rows.map(r => (
//                         <tr key={r.id} className="hover:bg-gray-50">
//                             {r.getVisibleCells().map(c => (
//                                 <td key={c.id} className="px-4 py-3">
//                                     {flexRender(c.column.columnDef.cell, c.getContext())}
//                                 </td>
//                             ))}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     )
// }
