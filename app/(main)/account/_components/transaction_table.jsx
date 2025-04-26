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
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ChevronDown, ChevronUp, Clock, Download, Loader, Loader2, MoreHorizontal, PlusCircleIcon, RefreshCw, Search, Trash, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useFetch from '@/hooks/use-fetch';
import { bulkDeleteTransactions, createSubAccount } from '@/actions/accounts';
import { toast } from 'sonner';
import { BarLoader, BeatLoader } from 'react-spinners';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Swal from 'sweetalert2';
import { createCashflow, deleteCashflow} from '@/actions/cashflow';
import { pdf, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import MyPDFaccountPage from '../[id]/pdf/route';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
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


const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
};



  
const TransactionTable = ({transactions, id, subAccounts}) => { 
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [response, setResponse] = useState(0.00)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCloseButtonDisabled, setIsCloseButtonDisabled] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSubAccountIds, setSelectedSubAccountIds] = useState([]); // State for selected sub-accounts
    const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
const [currentSubAccountPage, setCurrentSubAccountPage] = useState(1);
const [activityFilter, setActivityFilter] = useState("");
// Removed duplicate declaration of rowsPerPage
const rowsPerPage = 10; // Default rows per page

    const {
        register,
        handleSubmit,
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

    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];

        // Apply search filter
        if(searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((transaction) =>
                transaction.description?.toLowerCase().includes(searchLower));
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

    // const handleBulkDelete = async () => {
    //     // if (
    //     //     !window.confirm(
    //     //         `Are you sure you want to DELETE ${selectedIds.length} transactions?`
    //     //     )
    //     // )  
    //     // return; 

    //     console.log("Deleting transactions with IDs:", selectedIds);

    //     deleteFn(selectedIds);
    // }

    useEffect(() => {
        if (deleted && !deleteLoading) {
            // console.log("Transactions deleted successfully:", deleted);
            // toast.error("Selected Transactions Deleted successfully");
             toast.error(`${selectedIds.length} Deleted successfully`);
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

    // const handleSubmit = async (e, data) => {
    //     e.preventDefault();


    //     try {
    //          if(response === 0 || response < 0){
    //         toast.error(`Invalid beginning balance.`)
    //         return;
    //         } 

    //         if (selectedIds === null || selectedIds.length === 0){
    //             toast.error(`Select transactions. Beginning balance is ${response}`)
    //             return;
    //         }

    //         if (response !== null || selectedIds.length !== 0){
    //             console.log("TAKEN DATA: ", "start balance: ", response)
    //             console.log("Selected Transactions: ", selectedIds);
    //             await cfsFn(selectedIds, parseFloat(response));
    //         }

    //         if (forCfs && forCfs.success === true){
    //             toast.success("Cashflow statement done.")
    //             console.log("CFS data: ", forCfs)
    //             setIsModalLoading(true);
                
    //             setIsModalOpen(true);
    //         } else {
    //             toast.success("No data returned") && console.log("CFS data: ", forCfs)
    //         }
    //     } catch (error) {
    //         console.error("Error while producing CFS.", error)
    //         toast.error("Error: ", error)
    //     }

        
    // }
    const resetForm = () => {
        setResponse(0.00);
      };
    const handleCashflow = async (e) => {
        e.preventDefault();
      
       
            if (response === 0 || response < 0) {
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
          
              console.log("Sanitized Data:", sanitizedData);
          
              // Call the server action using useFetch
           
               await createSubAccountFn(selectedIds, sanitizedData);
        };

        useEffect(() => {
          if (subAccountData && subAccountData.success) {
            console.log("Group created successfully:", subAccountData);
            toast.success("Group created successfully!");
            reset(); // Reset the form after successful submission
            setIsDialogOpen(false); // Close the dialog
          }
        }, [subAccountData]);

        useEffect(() => {
          if (subAccountError) {
            console.error("Error grouping transactions:", subAccountError.message);
            toast.error(subAccountError.message || "An unexpected error occurred.");
          }
        }, [ subAccountError]);
   

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












































    
  return (
    
    <div className='space-y-4'>
       {deleteLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       
       
      {/* FILTERS */}
        <div className="lg:flex flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-start">

                <div className='flex flex-col sm:flex-row gap-4'>
                    <div className='relative flex'>
                        <Search className='absolute left-2 top-2.5 h-4 text-muted-foreground'/>
                        <Input 
                            className="pl-8 text-sm"
                            // placeholder="Search Transactions..."
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
                  text-center"
    >
      <SelectValue placeholder="All Activities" />
    </SelectTrigger>

    <SelectContent>
      {/* <SelectItem value="">All Activities</SelectItem> */}
      <SelectItem value="OPERATION">Operation</SelectItem>
      <SelectItem value="INVESTMENT">Investment</SelectItem>
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
                                        )}
                                    >
                                   
                                        <PlusCircleIcon/> Cashflow Statement
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-6 bg-white/2 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl "
                                    align="center"
                                    style={{ zIndex: 0 }}
                                >
                                <h2 className="text-lg font-semibold text-black mb-4">Generate Cashflow Statement</h2>
                                    <form onSubmit={handleCashflow} className="space-y-4">
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={response}
                                                onChange={handleSample}
                                                placeholder="0.00"
                                                className="w-full sm:w-64 text-sm bg-black/20 text-gray-800 border-purple-500/30
                                                placeholder:text-gray-400 focus-visible:ring-purple-500
                                                focus-visible:border-purple-500"
                                            />
                                        
                                            
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
                                                    disabled={cfsLoading}
                                                >
                                                {!cfsLoading
                                                    ? ("Generate")
                                                    : (<><Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-500" /> <span className="text-gray-500">Generating</span></>)
                                                }
                                                </Button>
                                        </div>
                                    </form>
                                    <p className="text-xs text-gray-700 mt-4">
                                        Enter a Beginning Net Cash and click Generate.
                                    </p>
                                </PopoverContent>
                            </Popover>

                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogContent className="[&>button:last-child]:hidden sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] max-h-[90vh]">
                                <DialogHeader>
                                    <DialogTitle>Cashflow Statement PDF</DialogTitle>
                                    <DialogDescription>
                                    {cfsLoading
                                        ? "Re-assessing your last entry..."
                                        : "View your generated cashflow statement."}
                                    </DialogDescription>
                                </DialogHeader>
                                {cfsLoading
                                    ? (
                                        <div className="flex justify-center items-center h-48">
                                        <BeatLoader color="#36d7b7" />
                                        <h1>LOADING...</h1>
                                        </div> ) 
                                    : ( 
                                            <PDFViewer style={{ width: '100%', height: '500px' }} showToolbar={false}>
                                                {forCfs && forCfs.data && Array.isArray(forCfs.data.transactions) 
                                                    ? (<MyPDFaccountPage cashflow={forCfs.data} subAccounts={forCfs.data.subAccounts} transactions={forCfs.data.transactions} />) 
                                                    : (<div>No transactions available for the Cashflow Statement.</div>)
                                                }
                                            </PDFViewer> 
                                    )}
                                
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
                                                        else if (loading){<Loader/>,"Downloading PDF."}
                                                        }
                                                    }

                                                    </PDFDownloadLink>
                                            )
                                            : ("SOMETHINGS'S WRONG")
                                        }
                                        

                                        {!loadingCfsDelete 
                                          ? <Button variant="destructive" onClick={handleCancelPDFdownload}> Cancel </Button>
                                          : <Button variant="destructive" disabled={true}>Cancelling<Loader2/></Button>
                                        }
                                    </div>
                                    
                                
                                </DialogContent>
                                
                            </Dialog>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    disabled={isDialogOpen} // Disable if no transactions are selected
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
                                        <label className="text-sm font-medium">Group name</label>
                                        <input
                                        type="text"
                                        {...register("name")}
                                        className="w-full p-2 border border-gray-300 rounded"
                                        placeholder="Enter group name"
                                        />
                                        {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        {/* <label className="text-sm font-medium">Description</label>
                                        <textarea
                                        {...register("description")}
                                        className="w-full p-2 border border-gray-300 rounded"
                                        placeholder="Enter description (optional)"
                                        />
                                        {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description.message}</p>
                                        )} */}
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
                                        <Button type="submit" className="bg-blue-500 text-white">
                                        Create group
                                        </Button>
                                    </div>
                                    </form>
                                </DialogContent>
                                </Dialog>
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
      <Tabs>
        <TabsList className="flex flex-col sm:flex-row sm:justify-start border-b border-gray-200 mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
          <TabsTrigger value="transactions" className="w-full sm:w-auto">Transactions tab</TabsTrigger>
          <TabsTrigger value="subAccounts" className="w-full sm:w-auto">Grouped transactions tab</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
  <div className="rounded-md border overflow-x-auto">
    <Table>
      <TableHeader>
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
          Date
          {sortConfig.field === "date" &&
            (sortConfig.direction === "asc" ? (
              <ArrowUpWideNarrow className="ml-1 h-4 w-4" />
            ) : (
              <ArrowDownNarrowWide className="ml-1 h-4 w-4" />
            ))}
        </div>
          </TableHead>
          <TableHead className="text-left">Description</TableHead>
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
          <TableHead className="text-center">
            {/* Recurring */}
            </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
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
              <TableCell className="text-left">{transaction.description}</TableCell>
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
                  >{transaction.Activity.charAt(0).toUpperCase() + transaction.Activity.slice(1).toLowerCase()}</TableCell>
              <TableCell className={cn(
                      "text-right font-medium",
                      transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-green-500"
                    )}>
                {transaction.type === "EXPENSE" ? "-" : "+"}
                ₱{transaction.amount.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                {/* {transaction.isRecurring ? (
                  <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700">
                    Recurring
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    One-time
                  </Badge>
                )} */}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
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
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
          <TableHead className="text-right">Amount</TableHead>
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
              <TableCell className="text-right font-medium">
                ₱{subAccount.balance?.toFixed(2) || "0.00"}
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

