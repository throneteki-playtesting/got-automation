import { Navigate, useParams } from "react-router-dom";
import ProjectDetail from "./projectDetail";

const Project = ({ isCreating }: ProjectProps) => {
    const { number } = useParams();

    if (!isCreating) {
        const project = parseInt(number ?? "0");
        if (!number || isNaN(project)) {
            return <Navigate to="/" replace />;
        }
        return (
            <ProjectDetail className="p-2" project={project}/>
        );
    }
    return (
        <div>
            TODO: Create project
        </div>
    );
};

export default Project;

type ProjectProps = { isCreating?: boolean };