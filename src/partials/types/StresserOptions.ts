import { KeroxOptions } from "./KeroxOptions";

export type StresserOptions = KeroxOptions & {
   background: boolean;
   debugMode: boolean;
}