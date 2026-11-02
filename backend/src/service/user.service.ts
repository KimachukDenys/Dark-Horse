import prisma from "../lib/prisma";
import type { LoginType, PostUserType } from "../types/user.types";
import argon2  from "argon2";

export async function register(data: PostUserType) {
  const hashedPassword = await argon2.hash(data.password)
    
  return prisma.user.create({
    data: {
      userName: data.userName,
      email: data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      userName: true,
      email: true
    }
  })
}

export async function login(data: LoginType) {
  const userCheck = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  })

  if(!userCheck) {
    throw new Error("Invalid password or email")
  }

  const isValid = await argon2.verify(userCheck.password, data.password)

  if(!isValid) {
    throw new Error("Invalid password or email")
  }

  const userData = {
    id: userCheck.id,
    userName: userCheck.userName,
    email: userCheck.email
  }

  return userData
}
