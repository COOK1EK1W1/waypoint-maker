export enum Severity {
  Good,
  Med,
  Bad,
}

export type Fault = {
  offenderMission?: string,
  offenderIndex?: number,
  message: string,
  severity: Severity
}
