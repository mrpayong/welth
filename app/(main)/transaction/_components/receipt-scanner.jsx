"use client";

import { scanReceipt } from '@/actions/transaction';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { Camera, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';

const ReceiptScanner = ({onScanComplete}) => {
    const fileInputRef = useRef();
    const [isClient, setIsClient] = useState(false);
    
        useEffect(() => {
            setIsClient(true)
          }, [])

    const {
        loading: scanReceiptLoading,
        fn: scanReceiptFn,
        data: scannedData,
        error: scanError
    } = useFetch(scanReceipt);

    const handleReceiptScan = async(file) => {
        if(file.size > 50 * 1024 *1024) {
            toast.error(`File size should be less than 50MB. Your file is ${file.size} MB`);
            return;
        }
        console.log("File size: ", file.size, "<", 50 * 1024 *1024);
       
        await scanReceiptFn(file);
         toast.info("File size: ", `${file.size}`)
    };

    useEffect(() => {
        if(scannedData && !scanReceiptLoading) {
            onScanComplete(scannedData);
            toast.success("Receipt scanned successfully. File size is less than 50MB");
        }
    }, [scanReceiptLoading, scannedData]);


    useEffect(() => {
        if(scanError && !scanReceiptLoading) {
            toast.error("1: ",scanError.message);
            console.log("Error scanning receipt 2: ", scanError);
        }
    }, [scanError])






    
  return (
    <div>

{isClient && (<><input 
        type="file" 
        ref={fileInputRef}
        className='hidden'
        accept='image/*'
        capture="environment"
        onChange={(e) => {
            const file = e.target.files?.[0];
            if(file) handleReceiptScan(file)
            }}
        />
    
       
    
  
    
    <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanReceiptLoading}
            className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 
            animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
            >
                {scanReceiptLoading
                    ? (<>
                        <Loader2 className='mr-2 animate-spin'/> 
                        Scanning Receipt... </>
                    )
                    : (<>
                            <Camera className='mr-2'/> 
                               Scan Receipt with AI
                        </>
                    )
                }
        </Button>
   
        </> )}
         


    </div>
  )
}

export default ReceiptScanner;
