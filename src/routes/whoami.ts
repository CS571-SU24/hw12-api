import { Express } from 'express';

import { CS571Route } from "@cs571/su24-api-framework/src/interfaces/route";
import { CS571HW12DbConnector } from '../services/hw12-db-connector';
import { CS571HW12TokenAgent } from '../services/hw12-token-agent';

export class CS571WhoAmIRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = '/rest/su24/hw12/whoami';

    private readonly connector: CS571HW12DbConnector;
    private readonly tokenAgent: CS571HW12TokenAgent;

    public constructor(connector: CS571HW12DbConnector, tokenAgent: CS571HW12TokenAgent) {
        this.connector = connector;
        this.tokenAgent = tokenAgent;
    }

    public addRoute(app: Express): void {
        app.get(CS571WhoAmIRoute.ROUTE_NAME, async (req, res) => {
            const user = await this.tokenAgent.validateToken(req.cookies['badgerchat_auth']);
            res.status(200).send({
                isLoggedIn: user ? true : false,
                user: user
            })
        })
    }

    public getRouteName(): string {
        return CS571WhoAmIRoute.ROUTE_NAME;
    }
}
