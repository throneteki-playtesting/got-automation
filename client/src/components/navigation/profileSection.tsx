import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addToast, Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Link, Spinner } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { PageInfo } from "../../pages";
import { AppDispatch } from "../../api/store";
import { useDispatch } from "react-redux";
import { loginAsync, logoutAsync } from "../../api/authSlice";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../api/hooks";

const ProfileSection = ({ children: items = [] }: ProfileSectionProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user, status } = useAuth();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (status === "idle") {
            dispatch(loginAsync());
        }
    }, [dispatch, status]);

    const isLoading = useMemo(() => status === "loading" || isProcessing, [status, isProcessing]);

    const onLogin = () => {
        setIsProcessing(true);
        window.location.href = "http://localhost:8080/auth/discord";
    };

    const onLogout = async () => {
        if (!user) {
            return;
        }
        try {
            setIsProcessing(true);
            await dispatch(logoutAsync());
            await navigate("/");
        } catch (err) {
            console.error("Logout failed", err);
            addToast({ title: "Error", color: "danger", description: "Failed to log out" });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        const startContent = isLoading ? <Spinner size="sm"/> : <FontAwesomeIcon icon={faDiscord} />;
        return <Button startContent={startContent} isDisabled={isLoading} onPress={onLogin} variant="flat">
            Log in with Discord
        </Button>;
    }

    return (
        <Dropdown>
            <DropdownTrigger>
                <div className="relative">
                    <Avatar isDisabled={isLoading} src={user.avatarUrl} onClick={() => setIsMenuOpen(!isMenuOpen)} className="cursor-pointer"/>
                    {isLoading && <Spinner className="absolute inset-0" size="sm"/>}
                </div>
            </DropdownTrigger>
            <DropdownMenu>
                {items.map((item) => (
                    <DropdownItem
                        key={item.path}
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
    );
};

type ProfileSectionProps = { children?: PageInfo[] }

export default ProfileSection;
