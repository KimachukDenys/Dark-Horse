// src/service/item.service.ts

import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { wearCategory, wearTypes } from "../types/transaction.types";
import * as cheerio from "cheerio";
import test from "node:test";


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


export async function createItem(tx: Prisma.TransactionClient, name: string) {

  if(!name?.trim()) {
    throw new Error("Item name is required")
  }

    
  const item = await tx.item.findUnique({
    where: {
      name
    }
  })

  if(item && item.collection) {
    return item
  }

  const itemData = await getSteamItemData({name})

  if (!itemData) {
    throw new Error("Steam item data not found")
  }

  const main = itemData.main
  const tags = itemData.tags

  if(item) {
    return await tx.item.update({
      where: {
        id: item.id
      },
      data: {
        name: name,
        marketHashName: String(main.market_hash_name),
        marketBucketGroupId: String(main.market_bucket_group_id ?? ""),
        imageUrl: String(main.imageURL ?? ""),
        itemColor: String(main.color ?? ""),
        backgroundColor: String(main.backgroundColor ?? ""),
        classId: String(main.classId),

        itemType: tags.Type?.name,
        itemTypeIterName: tags.Type?.internalName,

        collection: tags.Collection?.name,
        collectionIterName: tags.Collection?.internalName,
        
        quality: tags.Quality?.name,
        qualityIterName: tags.Quality?.internalName,
        
        rarity: tags.Rarity?.name,
        rarityIterName: tags.Rarity?.internalName,
        
        exterior: tags.Exterior?.name,
        exteriorIterName: tags.Exterior?.internalName
      }
    }) 
  }
  
  return await tx.item.create({
    data: {
      name: name,
      marketHashName: String(main.market_hash_name),
      marketBucketGroupId: String(main.market_bucket_group_id ?? ""),
      imageUrl: String(main.imageURL ?? ""),
      itemColor: String(main.color ?? ""),
      backgroundColor: String(main.backgroundColor ?? ""),
      classId: String(main.classId),
      appId: Number(main.appId),

      itemType: tags.Type?.name,
      itemTypeIterName: tags.Type?.internalName,

      weaponType: tags.Weapon?.name,
      weaponTypeIterName: tags.Weapon?.internalName,

      collection: tags.Collection?.name,
      collectionIterName: tags.Collection?.internalName,

      quality: tags.Quality?.name,
      qualityIterName: tags.Quality?.internalName,

      rarity: tags.Rarity?.name,
      rarityIterName: tags.Rarity?.internalName,

      exterior: tags.Exterior?.name,
      exteriorIterName: tags.Exterior?.internalName
    }
  })
}


export async function updateItem(tx: Prisma.TransactionClient, id: number, name: string) {
  if(!name) {
    throw new Error("Item name is required")
  }

  const itemData = await getSteamItemData({name})
  
  if(!itemData) {
    throw new Error("Steam item data not found")
  }

  const main = itemData.main
  const tags = itemData.tags

  return await tx.item.update({
    where: {
      id
    },
    data: {
      name: name,
      marketHashName: String(main.market_hash_name),
      marketBucketGroupId: String(main.market_bucket_group_id ?? ""),
      imageUrl: String(main.imageURL ?? ""),
      itemColor: String(main.color ?? ""),
      backgroundColor: String(main.backgroundColor ?? ""),
      classId: String(main.classId),

      itemType: tags.Type?.name,
      itemTypeIterName: tags.Type?.internalName,

      weaponType: tags.Weapon?.name,
      weaponTypeIterName: tags.Weapon?.internalName,

      collection: tags.Collection?.name,
      collectionIterName: tags.Collection?.internalName,

      quality: tags.Quality?.name,
      qualityIterName: tags.Quality?.internalName,

      rarity: tags.Rarity?.name,
      rarityIterName: tags.Rarity?.internalName,

      exterior: tags.Exterior?.name,
      exteriorIterName: tags.Exterior?.internalName
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


export async function getSteamItemData(data: { name: string} ) {
  const queryUrl = createMarketQuery(data.name)
  console.log(queryUrl)
  const res = await fetch(queryUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": "https://steamcommunity.com/market/"
    }
  })

  const resJson = await res.json()
  const resData = resJson.data 

  if(!resData) {
    return false
  }

  
  const itemInfo = Object.fromEntries(
    resData.tags.map((tag: {
      category: string,
      internal_name: string,
      localized_tag_name: string,
    }) => {
      let category:string = tag.category
      if(tag.category === "KeychainCapsule" || tag.category === "StickerCapsule" || tag.category === "ItemSet") {
        category = "Collection"
      }
      return [
        category,
        {
          internalName: tag.internal_name,
          name: tag.localized_tag_name,
        }
      ]
    })
  )
  
  const itemData: Record<string, number | string> = {
    appId: resData.appid,
    classId: resData.classid,
    imageURL: resData.icon_url,
    market_hash_name: resData.market_hash_name,
    market_bucket_group_id: resData.market_bucket_group_id,
    color:  resData.name_color,
    backgroundColor: resData.background_color
  } 

  return { main: itemData, tags: itemInfo }
}

function createMarketQuery(itemName: string) {
  console.log(itemName)
  return `https://steamcommunity.com/market/actions?q=QueryDescription&qp=%5B730%2C%22${encodeURIComponent(itemName)}%22%2Cnull%5D`
}