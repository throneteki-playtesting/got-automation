import { useParams } from "react-router-dom";
import CardDetail from "./cardDetail";

const Card = () => {
    const { project: projectParam, number: numberParam } = useParams();

    if (!projectParam || !numberParam) {
        return <div>
            Project or number is invalid!
        </div>;
    }

    const project = parseInt(projectParam);
    const number = parseInt(numberParam);

    return (
        <div>
            <div className="bg-default-50 p-2 space-y-2">
                <CardDetail className="p-2" project={project} number={number}/>
            </div>
        </div>
    );
};

export default Card;