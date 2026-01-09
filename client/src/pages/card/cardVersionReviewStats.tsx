import { Slider } from "@heroui/react";
import { BaseElementProps } from "../../types";
import { IPlaytestReview, statementAnswers, StatementQuestions, Statements } from "common/models/reviews";
import { useMemo } from "react";
import classNames from "classnames";
import dismoji from "../../emojis";

const CardVersionReviewStats = ({ className, style, reviews }: CardVersionReviewStatsProps) => {
    const averages = useMemo(() => {
        const all = (reviews ?? []).reduce<{ [s in keyof Statements]: number[] }>((avg, review) => {
            avg.boring.push(statementAnswers.indexOf(review.statements.boring.toLowerCase()));
            avg.competitive.push(statementAnswers.indexOf(review.statements.competitive.toLowerCase()));
            avg.creative.push(statementAnswers.indexOf(review.statements.creative.toLowerCase()));
            avg.balanced.push(statementAnswers.indexOf(review.statements.balanced.toLowerCase()));
            avg.releasable.push(statementAnswers.indexOf(review.statements.releasable.toLowerCase()));
            return avg;
        }, {
            boring: [],
            competitive: [],
            creative: [],
            balanced: [],
            releasable: []
        });

        const avg: { [s in keyof Statements]?: number } = {
            boring: all.boring.length > 0 ? all.boring.reduce((a, b) => a + b) / all.boring.length : undefined,
            competitive: all.competitive.length > 0 ? all.competitive.reduce((a, b) => a + b) / all.competitive.length : undefined,
            creative: all.creative.length > 0 ? all.creative.reduce((a, b) => a + b) / all.creative.length : undefined,
            balanced: all.balanced.length > 0 ? all.balanced.reduce((a, b) => a + b) / all.balanced.length : undefined,
            releasable: all.releasable.length > 0 ? all.releasable.reduce((a, b) => a + b) / all.releasable.length : undefined
        };
        return avg;
    }, [reviews]);

    const minValue = 0;
    const maxValue = statementAnswers.length - 1;

    const createSlider = (statement: keyof Statements) => {
        const label = StatementQuestions[statement];
        const value = averages[statement] ?? maxValue / 2;
        return <Slider
            classNames={{
                base: "gap-0"
            }}
            label={<span className="text-xs leading-tight italic">{label}</span>}
            minValue={minValue}
            maxValue={maxValue}
            value={value}
            isDisabled={!averages[statement]}
            size="md"
            disableThumbScale
            step={0.1}
            hideValue
            fillOffset={value}
            startContent={dismoji["thumbsdown"]}
            endContent={dismoji["thumbsup"]}
        />;
    };
    return (
        <div className={classNames("flex flex-col gap-1 w-full", className)} style={style}>
            {createSlider("boring")}
            {createSlider("competitive")}
            {createSlider("creative")}
            {createSlider("balanced")}
            {createSlider("releasable")}
        </div>
    );
};

type CardVersionReviewStatsProps = Omit<BaseElementProps, "children"> & { reviews?: IPlaytestReview[] };

export default CardVersionReviewStats;