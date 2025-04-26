import { getCashflowById } from "@/actions/cashflow";
import EditCashflow from "../../../_components/Edit_cashflow";

export default async function EditCashflowPage({ params }) {
  const { cfsID } = await params; // Extract the cashflow ID from the route

  try {
    const cashflow = await getCashflowById(cfsID); // Fetch the cashflow data
    console.log("THIS IS YOUR CASHFLOW: ",cashflow)
    if (!cashflow) {
      return (
        <div className="p-4 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Edit Cashflow</h1>
          <p className="text-red-500">Cashflow not found. Please check the ID and try again.</p>
        </div>
      );
    }

    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Cashflow</h1>
        <EditCashflow cashflow={cashflow} /> {/* Pass data to the child component */}
      </div>
    );
  } catch (error) {
    console.error("Error fetching cashflow:", error);
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Cashflow</h1>
        <p className="text-red-500">An error occurred while fetching the cashflow. Please try again later.</p>
      </div>
    );
  }
}