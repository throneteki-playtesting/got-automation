import { EditorContent, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import { BaseElementProps } from "../../../types";
import { Dispatch, SetStateAction } from "react";
import { abilityIcons } from "../../../utilities";
import { Button, ButtonGroup } from "@heroui/react";
import ThronesIcon, { Icon } from "../../thronesIcon";
import { AbilityIcon, AutoTriggeredAbility, NewLine, Trait, TriggeredAbility } from "./editorExtensions";

export const AbilityTextEditor = ({ value: text, setValue: setText }: AbilityTextEditorProps<string>) => {
    const TextDocument = Document.extend({
        content: "inline*",
        marks: "_"
    });

    const editor = useEditor({
        extensions: [TextDocument, Text, TriggeredAbility, AutoTriggeredAbility, Trait, AbilityIcon, NewLine],
        content: text,
        onUpdate({ editor }) {
            const html = editor.getHTML().replace(/<br\s*\/?>/gi, "\n");
            setText(html);
        },
        editorProps: {
            attributes: {
                class: "whitespace-pre-wrap min-h-[6.5rem] focus:outline-none p-1"
            }
        }
    });

    return (
        <div className="space-y-2 bg-default-100 p-2 rounded-xl">
            <div className="flex flex-wrap gap-1">
                <ButtonGroup size="sm" >
                    <Button
                        isIconOnly={true}
                        className="font-crimson italic font-bold text-medium"
                        onPress={() => editor.chain().focus().toggleTrait().run()}
                    >
                        T
                    </Button>
                    {
                        Object.keys(abilityIcons).map((icon) => (
                            <Button key={icon} onPress={() => editor.chain().focus().insertThronesIcon(icon).run()} isIconOnly={true}>
                                <ThronesIcon name={icon as Icon}/>
                            </Button>
                        ))
                    }
                </ButtonGroup>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
};

type AbilityTextEditorProps<T> = Omit<BaseElementProps, "children"> & { value?: T, setValue: Dispatch<SetStateAction<T | undefined>> };


export default AbilityTextEditor;