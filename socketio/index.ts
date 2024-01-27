import { Server } from "socket.io";
import { execCode } from "../turbodrive";
import prisma from "../lib/prisma";
import { User } from "@prisma/client";
import RoomsStateManager from "./state-manager";
import {
  CODE_EXEC_END,
  CODE_EXEC_START,
  CODE_UPDATE,
  CODE_UPDATED,
  CURSOR_UPDATE,
  CURSOR_UPDATED,
  DISCONNECT,
  LANG_UPDATE,
  LANG_UPDATED,
  LOBBY_UPDATED,
  MESSAGE_RECEIVE,
  MESSAGE_SEND,
  ROOM_CREATE,
  ROOM_CREATED,
  ROOM_CREATE_FAILED,
  ROOM_CREATE_SUCCESS,
  SERVER_INFO_RECEIVE,
  USER_CONNECTED,
  USER_DATA_SEND,
  USER_DISCONNECTED,
  USER_JOIN,
  USER_JOINED,
  USER_JOIN_FAILED,
  USER_JOIN_SUCCESS,
  USER_LEAVE,
  USER_LEFT,
  USER_LOST,
} from "./events";
import {
  CommonFailed,
  IMessage,
  LobbyUpdated,
  MessageReceive,
  MessageSend,
  RoomCreate,
  RoomCreateSuccess,
  RoomCreated,
  ServerInfoReceive,
  UserConnected,
  UserDataSend,
  UserDisconnected,
  UserJoin,
  UserJoinSuccess,
  UserJoined,
  UserLeave,
  UserLeft,
  UserLost,
} from "./events-types";

interface message {
  userId: number;
  username: string;
  text: string;
  timestamp?: string;
  roomId: number;
  photoURL: string;
}

interface Cursor {
  userId: number;
  roomId: number;
  row: number;
  col: number;
}

export const setupSocketIO = async (io: Server) => {
  // get rooms list from db and create a rooms list which would contains clients
  const dbRooms = await prisma.room.findMany({ include: { owner: true } });
  const state = RoomsStateManager({ initialRooms: dbRooms });

  const cursors = new Map<string, Cursor>();

  io.on("connection", (socket) => {
    // socket sends their user
    socket.on(USER_DATA_SEND, async ({ user }: UserDataSend) => {
      // add user to state
      await state.connectClient({
        socketId: socket.id,
        user: { id: user.id, socketId: socket.id },
      });
      // send updated state to socket
      socket.emit(SERVER_INFO_RECEIVE, {
        clients: state.getConnectedClients(),
        rooms: state.getrooms(),
      } as ServerInfoReceive);
      // notify all about user connected
      io.emit(USER_CONNECTED, {
        clients: state.getConnectedClients(),
      } as UserConnected);
    });

    socket.on(DISCONNECT, async (...args) => {
      const disconnectClient = await state.disconnectClient(socket.id);
      console.log("user disconnected: ", disconnectClient);
      // emit to every socket
      io.emit(USER_DISCONNECTED, {
        clients: state.getConnectedClients(),
      } as UserDisconnected);
      // if user was in a room then emit in room
      if (disconnectClient.room?.name) {
        io.to(disconnectClient.room.name).emit(USER_LOST, {
          room: disconnectClient.room,
          user: disconnectClient,
        } as UserLost);
        //update lobby (just pass ids for filtering)
        socket.broadcast.emit(LOBBY_UPDATED, {
          type: "remove-user-from-room",
          room: disconnectClient.room,
          user: disconnectClient,
        });
      }
    });
    // ----------------- ROOM JOINING -----------------
    socket.on(USER_JOIN, async ({ room, user }: UserJoin) => {
      const dbUser = await prisma.user.findFirst({
        where: {
          id: user.id,
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
      if (!dbUser) {
        socket.emit(USER_JOIN_FAILED, {
          status: "failed",
          msg: "User doesnt exist!",
        } as CommonFailed);
        return;
      }
      // check if roomname exists
      if (!state.getroom({ roomName: room.name })) {
        socket.emit(USER_JOIN_FAILED, {
          status: "failed",
          msg: "room doesnt exist",
        } as CommonFailed);
      }

      //find room in db
      const dbRoom = await prisma.room.findFirst({
        where: {
          name: room.name,
        },
        include: {
          owner: true,
        },
      });

      //if room doesnt exist, send error
      if (!dbRoom) {
        socket.emit(USER_JOIN_FAILED, {
          status: "failed",
          msg: "Room doesnt exist!",
        } as CommonFailed);
        return;
      }

      //if room exists, join room
      socket.join(room.name);
      // add room if not localy present in map
      state.joinRoom({ roomId: dbRoom.id, socketId: socket.id, user: dbUser });

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
      console.log(`Socket ${socket.id} joined room ${room.name}`);
      // find all users in room and send them updated client list

      //send room info to client
      socket.emit(USER_JOIN_SUCCESS, {
        status: "success",
        room: state.getroom({ roomId: dbRoom.id }),
        clients: state.getroom({ roomId: dbRoom.id }).clients,
        // cursors: Object.fromEntries(cursors),
        msgsList: msgsList,
      } as UserJoinSuccess);
      //update lobby
      socket.broadcast.emit(LOBBY_UPDATED, {
        type: "join-user-to-room",
        room: dbRoom,
        user: dbUser,
      } as LobbyUpdated);
      //send updated client list to all users in room
      socket.broadcast.to(dbRoom.name).emit(USER_JOINED, {
        user: { ...user, room: { id: dbRoom.id, name: dbRoom.name } },
        clients: state.getroom({ roomId: dbRoom.id }).clients,
      } as UserJoined);
    });
    // ----------------- ROOM LEAVING -----------------
    socket.on(USER_LEAVE, async ({ room, user }: UserLeave) => {
      socket.leave(room.name);
      state.leaveRoom(socket.id);
      socket.broadcast.emit(LOBBY_UPDATED, {
        type: "remove-user-from-room",
        room,
        user,
      } as LobbyUpdated);
      //send updated client list to all users in room
      socket.broadcast.to(room.name).emit(USER_LEFT, {
        room,
        user,
      } as UserLeft);
    });
    // ----------------- ROOM CREATION -----------------
    socket.on(ROOM_CREATE, async ({ newRoom, user }: RoomCreate) => {
      try {
        // check if user present
        if (!user.id) {
          socket.emit(ROOM_CREATE_FAILED, {
            status: "failed",
            msg: "not connected to WS server",
          } as CommonFailed);
          return;
        }
        // check if limit reached
        const prevRooms = await prisma.room.findMany({
          where: { ownerId: user.id },
        });
        if (prevRooms.length > 1) {
          socket.emit(ROOM_CREATE_FAILED, {
            status: "failed",
            msg: "You have reached room creation limit",
          } as CommonFailed);
          return;
        }
        // check if already has a room
        const prevRoom = await prisma.room.findMany({
          where: { name: newRoom.name },
        });
        if (prevRoom.length > 0) {
          return socket.emit(ROOM_CREATE_FAILED, {
            status: "failed",
            msg: "room already exists",
          } as CommonFailed);
        }

        state.createRoom({
          newRoom: {
            name: newRoom.name,
            isPublic: newRoom.isPublic || true,
            lang: newRoom.lang || "py",
          },
          user: user,
        });

        socket.emit(ROOM_CREATE_SUCCESS, {
          status: "success",
          user: user,
          newRoom: newRoom,
        } as RoomCreateSuccess);

        socket.broadcast.emit(ROOM_CREATED, {
          newRoom: newRoom,
          user: state.getConnectedClient(user.id),
        } as RoomCreated);
      } catch (err) {
        console.log(err);
        socket.emit(ROOM_CREATE_FAILED, {
          status: "failed",
          message: err,
        });
      }
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
    socket.on(CODE_UPDATE, (payload) => {
      // console.log("code-change", payload);

      const { content, user, roomInfo } = payload;
      socket.to(roomInfo.name).emit(CODE_UPDATED, payload);
      saveCodeToDB(payload);
    });
    socket.on(CURSOR_UPDATE, (payload) => {
      const { user, cursor, roomInfo } = payload;
      cursors.set(user.id, cursor);
      // console.log("change-user-cursor", payload);
      socket.to(roomInfo.name).emit(CURSOR_UPDATED, payload);
    });
    socket.on(LANG_UPDATE, async (payload) => {
      const { roomInfo, lang } = payload;
      state.updateRoom(roomInfo.id, { lang: lang });
      io.to(roomInfo.name).emit(
        LANG_UPDATED,
        state.getroom({ roomId: roomInfo.id })
      );
    });
    socket.on(CODE_EXEC_START, async (payload) => {
      // console.log("run-code", payload);
      io.to(payload.roomInfo.name).emit(CODE_EXEC_START, payload);
      const res = await execCode({
        lang: payload.lang,
        code: payload.code,
        inputs: [payload.input || ""],
        options: { maxBuffer: 1024 * 1024, timeout: 3000 },
      });

      // console.log(res);
      io.to(payload.roomInfo.name).emit(CODE_EXEC_END, {
        ...payload,
        res,
      });
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
