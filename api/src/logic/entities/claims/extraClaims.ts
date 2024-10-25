/*
 * Represents extra claims not received in access tokens
 */
export class ExtraClaims {

    private title: string;
    private regions: string[];

    public constructor(title: string, regions: string[]) {
        this.title = title;
        this.regions = regions;
    }

    public getTitle(): string {
        return this.title;
    }

    public getRegions(): string[] {
        return this.regions;
    }
}
