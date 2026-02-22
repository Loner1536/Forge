// helpers/isChildEntry.ts
import type Types from "@root/types";

/**
 * Type guard to check if a registry entry is a ChildEntry
 */
export default function isChildEntry(
	entry?: Types.Decorator.Entry | Types.Decorator.ChildEntry,
): entry is Types.Decorator.ChildEntry {
	return (
		!!entry && !!entry.rules && "parent" in entry.rules && typeIs(entry.rules.parent, "string")
	);
}
