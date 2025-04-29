"use client";
import React from 'react'
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";


const LogInPage = () => {
// const { isSignedIn, isLoaded } = useAuth(); // Check if the user is signed in and if the auth state is loaded
//   const { user } = useUser(); // Get the current user
//   const router = useRouter();

//   useEffect(() => {
//     if (isLoaded) {
//       if (!isSignedIn) {
//         router.push("/sign-in");
//       }
//     }
//   }, [isSignedIn, user, isLoaded, router]);

 
    redirect("/sign-in")
  
}

export default LogInPage
