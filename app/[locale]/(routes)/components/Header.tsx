import { getUser } from "@/actions/get-user";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import SupportComponent from "@/components/support";
import FulltextSearch from "./FulltextSearch";
import { HeaderAvatar } from "./Avatar";

type Props = {
  id: string;
  lang: string;
};

const Header = async ({ id, lang }: Props) => {
  const user = await getUser();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-20">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <FulltextSearch />
        </div>
        <div className="flex items-center gap-2">
          {/* <CommandComponent /> */}
          {/* <Feedback /> */}
          <ThemeToggle />
          <SupportComponent />

          <HeaderAvatar
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            }}
          />
        </div>
      </div>
      <Separator />
    </>
  );
};

export default Header;
// import Feedback from "./Feedback";
// import FulltextSearch from "./FulltextSearch";
// import Link from "next/link";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarMenuButton,
//   SidebarTrigger,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import { ThemeToggle } from "@/components/ThemeToggle";
// import SupportComponent from "@/components/support";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@radix-ui/react-dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
// import {
//   BadgeDollarSign,
//   ChevronsUpDown,
//   LayoutDashboard,
//   LogOut,
//   Settings,
// } from "lucide-react";
// import { getUser } from "@/actions/get-user";
// import { signOut } from "next-auth/react";

// type Props = {
//   id: string;
//   lang: string;
// };

// /**
//  * Header Component - Task Group 3.2
//  *
//  * Reorganized header for new layout with shadcn dashboard-01 pattern.
//  *
//  * Layout Structure:
//  * - Left side: SidebarTrigger (mobile menu), FulltextSearch
//  * - Right side: CommandComponent, Feedback, ThemeToggle, SupportComponent
//  *
//  * Changes from previous version:
//  * - Removed AvatarDropdown (functionality moved to nav-user section in sidebar)
//  * - Removed unused props: name, email, avatar (now only used by nav-user)
//  * - Optimized spacing and alignment for new layout
//  * - SidebarTrigger added in Task 2.8.0 for mobile menu control
//  *
//  * Note: User profile functionality (avatar, name, email, user actions) is now
//  * handled by the NavUser component in the sidebar footer (Task 3.1).
//  */

// const Header = async ({ id, lang }: Props) => {
//   const user = await getUser();
//   // const { isMobile } = useSidebar();

//   const avatarUrl =
//     user.avatar || `${process.env.NEXT_PUBLIC_APP_URL}/images/nouser.png`;
//   const userInitials = user.name
//     ? user.name
//         .split(" ")
//         .map((n) => n[0])
//         .join("")
//         .toUpperCase()
//         .slice(0, 2)
//     : "U";
//   return (
//     <>
//       <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//         <div className="flex items-center gap-2">
//           <SidebarTrigger className="-ml-1" />
//           <Separator orientation="vertical" className="mr-2 h-4" />
//           <FulltextSearch />
//         </div>
//         <div className="flex items-center gap-2">
//           {/* <CommandComponent /> */}
//           {/* <Feedback /> */}
//           <ThemeToggle />
//           <SupportComponent />
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <SidebarMenuButton
//                 size="lg"
//                 className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//               >
//                 <Avatar className="h-8 w-8 rounded-lg">
//                   <AvatarImage src={avatarUrl} alt={user.name || "User"} />
//                   <AvatarFallback className="rounded-lg">
//                     {userInitials}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="grid flex-1 text-left text-sm leading-tight">
//                   <span className="truncate font-semibold">{user.name}</span>
//                   <span className="truncate text-xs">{user.email}</span>
//                 </div>
//                 <ChevronsUpDown className="ml-auto size-4" />
//               </SidebarMenuButton>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
//               // side={isMobile ? "bottom" : "right"}
//               align="end"
//               sideOffset={4}
//             >
//               <DropdownMenuLabel className="p-0 font-normal">
//                 <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//                   <Avatar className="h-8 w-8 rounded-lg">
//                     <AvatarImage src={avatarUrl} alt={user.name || "User"} />
//                     <AvatarFallback className="rounded-lg">
//                       {userInitials}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="grid flex-1 text-left text-sm leading-tight">
//                     <span className="truncate font-semibold">{user.name}</span>
//                     <span className="truncate text-xs">{user.email}</span>
//                   </div>
//                 </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem asChild>
//                 <Link href="/projects/dashboard">
//                   <LayoutDashboard className="mr-2 h-4 w-4" />
//                   Todo Dashboard
//                 </Link>
//               </DropdownMenuItem>

//               <DropdownMenuItem asChild>
//                 <Link href={`/crm/dashboard/${user.id}`}>
//                   <BadgeDollarSign className="mr-2 h-4 w-4" />
//                   Sales Dashboard
//                 </Link>
//               </DropdownMenuItem>

//               <DropdownMenuSeparator />

//               <DropdownMenuItem asChild>
//                 <Link href="/profile">
//                   <Settings className="mr-2 h-4 w-4" />
//                   Profile Settings
//                 </Link>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={() => signOut()}>
//                 <LogOut className="mr-2 h-4 w-4" />
//                 Logout
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//       <Separator />
//     </>
//   );
// };

// export default Header;
