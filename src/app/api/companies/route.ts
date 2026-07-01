import { jsonError, jsonOk } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth/session";
import { createCompanyForUser } from "@/lib/services/company.service";
import { createCompanySchema } from "@/lib/validators/company";

export async function POST(req: Request) {
  try {
    const authUser = await requireAuth();
    const body = createCompanySchema.parse(await req.json());
    const company = await createCompanyForUser(
      authUser.id,
      authUser.email!,
      body
    );
    return jsonOk(company, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET() {
  try {
    const { requireCompany } = await import("@/lib/auth/company-context");
    const { getCompany } = await import("@/lib/services/company.service");
    const ctx = await requireCompany();
    const company = await getCompany(ctx);
    return jsonOk(company);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const { requireCompany } = await import("@/lib/auth/company-context");
    const { updateCompany } = await import("@/lib/services/company.service");
    const { updateCompanySchema } = await import("@/lib/validators/company");
    const ctx = await requireCompany();
    const body = updateCompanySchema.parse(await req.json());
    const company = await updateCompany(ctx, body);
    return jsonOk(company);
  } catch (error) {
    return jsonError(error);
  }
}
