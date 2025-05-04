"use client";

import { useState } from "react";

const SubAccount = ({ subAccount, level = 0}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    }).format(amount);
  };

  // return (
  //   <div className="border border-gray-300 rounded-lg p-4">
  //     {/* Sub-Account Header */}
  //     <div className="flex justify-between items-center">
  //       <div>
  //         <h3 className="text-lg font-semibold">{subAccount.name}</h3>
  //         <p className="text-sm text-gray-500">
  //           {subAccount.description || "No description available"}
  //         </p>
  //         <p className="text-sm font-medium">
  //           Balance: {subAccount.balance !== null ? `${formatAmount(subAccount.balance)}` : "N/A"}
  //         </p>
  //       </div>
  //       <button
  //         onClick={() => setIsExpanded(!isExpanded)}
  //         className="text-blue-500 hover:underline"
  //       >
  //         {isExpanded ? "Collapse" : "Expand"}
  //       </button>
  //     </div>

  //     {/* Sub-Account Details */}
  //     {isExpanded && (
  //       <div className="mt-4 space-y-4">
  //         {/* Transactions */}
  //         <div>
  //           <h4 className="text-md font-semibold">Transactions</h4>
  //           {subAccount.transactions.length === 0 ? (
  //             <p className="text-sm text-gray-500">No transactions available.</p>
  //           ) : (
  //             <ul className="list-disc list-inside">
  //               {subAccount.transactions.map((transaction) => (
  //                 <li key={transaction.id} className="text-sm">
  //                   <p>Type: {transaction.type}</p>
  //                   <p>Description: {transaction.description}</p>
  //                   <p>Amount: ${formatAmount(transaction.amount)}</p>
  //                   <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
  //                 </li>
  //               ))}
  //             </ul>
  //           )}
  //         </div>

  //         {/* Child Sub-Accounts */}
  //         {subAccount.children && subAccount.children.length > 0 && (
  //           <div>
  //             <h4 className="text-md font-semibold">Child Group</h4>
  //             <div className="ml-4 space-y-4">
  //               {subAccount.children.map((child) => (
  //                 <SubAccount key={child.id} subAccount={child} />
  //               ))}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     )}
  //   </div>
  // );

  return (
    <>
      {/* Table Row for Sub-Account */}
      <tr
        className={`border-b ${
          level % 2 === 0 ? "bg-blue-50" : "bg-white"
        }`}
      >
        <td className="py-2 px-4">
          <div
            className="flex items-center"
            style={{ marginLeft: `${level * 20}px` }} // Indentation for hierarchy
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-500 hover:underline mr-2"
            >
              {isExpanded ? "-" : "+"}
            </button>
            <span className="font-semibold text-blue-900">{subAccount.name}</span>
          </div>
        </td>
        <td className="py-2 px-4 text-gray-500">
          {subAccount.description || "No description available"}
        </td>
        <td className="py-2 px-4 text-gold-600 font-medium">
          {subAccount.balance !== null ? formatAmount(subAccount.balance) : "N/A"}
        </td>
      </tr>

      {/* Expanded Details */}
      {isExpanded && (
        <>
          {/* Transactions */}
          {subAccount.transactions.length > 0 && (
            <tr className="bg-gray-50">
              <td colSpan="3" className="py-2 px-4">
                <h4 className="text-md font-semibold text-blue-800">Transactions</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                  {subAccount.transactions.map((transaction) => (
                    <li key={transaction.id}>
                      <p>Type: {transaction.type}</p>
                      <p>Description: {transaction.description}</p>
                      <p>Amount: {formatAmount(transaction.amount)}</p>
                      <p>
                        Date:{" "}
                        {new Date(transaction.date).toLocaleDateString("en-US")}
                      </p>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          )}

          {/* Child Sub-Accounts */}
          {subAccount.children &&
            subAccount.children.length > 0 &&
            subAccount.children.map((child) => (
              <SubAccount key={child.id} subAccount={child} level={level + 1} />
            ))}
        </>
      )}
    </>
  );
};

const SubAccountTable = ({ subAccounts }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="py-2 px-4 text-left text-blue-900 font-semibold">
              Name
            </th>
            <th className="py-2 px-4 text-left text-blue-900 font-semibold">
              Description
            </th>
            <th className="py-2 px-4 text-left text-blue-900 font-semibold">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {subAccounts.map((subAccount) => (
            <SubAccount key={subAccount.id} subAccount={subAccount} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubAccount;




























