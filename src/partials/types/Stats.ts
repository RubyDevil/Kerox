import { Counter } from "../classes/Counter";

export type Stats = {
   startTime: number;
   requests: Counter;
   pending: Counter;
   success: Counter;
   errors: Counter;
}