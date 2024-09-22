import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface AddLogModalProps {
  onLogAdded: () => void;
}

const levels = ["Info", "Warn", "Error"];
const topics = ["auth", "database", "email", "payment", "server", "services"];

const AddLogModal: React.FC<AddLogModalProps> = ({ onLogAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    level: "",
    message: "",
    topic: "",
    resourceId: "",
    traceId: "",
    spanId: "",
    commit: "",
    metadata: "",
    timestamp: null as Date | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLog((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewLog((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setNewLog((prevState) => ({
      ...prevState,
      timestamp: date || null,
    }));
  };

  const handleSubmitLog = async () => {
    try {
      await axios.post("http://localhost:8000/add-log", {
        ...newLog,
        timestamp: newLog.timestamp?.toISOString(),
        metadata: JSON.parse(newLog.metadata || "{}"),
      });
      setIsOpen(false);
      setNewLog({
        level: "",
        message: "",
        topic: "",
        resourceId: "",
        traceId: "",
        spanId: "",
        commit: "",
        metadata: "",
        timestamp: null,
      });
      onLogAdded();
    } catch (error) {
      console.error("Error adding log:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Log</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="flex justify-center items-center">
          <DialogTitle>Add Log</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select onValueChange={(value) => handleSelectChange("topic", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleSelectChange("level", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            name="message"
            placeholder="Message"
            value={newLog.message}
            onChange={handleInputChange}
          />
          <Input
            name="resourceId"
            placeholder="Resource ID"
            value={newLog.resourceId}
            onChange={handleInputChange}
          />
          <Input
            name="traceId"
            placeholder="Trace ID"
            value={newLog.traceId}
            onChange={handleInputChange}
          />
          <Input
            name="spanId"
            placeholder="Span ID"
            value={newLog.spanId}
            onChange={handleInputChange}
          />
          <Input
            name="commit"
            placeholder="Commit"
            value={newLog.commit}
            onChange={handleInputChange}
          />
          <Input
            name="metadata"
            placeholder="Metadata (JSON)"
            value={newLog.metadata}
            onChange={handleInputChange}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !newLog.timestamp && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newLog.timestamp ? (
                  format(newLog.timestamp, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newLog.timestamp || undefined}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleSubmitLog}>Submit Log</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLogModal;
