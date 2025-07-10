"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";
import { ArrowLeft, AtomIcon, House, Layout, LayoutDashboard, Loader2, LogIn, Settings, UserRoundCog } from "lucide-react";
import MobileNavDrawer from "./MobileDrawer";
import { SignInButton, SignOutButton, UserButton, useSession } from "@clerk/nextjs";

export default function HeaderClient({ isAdminPage, isStaff, isAdmin, isSignedIn, SysAdminPage, isSysAdmin }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // When pathname changes, stop loading
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  const handleNavClick = (e) => {
    setLoading(true);
  };



  //   useEffect(() => {
  //   // Detect transition from sign-in to admin
  //   if (
  //     prevPath.current === "/sign-in" &&
  //     pathname.startsWith("/admin")
  //   ) {
  //     // Call your activityLog endpoint
  //     fetch("/api/activityLog", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         action: "SIGN-IN",
  //         result: { message: "User navigated from sign-in to admin" },
  //         timestamp: new Date().toISOString(),
  //       }),
  //     });
  //   }
  //   prevPath.current = pathname;
  // }, [pathname]);

  const navBorderClass = useMemo(() => {
    if (pathname.startsWith("/admin")) return "border-blue-500";
    if (pathname.startsWith("/dashboard")) return "border-teal-400";
    if (pathname.startsWith("/SysAdmin")) return "border-green-500";
    if (pathname.startsWith("/sign-in")) return "border-black";
    if (pathname.startsWith("/DecisionSupport")) return "border-purple-500"
    return "border-yellow-400"; // default
  }, [pathname]);


  const RoleCase = (isStaff, isAdmin, isSysAdmin) => {
  if (isSysAdmin) return "System Admin";
  if (isAdmin) return "Admin";
  if (isStaff) return "Staff";
  return null;
  };

// bg-gradient-to-r from-sky-300 to-white 
  return (
   <div 
      className={`fixed top-0 w-full bg-white backdrop-blur-md 
        z-50 border-b rounded-b-lg  transition-colors 
        duration-300 ${navBorderClass}`}
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 ">
        {/* LEFT: Logo + Name */}
        <div className="flex items-center min-w-[220px]">
          <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center">
            <Image
              className="h-16 w-auto object-contain"
              src={"/try2.png"}
              alt="TA logo"
              width={60}
              height={200}
            />
            <div className="flex flex-col items-start ml-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-gray-300 to-gray-500 bg-clip-text text-transparent">
                Teruel
              </h1>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-400 via-gray-300 to-yellow-500 bg-clip-text text-transparent">
                Accounting
              </h1>
            </div>
          </Link>
        
        {/* <span className="
          ml-4
          font-semibold
          tracking-wide
          text-base
          sm:text-lg
          md:text-xl
          lg:text-2xl
          text-slate-600
          whitespace-nowrap
          capitalize
        ">
  Hello, {RoleCase(isStaff, isAdmin, isSysAdmin)}!
</span> */}
        </div>

        {/* RIGHT: User button & mobile nav */}
        <div className="flex items-center gap-2 min-w-[60px] justify-end">
            <div className="hidden md:flex items-center space-x-4">
            {pathname !== "/" && pathname !== "/sign-in/factor-one" && ( 
              // if no in home then visibile
              <Link href={"/"}>
                <Button variant="outline" onClick={handleNavClick} disabled={loading}>
                  <House size={18} />
                  <span className="hidden md:inline">Home</span>
                </Button>
              </Link>
            )}

            {/* LOGGED IN */}

            {!SysAdminPage && isSysAdmin && isSignedIn && !isAdminPage && !isAdmin && !isStaff && (
              <>
                {/* VISIBLE (User management button)
                    if not in SysAdmin page, 
                    if SysAdmin Role
                    if Signed In, 
                    If not in Admin Page, 
                    if not Admin role, 
                    if not Staff role, */}
                {isSysAdmin && pathname !== "/SysAdmin" && (
                  <Link href={"/SysAdmin"}>
                    <Button variant="outline" onClick={handleNavClick} disabled={loading}>
                      <UserRoundCog size={18} />
                      <span className="hidden md:inline">User Management</span>
                    </Button>
                  </Link>
                )}
              </>
            )}

            {/* LOGGED IN NOT IN ADMIN  PAGE */}
            {!isAdminPage && isSignedIn && isAdmin && !isSysAdmin && !SysAdminPage && !isStaff && (
              <>
                {/* VISIBLE (DSS button, Admin Portal button)
                  if not in admin page, 
                  if Signed In, 
                  if Admin role, 
                  if not SysAdmin role,
                  if not in SysAdmin Page 
                  if not Staff role */}
                {pathname !== "/DecisionSupport" && isAdmin && (
                  <Link href={"/DecisionSupport"}>
                    <Button variant="outline" onClick={handleNavClick} disabled={loading}> 
                      <AtomIcon size={18} />
                      <span className="hidden md:inline">Forecasting</span>
                    </Button>
                  </Link>
                )}
                {isAdmin && pathname !== "/admin" && (
                  <Link href={"/admin"}>
                    <Button variant="outline" onClick={handleNavClick} disabled={loading} className="flex items-center gap-2">
                      <Layout size={18} />
                      <span className="hidden md:inline">Admin Portal</span>
                    </Button>
                  </Link>
                )}
              </>
            )}

            { isStaff && isSignedIn && !isAdmin && !isAdminPage && !isSysAdmin && !SysAdminPage &&  (
              <>
              {/* VISIBLE (Dashboard button)
                  if Staff role
                  if Signed in
                  if not Admin role
                  if not in Admin page
                  if not SysAdmin role, 
                  if not in SysAdmin page */}
                {pathname !== "/dashboard" && isStaff && (
                    <Link href={"/dashboard"}>
                      <Button variant="outline" onClick={handleNavClick} disabled={loading}>
                        <LayoutDashboard size={18} />
                        <span className="hidden md:inline">Dashboard</span>
                      </Button>
                    </Link>
                  )}
              </>
            )}






            {/* LOGGED OUT */}
            {!isSignedIn && !pathname !== "/sign-in" && (
              <div className="flex flex-row items-center justify-end gap-2 pr-3">
                <span className="text-gray-600 font-semibold text-2xl hidden md:inline">
                  Ready to start?
                </span>
              <Link href={"/sign-in"}>
                <Button onClick={handleNavClick} disabled={loading}>
                  {loading
                    ? (<Loader2 className="w-4 h-4 animate-spin text-gray-400" />)
                    : (<LogIn size={18} />)
                  }
                  Log In
                </Button>
               
              </Link>
              </div>
            )}
          </div>

          {/* LOGGED IN */}
          <div className="md:hidden">
            <MobileNavDrawer
              isAdminPage={isAdminPage}
              isAdmin={isAdmin}
              isSignedIn={isSignedIn}
              isStaff={isStaff}
              SysAdminPage={SysAdminPage} 
              isSysAdmin={isSysAdmin} 
              loading={loading}
              onNavClick={() => setLoading(true)}
            />
          </div>
          {isSignedIn && (
            loading 
            ? (<Loader2 className="w-10 h-10 animate-spin text-gray-400" />) 
            : (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },}}
                />

                
              )
          )}
        </div>
      </nav>
    </div>
  );
}