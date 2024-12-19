export function refDir(href: string): string {
    return href.substring(0, href.lastIndexOf("/")) + "/";
}