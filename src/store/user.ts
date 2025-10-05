import type { UserCredentials } from "@/apis/requests/user/schema";
import { persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { TOKEN_KEY } from "@/lib/request";
interface User extends Pick<UserCredentials, "token"> {
  setCredentials: (data: Pick<UserCredentials, "token">) => void
}
export const userInfoStore = create<User>()(
  persist(
    (set) => ({
      token: "",
      setCredentials: (data: Pick<UserCredentials, "token">) => {
        localStorage.setItem(TOKEN_KEY, data.token);
        set(data);
      },
    }),
    {
      name: "user-store",
      partialize: (s) => ({ token: s.token }),
      storage: createJSONStorage(() => localStorage),

      onRehydrateStorage: () => (state) => {
        console.log('恢复',state)
        // state 就是刚刚恢复出来的值（可能为 undefined）
        if (!state) return;
      },
    }
  )
);
