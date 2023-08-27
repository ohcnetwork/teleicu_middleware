


export const filterClients = (ws, path:string) => {
    // console.log("CLEINT", ws.clients)
    return Array.from(ws?.clients || []).filter((client) => client.route  === path);
}