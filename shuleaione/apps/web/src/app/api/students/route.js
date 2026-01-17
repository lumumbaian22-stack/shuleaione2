import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List students
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const schoolId = searchParams.get("schoolId");
    const classFilter = searchParams.get("class");

    let query = `SELECT s.*, u.name as parent_name FROM students s LEFT JOIN users u ON s.parent_id = u.id WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (parentId) {
      query += ` AND s.parent_id = $${paramCount}`;
      values.push(parseInt(parentId));
      paramCount++;
    }

    if (schoolId) {
      query += ` AND s.school_id = $${paramCount}`;
      values.push(parseInt(schoolId));
      paramCount++;
    }

    if (classFilter) {
      query += ` AND s.class = $${paramCount}`;
      values.push(classFilter);
      paramCount++;
    }

    query += ` ORDER BY s.name ASC`;

    const students = await sql(query, values);
    return Response.json({ students });
  } catch (err) {
    console.error("GET /api/students error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create student
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, class: studentClass, stream, schoolId, parentId } = body;

    if (!name || !studentClass || !schoolId) {
      return Response.json(
        { error: "Name, class, and school ID are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO students (name, class, stream, school_id, parent_id)
      VALUES (${name}, ${studentClass}, ${stream || null}, ${schoolId}, ${parentId || null})
      RETURNING *
    `;

    return Response.json({ student: result[0] });
  } catch (err) {
    console.error("POST /api/students error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



