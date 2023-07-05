import groupBy from "lodash.groupby";

export class ObservationsMap {
  #observations = {};
  constructor() {}

  get(id) {
    return this.#observations[id];
  }

  set(data) {
    if (data) {
      const newData = groupBy(data, "device_id");

      Object.keys(newData).forEach((key) => {
        this.#observations[key] = newData[key] ?? this.#observations[key];
      });

      // console.log("DATA", Object.keys(this.#observations));
    }
  }
}
