import { Document, YSocketIO } from "y-socket.io/dist/server";

export const setupYSocketIO = async (ysocketio: YSocketIO) => {
  return;
  ysocketio.on("document-loaded", function (doc: Document) {
    console.log("document-loaded");
    // console.log(doc);
  });
  ysocketio.on("document-update", function (doc: Document, update: Uint8Array) {
    console.log("document-update");
    // console.log(doc, update);
  });
  ysocketio.on(
    "awareness-update",
    function (doc: Document, update: Uint8Array) {
      console.log("awareness-update");
      // console.log(Object.keys(doc), update);
      console.log(Array.from(doc.store.clients.values()).length);
    }
  );
  ysocketio.on("document-destroy", function (doc: Document) {
    console.log("document-destory");
    // console.log(doc);
  });
  ysocketio.on("all-document-connections-closed", function (doc: Document) {
    console.log("all-doc-connections-closed");
    console.log(doc);
  });
};
