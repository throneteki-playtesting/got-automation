import config from "config";
import { JWT } from "google-auth-library";
import { Response } from "gas/restClient";


export default class GasClient {
    private readonly scriptSuffix: string;
    private clientEmail: string;
    private privateKey: string;
    constructor() {
        this.clientEmail = config.get("google.clientEmail");
        this.privateKey = config.get("google.privateKey");
        this.scriptSuffix = process.env.NODE_ENV !== "production" ? "dev" : "exec";
    }

    private async getAuthorization() {
        const client = new JWT({
            email: this.clientEmail,
            key: this.privateKey,
            scopes: [
                "https://www.googleapis.com/auth/drive.file",
                "https://www.googleapis.com/auth/script.processes",
                "https://www.googleapis.com/auth/drive.readonly",
                "https://www.googleapis.com/auth/script.external_request",
                "https://www.googleapis.com/auth/script.scriptapp"
            ]
        });
        const { token } = await client.getAccessToken();
        return `Bearer ${token}`;
    }

    private async fetch<T>(url: string, request: RequestInit) {
        if (!(request.headers && request.headers["Authorization"])) {
            request.headers = request.headers || {};
            request.headers["Authorization"] = await this.getAuthorization();
        }
        url = url.replace(/(script\.google\.com\/macros\/s\/[^/]+)/, `$1/${this.scriptSuffix}`);
        const response = await fetch(url, request);

        if (!response.ok) {
            throw Error(`Google App Script ${request.method} request failed`, { cause: { status: response.status, message: response.statusText } });
        }

        const json = await response.json() as Response<T>;

        if (json.error) {
            throw Error(`Google App Script ${request.method} request successful, but returned error(s)`, { cause: json.error });
        }

        return json.data;
    }

    /**
     * Creates the full url for the specified request, converting query parameters into JSON
     */
    private buildUrl(baseUrl: string, queryParameters?: { [key: string]: unknown }) {
        let url = baseUrl;
        if (!queryParameters || Object.keys(queryParameters).length > 0) {
            const queryString = Object.entries(queryParameters)
                .filter(([, value]) => !!value)
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                .join("&");
            url += "?" + queryString;
        }
        return url;
    }

    public async get<T>(baseUrl: string, queryParameters?: { [key: string]: unknown }) {
        const url = this.buildUrl(baseUrl, queryParameters);
        return await this.fetch<T>(url, { method: "GET" });
    }

    public async post<T>(baseUrl: string, queryParameters?: { [key: string]: unknown }, body?: BodyInit) {
        const url = this.buildUrl(baseUrl, queryParameters);
        return await this.fetch<T>(url, { method: "POST", ...(body && { body }) });
    }
}