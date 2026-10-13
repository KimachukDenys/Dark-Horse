// src/controller/item.controller.ts

import { Request, Response } from "express";
import {
  getAllItems as allItemsService,
  getItem as getItemServices,
  createItem as createItemService,
  updateItem as updateItemService,
  deleteItem as deleteItemService,
  getSteamItemData 
} from "../service/item.service";


export async function getAllItems(req: Request, res: Response) {
  try {
    const items = await allItemsService()

    res.json({
      message: "Items gets successfully",
      data: items
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Items don't exists") {
      return res.status(404).json({
        message: e.message
      })
    }

    return res.status(500).json({
      message: "Interval server Error"
    })
  }
}


export async function getItem(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const item = await getItemServices(id)

    res.json({
      message: "Item get successfully",
      data: item
    })
  } catch (e) {
    if(e instanceof Error && e.message === "Item doesn't exists") {
      return res.json(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}


export async function createItem(req: Request, res: Response) {
  try {
    const item = await createItemService(req.body);

    res.status(203).json({
      message: "Item created successfully",
      data: item
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Item name is required") {
      return res.status(404).json({
        message: e.message
      })
    }

    res.status(500).json({
      message: "Internal server Error"
    })
  }
}


export async function updateItem(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const update = await updateItemService(id, req.body)

    res.json({
      message: "Item updated successfully",
      data: update
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Item name is required") {
      return res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}


export async function deleteItem(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const delItem  = await  deleteItemService(id)

    res.json({
      message: "Item deleted successfully",
      data: delItem
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Item doesn't exists") {
      res.status(404).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function apiSearch(req: Request, res: Response) {
  try {
    const data = req.body
    console.log(data)
    const result = getSteamItemData(data)

    res.json({
      message: "work",
      data: result
    })
  } catch (e) {
    if(e instanceof Error) {
      res.json({
        message: e.message
      })
    }
  }
}