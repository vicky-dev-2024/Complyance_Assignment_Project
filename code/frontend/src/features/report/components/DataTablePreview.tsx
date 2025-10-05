import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { TypeBadge, type DataType } from '@/components/common/TypeBadge';
import { Skeleton } from '@/components/common/Skeleton';

interface DataTablePreviewProps {
  data: Record<string, unknown>[];
  isLoading?: boolean;
}

function inferType(value: unknown): DataType {
  if (value === null || value === undefined) return 'text';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))
    return 'date';
  return 'text';
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function DataTablePreview({ data, isLoading }: DataTablePreviewProps) {
  // Prepare table data
  const tableData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const previewData = data.slice(0, 20);
    const columns: ColumnDef<Record<string, unknown>>[] = Object.keys(
      previewData[0]
    ).map((key) => ({
      accessorKey: key,
      header: () => (
        <div className="flex flex-col space-y-1">
          <span className="font-semibold text-gray-900">{key}</span>
          <TypeBadge type={inferType(previewData[0][key])} />
        </div>
      ),
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className="text-sm text-gray-700">
            {value === null || value === undefined ? (
              <span className="text-gray-400 italic">empty</span>
            ) : (
              String(value)
            )}
          </span>
        );
      },
    }));

    return { data: previewData, columns };
  }, [data]);

  const table = useReactTable({
    data: tableData?.data || [],
    columns: tableData?.columns || [],
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!tableData) {
    return (
      <div className="text-center py-12 text-gray-500 border rounded-lg">
        <p className="text-lg font-medium">No data to preview</p>
        <p className="text-sm mt-2">Upload data will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
        <p className="text-sm text-gray-500">
          Showing {table.getRowModel().rows.length} of {data.length} rows
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
