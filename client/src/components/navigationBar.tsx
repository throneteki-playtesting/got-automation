import { Navbar, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import { useState } from "react";
import pages from "../pages";
import { Link } from "react-router-dom";

const NavigationBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <Navbar onMenuOpenChange={setIsMenuOpen}>
            <NavbarContent className="sm:hidden">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                />
            </NavbarContent>
            <NavbarContent className="hidden sm:flex">
                {pages.map((page) => <NavbarItem key={page.path}>
                    <Link to={page.path} className="text-large">{page.label}</Link>
                </NavbarItem>)}
            </NavbarContent>
            {"GOT Automation (WIP)"}
            <NavbarMenu>
                {pages.map((page) => <NavbarMenuItem key={page.path}><Link to={page.path}>{page.label}</Link></NavbarMenuItem>)}
            </NavbarMenu>
        </Navbar>);
};

export default NavigationBar;