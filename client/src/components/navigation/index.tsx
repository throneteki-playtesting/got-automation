import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link, Navbar, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import { useCallback, useMemo, useState } from "react";
import ProfileSection from "./profileSection";
import { isMenuItem, isPageItem, isVisibleFor, MenuItem, NavItem, navItems, PageItem, profileItems } from "../../pages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { RootState } from "../../api/store";

const NavigationBar = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSubMenus, setOpenSubmenus] = useState<Set<string>>(new Set());

    const createItem = useCallback((navItem: NavItem) => {
        const createPageItem = (pageItem: PageItem) => {
            return <Link href={pageItem.path} className="text-large">{pageItem.label}</Link>;
        };

        const createMenuItem = (menuItem: MenuItem, parentItems: MenuItem[] = []) => {
            const uniqueLabel = parentItems.map((pi) => pi.label).concat(menuItem.label).join(".");
            return (
                <Dropdown onOpenChange={(isOpen) => {
                    if (isOpen) {
                        setOpenSubmenus(openSubMenus.add(uniqueLabel));
                    } else {
                        openSubMenus.delete(uniqueLabel);
                        setOpenSubmenus(openSubMenus);
                    }
                }}>
                    <DropdownTrigger className="cursor-pointer">
                        <Link className="text-large flex gap-1">
                            <span>{menuItem.label}</span>
                            <FontAwesomeIcon size="xs" className={classNames("transition-transform", { "rotate-180": openSubMenus.has(uniqueLabel) })} icon={faChevronUp}/>
                        </Link>
                    </DropdownTrigger>
                    <DropdownMenu>
                        {
                            menuItem.subPages.filter((subPage) => isVisibleFor(subPage, user)).map((subPage) => {
                                if (isMenuItem(subPage)) {
                                    return (
                                        <DropdownItem key={subPage.label} >
                                            {createMenuItem(subPage, parentItems.concat(menuItem))}
                                        </DropdownItem>
                                    );
                                }
                                if (isPageItem(subPage)) {
                                    return (
                                        <DropdownItem key={subPage.label} as={Link} href={subPage.path}>
                                            {subPage.label}
                                        </DropdownItem>
                                    );
                                }
                                return null;
                            })
                        }
                    </DropdownMenu>
                </Dropdown>
            );
        };

        if (isPageItem(navItem)) {
            return createPageItem(navItem);
        }
        if (isMenuItem(navItem)) {
            return createMenuItem(navItem);
        }
    }, [openSubMenus, user]);

    const items = useMemo(() => navItems.filter((item) => isVisibleFor(item, user)).map(createItem), [createItem, user]);

    return (
        <Navbar onMenuOpenChange={setIsMenuOpen}>
            <NavbarContent className="sm:hidden">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                />
            </NavbarContent>
            <NavbarContent className="hidden sm:flex">
                {items.map((navItem, index) => <NavbarItem key={index}>{navItem}</NavbarItem>)}
            </NavbarContent>
            {"GOT Automation (WIP)"}
            <ProfileSection>
                {profileItems}
            </ProfileSection>
            <NavbarMenu>
                {items.map((navItem, index) => <NavbarMenuItem key={index}>{navItem}</NavbarMenuItem>)}
            </NavbarMenu>
        </Navbar>);
};

export default NavigationBar;