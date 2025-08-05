type PageInfo = { path: string, label: string, subPages?: PageInfo[] }
const pages: PageInfo[] = [
    {
        path: "/cards",
        label: "Cards"
    },
    {
        path: "/suggestions",
        label: "Suggestions"
    }
];

export default pages;