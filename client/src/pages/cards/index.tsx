import { Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import LatestCards from "./latestCards";

const Cards = () => {
    const [projects, setProjects] = useState([] as number[]);

    return (
        <div>
            <div className="bg-default-50 p-2 space-y-2">
                <h1>Select a project to view latest cards</h1>
                <Select aria-label="Projects" selectedKeys={projects.map((project) => project.toString())} onSelectionChange={(keys) => setProjects([...keys].map((key) => parseInt(key.toString())))} placeholder="Select project(s)">
                    <SelectItem key={"26"}> Sea of Shadows</SelectItem>
                </Select>
            </div>
            {projects.length > 0 && <LatestCards className="p-2" filter={projects.map((project) => ({ project }))}/>}
        </div>
    );
};

export default Cards;