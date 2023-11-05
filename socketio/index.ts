import { Server, Socket } from "socket.io";
import { execCode } from "../turbodrive";
import prisma from "../lib/prisma";
// import { execCodeWithSingleInput } from "../turbodrive";

interface message {
  userId: number;
  username: string;
  text: string;
  timestamp?: string;
  roomId: number;
  photoURL: string;
}
interface User {
  id: number;
  fullname: string;
  email: string;
  photoURL: string;
  username: string;
  roomname: string;
}
interface Cursor {
  userId: number;
  roomId: number;
  row: number;
  col: number;
}

export const setupSocketIO = (io: Server) => {
  const clients = new Map<string, User | null>();
  const cursors = new Map<string, Cursor>();

  io.on("connection", (socket) => {
    socket.on("disconnect", (...args) => {
      console.log("user disconnected", socket.id, args);
      if (clients.has(socket.id)) {
        const user = clients.get(socket.id);
        if (!user) return;
        console.log("user disconnected", user);
        clients.delete(socket.id);
        io.to(user.roomname).emit("user-disconnected", {
          user,
          clients: Object.fromEntries(clients),
        });
      }
    });
    // ----------------- ROOM JOINING -----------------
    socket.on("join-room", async (payload) => {
      const { username, roomname } = payload;
      console.log("join req:", payload);
      const user = await prisma.user.findFirst({
        where: {
          id: payload.user.id,
        },
        select: {
          id: true,
          fullname: true,
          email: true,
          photoURL: true,
          username: true,
        },
      });
      //if user doesnt exist, send error
      if (!user) {
        socket.emit("join-room-update", {
          status: "failed",
          message: "User doesnt exist!",
        });
        return;
      }
      clients.set(socket.id, { ...user, roomname });
      console.log("current clients", clients.size);
      //find room in db
      const room = await prisma.room.findFirst({
        where: {
          name: roomname,
        },
        include: {
          owner: true,
        },
      });

      //if room doesnt exist, send error
      if (!room) {
        socket.emit("join-room-update", {
          status: "failed",
          message: "Room doesnt exist!",
        });
        return;
      }
      //if room exists, join room
      socket.join(roomname);
      // get room messages
      const msgsList = await prisma.message.findMany({
        where: {
          roomId: room.id,
        },
        include: {
          user: {
            select: {
              fullname: true,
            },
          },
        },
        orderBy: {
          time: "desc",
        },
      });
      console.log(`Socket ${socket.id} joined room ${roomname}`);
      // find all users in room and send them updated client list
      const roomUsers = Array.from(clients.values()).filter(
        (user) => user?.roomname === roomname
      );
      //send room info to client
      socket.emit("join-room-success", {
        status: "success",
        roomInfo: room,
        clients: roomUsers,
        cursors: Object.fromEntries(cursors),
        msgsList: msgsList,
      });
      //send updated client list to all users in room
      socket.broadcast.to(roomname).emit("user-joined", {
        user: { ...user, roomname },
        clients: Object.fromEntries(clients),
      });
    });
    // ----------------- ROOM CREATION -----------------
    socket.on("create-room", async (roomConfig) => {
      try {
        const { roomname, user: userObj } = roomConfig;
        //save room to db
        const newRoom = await prisma.room.create({
          data: {
            name: roomname,
            isPublic: true,
            ownerId: userObj.id,
          },
          include: {
            owner: true,
          },
        });
        //create room with id from db as name
        if (io.sockets.adapter.rooms.has(roomname)) {
          return socket.emit("create-room-update", {
            status: "failed",
            message: "room already exists",
          });
        }
        socket.join(roomname);
        socket.emit("create-room-update", {
          status: "success",
          roomInfo: newRoom,
          clients: Object.fromEntries(clients),
          roomsAvailable: io.sockets.adapter.rooms,
        });
      } catch (err) {
        console.log(err);
        socket.emit("create-room-update", {
          status: "failed",
          message: err,
        });
      }
    });
    socket.on("message", async (payload: any) => {
      try {
        const savedMsg = await prisma.message.create({
          data: {
            text: payload.newMsg.text,
            username: payload.newMsg.username,
            userId: payload.newMsg.userId,
            roomId: payload.newMsg.roomId,
            photoURL: payload.newMsg.photoURL,
          },
        });
        io.in(payload.roomInfo.name).emit("message", savedMsg);
      } catch (err) {
        console.log(err);
      }
    });
    socket.on("code-change", (payload) => {
      // console.log("code-change", payload);

      const { content, user, roomInfo } = payload;
      socket.to(roomInfo.name).emit("code-change", payload);
      saveCodeToDB(payload);
    });
    socket.on("change-user-cursor", (payload) => {
      const { user, cursor, roomInfo } = payload;
      cursors.set(user.id, cursor);
      // console.log("change-user-cursor", payload);
      socket.to(roomInfo.name).emit("change-user-cursor", payload);
    });
    socket.on("change-lang", async (payload) => {
      // console.log("change-lang", payload);
      try {
        const result = await prisma.room.update({
          where: {
            id: payload.roomInfo.id,
          },
          data: {
            lang: payload.lang,
          },
        });
        io.to(payload.roomInfo.name).emit("change-lang", payload);
      } catch (err) {
        console.log(err);
      }
    });
    socket.on("code-exec", async (payload) => {
      // console.log("run-code", payload);
      io.to(payload.roomInfo.name).emit("code-exec-started", payload);
      const res = await execCode({
        lang: payload.lang,
        code: payload.code,
        inputs: [payload.input || ""],
        options: { maxBuffer: 1024 * 1024, timeout: 3000 },
      });

      // console.log(res);
      io.to(payload.roomInfo.name).emit("code-exec-finished", {
        ...payload,
        res,
      });

      // io.to(payload.roomInfo.name).emit("run-code", payload);
    });
  });
};

const saveCodeToDB = async (payload: {
  code: string;
  userr: User;
  roomInfo: { id: number; name: string };
}) => {
  const { code, roomInfo } = payload;

  console.log(payload);
  await prisma.room.update({
    where: {
      id: roomInfo.id,
    },
    data: {
      content: code,
    },
  });
  // try {
  //   const result = await prisma.room.update({
  //     where: {
  //       id: roomInfo.id,
  //     },
  //     data: {
  //       code,
  //     },
  //   });
  // } catch (err) {
  //   console.log(err);
  // }
};
