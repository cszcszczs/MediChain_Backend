export const isPrismaUniqueConstraintError = (
  error: unknown,
  field: string,
): boolean => {
  if (!error || typeof error !== "object") return false;

  const databaseError = error as {
    code?: unknown;
    meta?: {
      target?: unknown;
      driverAdapterError?: {
        cause?: {
          constraint?: { index?: unknown };
        };
      };
    };
  };
  if (databaseError.code !== "P2002") return false;

  const target = databaseError.meta?.target;
  const targetText = Array.isArray(target)
    ? target.map(String).join(" ")
    : typeof target === "string" ? target : "";
  const constraintIndex = databaseError.meta?.driverAdapterError?.cause?.constraint?.index;
  const constraintText = typeof constraintIndex === "string" ? constraintIndex : "";
  const normalizedField = field.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedConstraint = `${targetText} ${constraintText}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return normalizedConstraint.includes(normalizedField);
};
