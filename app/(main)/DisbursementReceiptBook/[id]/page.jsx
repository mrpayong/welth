import React, { Suspense } from 'react'
import DisbursementReceiptBook from '../_components/DisbursementReceipt_Book'
import { getCashOutflow } from '@/actions/cashflow';
import { BarLoader } from 'react-spinners';

async function DisbursementReceiptBookPage ({params}) {
    const {id} = await params;
    const outflows = await getCashOutflow(id);
    console.log(outflows)
  return (
    
    <div>
      <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color="#9333ea"/>}>
        <div>
          <DisbursementReceiptBook  outflows={outflows}/>
        </div>
      </Suspense>
    </div>
  )
}

export default DisbursementReceiptBookPage
