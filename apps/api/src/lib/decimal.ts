import PrismaPkg from "@prisma/client";
import type { Prisma } from "@prisma/client";

export const Decimal = PrismaPkg.Prisma.Decimal;
export type Decimal = Prisma.Decimal;

export function toDecimal(value: number | string): Decimal {
  return new Decimal(value);
}

export function decimalToNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : value.toNumber();
}
