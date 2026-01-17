import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get school theme
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const result = await sql`
      SELECT id, name, logo_url, primary_color, secondary_color, font_style
      FROM schools
      WHERE id = ${parseInt(id)}
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json({ error: "School not found" }, { status: 404 });
    }

    return Response.json({ theme: result[0] });
  } catch (err) {
    console.error("GET /api/schools/[id]/theme error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update school theme (admin only)
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { logoUrl, primaryColor, secondaryColor, fontStyle } = body;

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (logoUrl !== undefined) {
      setClauses.push(`logo_url = $${paramCount}`);
      values.push(logoUrl);
      paramCount++;
    }

    if (primaryColor) {
      setClauses.push(`primary_color = $${paramCount}`);
      values.push(primaryColor);
      paramCount++;
    }

    if (secondaryColor) {
      setClauses.push(`secondary_color = $${paramCount}`);
      values.push(secondaryColor);
      paramCount++;
    }

    if (fontStyle) {
      setClauses.push(`font_style = $${paramCount}`);
      values.push(fontStyle);
      paramCount++;
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const query = `
      UPDATE schools 
      SET ${setClauses.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING id, name, logo_url, primary_color, secondary_color, font_style
    `;
    values.push(parseInt(id));

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "School not found" }, { status: 404 });
    }

    return Response.json({ theme: result[0] });
  } catch (err) {
    console.error("PUT /api/schools/[id]/theme error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



