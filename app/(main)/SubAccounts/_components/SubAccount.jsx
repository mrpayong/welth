"use client";

import { useState } from "react";

const SubAccount = ({ subAccount }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      {/* Sub-Account Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{subAccount.name}</h3>
          <p className="text-sm text-gray-500">
            {subAccount.description || "No description available"}
          </p>
          <p className="text-sm font-medium">
            Balance: {subAccount.balance !== null ? `$${subAccount.balance}` : "N/A"}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:underline"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Sub-Account Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Transactions */}
          <div>
            <h4 className="text-md font-semibold">Transactions</h4>
            {subAccount.transactions.length === 0 ? (
              <p className="text-sm text-gray-500">No transactions available.</p>
            ) : (
              <ul className="list-disc list-inside">
                {subAccount.transactions.map((transaction) => (
                  <li key={transaction.id} className="text-sm">
                    <p>Type: {transaction.type}</p>
                    <p>Description: {transaction.description}</p>
                    <p>Amount: ${transaction.amount}</p>
                    <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Child Sub-Accounts */}
          {subAccount.children && subAccount.children.length > 0 && (
            <div>
              <h4 className="text-md font-semibold">Child Group</h4>
              <div className="ml-4 space-y-4">
                {subAccount.children.map((child) => (
                  <SubAccount key={child.id} subAccount={child} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubAccount;