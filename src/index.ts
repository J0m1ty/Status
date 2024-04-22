import express, { Request, Response, NextFunction } from "express";
import slowDown from "express-slow-down";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { readFileSync } from "fs";
import { WebSocketServer } from "ws";
import cors from "cors";
import { join } from "path";
import { collectStats } from "./stats";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { services, serverActions, isValidServiceName, isValidServerAction, isValidServiceAction, isValidActionType } from "./manage";
import { LoginMessageFailure, LoginMessageSuccess, ManageMessageFailure, ManageMessageSuccess, Stats, StatusMessage } from "./types";
import 'dotenv/config';

// Constants
const port = 3001;
const secret = process.env.API_SECRET as string;
const password = process.env.ADMIN_PASSWORD as string;
const admin = bcrypt.hashSync(password, 8);

// Data
const stats: Stats = {
    minecraft: undefined,
    mindustry: undefined,
    nginx: undefined,
    status: undefined,
    auth: undefined,
    threadblend: undefined,
    splashesofcolor: undefined,
    pz: undefined
};

// Functions
const updateStats = (s: Stats): void => {
    Object.assign(stats, s);
};

// Express app setup
const app = express();
app.use(cors());
app.set('trust proxy', 1);
app.get('/ip', (request, response) => response.send(request.ip));
app.use(express.static(join(__dirname, "../public")));


// Rate limiting and slowdown middleware
const speedLimiter = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 5,
    delayMs: 500
});

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
});

// Middleware
app.use("/api", speedLimiter);
app.use("/api", limiter);
app.use("/api/login", speedLimiter);
app.use("/api/login", limiter);
app.use("/api/manage", speedLimiter);
app.use("/api/manage", limiter);
app.use("/api", express.json());
app.use("/api", express.urlencoded({ extended: true }));

// Routes
app.post("/api", (req: Request, res: Response, next: NextFunction) => {
    const out: StatusMessage = {
        data: stats
    };
    
    try {
        res.json(out);
    } catch (error) {
        next(error);
    }
});

app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    const password = req.body.password ?? "";
    const isValid = bcrypt.compareSync(password, admin);

    if (!isValid) {
        const out: LoginMessageFailure = {
            accessToken: null,
            error: "Invalid credentials"
        };

        res.status(401).send(out);
        return;
    }

    const token = jwt.sign({
        id: 1
    }, secret, {
        expiresIn: 86400
    });

    const out: LoginMessageSuccess = {
        accessToken: token
    };

    res.status(200).send(out);

    next();
});

app.post("/api/manage", (req: Request, res: Response, next: NextFunction) => {
    const success: ManageMessageSuccess = {
        success: true
    };
    
    const tokenError: ManageMessageFailure = {
        error: "Invalid token"
    };
    
    const error: ManageMessageFailure = {
        error: "An error occurred"
    };
    
    
    if (req.headers && req.headers.authorization && req.headers.authorization.split(" ")[0] === "JWT") {
        const token = req.headers.authorization.split(" ")[1];

        jwt.verify(token, secret, async (err, decode) => {
            if (err) {
                res.status(401).send(tokenError);
                return;
            }

            const type = req.body.type as string;

            if (isValidActionType(type)) {
                if (type == "service") {
                    const service = req.body.service as string;
                    const action = req.body.action as string;
                
                    if (isValidServiceName(service) && isValidServiceAction(action)) {
                        const manager = services[service];

                        if (manager) {
                            manager[action]().then(() => {
                                res.status(200).send(success);
                                update();
                            }).catch((err) => {
                                res.status(500).send(error);
                            });
                        }
                        else {
                            res.status(400).send(error);
                        }
                    }
                    else {
                        res.status(400).send(error);
                    }
                }
                else if (type == "server") {
                    const action = req.body.action as string;

                    if (isValidServerAction(action)) {
                        const manager = serverActions[action];

                        if (manager) {
                            manager().then(() => {
                                res.status(200).send(success);
                                update();
                            }).catch((err) => {
                                res.status(500).send(error);
                            });
                        }
                        else {
                            res.status(400).send(error);
                        }
                    }
                    else {
                        res.status(400).send(error);
                    }
                }
            }
            else {
                res.status(400).send(error);
            }
        });
    }
});

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        res.sendFile(join(__dirname, "../public/index.html"));
    } catch (error) {
        next(error);
    }
});

// HTTPS server and WebSocket setup
const server = createServer(app);

const wss = new WebSocketServer({ server });

// Update stats
const update = () => {
    collectStats((stats) => {
        updateStats(stats);

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(stats));
        });
    });
}

// WebSocket connection handling
wss.addListener("connection", (ws) => {
    ws.send(JSON.stringify(stats));
});

// Start the server
server.listen(port, () => {
    console.log(`Server listening on :${port}`);

    // Periodic stats update
    setInterval(() => {
        update();
    }, 5000);
});
