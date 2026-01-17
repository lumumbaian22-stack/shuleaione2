import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get alerts for a parent
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const studentId = searchParams.get("studentId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    let query = `
      SELECT a.*, s.name as student_name 
      FROM alerts a
      LEFT JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (parentId) {
      query += ` AND a.parent_id = $${paramCount}`;
      values.push(parseInt(parentId));
      paramCount++;
    }

    if (studentId) {
      query += ` AND a.student_id = $${paramCount}`;
      values.push(parseInt(studentId));
      paramCount++;
    }

    if (unreadOnly) {
      query += ` AND a.read = false`;
    }

    query += ` ORDER BY a.sent_at DESC`;

    const alerts = await sql(query, values);
    return Response.json({ alerts });
  } catch (err) {
    console.error("GET /api/alerts error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Mark alert as read
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return Response.json({ error: "Alert ID is required" }, { status: 400 });
    }

    const result = await sql`
      UPDATE alerts 
      SET read = true 
      WHERE id = ${alertId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "Alert not found" }, { status: 404 });
    }

    return Response.json({ alert: result[0] });
  } catch (err) {
    console.error("PUT /api/alerts error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



