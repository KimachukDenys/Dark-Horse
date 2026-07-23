// src/service/item.service.ts

import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";


export async function getAllItems() {
  const items = await prisma.item.findMany()

  if(items.length === 0) {
    throw new Error("Items don't exitsts")
  }

  return items
}


export async function getItem(id: number) {
  const item = await prisma.item.findUnique({
    where: {
      id
    }
  })

  if(!item) {
    throw new Error("Item doesn't exists")
  }

  return item
}


export async function createItem(tx: Prisma.TransactionClient, data: { name: string }) {

  if(!data.name?.trim()) {
    throw new Error("Item name is required")
  }
    
  const item = await tx.item.findUnique({
    where: {
      name: data.name
    }
  })
    
  if(item) {
    return item
  }
  
  return await tx.item.create({
    data: {
      name: data.name
    }
  })
}


export async function updateItem(id: number, data: {name: string}) {
  return prisma.$transaction(async (tx) => {

    if(!data.name?.trim()) {
      throw new Error("Item name is required")
    }
    
    return await tx.item.update({
      where: {
        id
      },
      data: {
        name: data.name
      }
    })
  })
}


export async function deleteItem(id: number) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: {
        id
      }
    });
    
    if(!item) {
      throw new Error("Item doesn't exists")
    }
    
    return tx.item.delete({
      where: {
        id
      }
    })
  })
}