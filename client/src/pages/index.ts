type PageInfo = { path: string, label: string, subPages?: PageInfo[] }
const pages: PageInfo[] = [
    {
        path: "/cards",
        label: "Cards"
    }
];

export default pages;