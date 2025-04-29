"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlignJustify, ChevronDown, Loader2, X } from "lucide-react";
import Link from "next/link";

const SideNavBar = ({ accountId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBookExpanded, setIsBookExpanded] = useState(false);
  const [loadingLink, setLoadingLink] = useState(null);

  const toggleNavBar = () => setIsOpen(!isOpen);
  const toggleBookMenu = () => setIsBookExpanded(!isBookExpanded);

  const handleLinkClick = (linkId) => {
    setLoadingLink(linkId); // Set the clicked link as loading
  };
  

  return (
    <>
      {/* Button Under Transaction Count */}
      <div className="mt-4">
        <Button
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md flex items-center justify-center"
          onClick={toggleNavBar}
        >
          <AlignJustify />
        </Button>
      </div>

      {/* Hovering Side Navigation Bar */}
      {isOpen && (
        <div className="fixed top-[4rem] left-0 h-[calc(100%-4rem)] w-64 bg-white shadow-lg z-50 border-r border-gray-200">
          {/* Close Button */}
          
          {/* Navigation Links */}
          <nav className="p-4 space-y-4">
            {/* Book of Accounts */}
            <div className="flex justify-between items-center pt-5 ">
            <h2></h2>
            <button
              className="text-gray-400 hover:text-red-600"
              onClick={toggleNavBar}
            >
              <X className="w-4 h-6" />
            </button>
          </div>

            <div>
              <button
                className="flex items-center justify-between w-full text-left text-black hover:text-blue-600"
                onClick={toggleBookMenu}
              >
                <span>Book of Accounts</span>
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform ${
                    isBookExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isBookExpanded && (
                <div className="mt-2 pl-4 space-y-2">
                  <Link
                    href={`/CashReceiptBook/${accountId}`}
                    className={`block text-black hover:text-blue-600 ${
                      loadingLink === "cashReceipt" ? "pointer-events-none opacity-50" : ""
                    }`}
                    onClick={() => handleLinkClick("cashReceipt")}
                  >
                    {loadingLink === "cashReceipt" ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" />
                        <span className="text-neutral-500">Cash Receipt Book</span>
                      </div>
                    ) : (
                      "Cash Receipt Book"
                    )}
                  </Link>
                  <Link
                    href={`/DisbursementReceiptBook/${accountId}`}
                    className={`block text-black hover:text-blue-600 ${
                      loadingLink === "disbursementReceipt" ? "pointer-events-none opacity-50" : ""
                    }`}
                    onClick={() => handleLinkClick("disbursementReceipt")}
                  >
                    {loadingLink === "disbursementReceipt" ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" />
                        <span className="text-neutral-500">Disbursement Receipt Book</span>
                      </div>
                    ) : (
                      "Disbursement Receipt Book"
                    )}
                  </Link>
                </div>
              )}
            </div>

            {/* Cashflow */}
            <Link
              href={`/CashflowStatement/${accountId}`}
              className={`block text-black hover:text-blue-600 ${
                loadingLink === "cashflow" ? "pointer-events-none opacity-50" : ""
              }`}
              onClick={() => handleLinkClick("cashflow")}
            >
              {loadingLink === "cashflow" ? (
                    <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4 text-neutral-500" />
                    <span className="text-neutral-500">(icon)Cashflow Statement</span>
                    </div>
                ) : (
                    "Cashflow Statement"
                )}
            </Link>

            {/* Grouped Transactions */}
            <Link
              href={`/SubAccounts/${accountId}`}
              className={`block text-black hover:text-blue-600 ${
                loadingLink === "groupedTransactions" ? "pointer-events-none opacity-50" : ""
              }`}
              onClick={() => handleLinkClick("groupedTransactions")}
            >
              {loadingLink === "groupedTransactions" ? (
                <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4 text-neutral-500" />
                <span className="text-neutral-500">Grouped Transactions</span>
                </div>
            ) : (
                "Grouped Transactions"
            )}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
};

export default SideNavBar;