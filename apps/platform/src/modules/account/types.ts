import type { useMe } from "#/modules/auth";

export type Me = NonNullable<ReturnType<typeof useMe>["data"]>;
