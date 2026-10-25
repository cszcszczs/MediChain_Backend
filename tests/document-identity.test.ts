import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { describe, it } from "node:test";
import { PatientController } from "../src/controllers/patient.controller.ts";
import { ProfessionalController } from "../src/controllers/professional.controller.ts";
import {
  DocumentIdentityConflictError,
  isDocumentIdentityUniqueConstraintError,
} from "../src/exceptions/errors/document-identity-conflict.error.ts";
import {
  EmailConflictError,
  isEmailUniqueConstraintError,
} from "../src/exceptions/errors/email-conflict.error.ts";
import {
  isMedicalLicenseUniqueConstraintError,
  MedicalLicenseConflictError,
} from "../src/exceptions/errors/medical-license-conflict.error.ts";
import type { IPatientInterface } from "../src/services/interfaces/patient.interface.ts";
import type { IProfessionalInterface } from "../src/services/interfaces/professional.interface.ts";

const createResponse = () => {
  let statusCode = 0;
  let responseBody: unknown;
  const response = {
    status(code: number) {
      statusCode = code;
      return response;
    },
    json(body: unknown) {
      responseBody = body;
      return response;
    },
  };

  return {
    response: response as unknown as Response,
    getStatus: () => statusCode,
    getBody: () => responseBody,
  };
};

describe("document identity conflicts", () => {
  it("recognizes only unique violations for document type and number", () => {
    assert.equal(isDocumentIdentityUniqueConstraintError({
      code: "P2002",
      meta: { target: ["document_type", "document_number"] },
    }), true);
    assert.equal(isDocumentIdentityUniqueConstraintError({
      code: "P2002",
      meta: { target: ["email"] },
    }), false);
    assert.equal(isDocumentIdentityUniqueConstraintError({
      code: "P2002",
      meta: {
        driverAdapterError: {
          cause: { constraint: { index: "document_identities_type_number_key" } },
        },
      },
    }), true);
    assert.equal(isDocumentIdentityUniqueConstraintError(new Error("database unavailable")), false);
  });

  it("returns 409 when patient registration conflicts with an existing document", async () => {
    const controller = new PatientController({
      createPatient: async () => { throw new DocumentIdentityConflictError(); },
      listActivePatients: async () => [],
    } as IPatientInterface);
    const response = createResponse();

    await controller.createUser({ body: {} } as Request, response.response);

    assert.equal(response.getStatus(), 409);
    assert.deepEqual(response.getBody(), {
      message: "Ya existe un usuario con ese tipo y número de documento",
    });
  });

  describe("email conflicts", () => {
    it("recognizes unique violations for email only", () => {
      assert.equal(isEmailUniqueConstraintError({
        code: "P2002",
        meta: { target: ["email"] },
      }), true);
      assert.equal(isEmailUniqueConstraintError({
        code: "P2002",
        meta: {
          driverAdapterError: {
            cause: { constraint: { index: "users_email_key" } },
          },
        },
      }), true);
      assert.equal(isEmailUniqueConstraintError({
        code: "P2002",
        meta: { target: ["medical_license"] },
      }), false);
      assert.equal(isEmailUniqueConstraintError(new Error("database unavailable")), false);
    });

    it("returns 409 when patient registration uses an existing email", async () => {
      const controller = new PatientController({
        createPatient: async () => { throw new EmailConflictError(); },
        listActivePatients: async () => [],
      } as IPatientInterface);
      const response = createResponse();

      await controller.createUser({ body: {} } as Request, response.response);

      assert.equal(response.getStatus(), 409);
      assert.deepEqual(response.getBody(), { message: "El correo ya está registrado" });
    });

    it("returns 409 when professional registration uses an existing email", async () => {
      const controller = new ProfessionalController({
        createProfessional: async () => { throw new EmailConflictError(); },
        listActiveProfessionals: async () => [],
      } as IProfessionalInterface);
      const response = createResponse();

      await controller.createProfessional({ body: {} } as Request, response.response);

      assert.equal(response.getStatus(), 409);
      assert.deepEqual(response.getBody(), { message: "El correo ya está registrado" });
    });
  });

  describe("medical license conflicts", () => {
    it("recognizes unique violations for the medical license only", () => {
      assert.equal(isMedicalLicenseUniqueConstraintError({
        code: "P2002",
        meta: { target: ["medicalLicense"] },
      }), true);
      assert.equal(isMedicalLicenseUniqueConstraintError({
        code: "P2002",
        meta: {
          driverAdapterError: {
            cause: { constraint: { index: "professionals_medical_license_key" } },
          },
        },
      }), true);
      assert.equal(isMedicalLicenseUniqueConstraintError({
        code: "P2002",
        meta: { target: ["email"] },
      }), false);
      assert.equal(isMedicalLicenseUniqueConstraintError(new Error("database unavailable")), false);
    });

    it("returns 409 when professional registration uses an existing medical license", async () => {
      const controller = new ProfessionalController({
        createProfessional: async () => { throw new MedicalLicenseConflictError(); },
        listActiveProfessionals: async () => [],
      } as IProfessionalInterface);
      const response = createResponse();

      await controller.createProfessional({ body: {} } as Request, response.response);

      assert.equal(response.getStatus(), 409);
      assert.deepEqual(response.getBody(), {
        message: "La licencia médica ya está registrada",
      });
    });
  });

  it("returns 409 when professional registration conflicts with an existing document", async () => {
    const controller = new ProfessionalController({
      createProfessional: async () => { throw new DocumentIdentityConflictError(); },
      listActiveProfessionals: async () => [],
    } as IProfessionalInterface);
    const response = createResponse();

    await controller.createProfessional({ body: {} } as Request, response.response);

    assert.equal(response.getStatus(), 409);
    assert.deepEqual(response.getBody(), {
      message: "Ya existe un usuario con ese tipo y número de documento",
    });
  });
});