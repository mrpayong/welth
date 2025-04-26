import { Inter} from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const inter = Inter({subsets:["latin"]});

export const metadata = {
  title: "Teruel Accounting",
  description: "Teruel Accounting Firm Financial Management System",
};



export default function RootLayout({ children }) {


  return (
    <ClerkProvider>
    <html lang="en">
   
      <body
        className={`${inter.className}`}
      >
         <Header />
       
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster richColors/>
        
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>Footer</p>
          </div>

         {/* <SignedOut>
            <RedirectToSignIn forceRedirectUrl="/sign-in" />
         </SignedOut> */}
        </footer>
      </body>





      {/* <body className={`${inter.className}`}>
          <SignedIn>
      
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />
            <footer className="bg-blue-50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p>Footer</p>
              </div>
            </footer>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center justify-center min-h-screen bg-blue-50">
              <SignIn fallbackRedirectUrl="/dashboard"/>
            </div>
          </SignedOut>
        </body> */}
    </html>
    </ClerkProvider>
  );
}
