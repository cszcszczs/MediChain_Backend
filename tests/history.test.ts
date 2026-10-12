import assert from "node:assert/strict";
import type { Server } from "node:http";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";
import { SignJWT } from "jose";
import { createHistorySchema } from "../src/dto/history.dto.ts";
import { HistoryError, HistoryService } from "../src/services/history.service.ts";
import type {
  IHistoryRepository,
  IHistoryStorage,
} from "../src/services/interfaces/history.interface.ts";

const jwtSecret = "history-test-secret-with-at-least-32-bytes";
process.env.JWT_SECRET = jwtSecret;

const validData = {
  patientId: "b7a45dc6-5232-4a7f-a8d8-46d58c2092a0",
  consultationDate: "2026-10-11T14:30:00.000Z",
  symptoms: "Headache and fever",
  diagnosis: "Acute viral syndrome",
  treatment: "Rest and hydration",
  bloodPressure: "120/80",
  heartRate: 72,
  temperature: 36.5,
  weight: 70,
  medications: [{ name: "Acetaminophen", dose: "500 mg", frequency: "Every 8 hours" }],
  exams: [{ name: "Blood count", performedAt: "2026-10-11T14:00:00.000Z", status: "COMPLETED" }],
  notes: "Follow up if symptoms continue",
};

const createPdfFile = (): Express.Multer.File => {
  const buffer = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF");
  return {
    fieldname: "attachments",
    originalname: "exam.pdf",
    encoding: "7bit",
    mimetype: "application/pdf",
    size: buffer.length,
    buffer,
  } as Express.Multer.File;
};

const response = {
  id: "history-123",
  patientId: validData.patientId,
  professionalId: "professional-123",
  consultationDate: validData.consultationDate,
  symptoms: validData.symptoms,
  diagnosis: validData.diagnosis,
  treatment: validData.treatment,
  bloodPressure: validData.bloodPressure,
  heartRate: validData.heartRate,
  temperature: validData.temperature,
  weight: validData.weight,
  notes: validData.notes,
  medications: [],
  exams: [],
  attachments: [],
  createdAt: validData.consultationDate,
};

describe("createHistorySchema", () => {
  it("accepts a valid history payload and requires diagnosis and treatment", () => {
    assert.equal(createHistorySchema.safeParse(validData).success, true);
    assert.equal(createHistorySchema.safeParse({ ...validData, diagnosis: " " }).success, false);
    assert.equal(createHistorySchema.safeParse({ ...validData, treatment: " " }).success, false);
    assert.equal(createHistorySchema.safeParse({ ...validData, heartRate: -1 }).success, false);
  });
});

describe("HistoryService.createHistory", () => {
  const createService = (overrides: {
    professionalId?: string | null;
    patientActive?: boolean;
    failCreate?: boolean;
  } = {}) => {
    const uploaded: string[] = [];
    const removed: string[][] = [];
    let createdInput: Parameters<IHistoryRepository["createHistory"]>[0] | undefined;
    const repository: IHistoryRepository = {
      findActiveProfessionalId: async () => overrides.professionalId === undefined
        ? "professional-123"
        : overrides.professionalId,
      isPatientActive: async () => overrides.patientActive ?? true,
      createHistory: async (input) => {
        createdInput = input;
        if (overrides.failCreate) throw new Error("database unavailable");
        return response;
      },
    };
    const storage: IHistoryStorage = {
      bucket: "medical-history",
      upload: async (path) => { uploaded.push(path); },
      remove: async (paths) => { removed.push(paths); },
    };
    return { service: new HistoryService(repository, storage), uploaded, removed, getCreatedInput: () => createdInput };
  };

  it("derives professional identity from the authenticated user and stores only attachment metadata", async () => {
    const { service, uploaded, getCreatedInput } = createService();
    const result = await service.createHistory(
      "authenticated-user-id",
      createHistorySchema.parse(validData),
      [createPdfFile()],
    );

    assert.equal(result.id, response.id);
    assert.equal(getCreatedInput()?.professionalId, "professional-123");
    assert.equal(getCreatedInput()?.attachments.length, 1);
    assert.equal(getCreatedInput()?.attachments[0]?.mimeType, "application/pdf");
    assert.equal(uploaded.length, 1);
    assert.match(uploaded[0] ?? "", new RegExp(`^${validData.patientId}/`));
  });

  it("rejects inactive professionals and patients before uploading files", async () => {
    const inactiveProfessional = createService({ professionalId: null });
    await assert.rejects(
      inactiveProfessional.service.createHistory("user-id", createHistorySchema.parse(validData), [createPdfFile()]),
      (error: unknown) => error instanceof HistoryError && error.statusCode === 403,
    );

    const inactivePatient = createService({ patientActive: false });
    await assert.rejects(
      inactivePatient.service.createHistory("user-id", createHistorySchema.parse(validData), [createPdfFile()]),
      (error: unknown) => error instanceof HistoryError && error.statusCode === 404,
    );
    assert.equal(inactiveProfessional.uploaded.length, 0);
    assert.equal(inactivePatient.uploaded.length, 0);
  });

  it("removes uploaded objects when database persistence fails", async () => {
    const { service, uploaded, removed } = createService({ failCreate: true });

    await assert.rejects(
      service.createHistory("user-id", createHistorySchema.parse(validData), [createPdfFile()]),
      /database unavailable/,
    );
    assert.equal(uploaded.length, 1);
    assert.deepEqual(removed, [uploaded]);
  });

  it("rejects files whose content does not match an allowed file signature", async () => {
    const { service, uploaded } = createService();
    const fakePdf = { ...createPdfFile(), buffer: Buffer.from("not a PDF") } as Express.Multer.File;

    await assert.rejects(
      service.createHistory("user-id", createHistorySchema.parse(validData), [fakePdf]),
      (error: unknown) => error instanceof HistoryError && error.statusCode === 400,
    );
    assert.equal(uploaded.length, 0);
  });
});

describe("POST /v1/history", () => {
  let server: Server;
  let endpoint: string;

  before(async () => {
    const { createServer } = await import("../src/server.ts");
    server = createServer().listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    endpoint = `http://127.0.0.1:${address.port}/v1/history`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("requires a valid bearer token", async () => {
    const response = await fetch(endpoint, { method: "POST" });
    assert.equal(response.status, 401);
  });

  it("rejects invalid clinical payloads before database or Storage access", async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("authenticated-user-id")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(jwtSecret));
    const form = new FormData();
    form.set("data", JSON.stringify({ patientId: "invalid" }));
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: form,
    });

    assert.equal(response.status, 400);
    const body = await response.json() as { message: string };
    assert.equal(body.message, "Datos inválidos");
  });
});