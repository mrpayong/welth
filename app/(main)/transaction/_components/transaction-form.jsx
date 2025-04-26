"use client";
import { 
    createTransaction, 
    updateTransaction } from '@/actions/transaction';
import { transactionSchema } from '@/app/lib/schema';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { PopoverContent } from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ReceiptScanner from './receipt-scanner';
import { cn } from '@/lib/utils';

const AddTransactionForm = ({
    accounts, 
    categories,
    editMode =  false,
    initialData = null,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const [isClient, setIsClient] = useState(true);

    useEffect(() => {
        setIsClient(false)
      }, [])

    const {
        register,
        setValue,
        handleSubmit,
        formState: {errors},
        watch,
        getValues,
        reset,
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: 
            editMode && initialData 
            ? {
                type: initialData.type,
                Activity: initialData.Activity,
                refNumber: initialData.refNumber,
                amount: initialData.amount.toString(),
                description: initialData.description,
                accountId: initialData.accountId,
                category: initialData.category,
                particular: initialData.particular,
                date: new Date(initialData.date),
                isRecurring: initialData.isRecurring,
                ...(initialData.recurringInterval && {
                    recurringInterval: initialData.recurringInterval,
                }),
            }
            : {
            type: "EXPENSE",
            refNumber: "1234567",
            particular: "",
            Activity: "OPERATION",
            amount: "",
            description: "",
            category: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
        },
    });

    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionResult,
    } = useFetch(editMode ? updateTransaction : createTransaction);

    const type = watch("type");
    const activityType = watch("Activity");
    const isRecurring = watch("isRecurring");
    const date = watch("date");

    const filteredCategories = categories.filter(
        (category) => category.type === type
    );
    
    const onSubmit = async (data) => {
        const formData = {
            ...data,
            amount: parseFloat(data.amount),
        };

        if (editMode) {
            transactionFn(editId, formData);
        } else{
            transactionFn(formData);
        }
    };

    useEffect(() => {
        if (transactionResult?.success && !transactionLoading) {
            toast.success(
                editMode
                    ? "Transaction updated successfully."
                    : "Transaction created successfully."
                );
            reset();
            router.push(`/account/${transactionResult.data.accountId}`);
        }
    }, [transactionResult, transactionLoading, editMode]);

    // const handleScanComplete = (scannedData) => {
    //     console.log(scannedData);
    //     if(scannedData){
    //         setValue("amount", scannedData.amount.toString());
    //         setValue("date", new Date(scannedData.date));

    //         if (scannedData.description){
    //             setValue("description", scannedData.description);
    //         }
    //         if(scannedData.category){
    //             setValue("category", scannedData.category);
    //         }
    //         toast.success("Receipt scanned successfully");
    //     }
    // };
    const handleScanComplete = (scannedData) => {
        if (scannedData) {
          setValue("amount", scannedData.amount.toString());
          console.log("amount scanning success")
          setValue("date", new Date(scannedData.date));
          console.log("date scanning success")
          setValue("refNumber",scannedData.refNumber);
          setValue("particular", scannedData.particular);
          if (scannedData.description) {
            setValue("description", scannedData.description);
            console.log("description scanning success")
          }
          if (scannedData.category) {
            setValue("category", scannedData.category);
            
          }console.log("category scanning success:", scannedData.category)
          toast.success("Receipt scanned successfully");
        }
      };





      


  return (
    <form 
        className='space-y-6'
        onSubmit={handleSubmit(onSubmit)}>
      {/* AI RECEIPT SCANNER */}
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete}/>}

      {isClient ? ('This is never prerendered') : ( 
        <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Transaction type</label>
                <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={type}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Type"/>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>

                {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
            </div> 
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Activity type</label>
                <Select
                onValueChange={(value) => setValue("Activity", value)}
                defaultValue={activityType}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Type"/>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="OPERATION">Operating Activity</SelectItem>
                        <SelectItem value="INVESTMENT">Investment Activity</SelectItem>
                        <SelectItem value="FINANCING">Financing Activity</SelectItem>
                    </SelectContent>
                </Select>

                {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
            </div> 
        </div>
    )}

        {isClient ? ('This is never prerendered') : (  <div className='grid gap-6 md:grid-cols-2'> 
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Amount(₱)</label>
                    <Input
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...register("amount")}
                    />

                    {errors.type && (
                        <p className="text-sm text-red-500">{errors.type.message}</p>
                    )}
                </div>
                {/* 
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Reference Number</label>
                    <Input
                        type="text" 
                        placeholder="Reference Number"
                        {...register("refNumber")}
                    />

                    {errors.type && (
                        <p className="text-sm text-red-500">{errors.type.message}</p>
                    )}
                </div> 
                */}

                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Company Name</label>
                    <Select
                        onValueChange={(value) => setValue("accountId", value)}
                        defaultValue={getValues("accountId")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Account"/>
                        </SelectTrigger>

                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem
                                    key={account.id}
                                    value={account.id}>
                                        
                                        {account.name} 
                                        {/* (₱{parseFloat(account.balance)}) */}
                                </SelectItem>
                            ))}

                            {isClient && (<CreateAccountDrawer>
                                <Button 
                                    variant="ghost"
                                    className="w-full select-none items-center text-sm outline-none"
                                    >Create Account</Button>
                            </CreateAccountDrawer>)}

                        </SelectContent>
                    </Select>

                    {errors.accountId && (
                        <p className="text-sm text-red-500">{errors.accountId.message}</p>
                    )}
            </div>
            {/* <div className='space-y-2'>
                    <label className='text-sm font-medium'>Particular</label>
                    <Input
                        type="text" 
                        placeholder="Particular"
                        {...register("particular")}
                    />

                    {errors.type && (
                        <p className="text-sm text-red-500">{errors.type.message}</p>
                    )}
                </div> */}
            </div>
        )}












        {isClient ? ('This is never prerendered') :(<div className='space-y-2'>
            <label className='text-sm font-medium'>Account title</label>
            {/* <Select
                onValueChange={(value) => setValue("category", value)}
                defaultValue={getValues("category")}>
                <SelectTrigger>
                    <SelectValue placeholder={filteredCategories.find((category) => category.id === getValues("category"))?.name || "Select category"}/>
                </SelectTrigger>

                <SelectContent>
                    {filteredCategories.map((category) => (
                        <SelectItem
                            key={category.id}
                            value={category.id}>
                                
                                {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select> */}
            <Input
                {...register("category")}
                placeholder="category"
            />

         

            {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
        </div> )}
        {/* category */}
    
        {isClient ? ('This is never prerendered') :(<div className='space-y-2'>
            <label className='text-sm font-medium'>Date</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                        variant="outline"
                        className="w-full pl-3 text-left font-normal">
                            {date 
                                ? format(date, "PPP") 
                                : <span>Pick a date</span>
                            }
                            <CalendarIcon className='ml-auto h-4 w-4 '/>
                        </Button>
                    </PopoverTrigger>


                    <PopoverContent className='w-auto p-0' align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(date) => setValue("date", date)}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                    </PopoverContent>
                </Popover>

            {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
        </div>)}
            {/* date */}

            {isClient ? ('This is never prerendered') :(<div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="Enter Description" {...register("description")}/>

            {errors.description &&
                <p className="text-sm text-red-500">{errors.description.message}</p>
            }
        </div> )}
            {/* desc */}

            {/* {isClient ? ('This is never prerendered') :(<div className='flex items-center justify-between rounded-lg border p-3'>
            <div className="space-y-0 5">
                <label className='text-sm font-medium cursor-pointer'>
                Recurring Transaction
                </label>

                <p className='text-sm text-muted-foreground'>
                    Set up a recurring schedule for this transaction
                </p>
            </div>


            <Switch
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
                checked={isRecurring}
            />    
        </div>  )} */}



        {/* recurring */}

        {/* {isRecurring && (
            
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Recurring Interval</label>
                <Select
                    onValueChange={(value) => setValue("recurringInterval", value)}
                    defaultValue={getValues("recurringInterval")}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Interval"/>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                </Select>

                {errors.recurringInterval && (
                    <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
                )}
            </div>  
        )} */}


        {isClient ? ('This is never prerendered') :(
            <div className='flex gap-4'>
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}>
                    Cancel
            </Button>

            <Button
                type="submit"
                className="w-full"
                disabled={transactionLoading}>
                    {transactionLoading
                        ? (<>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                            {editMode 
                                ? "Updating..."
                                : "Creating..."
                            }
                        </>)
                        : editMode 
                            ? ("Update Transaction") 
                            : ("Create Transaction")
                    }
                    
            </Button>
        </div>  )}

   
    </form>
  )
}

export default AddTransactionForm;
