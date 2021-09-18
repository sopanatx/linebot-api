import { Request, Response } from "express";

export const ApiHello = async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Hello");
};
export const ApiAuth = async (req: Request, res: Response): Promise<void> => {
    console.log(req.headers);
    res.status(200).send("AUTH SERVICE");
};
