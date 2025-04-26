import { getSubAccounts } from "@/actions/accounts"; // Server action to fetch sub-accounts
import SubAccount from "../_components/SubAccount";

export default async function SubAccountsPage({ params }) {
  const { id } = await params; // Get the dynamic route parameter

  // Fetch sub-accounts data from the server
  const response = await getSubAccounts(id);

  if (!response.success) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">Error: {response.error}</p>
      </div>
    );
  }

  const subAccounts = response.data;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Grouped Transcations</h1>
      {subAccounts.length === 0 ? (
        <p className="text-gray-500">No Grouped transcations found.</p>
      ) : (
        <div className="space-y-4">
          {subAccounts.map((subAccount) => (
            <SubAccount key={subAccount.id} subAccount={subAccount} />
          ))}
        </div>
      )}
    </div>
  );
}