import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";

const Error = ({ label = "Unknown Error", content }: ErrorProps) => {
    return <div className="w-full h-full flex justify-center align-center">
        <div className="flex flex-col align-center">
            <FontAwesomeIcon icon={faExclamationTriangle} size="5x" widthAuto />
            {label && <div>{label}</div>}
            {content && <div>{content}</div>}
        </div>
    </div>;
};

type ErrorProps = { label?: string, content?: ReactNode | ReactNode[] }

export default Error;