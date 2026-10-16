export class DocumentIdentityConflictError extends Error {
  constructor() {
    super("Ya existe un usuario con ese tipo y número de documento");
    this.name = "DocumentIdentityConflictError";
  }
}

export const isDocumentIdentityUniqueConstraintError = (error: unknown): boolean => {
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
  const uniqueTarget = `${targetText} ${constraintText}`;

  return uniqueTarget.includes("document_type") && uniqueTarget.includes("document_number")
    || uniqueTarget.includes("documentType") && uniqueTarget.includes("documentNumber")
    || uniqueTarget.includes("document_identities_type_number_key");
};