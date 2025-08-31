import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addToast, Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link, Skeleton, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { PageInfo } from "../../pages";
import { useNavigate } from "react-router-dom";
import api, { useLogoutMutation } from "../../api";
import { useDispatch } from "react-redux";
import { setUser } from "../../api/authSlice";

const ProfileSection = ({ children: items = [] }: ProfileSectionProps) => {
    const dispatch = useDispatch();
    const [logout] = useLogoutMutation();
    const navigate = useNavigate();
    const { data: user, isLoading: isAuthLoading } = api.useAuthenticateQuery();

    const [isLoggingIn, setIsProcessing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (user) {
            dispatch(setUser(user));
        }
    }, [dispatch, user]);

    const onLogin = () => {
        setIsProcessing(true);
        window.location.href = `${import.meta.env.VITE_SERVER_HOST}/auth/discord`;
    };

    const onLogout = async () => {
        if (!user) {
            return;
        }
        try {
            setIsProcessing(true);
            await logout().unwrap();
            await navigate("/");
        } catch (err) {
            console.error("Logout failed", err);
            addToast({ title: "Error", color: "danger", description: "Failed to log out" });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user && !isAuthLoading) {
        const startContent = isLoggingIn ? <Spinner size="sm"/> : <FontAwesomeIcon icon={faDiscord} />;
        return <Button startContent={startContent} isDisabled={isLoggingIn} onPress={onLogin} variant="flat">
            Log in with Discord
        </Button>;
    }

    return (
        <Skeleton isLoaded={!!user} className="rounded-full">
            <Dropdown>
                <DropdownTrigger>
                    <div className="relative">
                        <Avatar isDisabled={isAuthLoading} src={user?.avatarUrl} onClick={() => setIsMenuOpen(!isMenuOpen)} className="cursor-pointer"/>
                        {isAuthLoading && <Spinner className="absolute inset-0" size="sm"/>}
                    </div>
                </DropdownTrigger>
                <DropdownMenu>
                    {items.map((item) => (
                        <DropdownItem
                            key={item.label}
                            as={Link}
                            href={item.path}
                        >
                            {item.label}
                        </DropdownItem>
                    )).concat(
                        <DropdownItem key="logout" onPress={async () => await onLogout()} color="danger">
                        Log out
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
        </Skeleton>
    );
};

type ProfileSectionProps = { children?: PageInfo[] }

export default ProfileSection;
