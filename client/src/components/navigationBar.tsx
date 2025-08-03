import { Link, Navbar, NavbarContent, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import { useState } from "react";

const NavigationBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuItems = ["Test1", "Test2"];
    return (
        <Navbar onMenuOpenChange={setIsMenuOpen}>
            <NavbarContent>
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />
                {"Website!"}
            </NavbarContent>
            <NavbarMenu>
                {menuItems.map((item, index) => <NavbarMenuItem key={index}><Link href={item}>{item}</Link></NavbarMenuItem>)}
            </NavbarMenu>
        </Navbar>);
};

export default NavigationBar;