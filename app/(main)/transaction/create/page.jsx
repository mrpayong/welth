import { getUserAccounts } from '@/actions/dashboard';
import { defaultCategories } from '@/data/category';
import React from 'react'
import AddTransactionForm from '../_components/transaction-form';
import { getTransaction } from '@/actions/transaction';
// import { AddTransactionForm } from '../_components/transaction-form';


const AddTransactionPage = async ({ searchParams }) => {
    const accounts = await getUserAccounts();

    
    const editId = (await searchParams)?.edit;
    
    let initialData = null;
    if (editId) {
      // console.log(editId);
      const transaction = await getTransaction(editId);
      initialData = transaction;
      console.info(transaction)
    }
    

  return (
    <div className="max-w-3xl mx-auto px-5">
     <h1 className="text-5xl gradient-title mb-8">{editId ? "Edit" : "Add"} Transaction</h1>
 
      <AddTransactionForm 
        accounts={accounts} 
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData }
      />
    </div>
  )
}

export default AddTransactionPage;