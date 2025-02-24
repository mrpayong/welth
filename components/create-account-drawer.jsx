"use client"
import React, { Children, useEffect, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer'
import { useForm } from 'react-hook-form';
import { accountSchema } from '@/app/lib/schema';
import {zodResolver} from "@hookform/resolvers/zod"
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CreateAccountDrawer = ({children}) => {
    const [open, setOpen] = useState(false);

    const {
      register, // connect form to react hook form
      handleSubmit,
      formState: {errors}, // for occurence of error and display
      setValue, //enable dynamically set value of form fields
      watch, //to monitor the fields
      reset, //to reset form when successful submit
    } = useForm({
      resolver: zodResolver(accountSchema),
      defaultValues: {
        name: "",
        type: "CURRENT",
        balance: "",
        isDefault: false,
      }
    })

    const {
      data: newAccount,
      error,
      fn: createAccountFn,
      loading: createAccountLoading,
    } = useFetch(createAccount);

    useEffect(() => {
      if (newAccount && !createAccountLoading) {
        toast.success("Account created successfully");
        reset(); //resets the form
        setOpen(false); //to close the drawer
      }
    }, [createAccountLoading, newAccount])

    useEffect(() => {
      if(error) {
        toast.error(error.message || "Failed to create account");
      }
    }, [error])

    const onSubmit = async (data) => {
      await createAccountFn(data);
    };

  return (
    <Drawer open={open} onOpenChange={setOpen}> 
        <DrawerTrigger asChild>{children}</DrawerTrigger>

        <DrawerContent>
            <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            </DrawerHeader>

            <div className='px-4 pb-4'>
              <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
                {/* ACCOUNT NAME */}
                 <div className='space-y-2'>
                  <label htmlFor="name" className='text-sm font-medium'>Account Name</label>
                  <Input 
                  id="name" 
                  placeholder="e.g., Main Checking"
                  {...register("name")} /*to connect with react hook form*/
                  />
                  {errors.name && ( //for errors in the form
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                 </div>
                  
                  {/* ACC TYPE */}
                <div className='space-y-2'>
                  <label htmlFor="type" className='text-sm font-medium'>Account Type</label>
                  <Select
                    onValueChange={(value) => setValue("type", value)}
                    defaultValue={watch("type")}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select Tpye" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CURRENT">Current</SelectItem>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && ( //for errors in the form
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>
                 
                 {/* INITIAL BALANCE */}
                <div className='space-y-2'>
                <label htmlFor="balance" className='text-sm font-medium'>Initial Balance</label>
                <Input 
                id="balance"
                type="number"
                step="0.01" //increment or interval inputs of the field
                placeholder="0.00" 
                {...register("balance")} /*to connect with react hook form*/
                />
                {errors.balance && ( //for errors in the form
                  <p className="text-sm text-red-500">{errors.balance.message}</p>
                )}
                </div>

                  {/* SET AS DEFAULT */}
                <div className='flex items-center justify-between rounded-lg border p-3'>
                <div className="space-y-0 5">
                  <label htmlFor="isDefault" className='text-sm font-medium cursor-pointer'>
                  Set as Default
                  </label>
                
                  <p className='text-sm text-muted-foreground'>
                    This account will be selected by default for transactions
                  </p>
                </div>
                <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
                />
                </div>

                  {/* SUBMIT OR CANCEL */}
                <div className='flex gap-4 pt-4'>
                  <DrawerClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1">
                      Cancel
                    </Button>
                  </DrawerClose>

                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createAccountLoading}>
                    {createAccountLoading
                    ? (<>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                      Creating...
                    </>)
                    :("Create Account")}
                  </Button>
                </div>

              </form> 
            </div>
        </DrawerContent>
    </Drawer>

  )
}

export default CreateAccountDrawer; 
 