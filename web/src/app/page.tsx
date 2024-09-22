"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CalendarIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [logCount, setLogCount] = useState(0);
  
  const itemsPerPage = 20;
  const totalItems = logCount;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    async function fetchPosts() {
      let res = await fetch("http://localhost:8000/logs-count");
      let data = await res.json();
      setLogCount(data.count);
    }
    fetchPosts();
  }, []);

  const logData = [
    {
      resourceId: "email-234567",
      traceId: "vwx-yza-234",
      spanId: "span-890",
      commit: "1d2e3f4",
      parentResourceId: "server-9876",
      timestamp: "2023-09-15T14:00:00Z",
      metadata: '"root": {...} 3 items',
    },
    {
      resourceId: "email-2345",
      traceId: "mno-pqr-789",
      spanId: "span-654",
      commit: "8b79ef0",
      parentResourceId: "server-9876",
      timestamp: "2023-09-15T08:45:00Z",
      metadata: '"root": {...} 3 items',
    },
    {
      resourceId: "email-23456",
      traceId: "bcd-efg-345",
      spanId: "span-901",
      commit: "2d3e4f5",
      parentResourceId: "server-5432",
      timestamp: "2023-09-15T12:15:00Z",
      metadata: '"root": {...} 3 items',
    },
    {
      resourceId: "database-23456",
      traceId: "pqr-stu-901",
      spanId: "span-567",
      commit: "5e6f7a8",
      parentResourceId: "server-9876",
      timestamp: "2023-09-15T11:45:00Z",
      metadata: '"root": {...} 3 items',
    },
    {
      resourceId: "database-456789",
      traceId: "jkl-mno-789",
      spanId: "span-234",
      commit: "5e6f7a8",
      parentResourceId: "server-5432",
      timestamp: "2023-09-15T14:30:00Z",
      metadata: '"root": {...} 3 items',
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-m font-bold">Total Logs: {logCount}</span>
          {/* <Button>Export Logs</Button> */}
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input placeholder="Search by any field :)" />
          <Input placeholder="Search using regex" />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${
                  !startDate && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${
                  !endDate && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>End date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by commit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All commits</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by span id" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All span ids</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Resource ID" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resource IDs</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Trace ID" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trace IDs</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select log level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Message" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All messages</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Resource ID</TableHead>
                <TableHead className="font-semibold">Trace ID</TableHead>
                <TableHead className="font-semibold">Span ID</TableHead>
                <TableHead className="font-semibold">Commit</TableHead>
                <TableHead className="font-semibold">
                  Parent resource ID
                </TableHead>
                <TableHead className="font-semibold">Timestamp</TableHead>
                <TableHead className="font-semibold">Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logData.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {log.resourceId}
                  </TableCell>
                  <TableCell>{log.traceId}</TableCell>
                  <TableCell>{log.spanId}</TableCell>
                  <TableCell>{log.commit}</TableCell>
                  <TableCell>{log.parentResourceId}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.metadata}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      <footer className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {currentPage * itemsPerPage - itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
