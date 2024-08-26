/*
 * Represents extra claims not received in access tokens
 */
export class ExtraClaims {

    private _title: string;
    private _regions: string[];

    public constructor(title: string, regions: string[]) {
        this._title = title;
        this._regions = regions;
    }

    public get title(): string {
        return this._title;
    }

    public get regions(): string[] {
        return this._regions;
    }
}
