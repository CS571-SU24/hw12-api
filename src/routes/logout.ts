import { Express } from 'express';

import { CS571Route } from "@cs571/su24-api-framework/src/interfaces/route";
import { CS571HW12DbConnector } from '../services/hw12-db-connector';
import { CS571Config } from '@cs571/su24-api-framework';
import HW12PublicConfig from '../model/configs/hw12-public-config';
import HW12SecretConfig from '../model/configs/hw12-secret-config';

export class CS571LogoutRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = '/rest/su24/hw12/logout';

    private readonly connector: CS571HW12DbConnector;
    private readonly config: CS571Config<HW12PublicConfig, HW12SecretConfig>

    public constructor(connector: CS571HW12DbConnector, config: CS571Config<HW12PublicConfig, HW12SecretConfig>) {
        this.connector = connector;
        this.config = config;
    }

    public addRoute(app: Express): void {
        app.post(CS571LogoutRoute.ROUTE_NAME, (req, res) => {
            res.status(200).cookie(
                'badgerchat_auth',
                "goodbye",
                {
                    domain: this.config.PUBLIC_CONFIG.IS_REMOTELY_HOSTED ? this.config.PUBLIC_CONFIG.HOST : undefined,
                    sameSite: this.config.PUBLIC_CONFIG.IS_REMOTELY_HOSTED ? "none" : "lax",
                    secure: this.config.PUBLIC_CONFIG.IS_REMOTELY_HOSTED,
                    maxAge: 1,
                    partitioned: true,
                    httpOnly: true
                }
            ).send({
                msg: "You have been logged out! Goodbye."
            });
        })
    }

    public getRouteName(): string {
        return CS571LogoutRoute.ROUTE_NAME;
    }
}
