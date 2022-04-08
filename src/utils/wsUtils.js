export const filterClients = (ws, path) => {
    // console.log("CLEINT", ws.clients)
    return Array.from(ws?.clients || []).filter((client) => client.route === path);
}