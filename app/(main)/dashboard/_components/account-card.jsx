"use client";

import { Switch } from '@/components/ui/switch';
import React, { useEffect } from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import useFetch from '@/hooks/use-fetch';
import { updateDefaultAccount } from '@/actions/accounts';
import { toast } from 'sonner';
  

const AccountCard = ({account}) => { 
    const {
        name, 
        type, 
        balance, 
        id, 
        isDefault // initially this is false
    } = account;

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
            toast.success(error.message || "Failed to update default account");
        }
    }, [error]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
        <Link href={`/account/${id}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
                <Switch checked={isDefault} 
                onClick={handleDefaultChange}
                disabled={updateDefaultLoading} />
            </CardHeader>

            <CardContent>
            <div className="text-2xl font-bold">
                    ₱{parseFloat(balance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
                    {type.charAt(0) + type.slice(1).toLowerCase()} Account
            </p>
            </CardContent>

            <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4 text-green-500"/>
                    Income
                </div>

                <div className="flex items-center">
                    <ArrowDownRight className="mr-1 h-4 w-4 text-red-500"/>
                    Expenses
                </div>
            </CardFooter>
        </Link>
    </Card>

  )
}

export default AccountCard;
