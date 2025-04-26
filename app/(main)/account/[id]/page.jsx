import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'

import { BarLoader } from 'react-spinners';
import { getAccountWithTransactions, getSubAccounts } from '@/actions/accounts';
import AccountChart from '../_components/account-chart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {  getCashflow} from '@/actions/cashflow';
// import { TransactionTable } from '..//_components/transaction_table';
import TransactionTable from '..//_components/transaction_table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, MenuIcon } from 'lucide-react';
import CreateSubAccountButton from '../_components/create_sub-account';


async function AccountsPage ({ params }) {
  const {id} = await params
  const accountData = await getAccountWithTransactions(id);
  const subAccounts = await getSubAccounts(id);



    if (!accountData) {
        notFound();
    }

    const {transactions, ...account} = accountData; //extract transacs and acc data
    // console.info("THE ACCOUNT DATUM:  ",accountData)

// const cashflow = await getCashflow(id);
//     console.log("CASHFLOW DATA ACCOUNT PAGE:", cashflow);




return (
  <div className="space-y-8 px-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">{account.name}</h1>
        <p className="text-muted-foreground">{account._count.transactions} Transactions</p>

        {/* Buttons Section */}
        <div className="flex flex-col gap-y-2 sm:flex-row sm:gap-x-2 mt-2 w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full p-3 rounded-md bg-gray-50 text-gray-800 hover:bg-gray-100 shadow-md flex items-center justify-between"
              >
                <span>Book of accounts</span>
                <ChevronDown className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-full sm:w-[300px] lg:mx-4 bg-gray-50 text-gray-800 shadow-lg border-b border-gray-500"
            >
              <DropdownMenuItem asChild>
                <Link href={`/CashReceiptBook/${id}`} className="block px-4 py-2 hover:bg-gray-100">
                  Cash Receipt Book
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/DisbursementReceiptBook/${id}`} className="block px-4 py-2 hover:bg-gray-100">
                  Cash Disbursement Book
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full p-3 rounded-md bg-gray-50 text-gray-800 hover:bg-gray-100 shadow-md flex items-center justify-between"
              >
                <span>Cashflow statements</span>
                <ChevronDown className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-full sm:w-[300px] bg-gray-50 text-gray-800 shadow-lg border-b border-gray-500"
            >
              <DropdownMenuItem asChild>
                <Link href={`/CashflowStatement/${id}`} className="block px-4 py-2 hover:bg-gray-100">
                  Monthly Cashflow Statement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/CashflowStatement/${id}`} className="block px-4 py-2 hover:bg-gray-100">
                  Quarterly Cashflow Statement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/DisbursementReceiptBook/${id}`} className="block px-4 py-2 hover:bg-gray-100">
                  Annual Cashflow Statement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/DisbursementReceiptBook/${id}`} className="block px-4 py-2 hover:bg-gray-100">
                  Fiscal Cashflow Statement
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add the Create Sub-Account Button */}
          <Button asChild>
                <Link href={`/SubAccounts/${id}`} className="block px-4 py-2 hover:bg-gray-100">
                  Grouped transactions
                </Link>
          </Button>
        </div>
      </div>
    </div>

    {/* Chart Section */}
    <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
      <AccountChart transactions={transactions} />
    </Suspense>

    {/* Transaction Table */}
    <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color={"#9333ea"} />}>
      <TransactionTable transactions={transactions} id={id} subAccounts={subAccounts} />
    </Suspense>
  </div>
);
}


export default AccountsPage;