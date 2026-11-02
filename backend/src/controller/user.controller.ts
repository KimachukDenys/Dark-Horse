import { Request, Response } from "express";
import { 
  register as registerService,
  login as loginService 
} from "../service/user.service";

export async function register(req: Request, res: Response) {
  try {
    const user = await registerService(req.body);

    req.session.regenerate((err) => {
      if(err) {
        return res.status(500).json({
          message: "Failed to regenerate session"
        })
      }
      req.session.userId = user.id;

      req.session.save((saveErr) => {
        if(saveErr) {
          return res.status(500).json({
            message: "Failed to save session"
          })
        }

        res.status(201).json({
          message: "User created successfully"
        });
      })
    })
  } catch (e: unknown) {
    if(e instanceof Error) {
      res.status(500).json({
        message: e.message
      })
    }
  }
}

export async function login(req: Request, res: Response) {
  try {
    const user = await loginService(req.body)

    req.session.regenerate((err) => {
      if(err) {
        return res.status(500).json({
          message: "Failed to regenerate session"
        })
      }
      req.session.userId = user.id;

      req.session.save((saveErr) => {
        if(saveErr) {
          return res.status(500).json({
            message: "Failed to save session"
          })
        }

        res.status(201).json({
          message: "Logged in successfully",
          userId: req.session.userId
        });
      })
    })
  } catch (e: unknown) {
    if(e instanceof Error && e.message === "Invalid password or email") {
      return res.status(401).json({
        message: e.message
      })
    }

    if(e instanceof Error) {
      return res.status(500).json({
        message: e.message
      })
    }
  }
} 

export async function getMe(req: Request, res: Response) {
  res.json({
    id: req.session.userId
  })
}

export function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to logout",
      });
    }

    res.clearCookie("SID", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  });
}