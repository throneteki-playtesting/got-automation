import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer, { Viewport } from "puppeteer";
import { BufferCollection } from "buffer-collection";
import Project from "../data/models/project";
import * as Cards from "common/models/cards";
import PlaytestingCard from "@/data/models/cards/playtestingCard";
import RenderedCard from "@/data/models/cards/renderedCard";
import CardCollection from "@/data/models/cards/cardCollection";
import { logger } from "@/services";
import { asArray, asSingle } from "common/utils";
import { SingleOrArray } from "common/types";

export type RenderType = "single" | "batch";
type RenderHtmlOptions = { copies?: number, perPage?: number, includeCSS?: boolean, includeJS?: boolean };

class RenderingService {
    public async syncImages(cards: CardCollection, override = false) {
        const filePathFunc = (card: PlaytestingCard) => `./public/img/${card.project}/${card.number}@${card.version}.png`;
        const syncing = override ? [...cards.all] : cards.all.filter((card) => !fs.existsSync(filePathFunc(card)));

        const imgBuffers = await this.asPNG(syncing.map((card) => card.toRenderedCard()));

        const promises: Promise<unknown>[] = [];
        while (syncing.length > 0)
        {
            const card = syncing.shift();
            const imgBuffer = imgBuffers.shiftBuffer();
            const filePath = filePathFunc(card);
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                // Make directory immediately, in case conflicts with writing file later
                await fs.promises.mkdir(dirPath, { recursive: true });
            }
            const promise = fs.promises.writeFile(filePath, imgBuffer)
                .catch((rejected) => logger.error(`Failed to write "${filePath}": ${rejected}`));
            promises.push(promise);
        }

        await Promise.allSettled(promises);
    }
    public async syncPDFs(project: Project, cards: CardCollection, override = false) {
        const all = cards.latest;
        const updated = cards.latest.filter((card) => card.isChanged);
        const filePathFunc = (collection: "all"|"updated") => `./public/pdf/${project.number}/${project.version + 1}_${collection}.pdf`;

        const allFilePath = filePathFunc("all");

        const dirPath = path.dirname(allFilePath);
        if (!fs.existsSync(dirPath)) {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }

        if (override || !fs.existsSync(allFilePath)) {
            const allPdfBuffer = await this.asPDF(all.map((card) => card.toRenderedCard()));
            await fs.promises.writeFile(allFilePath, allPdfBuffer);
        }

        if (updated.length > 0) {
            const updatedFilePath = filePathFunc("updated");
            if (override || !fs.existsSync(updatedFilePath)) {
                const updatedPdfBuffer = await this.asPDF(updated.map((card) => card.toRenderedCard()));
                await fs.promises.writeFile(updatedFilePath, updatedPdfBuffer);
            }
        }
    }
    public async asPNG(data: RenderedCard): Promise<Buffer>;
    public async asPNG(data: RenderedCard[]): Promise<BufferCollection>;
    public async asPNG(cards: SingleOrArray<RenderedCard>) {
        const width = 240;
        const height = 333;
        const browser = await this.launchPuppeteer();
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(() => {
            const style = document.createElement("style");
            style.innerHTML = fs.readFileSync("./public/css/render.css").toString();
            const script = document.createElement("script");
            script.innerHTML = fs.readFileSync("./public/js/render.js").toString();
            document.getElementsByTagName("head")[0].appendChild(style);
            document.getElementsByTagName("head")[0].appendChild(script);
        });
        const cardToBuffer = async (card: RenderedCard) => {
            page.setViewport({
                width: card.type === "plot" ? height : width,
                height: card.type === "plot" ? width : height,
                deviceScaleFactor: 1.25
            });
            const htmlContent = await this.asHtml("single", card, { includeCSS: true, includeJS: true });
            await page.setContent(htmlContent);
            return await page.screenshot({ optimizeForSpeed: true, type: "png" });
        };
        let result = null;
        if (Array.isArray(cards)) {
            const buffers = new BufferCollection();
            for (const card of cards) {
                const buffer = await cardToBuffer(card);
                buffers.push(buffer);
            }
            result = buffers;
        } else {
            result = await cardToBuffer(cards);
        }
        await page.close();
        await browser.close();
        return result;
    }

    public async asPDF(data: SingleOrArray<RenderedCard>, options? : { copies: number, perPage: number }) {
        const cards = asArray(data);
        if (cards.length === 0) {
            throw Error("Cannot render PDF with no cards");
        }
        const browser = await this.launchPuppeteer({
            width: 794,
            height: 1124 // For some reason, puppeteer wants this as 1124, rather than the 1122 that it SHOULD be for A4 *shrug*
        });
        const htmlContent = await this.asHtml("batch", cards.map((card) => card), { ...options, includeCSS: true, includeJS: true });
        const page = await browser.newPage();
        await page.addStyleTag({ path: "./public/css/render.css" });
        await page.addScriptTag({ path: "./public/js/render.js" });
        await page.setContent(htmlContent, { waitUntil: "load" });
        const buffer = await page.pdf({ printBackground: true, format: "A4" });
        await page.close();
        await browser.close();
        return buffer;
    }

    public async asHtml(mode: RenderType, cards: SingleOrArray<RenderedCard>, options?: RenderHtmlOptions) {
        switch (mode) {
            case "single":
                const single = asSingle(cards);
                options = { ...{ includeCSS: false, includeJS: false }, ...options };
                return RenderingService.renderTemplate({ type: mode, card: this.prepareCard(single), ...options });
            case "batch":
                const batch = asArray(cards);
                options = { ... { includeCSS: false, includeJS: false, copies: 3, perPage: 9 }, ...options };
                return RenderingService.renderTemplate({ type: mode, cards: batch.map((card) => this.prepareCard(card)), ...options });
        }
    }

    private prepareCard(card: RenderedCard) {
        const jCard = card.toJSON();
        return {
            ...jCard,
            ...{
                renderFile: jCard.type,
                traits: jCard.traits.map((t: string) => `${t}.`).join(" "),
                text: jCard.text
                    .replace(/\[([^\]]+)\]/g, "<span class=\"icon-$1\"></span>")
                    .replace(/\n/g, "<br>")
                    // If any plot modifiers are detected, create the plot-modifiers class...
                    .replace(/\n*((?:\s*[+-]\d+ (?:Income|Initiative|Claim|Reserve)\.?\s*)+)/gi, "<div class=\"plot-modifiers\">$1</div>")
                    // ...and wrap each plot modifier in a span within that class
                    .replace(/\s*([+-]\d+) (Income|Initiative|Claim|Reserve)\.?\s*/gi, (match: string, modifier: string, plotStat: string) => `<span class="plot-stat ${plotStat.toLowerCase()} auto-size">${modifier}</span>`)
                    // If any lists are detected, create the ul...
                    .replace(/(<br>-\s*.*\.)/g, "<ul>$1</ul>")
                    // ... and wrap each line in li
                    .replace(/<br>-\s*(.*?\.)(?=<br>|<\/ul>)/g, "<li>$1</li>"),
                deckLimit: jCard.deckLimit !== Cards.DefaultDeckLimit[jCard.type] ? `Deck Limit: ${jCard.deckLimit}` : ""
            }
        } as ejs.Data;
    }

    private static renderTemplate(data: ejs.Data) {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const filepath = `${__dirname}/templates/render.ejs`;
        const file = fs.readFileSync(filepath).toString();
        const { includeCSS, includeJS, ...restData } = data;
        const css = includeCSS ? fs.readFileSync(path.resolve(__dirname, "../../public/css/render.css")).toString() : undefined;
        const js = includeJS ? fs.readFileSync(path.resolve(__dirname, "../../public/js/render.js")).toString() : undefined;
        return ejs.render(file, { filename: filepath, name: "render", css, js, options: { ...restData } });
    }

    private async launchPuppeteer(defaultViewport?: Viewport) {
        return await puppeteer.launch({
            ...(defaultViewport ? { defaultViewport } : {}),
            args: [
                "--disable-features=IsolateOrigins",
                "--disable-site-isolation-trials",
                "--autoplay-policy=user-gesture-required",
                "--disable-background-networking",
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-breakpad",
                "--disable-client-side-phishing-detection",
                "--disable-component-update",
                "--disable-default-apps",
                "--disable-dev-shm-usage",
                "--disable-domain-reliability",
                "--disable-extensions",
                "--disable-features=AudioServiceOutOfProcess",
                "--disable-hang-monitor",
                "--disable-ipc-flooding-protection",
                "--disable-notifications",
                "--disable-offer-store-unmasked-wallet-cards",
                "--disable-popup-blocking",
                "--disable-print-preview",
                "--disable-prompt-on-repost",
                "--disable-renderer-backgrounding",
                "--disable-setuid-sandbox",
                "--disable-speech-api",
                "--disable-sync",
                "--hide-scrollbars",
                "--ignore-gpu-blacklist",
                "--metrics-recording-only",
                "--mute-audio",
                "--no-default-browser-check",
                "--no-first-run",
                "--no-pings",
                "--no-sandbox",
                "--no-zygote",
                "--password-store=basic",
                "--use-gl=swiftshader",
                "--use-mock-keychain"
            ]
        });
    }
}

export default RenderingService;