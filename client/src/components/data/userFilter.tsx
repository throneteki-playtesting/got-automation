import { Avatar, Select, SelectItem, SharedSelection } from "@heroui/react";
import { User } from "common/models/user";
import { useGetUsersQuery } from "../../api";
import { useCallback } from "react";

const UserFilter = ({ label = "Users", setUsers, users = [] }: UserFilterProps) => {
    const { data, isLoading } = useGetUsersQuery();

    const handleSelectionChange = useCallback((keys: SharedSelection) => {
        setUsers(
            keys === "all"
                ? data!
                : Array.from(keys).map((discordId) => data!.find(user => user.discordId === discordId)!).filter(Boolean)
        );
    }, [data, setUsers]);

    return <Select
        isLoading={isLoading}
        label={label}
        selectionMode={"multiple"}
        isMultiline
        items={data ?? []}
        selectedKeys={users.map((user) => user.discordId)}
        renderValue={(items) => <div className="flex gap-1">
            {items.map((item) => (
                <Avatar key={item.data?.discordId} size="sm" src={item.data?.avatarUrl}/>
            ))}
        </div>}
        onSelectionChange={handleSelectionChange}
    >
        {
            (user) => <SelectItem key={user.discordId} startContent={<Avatar src={user.avatarUrl}/>}>{user.displayname}</SelectItem>
        }
    </Select>;
};

type UserFilterProps = { label?: string, setUsers: (users: User[]) => void, users?: User[] }

export default UserFilter;