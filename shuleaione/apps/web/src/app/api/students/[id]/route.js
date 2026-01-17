import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get single student
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const result = await sql`
      SELECT s.*, u.name as parent_name, u.email as parent_email, u.phone as parent_phone
      FROM students s
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE s.id = ${parseInt(id)}
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    return Response.json({ student: result[0] });
  } catch (err) {
    console.error("GET /api/students/[id] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update student
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, class: studentClass, stream, parentId } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      setClauses.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (studentClass) {
      setClauses.push(`class = $${paramCount}`);
      values.push(studentClass);
      paramCount++;
    }

    if (stream !== undefined) {
      setClauses.push(`stream = $${paramCount}`);
      values.push(stream);
      paramCount++;
    }

    if (parentId !== undefined) {
      setClauses.push(`parent_id = $${paramCount}`);
      values.push(parentId);
      paramCount++;
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const query = `
      UPDATE students 
      SET ${setClauses.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(parseInt(id));

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    return Response.json({ student: result[0] });
  } catch (err) {
    console.error("PUT /api/students/[id] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



