import { jsonError, jsonOk } from "@/lib/api-response";
import { getAuthMe } from "@/lib/services/company.service";

export async function GET() {
  try {
    const result = await getAuthMe();
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
