import { Permission } from "common/models/user";
import { ReactNode } from "react";
import { SingleOrArray } from "common/types";
import { asArray, hasPermission } from "common/utils";
import { useSelector } from "react-redux";
import { RootState } from "../api/store";

// TODO: Bake this directly into pages, potentially having them extend from this?
// TODO: Better unauthorized page
const Page = ({ children, required }: PageProps) => {
    const user = useSelector((state: RootState) => state.auth.user);

    const permissions = asArray(required ?? []);
    if (!hasPermission(user, ...permissions)) {
        return <div>Unauthorized</div>;
    }

    return <>{children}</>;
};
type PageProps = { children: ReactNode, required?: SingleOrArray<Permission> }

export default Page;