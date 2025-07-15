"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns';
import { categoryColors } from '@/data/category';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ChevronDown, ChevronUp, Clock, Download, Info, Loader, Loader2, MoreHorizontal, PlusCircleIcon, RefreshCw, Search, Trash, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useFetch from '@/hooks/use-fetch';
import { bulkDeleteTransactions, createSubAccount, deleteSubAccount } from '@/actions/accounts';
import { toast } from 'sonner';
import { BarLoader, BeatLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import { createCashflow, deleteCashflow} from '@/actions/cashflow';
import { pdf, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import MyPDFaccountPage from '../[id]/pdf/route';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { subAccountSchema } from "@/app/lib/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import { updateManyTransaction } from '@/actions/transaction';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
};

function useIsSmallScreen(breakpoint = 640) { // Tailwind's 'sm' is 640px
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isSmall;
}

function formatManilaDate(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
  



const TransactionTable = ({transactions, id, subAccounts, recentCashflows}) => { 
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [response, setResponse] = useState(0.00)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkEdit, setIsBulkEdit] = useState(false);
    const [isCloseButtonDisabled, setIsCloseButtonDisabled] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSubAccountIds, setSelectedSubAccountIds] = useState([]); // State for selected sub-accounts
    const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
    const [currentSubAccountPage, setCurrentSubAccountPage] = useState(1);
    const [activityFilter, setActivityFilter] = useState("");
    const isSmallScreen = useIsSmallScreen();
// Removed duplicate declaration of rowsPerPage
const rowsPerPage = 10; // Default rows per page

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
      } = useForm({
        resolver: zodResolver(subAccountSchema),
        defaultValues: {
          name: "",
          description: "",
          accountId: id,
        //   balance: "",
          parentName: "",
        },
      });

    //filtering hooks
    const [sortConfig, setSortConfig] = useState({
        field: "date",
        direction: "desc",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [recurringFilter, setRecurringFilter] = useState("");

    // Pagination hooks
    const [currentPage, setCurrentPage] = useState(1);


    // const {
    //     loading: deleteLoading,
    //     fn: deleteFn,
    //     data: deleted,
    // } = useFetch(bulkDeleteTransactions);


    //bulk delete function API
    const {
        loading: deleteLoading,
        fn: deleteFn,
        data: deleted,
      } = useFetch(bulkDeleteTransactions);

    const handleSingleDelete = async (id) => {
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `You are about to delete this transaction.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
          });
        
          if (result.isConfirmed) {
            deleteFn([id]);
          }
    }

    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];

        // Apply search filter
        if(searchTerm) {
            const searchLower = searchTerm.toLowerCase();
        result = result.filter((transaction) =>
            (transaction.particular?.toLowerCase().includes(searchLower) ||
             transaction.description?.toLowerCase().includes(searchLower) ||
             transaction.refNumber?.toLowerCase().includes(searchLower))
        );
        }

        // Apply recurring filter
        if (activityFilter) {
          result = result.filter((transaction) => transaction.Activity === activityFilter);
        }

        // Apply Type Filter
        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter);
        }

        // Apply Sorting
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case "amount": 
                    comparison = a.amount - b.amount;
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category);
                    break;

                default:
                    comparison = 0;
            }
            
            return sortConfig.direction === "asc" ? comparison : -comparison; 
        })
        return result;
    },[transactions, searchTerm, typeFilter, activityFilter, sortConfig])
    
    const handleSort = (field) => {
        // setSortConfig((current) => ({
        //     field,
        //     direction: 
        //         current.field == field && current.direction === "asc"
        //             ? "desc"
        //             : "asc",
        // }));


        setSortConfig((current) => {
          if (current.field === field) {
            // Cycle through "asc", "desc", and "disabled"
            const nextDirection =
              current.direction === "asc"
                ? "desc"
                : current.direction === "desc"
                ? null // Disable sorting
                : "asc";
            return { field: nextDirection ? field : null, direction: nextDirection };
          }
          // Default to ascending if a new field is clicked
          return { field, direction: "asc" };
        });
    };

    const handleSelect = (id) => {
        setSelectedIds((current) =>
          current.includes(id)
            ? current.filter((item) => item !== id) // Deselect
            : [...current, id] // Select
        );
      };

    const handleSelectAll = () => {
        const currentPageIds = paginatedTransactions.map((t) => t.id);
        setSelectedIds((current) =>
          currentPageIds.every((id) => current.includes(id))
            ? current.filter((id) => !currentPageIds.includes(id)) // Deselect all on the current page
            : [...current, ...currentPageIds.filter((id) => !current.includes(id))] // Select all on the current page
        );
      };


    useEffect(() => {
        if (deleted && !deleteLoading) {
            // console.log("Transactions deleted successfully:", deleted);
            // toast.error("Selected Transactions Deleted successfully");
             toast.error(`Deleted successfully`);
             setSelectedIds([]);
        }
    }, [deleted, deleteLoading]);

    const handleBulkDelete = async () => {

        const result = await Swal.fire({
          title: `Are you sure?`,
          text: `You are about to delete ${selectedIds.length} transactions.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
        });
      
        if (result.isConfirmed) {
          console.log("Deleting transactions with IDs:", selectedIds);
          deleteFn(selectedIds); // Call the delete function with selected IDs
        }
      };

    const handleClearFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
        setRecurringFilter("");
        setSelectedIds([]);
        setActivityFilter("")
    }

    const {
        loading: cfsLoading,
        fn: cfsFn,
        data: forCfs,
        error: errorCfs
    } = useFetch(createCashflow)




    const handleSample = (event) => {
            setResponse(event.target.value)
    }


    const resetForm = () => {
        setResponse(0.00);
      };
    const handleCashflow = async (e) => {
        e.preventDefault();
      
       
            if (response === 0) {
              toast.error(`Beginning balance must not be zero.`);
              return;
            }
        
            if (selectedIds === null || selectedIds.length === 0) {
              toast.error(`Select transactions. Beginning balance is ${response}`);
              return;
            }
        
          //   console.log("TAKEN DATA: ", "start balance: ", response);
          //   console.log("Selected Transactions: ", selectedIds);
          //   // Create the cashflow
          //   await cfsFn(selectedIds, parseFloat(response));
          if (response !== null || selectedIds.length !== 0){
              console.log("TAKEN DATA: ", "start balance: ", response)
              console.log("Selected Transactions: ", selectedIds);
              console.log("Selected Sub Accounts: ", selectedSubAccountIds);
              await cfsFn(selectedIds, parseFloat(response), selectedSubAccountIds, id);
          }
        
      }; 

      useEffect(() => {
        if (forCfs && forCfs.success) {
          setSelectedIds([])
          toast.success("Cashflow statement created successfully.");
          console.log("CFS data:", forCfs);
    
          // Ensure forCfs.data.transactions is defined
          if (forCfs.data && Array.isArray(forCfs.data.transactions)) {
            setIsModalOpen(true);
          } 
        }
      }, [forCfs]);
     

      useEffect(() => {
        if (errorCfs) {
          toast.error("Failed to create Cashflow statement.");
          console.error("Error while producing CFS:", errorCfs.message);
        }
      }, [errorCfs]);


      const handleConfirm = () => {
        setIsModalOpen(false);
        setResponse(0.00);
        setSelectedIds([]);
      }


    
    const handlePdfDownload = async() => { // make a DELETE SERVER ACTION FOR THIS SO THAT WHEN CLOSED CREATED CFS IS DELETED
        // try {
        //     const doc = (
        //         <Document>
        //           <MyPDFaccountPage cashflow={forCfs.data} transactions={forCfs.data.transactions} />
        //         </Document>
        //       );
          
        //       const asPdf = pdf();
        //       asPdf.updateContainer(doc);
          
        //       const blob = await asPdf.toBlob();
          
        //       const url = window.URL.createObjectURL(blob);
        //       const a = document.createElement('a');
        //       a.href = url;
        //       a.download = `cashflow-statement-${id}.pdf`;
        //       document.body.appendChild(a);
        //       a.click();
          
        //       window.URL.revokeObjectURL(url);
        //       document.body.removeChild(a);
        //     toast.success("PDF exported")
        // } catch (error) {
        //     console.error("Error during PDF export: ", error);
        //     toast.error("Failed exporting PDF.")
        // }
        setIsModalOpen(false);
        setResponse(0.00);
        setSelectedIds([]);
    }

    const {
      loading: loadingCfsDelete, 
      fn: cfsDeleteFn, 
      data: cfsDeleteData,
      error: errorCfsDelete
    } = useFetch(deleteCashflow)

    const handleCancelPDFdownload = async() => {
      setIsModalOpen(false);
      console.log("CANCEL HANDLER: ",forCfs.data.id)
      if (forCfs && forCfs.data && forCfs.data.id) {
        console.log("Cancelling Cashflow Statement with ID:", forCfs.data.id);
        toast.warning("Cancelling Cashflow Statement creation.")
        // Call the delete function with the ID of the cashflow statement
        await cfsDeleteFn(forCfs.data.id);
      }
    }

    useEffect(() => {
        if (cfsDeleteData && cfsDeleteData.success) {
          toast.info("Cancelled creation of Cashflow Statement.");
          console.log("Cancelled creating cfs:", cfsDeleteData);
          setIsModalOpen(false);
        }
      }, [cfsDeleteData]);

    useEffect(() => {
        if (errorCfsDelete) {
          toast.error("Failed to delete Cashflow statement.");
          console.error("Error while deleting CFS:", errorCfsDelete.message);
        }
      }, [errorCfsDelete]);


      const { 
        loading: subAccountLoading, 
        fn: createSubAccountFn,
        data: subAccountData,
        error: subAccountError 
        } = useFetch(createSubAccount);

        const onSubmit = async (data) => {
              console.log("Raw Form Data:", data);
              // Sanitize and validate data types
              const sanitizedData = {
                ...data,
                name: String(data.name).trim(),
                description: data.description ? String(data.description).trim() : null,
                parentName: data.parentName ? String(data.parentName).trim() : null,
              };
          
            
          
              // Call the server action using useFetch
           
               await createSubAccountFn(selectedIds, sanitizedData);
        };

        useEffect(() => {
          if (subAccountData && !subAccountLoading) {
            toast.success("Group created successfully!");
            setSelectedIds([]);
            reset(); // Reset the form after successful submission
            setIsDialogOpen(false); // Close the dialog
          }
        }, [subAccountData, subAccountLoading]);

        useEffect(() => {
          if (subAccountError && !subAccountLoading) {
            console.error("Error grouping transactions:", subAccountError.message);
            toast.error("Failed to create group.");
          }
        }, [subAccountError, subAccountLoading]);
   

    const filteredAndSortedSubAccounts = useMemo(() => {
        if (!Array.isArray(subAccounts?.data)) return [];
      
        let result = [...subAccounts.data];
      
        // Add filtering or sorting logic here if needed
        // For now, we return the subAccounts as is
      
        return result;
      }, [subAccounts]);
      
      // Handle select all for sub-accounts
      const handleSelectAllSubAccounts = () => {
        const currentPageIds = paginatedSubAccounts.map((subAccount) => subAccount.id);
        setSelectedSubAccountIds((current) =>
          currentPageIds.every((id) => current.includes(id))
            ? current.filter((id) => !currentPageIds.includes(id)) // Deselect all on the current page
            : [...current, ...currentPageIds.filter((id) => !current.includes(id))] // Select all on the current page
        );
      };
      const handleSelectSubAccount = (id) => {
        setSelectedSubAccountIds((current) =>
          current.includes(id)
            ? current.filter((item) => item !== id) // Deselect
            : [...current, id] // Select
        );
      };
      
      

      const totalTransactionPages = Math.ceil(filteredAndSortedTransactions.length / rowsPerPage);
      const totalSubAccountPages = Math.ceil(filteredAndSortedSubAccounts.length / rowsPerPage);
      
      const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      );
      const paginatedTransactions = useMemo(() => {
        const startIndex = (currentTransactionPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredAndSortedTransactions.slice(startIndex, endIndex);
      }, [filteredAndSortedTransactions, currentTransactionPage]);
      
      const paginatedSubAccounts = useMemo(() => {
        const startIndex = (currentSubAccountPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredAndSortedSubAccounts.slice(startIndex, endIndex);
      }, [filteredAndSortedSubAccounts, currentSubAccountPage]);


      const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const utcYear = date.getUTCFullYear();
        const utcMonth = date.getUTCMonth(); // Month is zero-based
        const utcDay = date.getUTCDate();
      
        // Format the date as "Month Day, Year"
        return new Date(Date.UTC(utcYear, utcMonth, utcDay)).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

      const getGerundActivity = (activity) => {
        switch (activity) {
          case "OPERATION":
            return "Operating";
          case "INVESTMENT":
            return "Investing";
          case "FINANCING":
            return "Financing";
          default:
            return activity; // Fallback to raw data if no match
        }
      };
      const TransactionDetailshandler = (transaction) => {
        if (typeof window === "undefined") return;
        const formatDateTime = (dateString) => {
          const date = new Date(dateString);
          return date.toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        };
        const formatAmount = (amount) => {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
          }).format(amount);
        };
        const amountColor = transaction.type === "EXPENSE" ? "text-red-500" : "text-green-500";

        Swal.fire({
          title: `<h2 class="text-lg font-semibold text-blue-600">
                    ${transaction.particular || "Transaction Details"}
                  </h2>`,
          html: `
            <div class="text-left space-y-2">
              <p><strong>Date of transaction:</strong> ${formatDate(transaction.date)}</p>
              <p><strong>Amount:</strong><span class="${amountColor}"> ${formatAmount(transaction.amount)}</span></p>
              <p><strong>Type:</strong> ${transaction.type}</p>
              <p><strong>Reference number:</strong> ${transaction.refNumber || "N/A"}</p>
              <p><strong>Account title:</strong> ${transaction.category || "N/A"}</p>
              <p><strong>Activity type:</strong> ${getGerundActivity(transaction.Activity) || "N/A"}</p>
              <p><strong>Description:</strong> ${transaction.description || "No description provided."}</p>
              <p><strong>BIR authority to print number:</strong> ${transaction.printNumber || "N/A"}</p>
              <p><strong>Recorded on:</strong> ${formatDateTime(transaction.createdAt) || "N/A"}</p>              
            </div>
            <div class="text-center mt-4">
              <p class="text-xs text-neutral-400 italic">
                digital ID: ${transaction.id || "N/A"}
              </p>
            </div>
          `,
          showCloseButton: true,
          showConfirmButton: false,
          customClass: {
            popup: "max-w-lg w-full p-6 rounded-lg shadow-lg",
            title: "text-blue-500",
            htmlContainer: "text-gray-700",
          },
        });
      };

      const formatTableAmount = (amount) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
      };




      const {
        loading: updateLoading,
        fn: updateFn,
        data: updatedData,
        error: updateError
      } = useFetch(updateManyTransaction)

      const [ActivityType, setActivityType] = useState("")
      const handleUpdate = async () => {
        setIsBulkEdit(false)
        const result = await Swal.fire({
          title: `Are you sure?`,
          text: `You are about to update ${selectedIds.length} transactions.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
        });
      
        if (result.isConfirmed) {
          console.log("Updating transactions with IDs:", selectedIds);
          updateFn(selectedIds, ActivityType); // Call the delete function with selected IDs
        }
      }

      useEffect(() => {
        if (updatedData && !updateLoading){
          console.log("Success editing Activity types");
          toast.success("Success editing Activity types");
          setSelectedIds([]);
          setActivityType("")
        }
      }, [updatedData, updateLoading])

      useEffect(() => {
        if(updateError && !updateLoading){
          console.log("Error editing Activity types");
          toast.error("Error editing Activity types");
        }
      }, [updateError, updateLoading])

      // disable create group button
      const groupName = watch("name");
      const parentGroupName = watch("parentName");

      const isCreateGroupDisabled =
        (!groupName && !parentGroupName) ||
        (parentGroupName && selectedIds.length === 0);



      const PERIOD_LABELS = [
        { label: "Previous Daily", value: "DAILY" },
        { label: "Previous Weekly", value: "WEEKLY" },
        { label: "Previous Monthly", value: "MONTHLY" },
        { label: "Previous Annual", value: "ANNUAL" },
      ];

      const periodCashflowMap = useMemo(() => {
        const map = {};
        (recentCashflows?.latestCashflows || []).forEach(cf => {
          map[cf.periodCashFlow] = cf;
        });
        return map;
      }, [recentCashflows]);


      const [selectedPeriod, setSelectedPeriod] = useState(null);

      const handleCheckboxChange = (period) => {
        if (selectedPeriod === period) {
          setSelectedPeriod(null); // Uncheck
          setResponse("");         // Clear input
        } else {
          setSelectedPeriod(period);
          setResponse(periodCashflowMap[period]?.endBalance ?? "");
        }
      };





      const [openSubAccountInfoId, setOpenSubAccountInfoId] = useState(null);
      const [groupDeleteDialog, setGroupDeleteDialog] = useState(false);
      const [groupToDeleteId, setGroupToDeleteId] = useState("");



      const {
        loading: deleteGroupLoading,
        fn: deleteGroupFn,
        data: deletedGroup,
        error: deleteGroupError
      } = useFetch(deleteSubAccount)

      const handleGroupToDeleteId = (id) => {
        setGroupToDeleteId(id);
        if(groupToDeleteId !== ""){
          setGroupDeleteDialog(true);
        }
      }

      const handleCancelGroupToDeleteId = () => {
        setGroupToDeleteId("");
        if(groupToDeleteId !== ""){
          setGroupDeleteDialog(false);
        }
      }

      const handleDeleteGroup = async () => {
        if(!groupToDeleteId){
          toast.error("Error deleting group.")
        } else {
          deleteGroupFn(groupToDeleteId);
        }
      }


      useEffect(() => {
        if (deletedGroup && !deleteGroupLoading){
          setGroupToDeleteId("")
          console.log("Success deleting group.");
          toast.success("Success deleting group.");
        }
      }, [deletedGroup, deleteGroupLoading])

      useEffect(() => {
        if(deleteGroupError && !deleteGroupLoading){
          setGroupToDeleteId("")
          console.log("Error deleting group.");
          toast.error("Error deleting group.");
        }
      }, [deleteGroupError, deleteGroupLoading])

const selectedSoloTransactions = useMemo(() => {
  // Only include transactions from the Transaction model that are selected
  return filteredAndSortedTransactions.filter(txn => selectedIds.includes(txn.id));
}, [filteredAndSortedTransactions, selectedIds]);

// function generateCDBCsv(transactions) {
//   // Get all unique categories from selected transactions
//   const dbCategories = [...new Set(transactions.map(txn => txn.category))];

//   const header = [
//     "Date",
//     "Description",
//     "Particular",
//     "Reference Number",
//     "Cash In Bank",
//     ...dbCategories
//   ];

//   const formatNumber = (val) => {
//     if (typeof val === "number" || (!isNaN(val) && val !== "" && val !== null)) {
//       return Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//     }
//     return val;
//   };

//   const rows = transactions.map(txn => {
//     const dbCols = dbCategories.map(cat => (txn.category === cat ? txn.amount : ""));
//     return [
//       formatManilaDate(txn.date),
//       txn.description || "",
//       txn.particular || "",
//       txn.refNumber,
//       txn.amount, // Cash In Bank
//       ...dbCols
//     ];
//   });

//   const totalCashInBank = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
//   const totalDBs = dbCategories.map(cat =>
//     transactions
//       .filter(txn => txn.category === cat)
//       .reduce((sum, txn) => sum + Number(txn.amount), 0)
//   );
//   const totalsRow = ["", "", "", "TOTAL", totalCashInBank, ...totalDBs];

//   const csvArray = [header, ...rows, totalsRow];

//   return csvArray.map(row =>
//     row.map(val => `"${val}"`).join(",")
//   ).join("\r\n");
// }

// const handleDownloadCDB = () => {
//   const csv = generateCDBCsv(selectedSoloTransactions); // Only selected, non-group rows
//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.setAttribute("download", "cash_disbursement_book.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

const handleDownloadCDBExcel = () => {
  const dbCategories = [...new Set(selectedSoloTransactions.map(txn => txn.category))];
  const header = [
    "Date",
    "Description",
    "Particular",
    "Reference Number",
    "Cash In Bank",
    ...dbCategories
  ];

  // Only format date, not numbers
  const rows = selectedSoloTransactions.map(txn => {
    const dbCols = dbCategories.map(cat => (txn.category === cat ? txn.amount : ""));
    return [
      formatManilaDate(txn.date),
      txn.description || "",
      txn.particular || "",
      txn.refNumber,
      txn.amount, // raw number
      ...dbCols
    ];
  });

  const totalCashInBank = selectedSoloTransactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
  const totalDBs = dbCategories.map(cat =>
    selectedSoloTransactions
      .filter(txn => txn.category === cat)
      .reduce((sum, txn) => sum + Number(txn.amount), 0)
  );
  const totalsRow = ["", "", "", "TOTAL", totalCashInBank, ...totalDBs];

  const data = [header, ...rows, totalsRow];

  // Create worksheet and workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "CDB");

  // Auto-width columns
  const wscols = header.map((h, i) => ({
    wch: Math.max(
      h.length,
      ...rows.map(row => (row[i] ? row[i].toString().length : 0)),
      totalsRow[i] ? totalsRow[i].toString().length : 0
    ) + 2 // add some padding
  }));
  ws["!cols"] = wscols;

  // Export
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "cash_disbursement_book.xlsx");
};































    
  return (
    
    <div className='space-y-4'>
       {deleteLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       {updateLoading  && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       {subAccountLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       {deleteGroupLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       {cfsLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
      {/* FILTERS */}
        <div className="lg:flex flex-row items-center justify-between gap-4 mb-4">
          <div className="flex flex-col 
            sm:flex-row py-1 sm:items-center gap-4 justify-start lg:overflow-y-hidden
            md:overflow-x-auto md:max-w-full  md:gap-3">

              <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex'>
                    <Search className='absolute left-2 top-2.5 h-4 text-muted-foreground'/>
                    <Input 
                        className="pl-8 text-xs w-full md:w-64 lg:w-80"
                        placeholder="Search Ref#, Particular, Description"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className='flex flex-col lg:flex-row md:flex-row gap-2'>
                  <Select  value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className=" bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 hover:text-blue-300
                                          border border-blue-500/30 hover:border-blue-500/50
                                          shadow-lg shadow-blue-500/20
                                          transition-all duration-300
                                          px-6 py-3 rounded-full
                                          font-semibold text-sm
                                          flex items-center gap-2
                                          hover:scale-105
                                          justify-center 
                                          text-center">
                          <SelectValue placeholder="All Types"/>
                      </SelectTrigger>

                      <SelectContent>
                          <SelectItem value='INCOME'>Income</SelectItem>
                          <SelectItem value='EXPENSE'>Expense</SelectItem>
                      </SelectContent>
                  </Select>

                  <Select
                    value={activityFilter}
                    onValueChange={(value) => setActivityFilter(value)}
                    className="w-[140px] text-sm"
                  >
                    <SelectTrigger
                      className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 hover:text-blue-300
                                  border border-blue-500/30 hover:border-blue-500/50
                                  shadow-lg shadow-blue-500/20
                                  transition-all duration-300
                                  px-6 py-3 rounded-full
                                  font-semibold text-sm
                                  flex items-center gap-2
                                  hover:scale-105
                                  justify-center 
                                  text-center">
                      <SelectValue placeholder="All Activities" />
                    </SelectTrigger>

                    <SelectContent>
                      {/* <SelectItem value="">All Activities</SelectItem> */}
                      <SelectItem value="OPERATION">Operating</SelectItem>
                      <SelectItem value="INVESTMENT">Investing</SelectItem>
                      <SelectItem value="FINANCING">Financing</SelectItem>
                    </SelectContent>
                  </Select>


                  {(searchTerm || typeFilter || activityFilter) && (
                      <Button
                          variant="outline"
                          size="icon"
                          onClick={handleClearFilters}
                          title="Clear Filters"
                              ><X className='h-4 w-5'/></Button>
                  )}


                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                      variant="outline"
                      className={cn(
                          "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 hover:text-blue-300",
                          "border border-blue-500/30 hover:border-blue-500/50",
                          "shadow-lg shadow-blue-500/20",
                          "transition-all duration-300",
                          "px-4 sm:px-6 py-2 sm:py-3 rounded-full",
                          "font-semibold text-sm",
                          "flex items-center gap-2",
                          "hover:scale-105",
                          "w-full sm:w-auto" //Make it full width on small screen
                      )}>
                        <PlusCircleIcon/> Cashflow Statement
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-6 bg-white/2 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl "
                      align="center"
                      style={{ zIndex: 0 }}
                    >
                      <div className="flex flex-col gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-black">Generate Cashflow Statement</h2>
                        <div >
                          <ul className="grid grid-rows-4 md:grid-rows-none md:grid-cols-2 gap-1">
                            {PERIOD_LABELS.map(({ label, value }) => (
                              <li key={value} className="flex flex-row items-center gap-1">
                                <Checkbox
                                  checked={selectedPeriod === value}
                                  onCheckedChange={() => handleCheckboxChange(value)}
                                  disabled={!periodCashflowMap[value]}
                                  id={`checkbox-${value}`}
                                />
                                <label htmlFor={`checkbox-${value}`} className={periodCashflowMap[value] ? "" : "text-gray-400"}>
                                  {label}
                                </label>
                                {periodCashflowMap[value] && (
                                  <span className="ml-1 text-xs text-gray-500">
                                    (₱{Number(periodCashflowMap[value].endBalance).toLocaleString()})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    
                      <form onSubmit={handleCashflow} className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-full sm:w-64 relative min-h-[44px]">
                            {/* Animated input switch */}
                            <div className="relative">
                              {/* Read-only, formatted input */}
                              <Input
                                type="text"
                                readOnly
                                value={
                                  selectedPeriod && periodCashflowMap[selectedPeriod]
                                    ? formatTableAmount(periodCashflowMap[selectedPeriod].endBalance)
                                    : ""
                                }
                                className={`
                                  absolute top-0 left-0 w-full text-sm bg-black/20 text-gray-800 border-purple-500/30
                                  placeholder:text-gray-400 focus-visible:ring-purple-500
                                  focus-visible:border-purple-500 transition-all duration-300
                                  ${selectedPeriod && periodCashflowMap[selectedPeriod]
                                    ? "opacity-100 translate-y-0 pointer-events-auto"
                                    : "opacity-0 -translate-y-2 pointer-events-none"}
                                `}
                                style={{ zIndex: selectedPeriod && periodCashflowMap[selectedPeriod] ? 10 : 0 }}
                              />
                              {/* Editable number input */}
                              <Input
                                type="number"
                                step="0.01"
                                value={selectedPeriod && periodCashflowMap[selectedPeriod] ? "" : response}
                                onChange={handleSample}
                                placeholder="0.00"
                                className={`
                                  w-full text-sm bg-black/20 text-gray-800 border-purple-500/30
                                  placeholder:text-gray-400 focus-visible:ring-purple-500
                                  focus-visible:border-purple-500 transition-all duration-300
                                  ${selectedPeriod && periodCashflowMap[selectedPeriod]
                                    ? "opacity-0 translate-y-2 pointer-events-none absolute top-0 left-0"
                                    : "opacity-100 translate-y-0 pointer-events-auto relative"}
                                `}
                                style={{ zIndex: selectedPeriod && periodCashflowMap[selectedPeriod] ? 0 : 10 }}
                              />
                            </div>
                          </div>
                          <Button
                              variant="outline"
                              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 hover:text-blue-300
                                  border border-blue-500/30 hover:border-blue-500/50
                                  shadow-lg shadow-blue-500/20
                                  transition-all duration-300
                                  px-6 py-3 rounded-full
                                  font-semibold text-sm
                                  flex items-center gap-2
                                  hover:scale-105"
                              size="sm"
                              type="submit"
                              disabled={cfsLoading || !response || selectedIds.length === 0}
                          >
                          {!cfsLoading
                              ? ("Generate")
                              : (<><Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-500" /> <span className="text-gray-500">Generating</span></>)
                          }
                          </Button>
                        </div>
                      </form>
                      <p className="text-xs text-gray-700 mt-4 tracking-wide">
                        Choose previous ending balance from respective period.<br/> 
                        Enter new beginning balance for new period only.
                      </p>
                    </PopoverContent>
                  </Popover>

                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogContent onInteractOutside={e => e.preventDefault()} className="[&>button:last-child]:hidden sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] max-h-[90vh]">
                      <DialogHeader>
                          <DialogTitle>Cashflow Statement PDF</DialogTitle>
                      </DialogHeader>
                        {cfsLoading
                          ? (
                              <div className="flex justify-center items-center h-48">
                                <BeatLoader color="#36d7b7" />
                                <h1>LOADING</h1>
                              </div> 
                          ) 
                          : ( 
                            <>
                            {isSmallScreen 
                              ? (
                                <div className="flex justify-center gap-2 align-baseline">
                                  {forCfs && forCfs.data && Array.isArray(forCfs.data.transactions)
                                    ? ( 
                                        <PDFDownloadLink 
                                          document={<MyPDFaccountPage cashflow={forCfs.data} subAccounts={forCfs.data.subAccounts} transactions={forCfs.data.transactions} />}
                                          fileName={`Cashflow_Statement_${forCfs.data.id}.pdf`}
                                        >
                                          {({ blob, url, loading, error }) => {
                                            if (!loading){
                                              return <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handlePdfDownload} disabled={loading}>
                                              <div className='flex items-center gap-1'>
                                              <Download className="mr-2 sm:mr-3 md:mr-4 h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6"/>
                                                  Download
                                              </div></Button>
                                            }
                                            else if (loading){
                                              <Loader/>,"Downloading PDF."
                                            }
                                          }}
                                        </PDFDownloadLink>
                                    )
                                    : ("SOMETHINGS'S WRONG")
                                  }

                                  {!loadingCfsDelete 
                                    ? <Button variant="destructive" onClick={handleCancelPDFdownload}> Cancel </Button>
                                    : <Button variant="destructive" disabled={true}>Cancelling<Loader2  className="mr-2 h-4 w-4 animate-spin text-gray-500" /></Button>
                                  }
                                  <Button variant="outline" 
                                      className="bg-white text-black border-black 
                                      hover:border-0 hover:bg-black 
                                      hover:text-white" 
                                      onClick={() => setIsModalOpen(false)}>
                                    Save only
                                  </Button>
                                </div>
                              ) 
                              : (<>
                                  <PDFViewer style={{ width: '100%', height: '500px' }} showToolbar={false}>
                                    {forCfs && forCfs.data && Array.isArray(forCfs.data.transactions) 
                                      ? (<MyPDFaccountPage cashflow={forCfs.data} subAccounts={forCfs.data.subAccounts} transactions={forCfs.data.transactions} />) 
                                      : (<div>No transactions available for the Cashflow Statement.</div>)
                                    }
                                  </PDFViewer> 
                                  <div className="flex justify-center gap-2 align-baseline">
                                    {forCfs && forCfs.data && Array.isArray(forCfs.data.transactions)
                                      ? ( 
                                          <PDFDownloadLink 
                                            document={<MyPDFaccountPage cashflow={forCfs.data} subAccounts={forCfs.data.subAccounts} transactions={forCfs.data.transactions} />}
                                            fileName={`Cashflow_Statement_${forCfs.data.id}.pdf`}
                                          >
                                            {({ blob, url, loading, error }) => {
                                              if (!loading){
                                                return <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handlePdfDownload} disabled={loading}>
                                                <div className='flex items-center gap-1'>
                                                <Download className="mr-2 sm:mr-3 md:mr-4 h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6"/>
                                                    Download
                                                </div></Button>
                                              }
                                              else if (loading){
                                                <Loader/>,"Downloading PDF."
                                              }
                                            }}
                                          </PDFDownloadLink>
                                      )
                                      : ("SOMETHINGS'S WRONG")
                                    }

                                    {!loadingCfsDelete 
                                      ? <Button variant="destructive" onClick={handleCancelPDFdownload}>Cancel</Button>
                                      : <Button variant="destructive" disabled={true}>Cancelling<Loader2  className="mr-2 h-4 w-4 animate-spin text-gray-500" /></Button>
                                    }
                                    <Button 
                                        variant="outline" 
                                        className="bg-white text-black border-black 
                                        hover:border-0 hover:bg-black 
                                        hover:text-white" 
                                        onClick={() => setIsModalOpen(false)}>
                                      Save only
                                    </Button>
                                  </div>
                                </>
                              )
                            }
                            </>
                          )
                        }
                      <div className="flex justify-around items-center">
                        <DialogFooter className="text-gray-400 tracking-normal">
                          {cfsLoading
                            ? "Re-assessing your last entry..."
                            : isSmallScreen
                              ? "PDF ready, download to view. Downloading also saves in Cashflow."
                              : "Preview of generated cashflow statement. Downloading also saves in Cashflow."
                          }
                        </DialogFooter>
                      </div>
                      </DialogContent>
                  </Dialog>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                        className="
                        bg-white hover:bg-blue-600 
                          text-black hover:text-white
                          border border-blue-600 hover:border-0
                          hover:shadow-lg hover:shadow-blue-800/20"
                        disabled={isDialogOpen || subAccountLoading || deleteGroupLoading} 
                        >
                        Group transactions
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] max-h-[90vh]">
                        <DialogHeader>
                        <DialogTitle>Group transactions</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">New group name</label>
                            <input
                            type="text"
                            {...register("name")}
                            className="w-full p-2 border border-gray-300 rounded" 
                            placeholder="Enter group name"
                            />
                            {errors.name && (<p className="text-sm text-red-500">{errors.name.message}</p>)}
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                            {...register("description")}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="Enter description (optional)"
                            />
                            {errors.description && (
                            <p className="text-sm text-red-500">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium">Parent group's name</label>
                            <input
                            type="text"
                            {...register("parentName")}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="Enter parent group name (optional)"
                            />
                            {errors.parentName && (
                            <p className="text-sm text-red-500">{errors.parentName.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={subAccountLoading || isCreateGroupDisabled} className="bg-blue-500 text-white">
                            {subAccountLoading
                              ? (<><Loader2  className="mr-2 h-4 w-4 animate-spin text-blue-300" />Creating group</>)
                              : "Create group"
                            }
                            </Button>
                        </div>
                        </form>
                    </DialogContent>
                  </Dialog>

                  {selectedIds.length > 0 && (
                    <>
                    <Dialog open={isBulkEdit} onOpenChange={setIsBulkEdit}>
                      <DialogTrigger asChild>
                          <Button
                          className="
                          bg-white hover:bg-yellow-300
                          text-black hover:text-white
                          border border-yellow-300 hover:border-0
                          hover:shadow-lg hover:shadow-yellow-500/20
                          px-4 py-2 rounded "

                          disabled={isDialogOpen || subAccountLoading || deleteGroupLoading} // Disable if no transactions are selected
                          >
                          Edit Activity type
                          </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] max-h-[90vh]">
                          <DialogHeader>
                          <DialogTitle>Edit Activity Type</DialogTitle>
                          <DialogDescription>Select Activity Type to edit opted transactions.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={async (e) => {
                              e.preventDefault();
                              await handleUpdate();
                            }} className="space-y-4">
                              
                            <div className="flex flex-col gap-1">
                              <label htmlFor="Activity" className="text-sm font-medium text-gray-700">Activity</label>
                              <select
                                id="Activity"
                                className={`w-full border rounded px-2 py-2 bg-neutral-50 ${
                                  ActivityType ? "text-black" : "text-gray-400"
                                }`}
                                onChange={(e) => setActivityType(e.target.value)}
                                value={ActivityType}
                                required
                                disabled={updateLoading}
                              >
                                <option className="text-gray-400" value="">Select role</option>
                                <option className="text-blue-500" value="OPERATION">Operating</option>
                                <option className="text-purple-500" value="FINANCING">Financing</option>
                                <option className="text-yellow-500" value="INVESTMENT">Investing</option>
                              </select>
                            </div>
                          <div className="flex justify-end">
                              <Button type="submit" disabled={updateLoading} className="bg-blue-500 text-white">
                              {updateLoading
                                ? (<><Loader2  className="mr-2 h-4 w-4 animate-spin text-blue-300" />Editing Activity</>)
                                : "Edit Activity"
                              }
                              </Button>
                          </div>
                          </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={handleDownloadCDBExcel}
                      className="
                        bg-white hover:bg-green-600 
                          text-black hover:text-white
                          border border-green-600 hover:border-0
                          hover:shadow-lg hover:shadow-green-800/20">
                      <Download className="mr-2 h-4 w-4" />
                      Download .xlsx
                    </Button>
                  </>)}
                </div>
              </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {selectedIds && selectedIds.length > 0 && (
                <div className="fixed bottom-4 right-4 z-50">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-500/90 hover:bg-red-500 text-white
                    border border-red-500/30 hover:border-red-500/50
                    shadow-lg shadow-red-500/20
                    transition-all duration-300
                    px-4 py-2 rounded-full
                    font-semibold text-sm
                    flex items-center gap-2 hover:scale-105"
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete {selectedIds.length} transactions</span> 
                </Button>
              </div>
            )}
          </div>

        </div> 




      {/* TRANSACTIONS */}
      <Tabs defaultValue='transactions'>
        <TabsList   className="
          flex flex-row gap-x-2 
          overflow-x-auto md:overflow-x-visible
          whitespace-nowrap
          border-b border-gray-200 mb-4
          w-full
          bg-neutral-300
          rounded-t-md
          px-2 h-12 py-2 shadow-sm
          ">
          <TabsTrigger value="transactions" className="flex-shrink-0 px-4 py-2">Transactions tab</TabsTrigger>
          <TabsTrigger value="subAccounts" className="flex-shrink-0 px-4 py-2">Grouped transactions tab</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <div className="rounded-md border overflow-x-auto">

            <Table>
              <TableHeader className="bg-slate-300">
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <Checkbox
                      onCheckedChange={handleSelectAll}
                      checked={
                        paginatedTransactions.every((t) => selectedIds.includes(t.id)) &&
                        paginatedTransactions.length > 0
                      }
                    />
                  </TableHead>
                  <TableHead className="text-left cursor-pointer"
                    onClick={() => handleSort("date")}
                  ><div className="flex items-center">
                  Transaction date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUpWideNarrow className="ml-1 h-4 w-4" />
                    ) : (
                      <ArrowDownNarrowWide className="ml-1 h-4 w-4" />
                    ))}
                </div>
                  </TableHead>
                  <TableHead className="text-left">Particular</TableHead>
                  <TableHead className="text-left cursor-pointer"
                    onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center">
                          Account title
                          {sortConfig.field === "category" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUpWideNarrow className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDownNarrowWide className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                  </TableHead>
                  <TableHead className="text-center w-[150px]">Activity type</TableHead>
                  <TableHead className="text-right cursor-pointer"
                    onClick={() => handleSort("amount")}>
                      <div className="flex items-center justify-end">
                          Amount
                          {sortConfig.field === "amount" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUpWideNarrow className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDownNarrowWide className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                  </TableHead>
                  <TableHead className="text-center"
                    onClick={() => handleSort("createdAt")}>
                      <div className="flex justify-center">
                        Recorded on
                        {sortConfig.field === "createdAt" &&
                          (sortConfig.direction === "asc" ? (
                            <ArrowUpWideNarrow className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDownNarrowWide className="ml-1 h-4 w-4" />
                        ))}
                      </div>
                  </TableHead>
                  <TableHead className="text-center">Reference number</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-zinc-200">
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No Transactions Found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-center">
                        <Checkbox
                          onCheckedChange={() => handleSelect(transaction.id)}
                          checked={selectedIds.includes(transaction.id)}
                        />
                      </TableCell>
                      <TableCell className="text-left">{formatDate(transaction.date)}</TableCell>
                      <TableCell className="text-left">{transaction.particular || "No assigned particular"}</TableCell>
                      <TableCell className="text-left">{transaction.category}</TableCell>
                      
                      <TableCell
                          className={cn(
                                "text-center font-medium",
                                {
                                OPERATION: "text-blue-500",
                                INVESTMENT: "text-yellow-500",
                                FINANCING: "text-purple-500",
                                }[transaction.Activity] || "text-gray-500" // Default color if no match
                            )}
                          >
                            {getGerundActivity(transaction.Activity)}
                          </TableCell>
                      <TableCell className={cn(
                              "text-right font-medium",
                              transaction.type === "EXPENSE"
                                ? "text-red-500"
                                : "text-green-500"
                            )}>
                        {transaction.type === "EXPENSE" ? "-" : "+"}
                        {formatTableAmount(transaction.amount.toFixed(2))}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        {transaction.refNumber}
                      </TableCell>
                      <TableCell className='flex justify-around'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              disabled={subAccountLoading || deleteGroupLoading} 
                              variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() =>
                                    router.push(
                                      `/transaction/create?edit=${transaction.id}`
                                    )
                                  }
                                  className="text-yellow-400">Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleSingleDelete(transaction.id)}>Delete</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => TransactionDetailshandler(transaction)} className="text-blue-700">Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationControls
              currentPage={currentTransactionPage}
              totalPages={totalTransactionPages}
              onPageChange={setCurrentTransactionPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="subAccounts">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      onCheckedChange={handleSelectAllSubAccounts}
                      checked={
                        paginatedSubAccounts.every((subAccount) =>
                          selectedSubAccountIds.includes(subAccount.id)
                        ) && paginatedSubAccounts.length > 0
                      }
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-left">Amount</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No group found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSubAccounts.map((subAccount) => (
                    <TableRow key={subAccount.id}>
                      <TableCell>
                        <Checkbox
                          onCheckedChange={() => handleSelectSubAccount(subAccount.id)}
                          checked={selectedSubAccountIds.includes(subAccount.id)}
                        />
                      </TableCell>
                      <TableCell>{subAccount.name}</TableCell>
                      <TableCell className="text-left font-medium">
                        {formatTableAmount(subAccount.balance?.toFixed(2)) || "0.00"}
                      </TableCell>
                      <TableCell className="flex justify-end items-end">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline"
                            disabled={subAccountLoading || deleteGroupLoading}
                              className="px-2 py-1 h-8 w-8 flex border-0 items-center justify-center"
                              aria-label="Open user actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            align="end"
                            className="w-56 max-w-xs sm:max-w-sm md:max-w-md p-4 rounded-xl shadow-lg bg-white"
                            sideOffset={8}>

                            <div className="flex flex-col gap-2">
                          
                            <Button
                                onClick={() => handleGroupToDeleteId(subAccount.id)}
                                variant="outline"
                                className="flex items-center gap-2 text-rose-600 border-rose-600 hover:bg-rose-600 hover:text-white hover:border-0">
                                <span className="flex items-center">
                                  <Trash className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                  <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Delete</span>
                                </span>
                              </Button>

                              <Button
                                onClick={() => setOpenSubAccountInfoId(subAccount.id)}
                                variant="outline"
                                className="flex items-center gap-2 text-blue-700 border-blue-700 hover:bg-blue-700 hover:text-white hover:border-0"
                              >
                                <span className="flex items-center">
                                  <Info className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true"/>
                                  <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Details</span>
                                </span>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>

                      <Dialog open={openSubAccountInfoId === subAccount.id} onOpenChange={(open) => setOpenSubAccountInfoId(open ? subAccount.id : null)}>
                          <DialogContent>
                          <DialogHeader>
                              <DialogTitle className="text-center">Group Transaction Details</DialogTitle>
                              <DialogDescription>
                                  These details are only about this opened group.
                              </DialogDescription>
                          </DialogHeader>
                            <div className="flex">
                              <div className="flex-1">
                                <p className="text-sm text-gray-700">
                                  <strong>Name:</strong> {subAccount.name}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <strong>Balance:</strong> {formatTableAmount(subAccount.balance?.toFixed(2)) || "0.00"}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <strong>Parent of:</strong> {`${subAccount.children.length} groups` || "No child group"}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <strong>Transactions in this group only:</strong> {subAccount.transactions.length || "No Transactions"}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <strong>Description:</strong> {subAccount.description || "No description available"}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <strong>Created On:</strong> {formatDate(subAccount.createdAt) || "No date"}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <strong>Updated Last:</strong> {subAccount?.updatedAt ? formatDate(subAccount.updatedAt) : "No date"}
                                </p>
                              </div>
                            </div>
                          <DialogClose asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-auto
                              border-black hover:border-0 hover:bg-black hover:text-white"
                              >Close
                            </Button>
                          </DialogClose>
                          </DialogContent>
                          
                      </Dialog>
                          
                      <Dialog open={groupToDeleteId === subAccount.id} onOpenChange={(open) => setGroupToDeleteId(open ? subAccount.id : null)}>
                          <DialogContent>
                          <DialogHeader>
                              <DialogTitle className="text-center">Delete this group?</DialogTitle>
                              <DialogDescription className="text-center">
                                  Deleting this group will not delete other related child groups. 
                              </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col md:flex-row gap-2 justify-center">
                          <DialogFooter>
                              
                                <Button 
                                disabled={deleteGroupLoading}
                                type="button"
                                variant="outline"
                                onClick={handleDeleteGroup}
                                className="border-2 border-green-400 
                                hover:border-0 hover:bg-green-400 
                                text-green-400 hover:text-white">
                                  Yes
                                </Button>
                              
                                <DialogClose asChild>
                                  <Button
                                    disabled={deleteGroupLoading}
                                    onClick={handleCancelGroupToDeleteId}
                                    type="button"
                                    variant="outline"
                                    className="w-auto
                                    border-rose-600 hover:border-0 hover:bg-rose-600 
                                    text-rose-600 hover:text-white"
                                    >Cancel
                                  </Button>
                                </DialogClose>
                            
                          </DialogFooter></div>
                            
                          </DialogContent>
                      </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationControls
              currentPage={currentSubAccountPage}
              totalPages={totalSubAccountPages}
              onPageChange={setCurrentSubAccountPage}
            />
          </div>
        </TabsContent>

      </Tabs>
      
      
    </div>
    
  )
}
export default TransactionTable

