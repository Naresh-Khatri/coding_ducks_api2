import { Socket } from "socket.io";
import prisma from "../lib/prisma";
import { ISocketRoom, ISocketUser } from "./events";

const clientsStateManager = () => {
  const clientMap = new Map<number, ISocketUser[]>();
  return {
    getClients: () => {
      // Return a copy of all client arrays to prevent modification of the original state
      return Array.from(clientMap.values()).flat();
    },
    addClient: async ({
      userId,
      socketId,
    }: {
      userId: number;
      socketId: string;
    }) => {
      if (!userId) return;
      // Check if an array for this user ID already exists
      if (!clientMap.has(userId)) {
        clientMap.set(userId, []);
      }

      const dbUser = await prisma.user.findFirst({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          photoURL: true,
        },
      });

      const _user = {
        ...dbUser,
        socketId: socketId
      };

      // Add the user object to the array for the user ID
      clientMap.get(userId)?.push(_user);
      // console.log(clientMap);
      return _user;
    },
    removeClient: (socketId: string) => {
        console.log("removing client", socketId);
      // Iterate through all client arrays and remove the user with the matching socket ID
      for (const clients of clientMap.values()) {
        const userIndex = clients.findIndex(
          (client) => client.socketId === socketId
        );
        if (userIndex !== -1) {
          clients.splice(userIndex, 1);
          // Consider checking if the array is empty after removal and potentially removing the key from the map
        }
      }
    },
  };
};

export default clientsStateManager;
