// // 'use client';


// // import { Button } from "@/components/ui/button";
// // import { Checkbox } from "@/components/ui/checkbox";

// // import useFetch from "@/hooks/use-fetch";
// // import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
// // import { useMemo, useState } from "react";
// // import {
// //     Card,
// //     CardContent,
// //     CardFooter,
// //     CardHeader,
// //     CardTitle,
// // } from "@/components/ui/card"
// // import {
// //     Dialog,
// //     DialogContent,
// //     DialogDescription,
// //     DialogHeader,
// //     DialogTitle,
// // } from '@/components/ui/dialog';
// // import {
// //     Table,
// //     TableBody,
// //     TableCell,
// //     TableHead,
// //     TableHeader,
// //     TableRow,
// // } from "@/components/ui/table"




// // function CashflowList({ cashflows, onSelectCashflow }) {
// //     const [selectedIds, setSelectedIds] = useState([]);
// //     const [selectedCashflow, setSelectedCashflow] = useState(null);





// //     if (!cashflows || cashflows.length === 0) {
// //         return <p>No cashflow statements found.</p>;
// //     }
// //     const handleCloseDialog = () => {
// //         setSelectedCashflow(null);
// //     };

// //     const [sortConfig, setSortConfig] = useState({
// //         field: "date",
// //         direction: "desc",
// //     });

// //     const handleSort = (field) => {
// //         setSortConfig((current) => ({
// //             field,
// //             direction:
// //                 current.field == field && current.direction === "asc"
// //                     ? "desc"
// //                     : "asc",
// //         }));
// //     };

// //     const filteredAndSortedTransactions = useMemo(() => {
// //         let result = [...cashflows];


// //         // Apply Sorting
// //         result.sort((a, b) => {
// //             let comparison = 0;

// //             switch (sortConfig.field) {
// //                 case "createdAt":
// //                     comparison = new Date(a.date) - new Date(b.date);
// //                     break;


// //                 default:
// //                     comparison = 0;
// //             }

// //             return sortConfig.direction === "asc"
// //                 ? comparison
// //                 : -comparison;
// //         })
// //         return result;
// //     }, [cashflows, sortConfig])






// //     // const handleDelete =()

// //     return (

// //         <div className="p-2 sm:p-4">

// //             <div
// //                 className="cursor-pointer flex items-center gap-2 mb-4"
// //                 onClick={() => handleSort("createdAt")}>
// //                 <span>Sort Date Created</span>
// //                 {sortConfig.field === "createdAt" &&
// //                     (sortConfig.direction === "asc"
// //                         ? (<ArrowUpWideNarrow className='h-4 w-4' />)
// //                         : (<ArrowDownWideNarrow className="h-4 w-4" />)
// //                     )
// //                 }
// //                 {/* <span className="text-red-500">fix: when transactions are used in another CFS it is lost from another CFS. Ref: one-to-many relationship.</span> */}
// //             </div>
// //             {filteredAndSortedTransactions.length === 0
// //                 ? (
// //                     <TableRow>
// //                         <TableCell colSpan={7} className="text-center text-muted-foreground">
// //                             No Transactions Found
// //                         </TableCell>
// //                     </TableRow>
// //                 )
// //                 : (filteredAndSortedTransactions.map((cfs) => (

// //                     cfs.transactions && cfs.transactions.length > 0 && (
// //                         <div key={cfs.id} onClick={() => setSelectedCashflow(cfs)} className="mb-2">
// //                             <Card className="p-2 sm:p-3 border rounded-md cursor-pointer hover:bg-gray-100 flex flex-col sm:flex-row justify-between">

// //                                 <CardHeader className="flex-1">
// //                                     <CardTitle className="text-base sm:text-lg">{cfs.account.name}</CardTitle>
// //                                 </CardHeader>

// //                                 <CardContent className="mt-2 sm:mt-0 flex-1">
// //                                     <span className="text-sm">Cashflow ID: {cfs.id}</span>
// //                                 </CardContent>
// //                                 <CardFooter className="mt-2 sm:mt-0 flex-1">
// //                                     <span className="text-xs sm:text-sm">Created On: {new Date(cfs.createdAt).toLocaleDateString()}</span>
// //                                 </CardFooter>

// //                             </Card>


// //                         </div>
// //                     )

// //                 ))

// //                 )}


// //             <div>

// //                 <div>
// //                     <Dialog open={!!selectedCashflow} onOpenChange={handleCloseDialog}>
// //                         {selectedCashflow && (
// //                             <DialogContent key={selectedCashflow.id} className="w-[90%] max-w-2xl p-4 sm:p-6 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto">
// //                                 <DialogHeader>
// //                                     <DialogTitle className="text-lg sm:text-2xl">Cashflow Statement Details</DialogTitle>
// //                                     <DialogDescription className="text-xs text-gray-500">
// //                                         Cashflow ID: {selectedCashflow.id}
// //                                     </DialogDescription>
// //                                     <DialogDescription className="text-sm sm:text-base">
// //                                         {selectedCashflow.transactions ? (
// //                                             <div className="p-2 sm:p-4 space-y-4">
// //                                                 <div>
// //                                                     <h4 className="text-md sm:text-lg font-semibold">Operating Activities:</h4>
// //                                                     <ul className="list-none p-0">
// //                                                         {selectedCashflow.transactions.filter(tx => tx.Activity === "OPERATION").map(transaction => (
// //                                                             <li key={transaction.id} className="flex justify-between items-center py-1 border-b border-gray-200">
// //                                                                 <span className="text-sm sm:text-base">{transaction.description}</span>
// //                                                                 <span className={transaction.type === "INCOME" ? "text-green-500" : "text-red-500"}>{transaction.amount}</span>
// //                                                             </li>
// //                                                         ))}
// //                                                         <li className="flex justify-between items-center py-1 font-bold border-b border-gray-300">
// //                                                             <span className="text-sm sm:text-base">Net Cash from Operating Activities</span>
// //                                                             <span className="text-sm sm:text-base">{selectedCashflow.activityTotal[0]}</span>
// //                                                         </li>
// //                                                     </ul>
// //                                                 </div>

// //                                                 <div>
// //                                                     <h4 className="text-md sm:text-lg font-semibold">Investing Activities:</h4>
// //                                                     <ul className="list-none p-0">
// //                                                         {selectedCashflow.transactions.filter(tx => tx.Activity === "INVESTMENT").map(transaction => (
// //                                                             <li key={transaction.id} className="flex justify-between items-center py-1 border-b border-gray-200">
// //                                                                 <span className="text-sm sm:text-base">{transaction.description}</span>
// //                                                                 <span className={transaction.type === "INCOME" ? "text-green-500" : "text-red-500"}>{transaction.amount}</span>
// //                                                             </li>
// //                                                         ))}
// //                                                         <li className="flex justify-between items-center py-1 font-bold border-b border-gray-300">
// //                                                             <span className="text-sm sm:text-base">Net Cash from Investment Activities</span>
// //                                                             <span className="text-sm sm:text-base">{selectedCashflow.activityTotal[1]}</span>
// //                                                         </li>
// //                                                     </ul>
// //                                                 </div>

// //                                                 <div>
// //                                                     <h4 className="text-md sm:text-lg font-semibold">Financing Activities:</h4>
// //                                                     <ul className="list-none p-0">
// //                                                         {selectedCashflow.transactions.filter(tx => tx.Activity === "FINANCING").map(transaction => (
// //                                                             <li key={transaction.id} className="flex justify-between items-center py-1 border-b border-gray-200">
// //                                                                 <span className="text-sm sm:text-base">{transaction.description}</span>
// //                                                                 <span className={transaction.type === "INCOME" ? "text-green-500" : "text-red-500"}>{transaction.amount}</span>
// //                                                             </li>
// //                                                         ))}
// //                                                         <li className="flex justify-between items-center py-1 font-bold border-b border-gray-900">
// //                                                             <span className="text-sm sm:text-base">Net Cash from Financing Activities</span>
// //                                                             <span className="text-sm sm:text-base">{selectedCashflow.activityTotal[2]}</span>
// //                                                         </li>
// //                                                     </ul>
// //                                                 </div>

// //                                                 <div className="space-y-2 mt-4">
// //                                                     <div className="flex justify-between items-center">
// //                                                         <span className="text-sm sm:text-base">Gross:</span>
// //                                                         <span className="text-sm sm:text-base">{selectedCashflow.netChange}</span>
// //                                                     </div>
// //                                                     <div className="flex justify-between items-center">
// //                                                         <span className="text-sm sm:text-base">Beginning Net Cash:</span>
// //                                                         <span className="text-sm sm:text-base">{selectedCashflow.startBalance}</span>
// //                                                     </div>
// //                                                     <div className="flex justify-between items-center">
// //                                                         <span className="text-sm sm:text-base">Ending Balance:</span>
// //                                                         <span className="text-sm sm:text-base">{selectedCashflow.endBalance}</span>
// //                                                     </div>
// //                                                 </div>
// //                                             </div>
// //                                         ) : (
// //                                             "No data"
// //                                         )}
// //                                     </DialogDescription>
// //                                 </DialogHeader>

// //                                 <div className="flex justify-center space-x-2 mt-4">
// //                                     <Button variant="destructive" className="text-sm sm:text-base">
// //                                         Delete</Button>
// //                                 </div>



// //                             </DialogContent>
// //                         )}
// //                     </Dialog>
// //                 </div>

// //             </div>



// //         </div>


// //     );
// // }

// // export default CashflowList;



























// 'use client';

// import { useRouter } from 'next/navigation';
// import { useMemo, useState } from 'react';
// import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
// import {
//     Card,
//     CardContent,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from '@/components/ui/card';

// function CashflowList({ cashflows }) {
//     const router = useRouter(); // For navigation
//     const [sortConfig, setSortConfig] = useState({
//         field: 'createdAt',
//         direction: 'desc',
//     });

//     const handleSort = (field) => {
//         setSortConfig((current) => ({
//             field,
//             direction:
//                 current.field === field && current.direction === 'asc'
//                     ? 'desc'
//                     : 'asc',
//         }));
//     };

//     const sortedCashflows = useMemo(() => {
//         let result = [...cashflows];

//         // Apply Sorting
//         result.sort((a, b) => {
//             let comparison = 0;

//             switch (sortConfig.field) {
//                 case 'createdAt':
//                     comparison = new Date(a.createdAt) - new Date(b.createdAt);
//                     break;

//                 default:
//                     comparison = 0;
//             }

//             return sortConfig.direction === 'asc' ? comparison : -comparison;
//         });

//         return result;
//     }, [cashflows, sortConfig]);

//     if (!cashflows || cashflows.length === 0) {
//         return <p>No cashflow statements found.</p>;
//     }

//     return (
//         <div className="p-4">
//             <div
//                 className="cursor-pointer flex items-center gap-2 mb-4"
//                 onClick={() => handleSort('createdAt')}
//             >
//                 <span>Sort Date Created</span>
//                 {sortConfig.field === 'createdAt' &&
//                     (sortConfig.direction === 'asc' ? (
//                         <ArrowUpWideNarrow className="h-4 w-4" />
//                     ) : (
//                         <ArrowDownWideNarrow className="h-4 w-4" />
//                     ))}
//             </div>
//             {sortedCashflows.map((cfs) => (
//                 <div
//                     key={cfs.id}
//                     onClick={() => router.push(`/CashflowStatement/${cfs.accountId}/${cfs.id}`)} // Navigate to cashflow details
//                     className="mb-2"
//                 >
//                     <Card className="p-2 sm:p-3 border rounded-md cursor-pointer hover:bg-gray-100 flex flex-col sm:flex-row justify-between">
//                         <CardHeader className="flex-1">
//                             <CardTitle className="text-base sm:text-lg">
//                                 {cfs.account.name}
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="mt-2 sm:mt-0 flex-1">
//                             <span className="text-sm">Cashflow ID: {cfs.id}</span>
//                         </CardContent>
//                         <CardFooter className="mt-2 sm:mt-0 flex-1">
//                             <span className="text-xs sm:text-sm">
//                                 Created On: {new Date(cfs.createdAt).toLocaleDateString()}
//                             </span>
//                         </CardFooter>
//                     </Card>
//                 </div>
//             ))}
//         </div>
//     );
// }

// export default CashflowList;
