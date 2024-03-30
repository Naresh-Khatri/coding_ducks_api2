import { Server } from "socket.io";
import prisma, { getRecursiveInclude } from "../lib/prisma";
import RoomsStateManager from "./state-manager";
import {
  DISCONNECT,
  FILE_GET,
  LOBBY_UPDATED,
  MESSAGE_RECEIVE,
  MESSAGE_SEND,
  ROOM_GET,
  ROOM_UPDATE,
  ROOM_UPDATED,
  SERVER_INFO_RECEIVE,
  USER_CONNECTED,
  USER_DATA_SEND,
  USER_JOIN_DUCKLET,
  USER_JOIN_REQUEST,
  USER_JOIN_REQUESTED,
  USER_JOIN_REQUEST_ACCEPT,
  USER_JOIN_REQUEST_ACCEPTED,
  USER_LOST,
  USER_REMOVED_FROM_DUCKLET,
  USER_REMOVE_FROM_DUCKLET,
} from "./events";
import {
  MessageReceive,
  MessageSend,
  ServerInfoReceive,
  UserConnected,
  UserDataSend,
  UserJoinDucklet,
  UserLost,
} from "./events-types";
import clientsStateManager from "./clients-manager";

export const setupSocketIO = async (io: Server) => {
  // get rooms list from db and create a rooms list which would contains clients
  // const dbRooms = await prisma.room.findMany({ include: { owner: true } });
  // const state = RoomsStateManager({ initialRooms: dbRooms });
  const state2 = clientsStateManager();

  io.on("connection", (socket) => {
    //todo: add auth
    const { userId } = socket.handshake.query;
    if (userId) {
      state2.addClient({ userId: +userId, socketId: socket.id });
    }
    console.log(socket.handshake.query.userId);

    // extras after adding Yjs

    socket.on(DISCONNECT, async (...args) => {
      state2.removeClient(socket.id);
      // if user was in a room
    });
    socket.on(MESSAGE_SEND, async ({ msg }: MessageSend) => {
      const { room, text, user } = msg;
      try {
        const savedMsg = await prisma.message.create({
          data: {
            text: text,
            username: user.username,
            userId: user.id,
            roomId: room.id,
            photoURL: user.photoURL,
          },
        });
        io.in(msg.room.name).emit(MESSAGE_RECEIVE, {
          ...savedMsg,
          user: {
            id: savedMsg.userId,
            username: savedMsg.username,
            photoURL: savedMsg.photoURL,
          },
          room: { id: savedMsg.roomId, name: msg.room.name },
        } as MessageReceive);
      } catch (err) {
        console.log(err);
      }
    });
    socket.on(
      USER_JOIN_REQUEST,
      async ({ roomId, userId }: { roomId: number; userId: number }, cb) => {
        const room = await prisma.room.findFirst({
          where: { id: roomId },
          select: { ownerId: true },
        });
        const user = await prisma.user.findFirst({
          where: { id: userId },
          select: { id: true, username: true, photoURL: true, fullname: true },
        });
        if (!room?.ownerId || !user?.id) {
          cb({ status: "error", msg: "User or room not found" });
        }
        // if room and user exist then emit event to sockIds if ownner
        const ownerSocks = state2
          .getClients()
          .filter((c) => c.id === room?.ownerId);

        if (ownerSocks.length === 0) {
          cb({ status: "error", msg: "Owner not online" });
          return;
        }

        ownerSocks.forEach((owner) => {
          if (!owner.socketId) return;
          io.to(owner.socketId).emit(USER_JOIN_REQUESTED, {
            user,
            room,
          });
          cb({ status: "success", msg: "Request sent" });
        });

        // console.log(payload)
        // const ownerSockIds = state2
        //   .getClients()
        //   .filter((c) => c.id === payload.room.ownerId);
        // console.log(ownerSockIds);
        // sent this event to a socket
        // io.to();
      }
    );
    socket.on(USER_JOIN_DUCKLET, async (payload: UserJoinDucklet, cb) => {
      const { user, room } = payload;
      const dbUser = await prisma.user.findFirst({ where: { id: user.id } });
      const dbRoom = await prisma.room.findFirst({
        where: { id: room.id },
        include: { allowedUsers: true },
      });
      if (!dbUser || !dbRoom) {
        return cb({ status: "error", msg: "User or room not found" });
      }
      const userIsAllowed =
        dbRoom.isPublic ||
        dbRoom.ownerId === dbUser.id ||
        dbRoom.allowedUsers.some((u) => u.id === dbUser.id);

      if (!userIsAllowed) {
        return cb({ status: "error", msg: "User not allowed" });
      }

      socket.join(dbRoom.name);

      cb({ status: "success", msg: "Joined room" });

      io.to(dbRoom.name).emit(ROOM_UPDATED, payload);
    });
    socket.on(
      USER_JOIN_REQUEST_ACCEPT,
      async ({ roomId, userId }: { roomId: number; userId: number }) => {
        const reqUserSocks = state2.getClients().filter((c) => c.id === userId);

        if (reqUserSocks.length === 0) return;

        console.log("requsers", reqUserSocks);
        reqUserSocks.forEach((reqUserSock) => {
          if (!reqUserSock.socketId) return;
          io.to(reqUserSock.socketId).emit(USER_JOIN_REQUEST_ACCEPTED, {
            roomId,
          });
        });
      }
    );
    socket.on(
      USER_REMOVE_FROM_DUCKLET,
      async ({ userId }: { userId: number }) => {
        try {
          const reqUserSocks = state2
            .getClients()
            .filter((c) => c.id === userId);

          if (reqUserSocks.length === 0) return;

          reqUserSocks.forEach((reqUserSock) => {
            if (!reqUserSock.socketId) return;
            io.to(reqUserSock.socketId).emit(USER_REMOVED_FROM_DUCKLET);
          });
        } catch (err) {
          throw err;
        }
      }
    );

    socket.on(ROOM_UPDATE, async (payload) => {
      io.to(payload.room.name).emit(ROOM_UPDATED, payload);
    });
    socket.on(ROOM_UPDATE, async (payload) => {
      io.to(payload.room.name).emit(ROOM_UPDATED, payload);
    });
  });
};
