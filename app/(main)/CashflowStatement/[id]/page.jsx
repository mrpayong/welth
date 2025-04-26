import { getCashflow, getLatestCashflow } from "@/actions/cashflow";
import CashflowList from "../_components/Cashflow";
import CashflowFilter from "../_components/Cashflow_filter";


async function CashflowPage ({ params }) {
    const {id} = await params;
    
    const cashflows = await getCashflow(id)


    if (!cashflows || cashflows.length === 0) {
        return <p>No cashflow statements found for this account.</p>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Cashflow Statements for Account {id}</h1>
            <CashflowList cashflows={cashflows} /> {/* Pass data to the child component */}
        </div>
    );
}


export default  CashflowPage;
