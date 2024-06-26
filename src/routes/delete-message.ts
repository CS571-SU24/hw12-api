import { Express } from 'express';

import { CS571Route } from "@cs571/su24-api-framework/src/interfaces/route";
import { CS571HW12DbConnector } from '../services/hw12-db-connector';
import { CS571HW12TokenAgent } from '../services/hw12-token-agent';

export class CS571DeleteMessageRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = '/rest/su24/hw12/messages';

    private readonly connector: CS571HW12DbConnector;
    private readonly tokenAgent: CS571HW12TokenAgent;

    public constructor(connector: CS571HW12DbConnector, tokenAgent: CS571HW12TokenAgent) {
        this.connector = connector;
        this.tokenAgent = tokenAgent;
    }

    public addRoute(app: Express): void {
        app.delete(CS571DeleteMessageRoute.ROUTE_NAME, this.tokenAgent.authenticateToken, async (req, res) => {
            if (req.query.id === undefined || req.query.id === null) {
                res.status(400).send({
                    msg: "You must specify a post id to delete."
                });
                return;
            }

            let id = parseInt((req.query.id || "A") as string);
            
            if(isNaN(id)) {
                res.status(404).send({
                    msg: "That message does not exist!"
                });
                return;
            }
            
            const msg = await this.connector.getMessage(id);

            if (!msg) {
                res.status(404).send({
                    msg: "That message does not exist!"
                });
                return;
            }
            
            if (msg.poster !== (req as any).user.username) {
                res.status(401).send({
                    msg: "You may not delete another user's post!"
                });
                return;
            }

            await this.connector.deleteMessage(id)

            res.status(200).send({
                msg: "Successfully deleted message!",
            });
        })
    }

    public getRouteName(): string {
        return CS571DeleteMessageRoute.ROUTE_NAME;
    }
}
