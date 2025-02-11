import { CS571Config } from "@cs571/su24-api-framework";
import HW12PublicConfig from "../model/configs/hw12-public-config";
import HW12SecretConfig from "../model/configs/hw12-secret-config";

import jwt from 'jsonwebtoken';
import BadgerUser from "../model/badger-user";
import { NextFunction, Request, Response } from "express";


export class CS571HW12TokenAgent {

    public static readonly DEFAULT_EXP: number = 60 * 60;

    private readonly config: CS571Config<HW12PublicConfig, HW12SecretConfig>;

    public constructor(config: CS571Config<HW12PublicConfig, HW12SecretConfig>) {
        this.config = config;
    }

    public authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
        const token = await this.validateToken(req.cookies['badgerchat_auth'])
        if (token) {
            (req as any).user = token;
            next();
        } else {
            res.status(401).send({
                msg: "You must be logged in to do that!"
            });
        }
    }

    public validateToken = async<T = any>(token: string): Promise<T | undefined> => {
        return new Promise((resolve: any) => {
            if (!token) {
                resolve(undefined)
            }
            jwt.verify(token, this.config.SECRET_CONFIG.JWT_SECRET, (err: any, body: any): void => {
                if (err) {
                    resolve(undefined)
                } else {
                    resolve(body as T)
                }
            })
        });
    }


    public generateAccessToken = (user: BadgerUser, exp?: number): string => {
        return this.generateToken({ ...user }, exp ?? CS571HW12TokenAgent.DEFAULT_EXP);
    }

    public generateToken = (tokenBody: any, exp: number) => {
        return jwt.sign(tokenBody, this.config.SECRET_CONFIG.JWT_SECRET, { expiresIn: `${exp}s` });
    }

    public getExpFromToken = (token: string) => {
        return JSON.parse(atob(token.split(".")[1])).exp;
    }
}