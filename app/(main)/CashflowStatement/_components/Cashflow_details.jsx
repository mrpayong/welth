// 'use client';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useRouter } from "next/navigation";



// function CashflowDetails({ cashflow }) {
//   const router = useRouter();

//   if (!cashflow) {
//     return <p>No cashflow details available.</p>;
//   }

//   console.log("cashflows in child component", cashflow);

//   // Helper function to get the color class based on transaction type
//   const getColorClass = (type) => {
//     return type === "INCOME" ? "text-green-500" : "text-red-500";
//   };

//   // Group sub-accounts and solo transactions by Activity
//   const groupedData = {
//     OPERATION: [
//       ...cashflow.subAccounts.filter(
//         (subAccount) =>
//           subAccount.transactions.length > 0 &&
//           subAccount.transactions[0].Activity === "OPERATION"
//       ),
//       ...cashflow.transactions.filter(
//         (transaction) => transaction.Activity === "OPERATION"
//       ),
//     ],
//     INVESTMENT: [
//       ...cashflow.subAccounts.filter(
//         (subAccount) =>
//           subAccount.transactions.length > 0 &&
//           subAccount.transactions[0].Activity === "INVESTMENT"
//       ),
//       ...cashflow.transactions.filter(
//         (transaction) => transaction.Activity === "INVESTMENT"
//       ),
//     ],
//     FINANCING: [
//       ...cashflow.subAccounts.filter(
//         (subAccount) =>
//           subAccount.transactions.length > 0 &&
//           subAccount.transactions[0].Activity === "FINANCING"
//       ),
//       ...cashflow.transactions.filter(
//         (transaction) => transaction.Activity === "FINANCING"
//       ),
//     ],
//   };

//   return (
//     <div className="p-4">
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg sm:text-2xl">
//             Cashflow Statement Details
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {/* Operating Activities */}
//             <div>
//               <h4 className="text-md sm:text-lg font-semibold">
//                 Operating Activities:
//               </h4>
//               <ul className="list-none p-0">
//                 {groupedData.OPERATION.map((item, index) => (
//                   <li
//                     key={item.id || index} // Use index as fallback for solo transactions
//                     className="flex justify-between items-center py-1 border-b border-gray-200"
//                   >
//                     <span className="text-sm sm:text-base">
//                       {item.name || item.description} {/* Sub-account name or transaction description */}
//                     </span>
//                     <span
//                       className={`text-sm sm:text-base ${getColorClass(
//                         item.type
//                       )}`}
//                     >
//                       ₱{item.balance?.toFixed(3) || item.amount.toFixed(3)}
//                     </span>
//                   </li>
//                 ))}
//                 <li className="flex justify-between items-center py-1 font-bold border-b border-gray-300">
//                   <span className="text-sm sm:text-base">
//                     Net Cash from Operating Activities
//                   </span>
//                   <span className="text-sm sm:text-base">
//                     ₱{cashflow.activityTotal[0].toFixed(3)}
//                   </span>
//                 </li>
//               </ul>
//             </div>

//             {/* Investing Activities */}
//             <div>
//               <h4 className="text-md sm:text-lg font-semibold">
//                 Investing Activities:
//               </h4>
//               <ul className="list-none p-0">
//                 {groupedData.INVESTMENT.map((item, index) => (
//                   <li
//                     key={item.id || index}
//                     className="flex justify-between items-center py-1 border-b border-gray-200"
//                   >
//                     <span className="text-sm sm:text-base">
//                       {item.name || item.description}
//                     </span>
//                     <span
//                       className={`text-sm sm:text-base ${getColorClass(
//                         item.type
//                       )}`}
//                     >
//                       ₱{item.balance?.toFixed(3) || item.amount.toFixed(3)}
//                     </span>
//                   </li>
//                 ))}
//                 <li className="flex justify-between items-center py-1 font-bold border-b border-gray-300">
//                   <span className="text-sm sm:text-base">
//                     Net Cash from Investing Activities
//                   </span>
//                   <span className="text-sm sm:text-base">
//                     ₱{cashflow.activityTotal[1].toFixed(3)}
//                   </span>
//                 </li>
//               </ul>
//             </div>

//             {/* Financing Activities */}
//             <div>
//               <h4 className="text-md sm:text-lg font-semibold">
//                 Financing Activities:
//               </h4>
//               <ul className="list-none p-0">
//                 {groupedData.FINANCING.map((item, index) => (
//                   <li
//                     key={item.id || index}
//                     className="flex justify-between items-center py-1 border-b border-gray-200"
//                   >
//                     <span className="text-sm sm:text-base">
//                       {item.name || item.description}
//                     </span>
//                     <span
//                       className={`text-sm sm:text-base ${getColorClass(
//                         item.type
//                       )}`}
//                     >
//                       ₱{item.balance?.toFixed(3) || item.amount.toFixed(3)}
//                     </span>
//                   </li>
//                 ))}
//                 <li className="flex justify-between items-center py-1 font-bold border-b border-gray-300">
//                   <span className="text-sm sm:text-base">
//                     Net Cash from Financing Activities
//                   </span>
//                   <span className="text-sm sm:text-base">
//                     ₱{cashflow.activityTotal[2].toFixed(3)}
//                   </span>
//                 </li>
//               </ul>
//             </div>

//             {/* Summary */}
//             <div className="space-y-2 mt-4">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm sm:text-base">Gross:</span>
//                 <span className="text-sm sm:text-base">
//                   ₱{cashflow.netChange.toFixed(3)}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm sm:text-base">
//                   Beginning Net Cash:
//                 </span>
//                 <span className="text-sm sm:text-base">
//                   ₱{cashflow.startBalance.toFixed(3)}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm sm:text-base">Ending Balance:</span>
//                 <span className="text-sm sm:text-base">
//                   ₱{cashflow.endBalance.toFixed(3)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//         <div className="p-4">
//           <h2 className="text-lg font-bold mb-4">Cashflow Details</h2>
//           <p>Start Balance: {cashflow.startBalance.toFixed(3)}</p>
//           <button
//             // onClick={() =>
//             //   router.push(
//             //     `/CashflowStatement/${cashflow.accountId}/${cashflow.id}/edit`
//             //   )
//             // }
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//           >
//             Edit Cashflow
//           </button>
//         </div>
//       </Card>
//     </div>
//   );
// }

// export default CashflowDetails;