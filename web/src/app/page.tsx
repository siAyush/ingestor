"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
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
import AddLogModal from "../components/AddLogModal";
import ReactJson from "@microlink/react-json-view";

interface Log {
  _source: {
    topic: string;
    resourceId: string;
    traceId: string;
    spanId: string;
    commit: string;
    timestamp: string;
    message: string;
    level: string;
    metadata: Record<string, any>;
  };
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [logCount, setLogCount] = useState(0);
  const [logData, setLogData] = useState<Log[]>([]);
  const [logLevel, setLogLevel] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");

  const itemsPerPage = 20;
  const totalItems = logCount;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  async function fetchLogCount() {
    try {
      const res = await axios.get("http://localhost:8000/logs-count");
      setLogCount(res.data.count);
    } catch (error) {
      console.error("Error fetching log count:", error);
    }
  }

  async function fetchLogs() {
    try {
      const res = await axios.get("http://localhost:8000/all-logs", {
        params: {
          page: currentPage,
          size: itemsPerPage,
          startDate: startDate ? startDate.toISOString() : undefined,
          endDate: endDate ? endDate.toISOString() : undefined,
          logLevel: logLevel !== "all" ? logLevel : undefined,
          topic: topic !== "all" ? topic : undefined,
        },
      });
      setLogData(res.data.logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }

  useEffect(() => {
    fetchLogCount();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, startDate, endDate, logLevel, topic]);

  const handleLogAdded = () => {
    fetchLogCount();
    fetchLogs();
  };

  const exportLogsToJson = () => {
    const json = JSON.stringify(logData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center px-6 py-4 border-b">
        <Image src="/logIcon.png" alt="Logo" width={50} height={50} />
        <h1 className="text-2xl font-bold ml-4">Dashboard</h1>
        <div className="flex-grow" />
        <div className="flex items-center space-x-4">
          <Button onClick={exportLogsToJson}>Export Logs</Button>
          <AddLogModal onLogAdded={handleLogAdded} />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select onValueChange={setTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Select Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="services">Services</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setLogLevel}>
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

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${
                  !startDate && "text-foreground"
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
                  !endDate && "text-foreground"
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Topic</TableHead>
                <TableHead className="font-semibold">Message</TableHead>
                <TableHead className="font-semibold">Level</TableHead>
                <TableHead className="font-semibold">Resource ID</TableHead>
                <TableHead className="font-semibold">Commit</TableHead>
                <TableHead className="font-semibold">Timestamp</TableHead>
                <TableHead className="font-semibold">Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logData.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log._source.topic}</TableCell>
                  <TableCell>{log._source.message}</TableCell>
                  <TableCell>{log._source.level}</TableCell>
                  <TableCell className="font-medium">
                    {log._source.resourceId}
                  </TableCell>
                  <TableCell>{log._source.commit}</TableCell>
                  <TableCell>{log._source.timestamp}</TableCell>
                  <TableCell>
                    <ReactJson
                      src={log._source.metadata}
                      collapsed={true}
                      enableClipboard={false}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      <footer className="border-t p-4">
        <div className="text-m font-bold">Total Logs: {logCount}</div>
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
