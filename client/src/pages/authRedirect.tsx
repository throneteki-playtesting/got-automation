import { addToast, Spinner } from "@heroui/react";
import { AuthStatus } from "common/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../api/store";

const AuthRedirect = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get("status") as AuthStatus;
    useEffect(() => {
        const process = async function() {
            if (status === "error") {
                addToast({ title: "Failed to login", description: "An error has occurred during login process. Please contact an administrator", color: "danger" });
            } else if (status === "unauthorized") {
                // TODO: maybe remove this in favor of just limited pages and instructions on how to join discord
                addToast({ title: "Unauthorized", description: "Failed to authorize your discord details. Please make sure you are within the appropriate discord server", color: "warning" });
            }
            navigate("/", { replace: true });
        };
        process();
    }, [dispatch, navigate, status]);
    return <Spinner size="lg" className="h-full"/>;
};

export default AuthRedirect;