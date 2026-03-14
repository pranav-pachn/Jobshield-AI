"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  id: string;
  label: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

interface EnhancedTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  emptyMessage?: string;
  defaultSortBy?: string;
  defaultSortOrder?: "asc" | "desc";
  maxRows?: number;
  onRowClick?: (row: T) => void;
}

export function EnhancedTable<T extends { id?: string; [key: string]: any }>({
  data,
  columns,
  title,
  emptyMessage = "No data to display",
  defaultSortBy,
  defaultSortOrder = "asc",
  maxRows = 10,
  onRowClick,
}: EnhancedTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(defaultSortBy || null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedAndPaginatedData = useMemo(() => {
    let sorted = [...data];

    if (sortBy) {
      const sortColumn = columns.find((col) => col.id === sortBy);
      if (sortColumn) {
        sorted.sort((a, b) => {
          const aVal = sortColumn.accessor(a);
          const bVal = sortColumn.accessor(b);

          // Handle different data types
          if (typeof aVal === "string" && typeof bVal === "string") {
            return sortOrder === "asc"
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }

          if (typeof aVal === "number" && typeof bVal === "number") {
            return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
          }

          return 0;
        });
      }
    }

    const totalPages = Math.ceil(sorted.length / maxRows);
    const start = (currentPage - 1) * maxRows;
    const paginatedData = sorted.slice(start, start + maxRows);

    return { data: paginatedData, totalPages, total: sorted.length };
  }, [data, sortBy, sortOrder, currentPage, maxRows, columns]);

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnId);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (columnId: string) => {
    if (sortBy !== columnId) return <ChevronsUpDown className="h-4 w-4 opacity-40" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <Card className="glass-card border-border">
      {title && (
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {sortedAndPaginatedData.data.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    {columns.map((column) => (
                      <TableHead
                        key={column.id}
                        style={{ width: column.width }}
                        className={cn(
                          "font-semibold text-muted-foreground uppercase text-xs tracking-wide",
                          column.className
                        )}
                      >
                        {column.sortable ? (
                          <button
                            onClick={() => handleSort(column.id)}
                            className="flex items-center gap-2 hover:text-foreground transition-colors"
                          >
                            {column.label}
                            {getSortIcon(column.id)}
                          </button>
                        ) : (
                          column.label
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndPaginatedData.data.map((row, idx) => (
                    <TableRow
                      key={row.id || idx}
                      className={cn(
                        "border-border/30 hover:bg-muted/40 transition-colors",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={`${row.id || idx}-${column.id}`}
                          className={cn("text-foreground/90 text-sm", column.className)}
                        >
                          {column.accessor(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {sortedAndPaginatedData.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                <p className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * maxRows + 1}-
                  {Math.min(currentPage * maxRows, sortedAndPaginatedData.total)} of{" "}
                  {sortedAndPaginatedData.total} records
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === sortedAndPaginatedData.totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
