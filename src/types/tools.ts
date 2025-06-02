export type Tool = "Waypoint" | "Place" | "Takeoff" | "Landing"

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};
