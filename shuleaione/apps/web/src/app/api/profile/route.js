import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const rows = await sql`
      SELECT u.id, u.name, u.email, u.role, u.phone, u.school_id, s.name as school_name
      FROM auth_users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.id = ${userId}
      LIMIT 1
    `;

    const user = rows?.[0] || null;
    return Response.json({ user });
  } catch (err) {
    console.error("GET /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { role, schoolId, phone } = body || {};

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (typeof role === "string" && role.trim().length > 0) {
      setClauses.push(`role = $${paramCount}`);
      values.push(role.trim());
      paramCount++;
    }

    if (typeof schoolId === "number") {
      setClauses.push(`school_id = $${paramCount}`);
      values.push(schoolId);
      paramCount++;
    }

    if (typeof phone === "string" && phone.trim().length > 0) {
      setClauses.push(`phone = $${paramCount}`);
      values.push(phone.trim());
      paramCount++;
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const finalQuery = `
      UPDATE auth_users 
      SET ${setClauses.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, phone, school_id
    `;

    const result = await sql(finalQuery, [...values, userId]);
    const updated = result?.[0] || null;

    return Response.json({ user: updated });
  } catch (err) {
    console.error("PUT /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



