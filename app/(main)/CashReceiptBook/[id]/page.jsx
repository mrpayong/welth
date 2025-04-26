import React, { Suspense } from 'react'
import CashReceiptBook from '../_components/CashReceipt_Book';
import { getCashInflow } from '@/actions/cashflow';
import { BarLoader } from 'react-spinners';


async function CashReceiptBookPage ({params})  {
  const {id} = await params;
  const inflows = await getCashInflow(id);
  console.log(inflows)

  return (
    <div>
      <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color="#9333ea"/>}>
        <div>
          <CashReceiptBook inflows={inflows} />
        </div>
      </Suspense>
    </div>
  )
}

export default CashReceiptBookPage
