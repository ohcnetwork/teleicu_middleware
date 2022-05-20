import groupBy from "lodash.groupby"

export class ObservationsMap {
    #observations = {}
    constructor() { }

    get(id) {
        console.log(this.#observations)
        return this.#observations[id]
    }

    set(data) {
        if (data) {
            console.log(data)
            this.#observations = groupBy(data, "device_id")
            console.log("DATA", this.#observations)
        }
    }

}