import fs from 'fs'

import express, { Express } from 'express';
import cookies from "cookie-parser";

import { CS571Initializer } from '@cs571/su24-api-framework'
import HW12PublicConfig from './model/configs/hw12-public-config';
import HW12SecretConfig from './model/configs/hw12-secret-config';
import { CS571AllChatroomsRoute } from './routes/chatrooms';
import { CS571GetMessagesRoute } from './routes/get-messages';
import { CS571CreateMessageRoute } from './routes/create-message';
import { CS571DeleteMessageRoute } from './routes/delete-message';
import { CS571RegisterRoute } from './routes/register';
import { CS571LoginRoute } from './routes/login';
import { CS571LogoutRoute } from './routes/logout';
import { CS571WhoAmIRoute } from './routes/whoami';
import { CS571HW12DbConnector } from './services/hw12-db-connector';
import { CS571HW12TokenAgent } from './services/hw12-token-agent';
import { CS571PasswordsRoute } from './routes/passwords';

console.log("Welcome to HW12!");

const app: Express = express();

app.use(cookies());

// https://github.com/expressjs/express/issues/5275
declare module "express-serve-static-core" {
  export interface CookieOptions {
    partitioned?: boolean;
  }
}

const appBundle = CS571Initializer.init<HW12PublicConfig, HW12SecretConfig>(app, {
  allowNoAuth: [],
  skipAuth: false
});

const db = new CS571HW12DbConnector(appBundle.config);
const ta = new CS571HW12TokenAgent(appBundle.config);

db.init();

const chatrooms = JSON.parse(fs.readFileSync('includes/chatrooms.json').toString());
const passwords = JSON.parse(fs.readFileSync(appBundle.config.PUBLIC_CONFIG.PASSWORDS_LOC).toString());

appBundle.router.addRoutes([
  new CS571AllChatroomsRoute(chatrooms, db),
  new CS571GetMessagesRoute(chatrooms, db),
  new CS571CreateMessageRoute(chatrooms, db, ta),
  new CS571DeleteMessageRoute(db, ta),
  new CS571RegisterRoute(db, ta, appBundle.config),
  new CS571LoginRoute(db, ta, appBundle.config),
  new CS571LogoutRoute(db, appBundle.config),
  new CS571WhoAmIRoute(db, ta),
  new CS571PasswordsRoute(passwords)
])

app.listen(appBundle.config.PORT, () => {
  console.log(`Running at :${appBundle.config.PORT}`);
});
