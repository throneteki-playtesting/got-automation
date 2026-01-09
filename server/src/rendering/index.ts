import fs from "fs";
import path from "path";
import puppeteer, { Viewport } from "puppeteer";
import Project from "../data/models/project";
import PlaytestingCard from "@/data/models/cards/playtestingCard";
import RenderedCard from "@/data/models/cards/renderedCard";
import CardCollection from "common/collections/cardCollection";
import { dataService, logger } from "@/services";
import { asArray, renderPlaytestingCard } from "common/utils";
import { SingleOrArray } from "common/types";
import { randomUUID } from "crypto";
import { BatchRenderJob, BatchRenderJobOptions, RenderType, SingleRenderJob, SingleRenderJobOptions } from "@/types";
import { IPlaytestCard, IRenderCard } from "common/models/cards";

type PNGResponse = { filename: string, buffer: Buffer<ArrayBufferLike> };

class RenderingService {
    public async syncImages<T extends IPlaytestCard>(cards: CardCollection<T>, override = false) {
        const filePathFunc = (card: IPlaytestCard) => `./public/img/${card.project}/${card.number}@${card.version}.png`;
        const syncing = override ? [...cards.all] : cards.all.filter((card) => !fs.existsSync(filePathFunc(card)));

        const data = await this.asPNG(syncing.map((card) => renderPlaytestingCard(card)));
        const buffers = data.map(({ buffer }) => buffer);

        const promises: Promise<unknown>[] = [];
        while (syncing.length > 0)
        {
            const card = syncing.shift();
            const buffer = buffers.shift();
            const filePath = filePathFunc(card);
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                // Make directory immediately, in case conflicts with writing file later
                await fs.promises.mkdir(dirPath, { recursive: true });
            }
            const promise = fs.promises.writeFile(filePath, buffer)
                .catch((rejected) => logger.error(`Failed to write "${filePath}": ${rejected}`));
            promises.push(promise);
        }

        await Promise.allSettled(promises);
    }
    public async syncPDFs<T extends PlaytestingCard>(project: Project, cards: CardCollection<T>, override = false) {
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
    public async asPNG(card: IRenderCard, options?: SingleRenderJobOptions): Promise<PNGResponse>;
    public async asPNG(cards: IRenderCard[], options?: SingleRenderJobOptions): Promise<PNGResponse[]>;
    public async asPNG(data: SingleOrArray<IRenderCard>, options?: SingleRenderJobOptions) {
        const cards = asArray(data);
        const browser = await this.launchPuppeteer();
        const page = (await browser.pages())[0] ?? await browser.newPage();
        const job = await this.createJob("single", cards, options);
        try {
            // TODO: Create integration authorization
            await page.setExtraHTTPHeaders({ "Authorization": `Basic ${Buffer.from(`${process.env.BASIC_USERNAME}:${process.env.BASIC_PASSWORD}`).toString("base64")}` });
            await page.goto(`${process.env.CLIENT_HOST}/render?id=${job.id}`, { waitUntil: "networkidle0" });

            // TODO: Handle error handling, but checking a "status" div on rendered page.
            //       That div should contain either "OK" or a stringified object of the error
            const responses: PNGResponse[] = [];
            for (const { id } of job.data) {
                const filename = `${id}.png`;
                const element = await page.$(`[data-card-id="${id}"]`);
                const buffer = await element.screenshot({ optimizeForSpeed: true, type: "png" });

                responses.push({
                    filename,
                    buffer
                });
            }
            return Array.isArray(data) ? responses : responses[0];
        } finally {
            await page.close();
            await browser.close();
        }
    }

    public async asPDF(data: SingleOrArray<RenderedCard>, options?: BatchRenderJobOptions) {
        const cards = asArray(data);
        const job = await this.createJob("batch", cards, options);
        const browser = await this.launchPuppeteer({
            width: 794,
            height: 1124 // For some reason, puppeteer wants this as 1124, rather than the 1122 that it SHOULD be for A4 *shrug*
        });
        const page = (await browser.pages())[0] ?? await browser.newPage();

        try {
            // TODO: Create integration authorization
            await page.setExtraHTTPHeaders({ "Authorization": `Basic ${Buffer.from(`${process.env.BASIC_USERNAME}:${process.env.BASIC_PASSWORD}`).toString("base64")}` });
            await page.goto(`${process.env.CLIENT_HOST}/render?id=${job.id}`, { waitUntil: "networkidle0" });

            // TODO: Handle error handling, but checking a "status" div on rendered page.
            //       That div should contain either "OK" or a stringified object of the error
            const buffer = await page.pdf({ printBackground: true, format: "A4" });

            return buffer;
        } finally {
            await page.close();
            await browser.close();
        }
    }

    private async createJob(type: "single", cards: IRenderCard[], options?: SingleRenderJobOptions): Promise<SingleRenderJob>;
    private async createJob(type: "batch", cards: IRenderCard[], options?: BatchRenderJobOptions): Promise<BatchRenderJob>;
    private async createJob(type: RenderType, cards: IRenderCard[], options?: SingleRenderJobOptions|BatchRenderJobOptions) {
        const id = randomUUID();
        const data = cards.map((card) => ({ id: randomUUID(), card }));
        const job = {
            id,
            type,
            data,
            options
        };
        await dataService.redis.set(id, JSON.stringify(job));
        switch (type) {
            case "single":
                return job as SingleRenderJob;
            case "batch":
                return job as BatchRenderJob;
        }
    }

    private async launchPuppeteer(defaultViewport?: Viewport) {
        return await puppeteer.launch({
            ...(defaultViewport ? { defaultViewport } : {}),
            headless: true,
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