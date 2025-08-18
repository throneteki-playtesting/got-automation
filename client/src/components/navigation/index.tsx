import { Link, Navbar, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import { useMemo, useState } from "react";
import ProfileSection from "./profileSection";
import { isVisibleFor, navigationItems, profileMenuItems } from "../../pages";
import { useAuth } from "../../api/hooks";

const NavigationBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();

    const navItems = useMemo(() => navigationItems.filter((item) => isVisibleFor(item, user)), [user]);
    return (
        <Navbar onMenuOpenChange={setIsMenuOpen}>
            <NavbarContent className="sm:hidden">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                />
            </NavbarContent>
            <NavbarContent className="hidden sm:flex">
                {navItems.map((item) => (
                    <NavbarItem key={item.path}>
                        <Link href={item.path} className="text-large">{item.label}</Link>
                    </NavbarItem>)
                )}
            </NavbarContent>
            {"GOT Automation (WIP)"}
            <ProfileSection>
                {profileMenuItems}
            </ProfileSection>
            <NavbarMenu>
                {navItems.map((item) => (
                    <NavbarMenuItem key={item.path}>
                        <Link href={item.path}>{item.label}</Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>);
};

export default NavigationBar;