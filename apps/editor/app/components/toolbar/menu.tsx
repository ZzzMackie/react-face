import { Button } from "@/components/ui/button"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
interface MenuItem {
    name: string,
    icon: string,
    path: string
}
export default function Menu() {
    const menuList: MenuItem[] = [
        {
            name: "Pay",
            icon: "pay",
            path: "/",
        },
        {
            name: "Cart",
            icon: "car",
            path: "/",
        },
        {
            name: "Save",
            icon: "save",
            path: "/",
        },
        {
            name: "User",
            icon: "user",
            path: "/",
        },
        
        
    ]
  return (
    <div className="editor_menu__wrapper flex items-center gap-4">
        {menuList.map((item) => (
            <div className="editor_menu__item" key={item.name} >
                {
                    item.icon === "user" ? 
                        <Avatar className="editor_menu__item_avatar cursor-pointer">
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        : <Button className="editor_menu__item_button cursor-pointer">
                            <span>{item.name}</span>
                        </Button>
                }
            </div>
        ))}
    </div>
  );
}