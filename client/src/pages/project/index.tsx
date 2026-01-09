import { useParams } from "react-router-dom";
import ProjectDetail from "./projectDetail";

const Project = ({ isCreating }: ProjectProps) => {
    const { number } = useParams();

    if (!isCreating) {
        if (!number) {
        // TODO: Add standard error page
            return <div>
            Project does not exist
            </div>;
        }
        const project = parseInt(number);

        return (
            <div>
                <div className="bg-default-50 p-2 space-y-2">
                    <ProjectDetail className="p-2" project={project}/>
                </div>
            </div>
        );
    }
    return (
        <div>
            <div className="bg-default-50 p-2 space-y-2">
                <ProjectDetail className="p-2" project={undefined}/>
            </div>
        </div>
    );
};

export default Project;

type ProjectProps = { isCreating?: boolean };