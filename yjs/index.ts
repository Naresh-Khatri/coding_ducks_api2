import 'dotenv/config'
import http from "http";
import { WebSocketServer } from "ws";
import * as Y from "yjs";
import { MongodbPersistence } from "y-mongodb-provider";
import { setPersistence, setupWSConnection } from "./websocket/utils";

import { IWSSharedDoc } from "./websocket/interfaces";

const server = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("okay");
});

const wss = new WebSocketServer({ server });
wss.on("connection", setupWSConnection);

if (!process.env.MONGODB_URL) {
  throw new Error("Please define the MONGODB_URL environment variable");
}
const mdb = new MongodbPersistence(process.env.MONGODB_URL, {
  flushSize: 100,
  multipleCollections: true,
});

setPersistence({
  bindState: async (docName: string, ydoc: IWSSharedDoc) => {
    const persistedYdoc = await mdb.getYDoc(docName);
    const newUpdates = Y.encodeStateAsUpdate(ydoc);
    mdb.storeUpdate(docName, newUpdates);
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
    ydoc.on("update", async (update: Uint8Array) => {
      mdb.storeUpdate(docName, update);
    });
  },
  writeState: (docName: string, ydoc: IWSSharedDoc) => {
    return new Promise((resolve) => {
      resolve(true);
    });
  },
});

server.listen(process.env.YJS_PORT, () => {
  console.log("yjs server up at:" + process.env.YJS_PORT);
});
