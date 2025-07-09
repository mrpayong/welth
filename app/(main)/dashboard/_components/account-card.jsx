"use client";

import { Switch } from '@/components/ui/switch';
import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import useFetch from '@/hooks/use-fetch';
import { updateDefaultAccount } from '@/actions/accounts';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useAccountCardContext } from '@/components/loadingCard';
import { Button } from '@/components/ui/button';
  

const AccountCard = ({account}) => { 
    const {
        name, 
        type, 
        balance, 
        id, 
        _count,
        isDefault, // initially this is false
    } = account;

    const router = useRouter();

    const handleAddTransaction = () => {
      router.push(`/transaction/create?accountId=${account.id}`);
    };

    const { 
        //fetch hook for updating default status
        // this is update default function to be called
        loading: updateDefaultLoading,
        fn: updateDefaultFn,
        data: updatedAccount,
        error,
    } = useFetch(updateDefaultAccount);

    const handleDefaultChange = async (event) => { // this is async bcoz API calling will happen inside
        event.preventDefault(); //prevent refreshing the page 

        // checking if isDefault true/false status
        if (isDefault /*isDefault is currently false*/) {
            //if false nga talaga ang isDefault, throw warning messge kasi dapat true na may default acc
            toast.warning("You need at least 1 default account");
            return; //don't allow toggling off the default account when no other default acc
        }

        await updateDefaultFn(id); //call the update default func on the selected id
    } 

    useEffect(() => {
        if (updatedAccount?.success) {
            toast.success("Default account updated successfully")
        }
    }, [updatedAccount, updateDefaultLoading]);

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to update default account");
        }
    }, [error]);


    const { loadingAccountId, setLoadingAccountId } = useAccountCardContext();

  const handleClick = () => {
    if (!loadingAccountId) {
      setLoadingAccountId(id); // Set the loading state for the clicked card
    }
  };

  const isLoading = loadingAccountId === id; // Check if this card is loading
  const isDisabled = !!loadingAccountId; // Disable all cards if any card is loading

  console.log("Account:",_count)

  
  






  return (
    <Card
    onClick={handleClick}
    className={`hover:shadow-md transition-shadow group relative border border-gray-800 ${
        isDisabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
    <Link href={`/account/${id}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium capitalize">{account._count.transactions} Transactions</CardTitle> {/*replace with number of transaction in the account */}
      </CardHeader>

      <CardContent>
      <div className="text-2xl font-bold flex items-center gap-2">
    {isLoading ? (
      <>
        <span className="opacity-50">{name}</span>
        <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
      </>
    ) : (
      name
    )}
  </div>
        <p className="text-xs text-muted-foreground">
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </p>
      </CardContent>

    
    </Link>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        
        <Button
        className={`bg-white hover:bg-gradient-to-r 
                    hover:from-blue-700 hover:to-fuchsia-600 
                    text-black hover:text-white font-semibold 
                    py-2 px-4 rounded-lg 
                    shadow-md hover:shadow-lg 
                    transition-all duration-300 
                    w-full
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400
                    border border-black hover:border-white tracking-normal
                  `}
        onClick={handleAddTransaction}
        >
        <Camera/> Add Transaction
      </Button>
      </CardFooter>
  </Card>



  // <div className="border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow">
  //     <h3 className="text-lg font-semibold">{account.name}</h3>
  //     <p className="text-sm text-gray-500">{account.type}</p>
  //     <div className="flex justify-between items-center mt-4">
  //       <p className="text-sm font-medium text-green-500">
  //         Income: ₱{account.income?.toFixed(2) || "0.00"}
  //       </p>
  //       <p className="text-sm font-medium text-red-500">
  //         Expenses: ₱{account.expenses?.toFixed(2) || "0.00"}
  //       </p>
  //     </div>
  //     <Button
  //       className="mt-4 bg-blue-500 text-white hover:bg-blue-600 w-full"
  //       onClick={handleAddTransaction}
  //     >
  //       Add Transaction
  //     </Button>
  //   </div>

  )
}

export default AccountCard;
