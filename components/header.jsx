import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs'
import React from 'react'
import Image from "next/image"
import Link from 'next/link'
import { Button } from './ui/button'
import { ArrowLeft, House, Layout, LayoutDashboard, PenBox } from 'lucide-react'
import { checkUser } from '@/lib/checkUser'



const Header = async ({isAdminPage = false}) => {
  const user = await checkUser();

  console.log(user)
  

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className='fixed top-0 w-full bg-gradient-to-r from-sky-300 to-white backdrop-blur-md z-50 border-b'>
      <nav className='container max-auto px-4 py-4 flex items-center justify-between'>
        <Link href={isAdminPage ? "/admin" : '/dashboard'} className='flex items-center'>
        <Image
          className="h-16 w-auto object-contain" 
          src={'/try2.png'}
          alt='TA logo'
          width={60}
          height={200}/>
          {isAdminPage && (
            <span className='text-xs font-extralight'>Admin</span>
          )}
        </Link>
  
               
      
        <div className="flex items-center space-x-4">
        <Link href={"/"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2"> 
            <Button variant="outline">
              <House size={18}/>
              <span className='hidden md:inline'>Home</span>
            </Button>
        </Link>
          {isAdminPage 
            ? (
                <Link href={"/dashboard"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2"> 
                  <Button variant="outline">
                    <ArrowLeft size={18}/>
                    <span className='hidden md:inline'>Back to App</span>
                  </Button>
                </Link>
              ) 

            : (
                <SignedIn>

                  <Link href={"/dashboard"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2"> 
                      <Button variant="outline">
                      <LayoutDashboard size={18}/>
                      <span className='hidden md:inline'>Dashboard</span>
                    </Button>
                  </Link>


                  {!isAdmin 
                    ? (<Link href={"/transaction/create"}> 
                          <Button className="flex items-center gap-2">
                            <PenBox size={18} />
                            <span className='hidden md:inline'>Add Transaction</span>
                          </Button>
                        </Link>) 
                        
                    :(<Link href={"/admin"}> 
                        <Button variant="outline" className="flex items-center gap-2">
                          <Layout size={18} />
                          <span className='hidden md:inline'>Admin Portal</span>
                        </Button>
                      </Link>
                    )}

                </SignedIn>
              )
            }



        <SignedOut>
          <SignInButton>
            <Link href={"/sign-in"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2"> 
              <Button>
                Log In
              </Button>
              <span className="text-gray-600 hidden md:inline">
                <strong>Welcome!</strong>
              </span>
            </Link>
          </SignInButton>
        </SignedOut>



        

        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              }
            }}/>
        </SignedIn>
        </div>
        </nav>
    </div>
  )
}

export default Header
