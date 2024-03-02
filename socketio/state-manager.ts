import { Room } from "@prisma/client";
import prisma, { getRecursiveInclude } from "../lib/prisma";
import { Lang } from "../types";
import { ISocketRoom } from "./events";
import { getRandomColor } from "../lib/utils";
import { IDirectory, ICursor, ICursorPos, IFile } from "./events-types";

interface ISocketUser {
  socketId?: string;
  id?: number;
  fullname?: string;
  email?: string;
  photoURL?: string;
  username?: string;
  room?: {
    id: number;
    name: string;
  };
}

interface ErrorMsg {
  msg: string;
}

interface IRoom extends Room {
  owner: ISocketUser;
}

const RoomsStateManager = ({ initialRooms }: { initialRooms: IRoom[] }) => {
  let rooms: IRoom[] = initialRooms;
  let clients: ISocketUser[] = [];
  let cursors: ICursor[] = [];
  let openFiles: IFile[] = [];

  // let fs: FileSystem[] = [];

  return {
    // ----------- FS ACTIONS -----------
    async getFile(fileId: number): Promise<IFile | null> {
      try {
        let file = openFiles.find((f) => f.id == fileId) || null;
        // if file not found then fetch and add it to state
        if (!file) {
          console.log("file miss", openFiles.length);
          file = await prisma.file.findFirst({
            where: { id: fileId },
          });
          if (file) openFiles.push(file);
          console.log("file cached", openFiles.length);
        }
        return file;
      } catch (err) {
        throw err;
      }
    },
    async updateFileContent(
      fileId: number,
      newContent: string
    ): Promise<IFile | ErrorMsg> {
      try {
        console.log("newconent:", newContent);
        const dbFile = await prisma.file.update({
          where: { id: fileId },
          data: { code: newContent },
        });
        console.log("db", dbFile);
        if (!dbFile) return { msg: "file not found on db" };

        let file = openFiles.find((f) => f.id == fileId);
        if (file) {
          openFiles = openFiles.map((f) => {
            if (f.id === dbFile.id) return dbFile;
            else return f;
          });
        } else {
          openFiles.push(dbFile);
        }
        console.log("state", openFiles);
        return file as IFile;
      } catch (err) {
        throw err;
      }
    },
    async getRoomFS(roomId: number): Promise<IDirectory | null> {
      try {
        const dirs = await prisma.directory.findMany({
          where: { roomId, parentDir: null },
          include: getRecursiveInclude({ depth: 6, obj: { files: true } }),
        });
        const rootFiles = await prisma.file.findMany({
          where: { roomId, parentDirId: null },
          orderBy: { fileName: "asc" },
        });
        const fileSystemTree = [...dirs, ...rootFiles];
        return null;
      } catch (err) {
        throw err;
      }
    },
    // ----------- CURSOR ACTIONS -----------
    getCursorsInRoom(roomId: number): ICursor[] {
      return cursors.filter((c) => c.room.id === roomId);
    },
    addCursor({ user, room }: { user: ISocketUser; room: ISocketRoom }) {
      // return if there exist a cursor with same cursor.user.id
      if (cursors.some((c) => c.user.id === user.id)) return;
      // add otherwise
      cursors.push({
        user,
        room,
        cursor: { pos: { lineNumber: 0, column: 0 } },
        color: getRandomColor(cursors.map((cursor) => cursor.color)),
      });
    },
    updateCursor({ user, newPos }: { user: ISocketUser; newPos: ICursorPos }) {
      // return if no cursor with user.id exist
      if (!cursors.some((c) => c.user.id === user.id)) return;

      // update otherwise
      cursors = cursors.map((c) => {
        if (c.user.id === user.id) {
          return { ...c, pos: newPos };
        } else return c;
      });
    },
    removeCursor(userId: number) {
      cursors = cursors.filter((c) => c.user.id !== userId);
    },
    // ----------- ROOM ACTIONS -----------
    // GET ROOMS
    getrooms() {
      return rooms.map((room) => {
        return {
          ...room,
          clients: clients?.filter((client) => client.room?.id === room.id),
        };
      });
    },

    // GET ROOM
    getroom({ roomId, roomName }: { roomId?: number; roomName?: string }) {
      return {
        ...rooms.find((r) => {
          if (roomId) return r.id == roomId;
          else if (roomName) return r.name == roomName;
        }),
        clients: clients.filter((client) => {
          if (roomId) return client.room?.id === roomId;
          if (roomName) return client.room?.name === roomName;
        }),
      };
    },
    // CREATE ROOMS
    async createRoom({
      newRoom,
      user,
    }: {
      newRoom: { name: string; isPublic: boolean; lang: Lang };
      user: ISocketUser;
    }) {
      try {
        const savedRoom = await prisma.room.create({
          data: {
            name: newRoom.name,
            isPublic: newRoom.isPublic,
            content: "print('hello world')",
            lang: newRoom.lang,
            owner: { connect: { id: 23 } },
            Directory: {
              create: { owner: { connect: { id: user.id } }, name: "root" },
            },
          },
          include: { owner: true },
        });
        rooms.push(savedRoom);
      } catch (err) {
        throw err;
      }
    },
    // UPDATE ROOMS
    async updateRoom(
      roomId: number,
      updatedRoom: {
        name?: string;
        isPublic?: boolean;
        lang?: Lang;
      }
    ): Promise<Room> {
      try {
        const savedRoom = await prisma.room.update({
          where: { id: roomId },
          data: {
            name: updatedRoom.name,
            isPublic: updatedRoom.isPublic,
            lang: updatedRoom.lang,
          },
          include: { owner: true },
        });
        rooms = rooms.map((room) => {
          if (room.id === savedRoom.id) return savedRoom;
          else return room;
        });
        return savedRoom;
      } catch (err) {
        throw err;
      }
    },
    // DELETE ROOMS
    async deleteRoom({ roomId, user }: { roomId: number; user: ISocketUser }) {
      try {
        const deletedRoom = await prisma.room.delete({
          where: { id: roomId },
        });
        rooms = rooms.filter((r) => r.id !== roomId);
      } catch (err) {
        throw err;
      }
    },

    // ----------- SOCKET ACTIONS -----------
    // CONNECT
    async connectClient({
      user,
      socketId,
    }: {
      user: ISocketUser;
      socketId: string;
    }): Promise<ISocketUser> {
      try {
        const dbUser = await prisma.user.findFirst({
          select: { id: true, username: true, photoURL: true },
          where: { id: user.id },
        });
        clients.push({ ...dbUser, socketId });
        return dbUser || {};
      } catch (err) {
        throw err;
      }
    },
    // DISCONNECT
    disconnectClient(socketId: string) {
      const disconnectedClient = clients.find(
        (client) => client.socketId === socketId
      );
      clients = clients.filter((client) => client.socketId !== socketId);
      return disconnectedClient || { socketId };
    },

    // ----------- CLIENT ACTIONS -----------
    // GET CONNECTED CLIENTS
    getConnectedClients() {
      return clients;
    },
    // GET CLIENT WITH user.id
    getConnectedClient(userId: number) {
      return clients.find((client) => client.id === userId);
    },
    // JOIN ROOM
    joinRoom({
      roomId,
      user,
      socketId,
    }: {
      roomId: number;
      user: ISocketUser;
      socketId: string;
    }) {
      try {
        // check if roomId is present
        const room = rooms.find((r) => r.id === roomId);
        if (!room) return { status: "failed", msg: "no such room" };
        clients = clients.map((client) => {
          if (client.socketId === socketId) {
            return { ...client, room };
          } else return client;
        });
      } catch (err) {
        throw err;
      }
    },
    // LEAVE ROOM
    leaveRoom(socketId: string) {
      try {
        clients = clients.map((client) => {
          if (client.socketId === socketId) {
            return { ...client, roomId: undefined };
          } else return client;
        });
      } catch (err) {
        throw err;
      }
    },
  };
};

export default RoomsStateManager;
