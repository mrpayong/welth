"use server";
import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


async function archiveEntity({
  userId,
  accountId,
  action,
  entityType,
  entityId,
  data,
}) {
  try {
    await db.archive.create({
      data: {
        userId,
        accountId,
        action,
        entityType,
        entityId,
        data,
      },
    });

    return;
  } catch (error) {
    console.error("Error archiving entity:", error);
    return { success: false, error: error.message || "Archiving failed" };
  }
}

export async function getUser(){
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId}
        });

 
        console.log("user is: ", user)
        if (!user || user.role !== "ADMIN"){
            throw new Error("Unauthorized");
        }
        //get all users
        const users = await db.user.findMany({
            orderBy: {createdAt: "desc"},
        })

        return {
            authorized: true,
            success: true,
            data: users.map((user) => ({
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString()
            })),
        };
    }catch (error) {
        throw new Error("Error fetching users:" + error.message);
    } 
}

export async function getUserForSysAdmin(){
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId}
        });

        if (!user || user.role !== "SYSADMIN"){
            throw new Error("Unauthorized");
        }

        //get all users
        const users = await db.user.findMany({
            orderBy: {createdAt: "desc"},
        })

        return {
            success: true,
            authorized: true,
            data: users.map((user) => ({
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString()
            })),
        };
    }catch (error) {
        throw new Error("Error fetching users:" + error.message);
    } 
}

export async function updateUserRole(UserIdRoleUpdate, role){
    try {
        const { userId } = await auth();
        if(!userId){
            throw new Error("Unauthorized");
        }

        const user = await db.user.findUnique({
            where: {clerkUserId: userId}
        });
        if(!user){
            throw new Error("Unauthorized");
        }
        if (user.role !== "SYSADMIN" && user.role !== "ADMIN"){
            throw new Error("[1] Unauthorized")
        }

        await db.user.update({
            where: {id: UserIdRoleUpdate},
            data: {role},
        });

        revalidatePath('/admin/settings')
        revalidatePath('/SysAdmin/settings')
        return {success: true}
    }catch (error) {
        throw new Error("Error role udpate:" + error.message);
    } 
}

export async function createUser(data) {
  try {
    // 1. Authorization: Only SYSADMIN can create users
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const currentUser = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!currentUser){
        throw new Error("Unauthorized");
    }
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SYSADMIN") {
      throw new Error("Unauthorized");
    }

    const client = await clerkClient()


    // 2. Create user in Clerk (passwordless, will send invite/verification email)
    const clerkUser = await client.users.createUser({
        emailAddress: [data.email],
        firstName: data.Fname,
        lastName: data.Lname,
        username: data.username,
    });

    // 3. Create user in your database
   
    const newUser = await db.user.create({
      data: {
        clerkUserId: clerkUser.id,
        email: data.email,
        Fname: data.Fname,
        Lname: data.Lname,
        role: data.role,
        username: data.username,
      },
    });

    revalidatePath("/admin/settings")
    revalidatePath("/SysAdmin/settings")

    return {
      success: true,
      data: {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    throw new Error("Email or Username might already exists.");
  }
}

export async function deleteUser(userIdDelete, deleteClerkId) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const currentUser = await db.user.findUnique({
            where: { clerkUserId: userId }
        });
        if (currentUser.role !== "ADMIN" && currentUser.role !== "SYSADMIN") {
            throw new Error("Unauthorized");
        }

        const userToDelete = await db.user.findUnique({
            where: {id: userIdDelete},
            select: {
                id: true,
                clerkUserId: true, 
                email: true,
                Fname: true,
                Lname: true,
            }
        })
        await archiveEntity({
          userId: currentUser.id,
          accountId: userToDelete.accountId,
          action: "deleteUser",
          entityType: "User",
          entityId: userToDelete.id,
          data: userToDelete,
        });

        const client = await clerkClient();
        console.log("[Del 1] IDs in the backend:", userIdDelete, deleteClerkId)
        await client.users.deleteUser(deleteClerkId);

        // Delete user from your database
        await db.user.delete({
            where: { id: userIdDelete }
        });

        return { 
            success: true, 
            message: 'User deleted successfully'
        };
    } catch (error) {
        throw new Error("Error deleting user: " + error.message);
    }
}


export async function updateUser(updateClerkId, newFname, newLname, newuserName) {
    try {
        console.log("[1] Auth")
        console.log(updateClerkId, newFname, newLname, newuserName)
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const currentUser = await db.user.findUnique({
            where: { clerkUserId: userId }
        });
        if (!currentUser){
            throw new Error("Unauthorized");
        }
        if (currentUser.role !== "ADMIN" && currentUser.role !== "SYSADMIN") {
            throw new Error("Unavailable action");
        }

        // fetch wich user to udpate first
        console.log("[1] Fetch user to update")
        const user = await db.user.findUnique({
            where: {id: updateClerkId },
            select: {
                id: true,
                clerkUserId: true,
            }
        })

        console.log("[2] Update in Clerk")
        const client = await clerkClient();
        // update for clerk
        await client.users.updateUser(
            user.clerkUserId,
            {
                firstName: newFname,
                lastName: newLname, 
                username: newuserName
            }
            
        );

        // udpate method for my own database
        console.log("[3] Update in Db")
        await db.user.update({
            where: { id: user.id },
            data: {
                Fname: newFname,
                Lname: newLname,
                username: newuserName,
            }
        });

        revalidatePath("/admin/settings");
        revalidatePath("/SysAdmin/settings");
        console.log("[4] success update")
        return { 
            success: true, 
            message: 'User udpated successfully'
        };
    } catch (error) {
        throw new Error("Error updating user: " + error.message);
    }
}


