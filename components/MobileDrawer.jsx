"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Drawer, DrawerTrigger, DrawerContent } from "./ui/drawer";
import { House, LayoutDashboard, AtomIcon, ArrowLeft, Layout } from "lucide-react";

const MobileNavDrawer = ({ isAdminPage = false, isAdmin = false, isSignedIn = false }) => {
  const pathname = usePathname();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-6 space-y-4">
          {pathname !== "/" && (
            <Link href="/" passHref>
              <Button variant="outline" className="w-full justify-start">
                <House size={18} /> <span className="ml-2">Home</span>
              </Button>
            </Link>
          )}
          {isAdminPage && pathname !== "/dashboard" && (
            <Link href="/dashboard" passHref>
              <Button variant="outline" className="w-full justify-start">
                <ArrowLeft size={18} /> <span className="ml-2">Back to App</span>
              </Button>
            </Link>
          )}
          {!isAdminPage && isSignedIn && (
            <>
              {pathname !== "/dashboard" && (
                <Link href="/dashboard" passHref>
                  <Button variant="outline" className="w-full justify-start">
                    <LayoutDashboard size={18} /> <span className="ml-2">Dashboard</span>
                  </Button>
                </Link>
              )}
              {pathname !== "/DecisionSupport" && (
                <Link href="/DecisionSupport" passHref>
                  <Button variant="outline" className="w-full justify-start">
                    <AtomIcon size={18} /> <span className="ml-2">Forecasting</span>
                  </Button>
                </Link>
              )}
              {isAdmin && pathname !== "/admin" && (
                <Link href="/admin" passHref>
                  <Button variant="outline" className="w-full justify-start">
                    <Layout size={18} /> <span className="ml-2">Admin Portal</span>
                  </Button>
                </Link>
              )}
            </>
          )}
          {!isSignedIn && (
            <Link href="/sign-in" passHref>
              <Button className="w-full justify-start">
                Log In
              </Button>
            </Link>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileNavDrawer;