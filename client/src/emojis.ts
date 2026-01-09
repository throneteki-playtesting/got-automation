import * as discordEmojis from "discord-emoji";

const dismoji: { [emoji: string]: string } = {};

for (const categoryName in discordEmojis) {
    const categoryEmojis = (discordEmojis as { [category: string]: { [emoji: string]: string }})[categoryName];
    if (typeof categoryEmojis == "object" && categoryEmojis !== null && !Array.isArray(categoryEmojis)) {
        Object.assign(dismoji, categoryEmojis);
    }
}

export const emojis = {
    playtesting: "dart",
    physicalplaytesting: "flower_playing_cards",
    digitalplaytesting: "computer",
    changeLog: "memo",
    changeNotes: "card_file_box",
    implemented: "white_check_mark",
    notimplemented: "no_entry_sign",
    replaced: "twisted_rightwards_arrows",
    reworked: "arrows_clockwise",
    updated: "arrow_double_up",
    bugfixed: "wrench",
    other: "eight_spoked_asterisk"
} as { [emoji: string]: string };

export default dismoji;