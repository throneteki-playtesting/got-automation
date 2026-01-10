/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { cloneElement, FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { Button, ButtonProps, Form } from "@heroui/react";
import Joi from "joi";
import { DeepPartial } from "common/types";
import { unflatten } from "flat";
import { merge } from "lodash";
import { BaseElementProps } from "../../types";
import { useWizard, WizardContext, WizardContextProps } from "./context";

export const Wizard = function<T>({ schema, data: initial, onSubmit = () => true, onError = () => true, children }: WizardProps<T>) {
    const [internalData, setInternalData] = useState({} as DeepPartial<T>);
    const [currentPage, setCurrentPage] = useState(1);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [totalPages, setTotalPages] = useState(0);

    const isFirstPage = useMemo(() => currentPage <= 1, [currentPage]);
    const isLastPage = useMemo(() => currentPage >= totalPages, [currentPage, totalPages]);

    useEffect(() => {
        setInternalData(initial ?? {} as DeepPartial<T>);
    }, [initial]);

    const validate = useCallback((data: Record<string, any>, partial = false) => {
        const { error } = schema.validate(data, {
            allowUnknown: true,
            abortEarly: false
        });

        if (error) {
            const inputErrors: Record<string, string> = {};
            error.details.forEach((detail) => {
                if (partial) {
                    // Partial validation should ignore errors for values which do not exist in provided data
                    // This allows for validation for data on a single page, whilst using a full schema
                    const pathValue = detail.path.reduce<any>((currentLevel, key) => {
                        if (currentLevel && typeof currentLevel === "object" && key in currentLevel) {
                            return currentLevel[key];
                        } else {
                            return undefined;
                        }
                    }, data);

                    if (pathValue === undefined) {
                        return;
                    }
                }
                // Needs to match input ids on page
                const inputId = detail.path.join(".");
                inputErrors[inputId] = detail.message;
            });

            if (Object.keys(inputErrors).length > 0) {
                console.error("Validation Error Details:", error.details);
                setValidationErrors(inputErrors);
                return false;
            }
        }

        setValidationErrors({});
        return true;
    }, [schema, setValidationErrors]);

    const onPageSubmit = useCallback((inputData: Record<string, any>) => {
        const pageData = unflatten<Record<string, any>, Record<string, any>>(inputData);

        // Always validate the page first (partial)
        if (validate(pageData, true)) {
            const newData = merge({}, internalData, pageData);
            setInternalData(newData);
            if (isLastPage) {
                // Validate full object
                if (validate(newData)) {
                    onSubmit(newData as T);
                } else {
                    onError(validationErrors);
                }
            } else {
                setCurrentPage((prev) => Math.max(prev + 1, totalPages - 1));
            }
        }
    }, [validate, internalData, isLastPage, onSubmit, onError, validationErrors, totalPages]);

    const onPageBack = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
        setValidationErrors({});
    }, [setCurrentPage, setValidationErrors]);

    const contextValue = useMemo<WizardContextProps<T>>(() => ({
        id: crypto.randomUUID(),
        currentPage,
        totalPages,
        setTotalPages,
        data: internalData,
        setData: setInternalData,
        isFirstPage,
        isLastPage,
        validationErrors,
        onPageSubmit,
        onPageBack
    }), [
        currentPage,
        totalPages,
        setTotalPages,
        internalData,
        setInternalData,
        isFirstPage,
        isLastPage,
        validationErrors,
        onPageSubmit,
        onPageBack
    ]);

    return (
        <WizardContext.Provider value={contextValue}>
            {children}
        </WizardContext.Provider>
    );
};

type WizardProps<T> = {
    schema: Joi.Schema,
    data?: DeepPartial<T>,
    onSubmit?: (data: T) => void,
    onError?: (errors: Record<string, string>) => void,
    children: ReactNode | ReactNode[]
}

export const WizardPages = ({ className, style, children: pages }: WizardPagesProps) => {
    const { currentPage, setTotalPages } = useWizard();

    useEffect(() => {
        const pagesArr = React.Children.toArray(pages);
        setTotalPages(pagesArr.filter((page) => React.isValidElement(page)).length);
    }, [pages, setTotalPages]);

    return (
        <div className={classNames("relative w-full overflow-hidden", className)} style={style}>
            <div
                className="flex flex-row transition-transform duration-500 ease-in-out"
                style={{
                    transform: `translateX(-${(currentPage - 1) * 100}%)`
                }}
            >
                {React.Children.map(pages, (page, index) => {
                    if (React.isValidElement(page)) {
                        return cloneElement(page, {
                            ...page.props,
                            pageNo: index + 1
                        });
                    }
                    return page;
                })}
            </div>
        </div>
    );
};

type WizardPageComponent = React.ReactElement<React.ComponentProps<typeof WizardPage>> | false;
type WizardPagesProps = Omit<BaseElementProps, "children"> & { children: WizardPageComponent | WizardPageComponent[] };

export const WizardPage = ({ className, style, children, data, pageNo }: WizardPageProps) => {
    const { id, validationErrors, onPageSubmit } = useWizard();

    const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (data) {
            onPageSubmit(data);
        } else {
            // If no data is being handled, simply pass in form data as an object
            const formData = new FormData(e.target as HTMLFormElement);
            onPageSubmit(Object.fromEntries(formData.entries()));
        }
    }, [data, onPageSubmit]);

    return (
        <Form
            id={`${id}_page_${pageNo ?? 0}`}
            className={classNames("flex-shrink-0 w-full h-full", className)}
            style={style}
            validationErrors={validationErrors}
            onSubmit={onSubmit}
        >
            {children}
        </Form>
    );
};

type WizardPageProps = BaseElementProps & { data?: Record<string, any>, pageNo?: number }

export const WizardNext = ({ children, nextContent = "Next", submitContent = "Submit", ...buttonProps }: WizardNextButtonProps) => {
    const { id, currentPage, isLastPage } = useWizard();

    return (
        <Button type="submit" form={`${id}_page_${currentPage}`} {...buttonProps}>
            {children || (isLastPage ? submitContent : nextContent)}
        </Button>
    );
};

type WizardNextButtonProps = Omit<ButtonProps, "onPress"> & { nextContent?: ReactNode, submitContent?: ReactNode };

export const WizardBack = ({ children, backContent = "Back", cancelContent = "Cancel", onCancel, ...buttonProps }: WizardBackButtonProps) => {
    const { onPageBack, isFirstPage } = useWizard();

    const onPress = useCallback(() => {
        onPageBack();
        if (isFirstPage && onCancel) {
            onCancel();
        }
    }, [onPageBack, isFirstPage, onCancel]);

    return (
        <Button type="submit" onPress={onPress} {...buttonProps}>
            {children || (isFirstPage ? (onCancel ? cancelContent : null) : backContent)}
        </Button>
    );
};

type WizardBackButtonProps = Omit<ButtonProps, "onPress"> & { backContent?: ReactNode, cancelContent?: ReactNode, onCancel?: () => void };