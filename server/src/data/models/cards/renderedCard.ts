import { RenderableCard, Watermark } from "common/models/cards";
import BaseCard from "./baseCard";


class RenderedCard extends BaseCard implements RenderableCard {
    // Playtesting specific properties
    public watermark: Watermark;

    constructor(data: RenderableCard) {
        super(data);
        this.watermark = data.watermark;
    }

    override toJSON() {
        const base = super.toJSON();
        const obj = {
            ...base,
            ...(this.watermark !== undefined && { watermark: this.watermark })
        } as RenderableCard;
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

    private generateDevImageUrl(project: number, number: number, version: string) {
        return encodeURI(`${process.env.SERVER_HOST}/img/${project}/${number}@${version}.png`);
    }
}

export default RenderedCard;