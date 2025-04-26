'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import { updateCashflow } from "@/actions/cashflow";
import Link from "next/link";

export default function EditCashflow({ cashflow }) {
  const router = useRouter();

  // Initialize useFetch with the server action
  const { 
    loading: isLoading, 
    fn: updateFn, 
    data: updatedCFSdata,
    error: errorEdit,
} = useFetch(updateCashflow);

  const [formData, setFormData] = useState({
    startBalance: cashflow.startBalance,
    subAccountIds: cashflow.subAccounts.map((sa) => sa.id),
    transactionIds: cashflow.transactions.map((tx) => tx.id),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (isNaN(formData.startBalance) || formData.startBalance <= 0) {
      alert("Start Balance must be a positive number.");
      return;
    }
    if (!Array.isArray(formData.subAccountIds) || formData.subAccountIds.length === 0) {
      alert("At least one sub-account must be selected.");
      return;
    }
    if (!Array.isArray(formData.transactionIds) || formData.transactionIds.length === 0) {
      alert("At least one transaction must be selected.");
      return;
    }

    // Call the updateFn function from useFetch
    await updateFn(cashflow.id, Number(formData));
  };

    // Success handling
    useEffect(() => {
        if (updatedCFSdata?.success) {
          router.push(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);
        }
      }, [updatedCFSdata, router, cashflow]);
    
      // Error handling
      useEffect(() => {
        if (errorEdit) {
          console.error("Error updating cashflow:", errorEdit);
          alert(errorEdit.message || "An error occurred while updating the cashflow.");
        }
      }, [errorEdit]);

  return (
    <div>
    <h1 className="text-2xl font-bold mb-6">Edit Cashflow</h1>

    {/* Transactions Section */}
    <div className="mb-6">
      <h2 className="text-lg font-semibold">Transactions</h2>
      <ul>
        {cashflow.transactions.map((transaction) => (
          <li key={transaction.id} className="flex justify-between items-center">
            <span>{transaction.description} - ₱{transaction.amount}</span>
            <Link
              href={`/transaction/edit/${transaction.id}`}
              className="text-blue-500 hover:underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>

    {/* Sub-Accounts Section */}
    <div>
      <h2 className="text-lg font-semibold">Sub-Accounts</h2>
      <ul>
        {cashflow.subAccounts.map((subAccount) => (
          <li key={subAccount.id} className="flex justify-between items-center">
            <span>{subAccount.name} - ₱{subAccount.balance}</span>
            <Link
              href={`/sub-account/edit/${subAccount.id}`}
              className="text-blue-500 hover:underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
  );
}