import { Code, RenderableCard, Watermark } from "common/models/cards";
import BaseCard from "./baseCard";

class RenderedCard extends BaseCard implements RenderableCard {
    // Playtesting specific properties
    public key: string;
    public watermark: Watermark;

    constructor(data: RenderableCard) {
        super({ ...data, code: data.code ?? "00000" });
        this.key = data.key;
        this.watermark = data.watermark;
    }

    override toJSON() {
        const base = super.toJSON();
        const obj = {
            ...base,
            ...(this.watermark !== undefined && { watermark: this.watermark })
        } as RenderableCard & { code: Code };
        return obj;
    }

    override clone() {
        const base = super.clone().toJSON();
        const data = {
            ...base,
            watermark: this.watermark
        } as RenderableCard;

        return new RenderedCard(data);
    }
}

export default RenderedCard;