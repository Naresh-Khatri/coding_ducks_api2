import { Room, User } from "@prisma/client";
import prisma from "../lib/prisma";
import { Lang } from "../types";

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
interface IRoom extends Room {
  owner: ISocketUser;
}

const RoomsStateManager = ({ initialRooms }: { initialRooms: IRoom[] }) => {
  let rooms: IRoom[] = initialRooms;
  let clients: ISocketUser[] = [];

  return {
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
      updatedRoom: { name?: string; isPublic?: boolean; lang?: Lang }
    ): Promise<Room[]> {
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
        return rooms;
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
        rooms = rooms.filter((r) => r.id != roomId);
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
    }) {
      try {
        const dbUser = await prisma.user.findFirst({
          select: { id: true, username: true, photoURL: true },
          where: { id: user.id },
        });
        clients.push({ ...dbUser, socketId });
      } catch (err) {
        throw err;
      }
    },
    // DISCONNECT
    async disconnectClient(socketId: string) {
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
