import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { BarLoader } from "react-spinners";
import { getAccountWithTransactions, getSubAccounts } from "@/actions/accounts";
import AccountChart from "../_components/account-chart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCashflow, getCashflowEnding } from "@/actions/cashflow";
// import { TransactionTable } from '..//_components/transaction_table';
import TransactionTable from "..//_components/transaction_table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MenuIcon } from "lucide-react";
import CreateSubAccountButton from "../_components/create_sub-account";
import SideNavBar from "@/components/sideNav";
import AccountLineChart from "../_components/account-LineChart";
import { getStaff, getUnauthUser } from "@/actions/admin";
import NotFound from "@/app/not-found";
import { useSession, useUser } from "@clerk/nextjs";

async function AccountsPage({ params }) {
  const user = await getStaff();


  if(!user.authorized){
    await getUnauthUser();
    return NotFound();
  }
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);
  const subAccounts = await getSubAccounts(id);
  const recentCashflows = await getCashflowEnding(id)

  // console.log("recentCashflows", fetchedCashflows);

  // const recentCashflows = fetchedCashflows.latestCashflows;

  const { transactions, ...account } = accountData; //extract transacs and acc data
  // console.info("THE ACCOUNT DATUM:  ",accountData)

  // const cashflow = await getCashflow(id);
  //     console.log("CASHFLOW DATA ACCOUNT PAGE:", cashflow);

  if (!accountData) {
    notFound();
  }
  return (
    <div className="space-y-8 px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SideNavBar accountId={id} />
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
          
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} />
        {/* <AccountLineChart transactions={transactions} /> */}
      </Suspense>

      {/* Transaction Table */}
      <Suspense
        fallback={
          <BarLoader className="mt-4" width={"100%"} color={"#9333ea"} />
        }
      >
        <TransactionTable
          recentCashflows={recentCashflows}
          transactions={transactions}
          id={id}
          subAccounts={subAccounts}
        />
      </Suspense>
    </div>
  );
}

export default AccountsPage;
