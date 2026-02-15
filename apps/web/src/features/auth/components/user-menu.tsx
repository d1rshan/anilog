import { User, LogOut, Shield, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "../lib/hooks";

export const UserMenu = () => {
  const router = useRouter();
  const { isAuthenticated, user, username } = useAuth();

  if (!isAuthenticated || !user || !username) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all active:scale-95 focus:outline-none cursor-pointer">
          <User className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 border border-white/10 bg-black/80 backdrop-blur-2xl p-2 shadow-2xl rounded-lg" 
        align="end" 
        sideOffset={16}
      >
        <div className="px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-tight">{user.name}</p>
              <p className="truncate text-[10px] font-bold text-muted-foreground/60">{user.email}</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-white/5 mx-2" />
        <div className="p-1">
          <DropdownMenuItem
            className="cursor-pointer rounded-xl py-2 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:bg-white/5 focus:text-foreground transition-colors"
            onClick={() => router.push(`/${username}`)}
          >
            <Shield className="mr-2 h-3.5 w-3.5" />
            Profile Archive
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl py-2 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground focus:bg-white/5 focus:text-foreground transition-colors"
          >
            <Settings className="mr-2 h-3.5 w-3.5" />
            Settings
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="bg-white/5 mx-2" />
        <div className="p-1">
          <DropdownMenuItem
            className="cursor-pointer rounded-xl py-2 px-3 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/login");
                  },
                },
              });
            }}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
