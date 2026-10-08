// src/service/item.service.ts

import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { wearTypes } from "../types/transaction.types";
import * as cheerio from "cheerio";


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


export async function createItem(tx: Prisma.TransactionClient, data: { name: string, wear: string }) {

  if(!data.name?.trim()) {
    throw new Error("Item name is required")
  }

    
  const item = await tx.item.findUnique({
    where: {
      name: data.name
    }
  })

  if(item && item.itemCollection) {
    return item
  }

  const itemData = await getSteamItemData(data)

  if(item) {
    return await tx.item.update({
      where: {
        id: item.id
      },
      data: {
        imageUrl: itemData.imageId,
        itemType: itemData.itemType,
        weaponType: itemData.weaponType,
        itemCollection: itemData.itemCollection,
        itemQuality: itemData.itemQuality
      }
    }) 
  }
  
  return await tx.item.create({
    data: {
      name: data.name,
      imageUrl: itemData.imageId,
      itemType: itemData.itemType,
      weaponType: itemData.weaponType,
      itemCollection: itemData.itemCollection,
      itemQuality: itemData.itemQuality
    }
  })
}


export async function updateItem(tx: Prisma.TransactionClient, id: number, data: {name: string, wear: string}) {
  if(!data) {
    throw new Error("Item data is required")
  }

  const itemData = await getSteamItemData(data)
    
  return await tx.item.update({
    where: {
      id
    },
    data: {
      name: data.name,
      imageUrl: itemData.imageId,
      itemType: itemData.itemType,
      weaponType: itemData.weaponType,
      itemCollection: itemData.itemCollection,
      itemQuality: itemData.itemQuality
    }
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


async function getSteamItemData(data: { name: string, wear: string }) {
  const wearFormat = wearTypes[data.wear as keyof typeof wearTypes] 
  const url = `https://steamcommunity.com/market/listings/730/`
  let formatUrl = `${encodeURIComponent(`${data.name} (${wearFormat})`)}`
  console.log(formatUrl)
  if(data.wear === "NONE") {
    formatUrl = `${encodeURIComponent(`${data.name}`)}`
  }
  const response = await fetch(`${url}${formatUrl}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0",
      "Accept":
        "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With":
        "XMLHttpRequest",
      "Referer":
        "https://steamcommunity.com/market/",
      }
  });

  const html = await response.text();

  const $ = cheerio.load(html);
  const image = $('link[as="image"]')
      .map((_, el) => $(el).attr("href"))
      .get()
      .find(url => url?.includes("/economy/image/"));
  
  const imageId = image?.split("/economy/image/")[1]?.split("/")[0]

  const itemData = $("a")
    .filter((_, el) => {
      return $(el).attr("href")?.includes("/search?category_Type") ?? false;
    })
    .first()
    .parent()
    .text();
    
  let itemType = null
  let weaponType = null
  let itemCollection = null
  let itemQuality = null
    
  if(itemData.match(/Type:\s*(.*?)Weapon:/)?.[1]) {
    itemType = "weapon";
    weaponType = itemData.match(/Type:\s*(.*?)Weapon:/)?.[1];
    itemCollection = itemData.match(/Collection:\s*(.*?)Category:/)?.[1];
    itemQuality = itemData.match(/Quality:\s*(.*?)Exterior:/)?.[1];
  } else  if(itemData.match(/Type:\s*(.*?)Category:/)?.[1] === "Charm") {
    itemType = itemData.match(/Type:\s*(.*?)Category:/)?.[1];
    itemQuality = itemData.match(/Quality:\s*(.*?)Charms /)?.[1];
    itemCollection = itemData.match(/Collection:\s*(.*?)$/)?.[1];
  } else if(itemData.match(/Type:\s*(.*?)Collection:/)?.[1] === "Container") {
    itemType = itemData.match(/Type:\s*(.*?)Collection:/)?.[1];
    itemCollection = itemData.match(/Collection:\s*(.*?)Category:/)?.[1];
    itemQuality = itemData.match(/Quality:\s*(.*?)Tournament:/)?.[1];
  }
  // console.log("tssf",itemType,weaponType, itemQuality, itemCollection)
  // console.log(imageId)
  return {imageId, itemType, weaponType, itemCollection, itemQuality}
}