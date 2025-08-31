import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link, Navbar, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import { useMemo, useState } from "react";
import ProfileSection from "./profileSection";
import { isVisibleFor, navigationItems, profileMenuItems } from "../../pages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { RootState } from "../../api/store";

const NavigationBar = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSubMenu, setOpenSubmenu] = useState<string>();

    const navItems = useMemo(() =>
        navigationItems
            .filter((item) => isVisibleFor(item, user))
            .map((navItem) => {
                if (navItem.subPages && navItem.subPages.length > 0) {
                    return (
                        <Dropdown onOpenChange={(isOpen) => {
                            if (isOpen) {
                                setOpenSubmenu(navItem.label);
                            } else {
                                setOpenSubmenu(undefined);
                            }
                        }}>
                            <DropdownTrigger className="cursor-pointer">
                                <Link className="text-large flex gap-1">
                                    <span>{navItem.label}</span>
                                    <FontAwesomeIcon size="xs" className={classNames("transition-transform", { "rotate-180": openSubMenu === navItem.label })} icon={faChevronUp}/>
                                </Link>
                            </DropdownTrigger>
                            <DropdownMenu>
                                {
                                    navItem.subPages.map((subPage) => (
                                        <DropdownItem key={subPage.label} as={Link} href={subPage.path}>
                                            {subPage.label}
                                        </DropdownItem>
                                    ))
                                }
                            </DropdownMenu>
                        </Dropdown>
                    );
                }
                return <Link href={navItem.path} className="text-large">{navItem.label}</Link>;
            }), [openSubMenu, user]);

    return (
        <Navbar onMenuOpenChange={setIsMenuOpen}>
            <NavbarContent className="sm:hidden">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                />
            </NavbarContent>
            <NavbarContent className="hidden sm:flex">
                {navItems.map((navItem, index) => <NavbarItem key={index}>{navItem}</NavbarItem>)}
            </NavbarContent>
            {"GOT Automation (WIP)"}
            <ProfileSection>
                {profileMenuItems}
            </ProfileSection>
            <NavbarMenu>
                {navItems.map((navItem, index) => <NavbarMenuItem key={index}>{navItem}</NavbarMenuItem>)}
            </NavbarMenu>
        </Navbar>);
};

export default NavigationBar;