"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerHeader } from "./ui/drawer";
import { House, LayoutDashboard, AtomIcon, ArrowLeft, Layout, Loader2, UserRoundCog, AlignJustify } from "lucide-react";

const MobileNavDrawer = ({ 
  isAdminPage = false,
  isAdmin = false,
  isSignedIn = false,
  isStaff = false,
  SysAdminPage = false,
  isSysAdmin = false,
  loading=false,
  onNavClick = () => {},
}) => {
  const pathname = usePathname();

  return (
    <Drawer>
      
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <AlignJustify />
        </Button>
      </DrawerTrigger>

      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader className="pb-0">
          <DrawerTitle>
            Menu
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-6 flex flex-col gap-2">
          {/* Home */}
          {pathname !== "/" && (
            <Link href="/" passHref>
              <Button disabled={loading} onClick={onNavClick} variant="outline" className="border border-black w-full justify-start">
                <House size={18} /> <span className="ml-2">Home</span>
              </Button>
            </Link>
          )}

          {/* SysAdmin User Management */}
          {isSysAdmin && isSignedIn && !isAdminPage && !isAdmin && !isStaff && pathname !== "/SysAdmin" && (
            <Link href="/SysAdmin" passHref>
              <Button disabled={loading} onClick={onNavClick}  variant="outline" className="border border-black w-full justify-start">
                <UserRoundCog size={18} /> <span className="ml-2">User Management</span>
              </Button>
            </Link>
          )}

          {/* Admin Buttons */}
          {!isAdminPage && isSignedIn && isAdmin && !isSysAdmin && !SysAdminPage && !isStaff && (
            <>
              {pathname !== "/DecisionSupport" && (
                <Link href="/DecisionSupport" passHref>
                  <Button disabled={loading} onClick={onNavClick}  variant="outline" className="border border-black w-full justify-start">
                    <AtomIcon size={18} /> <span className="ml-2">Forecasting</span>
                  </Button>
                </Link>
              )}
              {pathname !== "/admin" && (
                <Link href="/admin" passHref>
                  <Button  disabled={loading} onClick={onNavClick} variant="outline" className="border border-black w-full justify-start">
                    <Layout size={18} /> <span className="ml-2">Admin Portal</span>
                  </Button>
                </Link>
              )}
            </>
          )}

          {/* Staff Dashboard */}
          {isStaff && isSignedIn && !isAdmin && !isAdminPage && !isSysAdmin && !SysAdminPage && pathname !== "/dashboard" && (
            <Link href="/dashboard" passHref>
              <Button variant="outline" disabled={loading} className="border border-black w-full justify-start" onClick={onNavClick}>
                <LayoutDashboard size={18} /> <span className="ml-2">Dashboard</span>
              </Button>
            </Link>
          )}

          {/* Back to App (for admin page) */}
          {isAdminPage && pathname !== "/dashboard" && (
            <Link href="/dashboard" passHref>
              <Button variant="outline" disabled={loading} onClick={onNavClick}  className="border border-black w-full justify-start">
                <ArrowLeft size={18} /> <span className="ml-2">Back to App</span>
              </Button>
            </Link>
          )}

          {/* Log In */}
          {!isSignedIn && pathname !== "/sign-in" && (
            <Link href="/sign-in" passHref>
              <Button disabled={loading} onClick={onNavClick}  className="w-full justify-start">
                Log In
                {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
              </Button>
            </Link>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileNavDrawer;