import type { User } from "~/generated/prisma"

declare module 'h3' {
  interface H3EventContext {
    user?: User;
  }
}