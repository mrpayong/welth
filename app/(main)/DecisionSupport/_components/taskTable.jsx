"use client";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskForm from "./addTaskForm";
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ChevronLeft, ChevronRight, Plus, Trash } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTask } from "@/actions/task";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Fab, Tooltip } from "@mui/material";
import { BarLoader } from "react-spinners";

function getUrgencyBadgeClass(urgency) {
  switch (urgency) {
    case "HIGH":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "LOW":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}

const ROWS_PER_PAGE = 5; 

const TaskTable = ({ tasks, accounts }) => {
  const [addNew, setAddNew] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [localTasks, setLocalTasks] = useState(tasks);
  const [deadlineSort, setDeadlineSort] = useState(null);
  // Keep localTasks in sync with props if tasks change (e.g., after add)
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleTaskSuccess = (newTask) => {
  setAddNew(false);
  if (newTask) {
    setLocalTasks(prev => [newTask, ...prev]);
  }
};

  const {
    loading: bulkDeleteLoading,
    fn: bulkDeleteFn,
    data: bulkDeleteData,
  } = useFetch(bulkDeleteTask);

  // Optimistic bulk delete
  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You are about to delete ${selectedIds.length} tasks.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLocalTasks((prev) => prev.filter((task) => !selectedIds.includes(task.id)));
      await bulkDeleteFn(selectedIds);
    }
  };

  // Optimistic single delete
  const handleSingleDelete = async (id) => {
const result = await Swal.fire({
      title: `Delete this task?`,
      text: `This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLocalTasks((prev) => prev.filter((task) => task.id !== id));
      await bulkDeleteFn([id]);
    }
  };

  useEffect(() => {
    if (bulkDeleteData && !bulkDeleteLoading) {
      toast.error(`Deleted successfully`);
      setSelectedIds([]);
    }
  }, [bulkDeleteData, bulkDeleteLoading]);

  const sortedTasks = React.useMemo(() => {
    let sorted = [...localTasks];
    if (deadlineSort) {
      sorted.sort((a, b) => {
        const aDate = a.dueDate ? new Date(a.dueDate) : null;
        const bDate = b.dueDate ? new Date(b.dueDate) : null;
        if (!aDate && !bDate) return 0;
        if (!aDate) return deadlineSort === "asc" ? 1 : -1;
        if (!bDate) return deadlineSort === "asc" ? -1 : 1;
        return deadlineSort === "asc"
          ? aDate - bDate
          : bDate - aDate;
      });
    }
    return sorted;
  }, [localTasks, deadlineSort]);

    const totalPages = Math.ceil(sortedTasks.length / ROWS_PER_PAGE);
  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);


  const handleDLsetSort = () => setDeadlineSort(
    deadlineSort === "asc" 
      ? "desc" 
      : deadlineSort === "desc" 
        ? null 
        : "asc"
  )










































  return (
    <div className="w-full">
      {bulkDeleteLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
      <div className="mt-8">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100">
            <CardTitle>Task Table</CardTitle>
            <CardDescription>
              List of current tasks and their status.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50">
                    <TableHead className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={localTasks.length > 0 && selectedIds.length === localTasks.length}
                        onChange={e => {
                          setSelectedIds(e.target.checked ? localTasks.map(t => t.id) : []);
                        }}
                        aria-label="Select all tasks"
                      />
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Name
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task to Account
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </TableHead>
                    <TableHead 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none"
                      onClick={handleDLsetSort}
                    >
                      <span className="flex items-center gap-1">
                        Deadline
                        {deadlineSort === "asc" && (
                          <Tooltip title="Descending" arrow>
                            <span>
                              <ArrowUpWideNarrow className="w-4 h-4 text-blue-500" />
                            </span>
                          </Tooltip>
                        )}
                        {deadlineSort === "desc" && (
                          <Tooltip title="Ascending" arrow>
                            <span>
                              <ArrowDownNarrowWide className="w-4 h-4 text-blue-500" />
                            </span>
                          </Tooltip>
                        )}
                        {deadlineSort === null && (
                          <Tooltip title="Sort deadlines" arrow>
                            <span className="w-4 h-4 inline-block opacity-30">
                              <ArrowUpWideNarrow className="w-4 h-4" />
                            </span>
                          </Tooltip>
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </TableHead>
                    <TableHead className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-gray-200">
                  {paginatedTasks && paginatedTasks.length > 0 ? (
                    paginatedTasks.map(task => (
                      <TableRow key={task.id} className="hover:bg-gray-50">
                        <TableCell className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(task.id)}
                            onChange={e => {
                              setSelectedIds(
                                e.target.checked
                                  ? [...selectedIds, task.id]
                                  : selectedIds.filter(id => id !== task.id)
                              );
                            }}
                            aria-label="Select task"
                          />
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {task.taskName}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-gray-600">
                          {task.taskCategory}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-gray-600">
                          {task.taskDescription}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm">
                          <Badge className={getUrgencyBadgeClass(task.urgency)}>
                            {task.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-center">
                          <Tooltip title="Delete this task" arrow>
                            <button
                              aria-label="Delete task"
                              onClick={() => handleSingleDelete(task.id)}
                              className="rounded-full p-2 transition-colors duration-150 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                              type="button"
                            >
                              <Trash className="w-5 h-5 text-red-500" />
                            </button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-400"
                      >
                        No tasks found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {tasks.length > 5 && (
              <div className="flex justify-between items-center px-4 py-2">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-100 py-4 flex flex-col md:flex-row gap-2 md:gap-0 justify-end">
            <Dialog open={addNew} onOpenChange={setAddNew}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 !rounded-button whitespace-nowrap cursor-pointer">
                  <Plus/> Add New Task
                </Button>
              </DialogTrigger>
              <DialogContent
                id="add-task-dialog-content"
                className="max-w-4xl w-full bg-gray-100 rounded-2xl shadow-2xl border border-gray-200 p-0 flex flex-col items-center"
                style={{
                  maxHeight: "90vh",
                  overflowY: "auto",
                  padding: 0,
                }}
              >
                <div className="w-full p-0">
                  <DialogHeader className="pt-8 pb-2">
                    <DialogTitle className="text-3xl font-bold text-center">
                      Add Task
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-500 mb-4">
                      Fill out the form below to add a new task.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col md:flex-row gap-6 px-6 pb-8">
                    <TaskForm accounts={accounts} onSuccess={handleTaskSuccess}/>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        {selectedIds.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50 flex items-center">
            <Tooltip title={`Delete ${selectedIds.length} selected task${selectedIds.length > 1 ? "s" : ""}`} arrow>
              <span>
                  <Fab
                    color="error"
                    aria-label="delete"
                    onClick={handleBulkDelete}
                    className="shadow-xl"
                    disabled={bulkDeleteLoading}
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "#ef4444",
                      "&:hover": { bgcolor: "#dc2626" }
                    }}
                  >
                    <Trash className="w-7 h-7" />
                  </Fab>
              </span>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTable;