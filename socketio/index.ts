import { Server } from "socket.io";
import { execCode } from "../turbodrive";
import prisma, { getRecursiveInclude } from "../lib/prisma";
import RoomsStateManager from "./state-manager";
import {
  CODE_EXEC_END,
  CODE_EXEC_START,
  CODE_SAVE,
  CODE_UPDATE,
  CODE_UPDATED,
  CURSOR_UPDATE,
  CURSOR_UPDATED,
  DISCONNECT,
  FILE_GET,
  ISocketUser,
  LANG_UPDATE,
  LANG_UPDATED,
  LOBBY_UPDATED,
  MESSAGE_RECEIVE,
  MESSAGE_SEND,
  ROOM_CREATE,
  ROOM_CREATED,
  ROOM_CREATE_FAILED,
  ROOM_CREATE_SUCCESS,
  ROOM_GET,
  ROOM_UPDATE,
  ROOM_UPDATED,
  SERVER_INFO_RECEIVE,
  USER_CONNECTED,
  USER_DATA_SEND,
  USER_DISCONNECTED,
  USER_JOIN,
  USER_JOINED,
  USER_JOIN_DUCKLET,
  USER_JOIN_FAILED,
  USER_JOIN_REQUEST,
  USER_JOIN_REQUESTED,
  USER_JOIN_REQUEST_ACCEPT,
  USER_JOIN_REQUEST_ACCEPTED,
  USER_JOIN_SUCCESS,
  USER_LEAVE,
  USER_LEFT,
  USER_LOST,
  USER_REMOVED_FROM_DUCKLET,
  USER_REMOVE_FROM_DUCKLET,
} from "./events";
import {
  CodeSave,
  CodeUpdate,
  CodeUpdated,
  CommonFailed,
  CursorUpdate,
  CursorUpdated,
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
  UserJoinDucklet,
  UserJoinSuccess,
  UserJoined,
  UserLeave,
  UserLeft,
  UserLost,
} from "./events-types";
import clientsStateManager from "./clients-manager";

export const setupSocketIO = async (io: Server) => {
  // get rooms list from db and create a rooms list which would contains clients
  const dbRooms = await prisma.room.findMany({ include: { owner: true } });
  const state = RoomsStateManager({ initialRooms: dbRooms });
  const state2 = clientsStateManager();

  io.on("connection", (socket) => {
    //todo: add auth
    const { userId } = socket.handshake.query;
    if (userId) {
      state2.addClient({ userId: +userId, socketId: socket.id });
    }
    console.log(socket.handshake.query.userId);
    // ----------------- FILES -----------------
    socket.on(FILE_GET, async (payload, cb) => {
      const file = await state.getFile(payload.fileId);
      cb(file);
    });

    // extras after adding Yjs
    socket.on(ROOM_GET, async ({ roomName }: { roomName: string }, cb) => {
      const dbRoom = await prisma.room.findFirst({
        where: { name: roomName },
      });
      if (!dbRoom || !dbRoom.id) {
        return cb({ status: "error", message: "Room not found" });
      }
      const dirs = await prisma.directory.findMany({
        where: { roomId: dbRoom.id, parentDir: null },
        include: getRecursiveInclude({
          depth: 6,
          obj: {
            files: {
              select: {
                id: true,
                fileName: true,
                parentDirId: true,
                lang: true,
                // isDeletable: true,
                // isArchived: true,
              },
            },
          },
        }),
      });

      // get room messages
      const msgsList = await prisma.message.findMany({
        where: {
          roomId: dbRoom.id,
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
      cb({ status: "success", data: { room: dbRoom, fs: dirs, msgsList } });
    });

    // socket sends their user
    socket.on(USER_DATA_SEND, async ({ user }: UserDataSend) => {
      // add user to state
      const newClient = await state.connectClient({
        socketId: socket.id,
        user: { id: user.id, socketId: socket.id },
      });
      // send updated state to socket
      socket.emit(SERVER_INFO_RECEIVE, {
        clients: state.getConnectedClients(),

        rooms: state.getRooms(),
      } as ServerInfoReceive);
      // notify all about user connected
      io.emit(USER_CONNECTED, {
        clients: state.getConnectedClients(),
      } as UserConnected);
    });

    socket.on(DISCONNECT, async (...args) => {
      const disconnectedClient = state.disconnectClient(socket.id);
      state2.removeClient(socket.id);
      // if user was in a room
      if (disconnectedClient.room?.name) {
        // remove their cursor
        state.removeCursor(disconnectedClient.id || 0);
        // emit in room
        io.to(disconnectedClient.room.name).emit(USER_LOST, {
          room: disconnectedClient.room,
          user: disconnectedClient,
          cursors: state.getCursorsInRoom(disconnectedClient.room.id),
        } as UserLost);
        //update lobby (just pass ids for filtering)
        socket.broadcast.emit(LOBBY_UPDATED, {
          type: "remove-user-from-room",
          room: disconnectedClient.room,
          user: disconnectedClient,
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
      if (!state.getRoom({ roomName: room.name })) {
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

      // add their cursor
      state.addCursor({
        user: dbUser,
        room: { id: dbRoom.id, name: dbRoom.name },
      });

      // generate a filesystem
      // since prisma doesnt support recursive queries for self relations
      // im forced to use this helper function
      const dirs = await prisma.directory.findMany({
        where: { roomId: dbRoom.id, parentDir: null },
        include: getRecursiveInclude({
          depth: 6,
          obj: {
            files: {
              select: {
                id: true,
                fileName: true,
                parentDirId: true,
                lang: true,
                // isDeletable: true,
                // isArchived: true,
              },
            },
          },
        }),
      });

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
        room: state.getRoom({ roomId: dbRoom.id }),
        clients: state.getRoom({ roomId: dbRoom.id }).clients,
        cursors: state.getCursorsInRoom(dbRoom.id),
        fileSystemTree: dirs,
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
        clients: state.getRoom({ roomId: dbRoom.id }).clients,
        cursors: state.getCursorsInRoom(dbRoom.id),
      } as UserJoined);
    });
    // ----------------- ROOM LEAVING -----------------
    socket.on(USER_LEAVE, async ({ room, user }: UserLeave) => {
      socket.leave(room.name);
      state.leaveRoom(socket.id);
      state.removeCursor(user.id || 0);

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
    socket.on(CODE_UPDATE, ({ room, file, user, change }: CodeUpdate) => {
      console.log("code-change", change);
      socket.to(room.name).emit(CODE_UPDATED, {
        user,
        change,
        room,
      } as CodeUpdated);
      // console.log(user);
      // TODO: complete this function def
    });
    socket.on(CODE_SAVE, async ({ file, user, code }: CodeSave, cb) => {
      // console.log("code-change", );
      const res = await state.updateFileContent(file.id, code);

      cb(res);
      // socket.to(room.name).emit(CODE_UPDATED, {
      //   user,
      //   change,
      //   room,
      // } as CodeUpdated);
      // console.log(user);
      // TODO: complete this function def
      // saveCodeToDB({ code: event.value, roomInfo, user });
    });
    socket.on(CURSOR_UPDATE, (payload: CursorUpdate) => {
      const { user, newCursor, room } = payload;

      state.updateCursor({ user, newPos: newCursor.pos });
      socket.to(room.name).emit(CURSOR_UPDATED, {
        user,
        room,
        newCursor: newCursor,
      } as CursorUpdated);
    });
    socket.on(LANG_UPDATE, async (payload) => {
      const { room, lang } = payload;
      state.updateRoom(room.id, { lang: lang });
      io.to(room.name).emit(LANG_UPDATED, state.getRoom({ roomId: room.id }));
    });
    socket.on(CODE_EXEC_START, async (payload) => {
      io.to(payload.room.name).emit(CODE_EXEC_START, payload);
      const res = await execCode({
        lang: payload.lang,
        code: payload.code,
        inputs: [payload.input || ""],
        options: { maxBuffer: 1024 * 1024, timeout: 3000 },
      });

      io.to(payload.room.name).emit(CODE_EXEC_END, {
        ...payload,
        res,
      });
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
        console.log("allowed: ", dbRoom.allowedUsers);
        console.log("req userid: ", user.id);
        console.log("is public", dbRoom.isPublic);
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

const saveCodeToDB = async (payload: {
  code: string;
  user: ISocketUser;
  room: { id: number; name: string };
}) => {
  const { code, room } = payload;

  await prisma.room.update({
    where: {
      id: room.id,
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
