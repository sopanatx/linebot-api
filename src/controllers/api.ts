import { Request, Response } from "express";

export const ApiHello = async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Hello");
};
export const ApiAuth = async (req: Request, res: Response): Promise<void> => {
    console.log(req.headers);
    res.status(200).send("AUTH SERVICE");
};

export const ApiLiffId = async (req: Request, res: Response): Promise<void> => {
    const myLiffId = process.env.LINE_LIFF_ID || "NULL_ID";
    res.json({
        id: myLiffId,
    });
};

export const GetStudentInfoByLineUserId = async (
    req: Request,
    res: Response,
): Promise<void> => {
    res.json({
        data: {
            studentName: "Test",
            lineId: "test",
        },
    });
};
