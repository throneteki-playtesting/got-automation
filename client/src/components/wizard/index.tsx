/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Children, cloneElement, FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
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
        setInternalData((prev) => ({ ...prev, ...(initial ?? {} as DeepPartial<T>) }));
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
                    try {
                        let currentLevel = data;
                        for (const path of detail.path) {
                            if (currentLevel && typeof currentLevel === "object" && path in currentLevel) {
                                currentLevel = currentLevel[path];
                            } else {
                                throw new Error("Path not found!");
                            }
                        }
                    } catch {
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
        id: crypto?.randomUUID ? crypto.randomUUID() : (Math.floor(Math.random() * 100) + 1).toString(), // crypto not available on http
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
        const pagesArr = Children.toArray(pages);
        setTotalPages(pagesArr.filter((page) => React.isValidElement(page)).length);
    }, [pages, setTotalPages]);

    const pageElements = useMemo(() => {
        let totalPages = 0;
        return Children.map(pages, (page) => {
            if (React.isValidElement(page)) {
                return cloneElement(page, {
                    ...page.props,
                    pageNo: ++totalPages
                });
            }
            return page;
        });
    }, [pages]);
    return (
        <div className={classNames("relative w-full overflow-hidden", className)} style={style}>
            <div
                className="flex flex-row transition-transform duration-500 ease-in-out"
                style={{
                    transform: `translateX(-${(currentPage - 1) * 100}%)`
                }}
            >
                {pageElements}
            </div>
        </div>
    );
};

type WizardPageComponent = React.ReactElement<React.ComponentProps<typeof WizardPage>> | false;
type WizardPagesProps = Omit<BaseElementProps, "children"> & { children: WizardPageComponent | WizardPageComponent[] };

export const WizardPage = ({ className, style, children, data, pageNo, allowEmptyValues = false }: WizardPageProps) => {
    const { id, validationErrors, onPageSubmit } = useWizard();

    const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (data) {
            // Controlled
            onPageSubmit(data);
        } else {
            // Uncontrolled (eg. using form data & input names)
            const formData = new FormData(e.target as HTMLFormElement);
            let objData = Object.fromEntries(formData.entries());
            if (!allowEmptyValues) {
                // Sanitises "" values into undefined. Usually helps with validation
                objData = Object.keys(objData).reduce<Record<string, any>>((acc, key) => {
                    const value = objData[key];
                    acc[key] = value === "" ? undefined : value;
                    return acc;
                }, {});
            }
            onPageSubmit(objData);
        }
    }, [allowEmptyValues, data, onPageSubmit]);

    return (
        <Form
            id={`${id}_page_${pageNo ?? 0}`}
            className={classNames("flex-shrink-0 w-full h-full p-1", className)}
            style={style}
            validationErrors={validationErrors}
            onSubmit={onSubmit}
        >
            {children}
        </Form>
    );
};

type WizardPageProps = BaseElementProps & { data?: Record<string, any>, pageNo?: number, allowEmptyValues?: boolean }

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
        (!isFirstPage || onCancel) &&
        <Button type="submit" onPress={onPress} {...buttonProps}>
            {children || (isFirstPage ? cancelContent : backContent)}
        </Button>
    );
};

type WizardBackButtonProps = Omit<ButtonProps, "onPress"> & { backContent?: ReactNode, cancelContent?: ReactNode, onCancel?: () => void };