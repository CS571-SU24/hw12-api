import { Express } from 'express';

import { CS571Route } from "@cs571/su24-api-framework/src/interfaces/route";
import { CS571HW12DbConnector } from '../services/hw12-db-connector';
import { CS571HW12TokenAgent } from '../services/hw12-token-agent';
import { CS571Config } from '@cs571/su24-api-framework';
import HW12PublicConfig from '../model/configs/hw12-public-config';
import HW12SecretConfig from '../model/configs/hw12-secret-config';
import BadgerUser from '../model/badger-user';

export class CS571LoginRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = '/rest/su24/hw12/login';

    private readonly connector: CS571HW12DbConnector;
    private readonly tokenAgent: CS571HW12TokenAgent;
    private readonly config: CS571Config<HW12PublicConfig, HW12SecretConfig>


    public constructor(connector: CS571HW12DbConnector, tokenAgent: CS571HW12TokenAgent, config: CS571Config<HW12PublicConfig, HW12SecretConfig>) {
        this.connector = connector;
        this.tokenAgent = tokenAgent;
        this.config = config;
    }

    public addRoute(app: Express): void {
        app.post(CS571LoginRoute.ROUTE_NAME, async (req, res) => {
            const username = req.body.username?.trim();
            const pin = req.body.pin?.trim();

            if (!username || !pin) {
                res.status(400).send({
                    msg:  "A request must contain a 'username' and 'pin'"
                });
                return;
            }

            const pers = await this.connector.findUserIfExists(username)
            
            if (!pers) {
                // bogus calculation to mirror true hash calculation
                CS571HW12DbConnector.calculateHash(new Date().getTime().toString(), pin)
                this.delayResponse(() => {
                    res.status(401).send({
                        msg: "That username or pin is incorrect!",
                    })
                });
                return;
            }

            const hash = CS571HW12DbConnector.calculateHash(pers.salt, pin)

            if (hash !== pers.pin) {
                this.delayResponse(() => {
                    res.status(401).send({
                        msg: "That username or pin is incorrect!",
                    })
                });
                return;
            }

            const cook = this.tokenAgent.generateAccessToken(new BadgerUser(pers.id, pers.username));

            res.status(200).cookie(
                'badgerchat_auth',
                cook,
                {
                    domain: this.config.PUBLIC_CONFIG.IS_REMOTELY_HOSTED ? this.config.PUBLIC_CONFIG.HOST : undefined,
                    sameSite: this.config.PUBLIC_CONFIG.IS_REMOTELY_HOSTED ? "none" : "lax",
                    secure: this.config.PUBLIC_CONFIG.IS_REMOTELY_HOSTED,
                    maxAge: 3600000,
                    partitioned: true,
                    httpOnly: true,
                }
            ).send({
                msg: "Successfully authenticated.",
                user: {
                    id: pers.id,
                    username: pers.username
                },
                eat: this.tokenAgent.getExpFromToken(cook)
            })
        })
    }

    public async delayResponse(cb: () => void): Promise<void> {
        return new Promise((resolve: any) => {
            setTimeout(() => {
                cb()
                resolve();
            }, Math.ceil(Math.random() * 100))
        })
        
    }

    public getRouteName(): string {
        return CS571LoginRoute.ROUTE_NAME;
    }
}
