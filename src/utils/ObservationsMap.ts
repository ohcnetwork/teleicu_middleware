import groupBy from "lodash.groupby";

export class ObservationsMap {
  #observations: Record<string, any> = {};
  constructor() {}

  get(id: string) {
    return this.#observations[id];
  }

  // TODO: remove any
  set(data: any) {
    if (data) {
      const newData = groupBy(data, "device_id");

      Object.keys(newData).forEach((key) => {
        this.#observations[key] = newData[key] ?? this.#observations[key];
      });

      // console.log("DATA", Object.keys(this.#observations));
    }
  }
}
