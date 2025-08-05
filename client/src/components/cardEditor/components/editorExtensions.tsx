import { Extension, Mark, mergeAttributes, Node } from "@tiptap/core";
import HardBreak from "@tiptap/extension-hard-break";
import { Plugin } from "prosemirror-state";
import { abilityIcons } from "../../../utilities";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    trait: {
        toggleTrait: () => ReturnType;
    },
    triggeredAbility: {
        toggleTriggeredAbility: () => ReturnType
    },
    thronesIcon: {
        insertThronesIcon: (name: string) => ReturnType;
    }
  }
}


export const TriggeredAbility = Mark.create({
    name: "triggeredAbility",
    parseHTML: () => [{ tag: "b" }],
    renderHTML: ({ HTMLAttributes }) => ["b", HTMLAttributes, 0],
    addCommands: () => ({
        toggleTriggeredAbility: () =>
            ({ commands }) => {
                commands.unsetMark("trait");
                return commands.toggleMark("triggeredAbility");
            }
    })
});
const TRIGGERED_REGEX = /^((?:(?:Forced )?(?:Reaction|Interrupt)|(?:When Revealed)|(?:(?:Plot |Draw |Marshaling |Challenges |Dominance |Standing |Taxation )?Action)):)/;
export const AutoTriggeredAbility = Extension.create({
    name: "autoTriggeredAbility",
    addProseMirrorPlugins: () => [
        new Plugin({
            appendTransaction: (_transactions, _oldState, newState) => {
                const { tr } = newState;
                let modified = false;
                newState.doc.descendants((node, pos) => {
                    if (!node.isText) {
                        return;
                    }
                    const { triggeredAbility } = newState.schema.marks;
                    const text = node.text || "";
                    const hasMark = node.marks.some(mark => mark.type === triggeredAbility);
                    const matches = text.match(TRIGGERED_REGEX);

                    if (matches && !hasMark) {
                        const start = pos + matches.index!;
                        const end = start + matches[0].length;
                        tr.addMark(start, end, triggeredAbility.create());
                        tr.removeStoredMark(triggeredAbility);
                        modified = true;
                    } else if (!matches && hasMark) {
                        tr.replaceRangeWith(pos, pos + node.nodeSize, newState.schema.text(text));
                        modified = true;
                    }
                });

                return modified ? tr : null;
            }
        })
    ]
});

export const Trait = Mark.create({
    name: "trait",
    addOptions: () => ({ HTMLAttributes: { class: "italics" } }),
    parseHTML: () => [{ tag: "i" }],
    renderHTML: ({ HTMLAttributes }) => ["i", mergeAttributes(HTMLAttributes, { style: "font-weight: 700" }), 0],
    addCommands: () => ({
        toggleTrait: () =>
            ({ commands }) => {
                commands.unsetMark("triggeredAbility");
                return commands.toggleMark("trait");
            }
    })
});

export const AbilityIcon = Node.create({
    name: "thronesIcon",
    group: "inline",
    inline: true,
    atom: true,
    addAttributes: () => ({ name: { default: null } }),
    parseHTML: () => [
        {
            tag: "span[data-thrones-icon]",
            getAttrs: dom => ({
                name: (dom as HTMLElement).getAttribute("data-thrones-icon")
            })
        }
    ],
    renderHTML: ({ node }) => ({ dom: document.createTextNode(`[${node.attrs.name}]`) }),
    addNodeView: () =>
        ({ node }) => {
            const span = document.createElement("span");
            span.className = "font-thronesdb";
            span.textContent = abilityIcons[node.attrs.name];
            span.setAttribute("data-thrones-icon", node.attrs.name);
            return {
                dom: span
            };
        },
    addCommands: () => ({
        insertThronesIcon: (name: string) =>
            ({ commands }) => {
                return commands.insertContent({
                    type: "thronesIcon",
                    attrs: { name }
                });
            }
    })
});

export const NewLine = HardBreak.extend({
    addKeyboardShortcuts() {
        return { Enter: () => this.editor.commands.setHardBreak() };
    }
});