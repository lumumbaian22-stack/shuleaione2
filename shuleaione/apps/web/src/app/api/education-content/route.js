import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all education content
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query = `SELECT * FROM education_content WHERE 1=1`;
    const values = [];

    if (type) {
      query += ` AND type = $1`;
      values.push(type);
    }

    query += ` ORDER BY created_at DESC`;

    const content = await sql(query, values);
    return Response.json({ content });
  } catch (err) {
    console.error("GET /api/education-content error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create education content (admin only)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type, link, thumbnailUrl } = body;

    if (!title || !type || !link) {
      return Response.json(
        { error: "Title, type, and link are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO education_content (title, description, type, link, thumbnail_url)
      VALUES (${title}, ${description || null}, ${type}, ${link}, ${thumbnailUrl || null})
      RETURNING *
    `;

    return Response.json({ content: result[0] });
  } catch (err) {
    console.error("POST /api/education-content error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



