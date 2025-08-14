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
const ABILITY_TEXT_REGEX = /^((?:(?:Forced )?(?:Reaction|Interrupt)|(?:When Revealed)|(?:(?:Plot |Draw |Marshaling |Challenges |Dominance |Standing |Taxation )?Action)):)/g;
const TRAIT_HIGHLIGHT_REGEX = /\*\*\*(.+?)\*\*\*/g;
const ICON_REGEX = /(?::([a-zA-Z0-9_]+):|\[([a-zA-Z0-9_]+)\])/g;
export const AutoTextConversions = Extension.create({
    name: "autoTextConversions",

    addProseMirrorPlugins: () => [
        new Plugin({
            appendTransaction: (_transactions, _oldState, newState) => {
                const { tr } = newState;
                let modified = false;

                const { trait, triggeredAbility } = newState.schema.marks;
                const thronesIconType = newState.schema.nodes.thronesIcon;

                newState.doc.descendants((node, pos) => {
                    if (!node.isText) return;

                    const text = node.text || "";
                    const patterns: { regex: RegExp; handler: (match: RegExpMatchArray, start: number, end: number) => void }[] = [
                        {
                            regex: TRAIT_HIGHLIGHT_REGEX,
                            handler: (match, start, end) => {
                                const innerText = match[1];
                                tr.replaceRangeWith(start, end, newState.schema.text(innerText, [trait.create()]));
                                tr.removeStoredMark(trait);
                                modified = true;
                            }
                        },
                        {
                            regex: ABILITY_TEXT_REGEX,
                            handler: (match, start, end) => {
                                const innerText = match[1];
                                tr.replaceRangeWith(start, end, newState.schema.text(innerText, [triggeredAbility.create()]));
                                tr.removeStoredMark(triggeredAbility);
                                modified = true;
                            }
                        },
                        {
                            regex: ICON_REGEX,
                            handler: (match, start, end) => {
                                const iconName = match[1] || match[2];
                                if (abilityIcons[iconName]) {
                                    tr.replaceRangeWith(
                                        start,
                                        end,
                                        thronesIconType.create({ name: iconName })
                                    );
                                    modified = true;
                                }
                            }
                        }
                    ];

                    for (const { regex, handler } of patterns) {
                        let match = regex.exec(text);
                        while (match !== null) {
                            if (match.index === regex.lastIndex) {
                                // Prevent zero-length matches from stalling the loop
                                regex.lastIndex++;
                            }
                            const start = pos + match.index;
                            const end = start + match[0].length;
                            handler(match, start, end);

                            match = regex.exec(text);
                        }
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
    content: "text*",
    // atom: true,
    addAttributes: () => ({ name: { default: null } }),
    parseHTML: () => [
        {
            tag: "span[data-thrones-icon]",
            getAttrs: dom => ({
                name: (dom as HTMLElement).getAttribute("data-thrones-icon")
            })
        }
    ],
    // renderHTML: ({ node }) => ({ dom: document.createTextNode(`[${node.attrs.name}]`) }),
    renderHTML: ({ node }) => [
        "span",
        `[${node.attrs.name}]`
    ],
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
                return commands.insertContent([
                    {
                        type: "thronesIcon",
                        attrs: { name }
                    }
                    // {
                    //     type: "text",
                    //     text: " "
                    // }
                ]);
            }
    })
});

export const NewLine = HardBreak.extend({
    addKeyboardShortcuts() {
        return { Enter: () => this.editor.commands.setHardBreak() };
    }
});