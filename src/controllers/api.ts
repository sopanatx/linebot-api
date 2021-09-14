import { Request, Response } from "express";

export const ApiHello = async (req: Request, res: Response): Promise<void> => {
    res.status(200).send({
        status: 200,
        message: "it works!!!@@",
    });
};
