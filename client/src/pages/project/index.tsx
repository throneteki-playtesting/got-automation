import { Navigate, useParams } from "react-router-dom";
import ProjectDetail from "./projectDetail";
import { useMemo } from "react";

const Project = ({ isCreating = false }: ProjectProps) => {
    const { number } = useParams();

    const project = useMemo(() => {
        const parsed = parseInt(number ?? "0");
        return !number || isNaN(parsed) ? undefined : parsed;
    }, [number]);

    if (!isCreating && !project) {
        return <Navigate to="/" replace />;
    }
    return (
        <ProjectDetail key={project} project={project}/>
    );
};

export default Project;

type ProjectProps = { isCreating?: boolean };