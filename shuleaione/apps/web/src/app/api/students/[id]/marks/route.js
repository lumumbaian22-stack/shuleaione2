import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Add marks for a student
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { subject, score, term } = body;

    if (!subject || score === undefined || !term) {
      return Response.json(
        { error: "Subject, score, and term are required" },
        { status: 400 },
      );
    }

    if (score < 0 || score > 100) {
      return Response.json(
        { error: "Score must be between 0 and 100" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO marks (student_id, subject, score, term)
      VALUES (${parseInt(id)}, ${subject}, ${score}, ${term})
      RETURNING *
    `;

    // Auto-generate alerts based on performance
    await generateAlertsForStudent(parseInt(id), subject, score, term);

    return Response.json({ mark: result[0] });
  } catch (err) {
    console.error("POST /api/students/[id]/marks error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get marks for a student
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term");

    let query = `SELECT * FROM marks WHERE student_id = $1`;
    const values = [parseInt(id)];

    if (term) {
      query += ` AND term = $2`;
      values.push(term);
    }

    query += ` ORDER BY date_entered DESC`;

    const marks = await sql(query, values);
    return Response.json({ marks });
  } catch (err) {
    console.error("GET /api/students/[id]/marks error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Helper function to generate alerts
async function generateAlertsForStudent(
  studentId,
  subject,
  currentScore,
  currentTerm,
) {
  try {
    // Get student and parent info
    const studentInfo = await sql`
      SELECT s.*, s.parent_id FROM students s WHERE s.id = ${studentId} LIMIT 1
    `;

    if (studentInfo.length === 0 || !studentInfo[0].parent_id) {
      return;
    }

    const parentId = studentInfo[0].parent_id;

    // Get previous term's score for this subject
    const previousMarks = await sql`
      SELECT score FROM marks 
      WHERE student_id = ${studentId} 
      AND subject = ${subject} 
      AND term != ${currentTerm}
      ORDER BY date_entered DESC 
      LIMIT 1
    `;

    let alertType = null;
    let message = "";

    if (previousMarks.length > 0) {
      const previousScore = previousMarks[0].score;
      const improvement = currentScore - previousScore;
      const improvementPercent = ((improvement / previousScore) * 100).toFixed(
        1,
      );

      if (improvement >= 5) {
        alertType = "positive";
        message = `Great news! Your child improved in ${subject} by ${improvementPercent}% (from ${previousScore}% to ${currentScore}%)`;
      } else if (currentScore < 50 || improvement <= -10) {
        alertType = "warning";
        message = `Your child is struggling in ${subject} with a score of ${currentScore}%. We recommend additional support.`;
      }
    } else {
      if (currentScore < 50) {
        alertType = "warning";
        message = `Your child scored ${currentScore}% in ${subject}. We recommend additional support to improve performance.`;
      } else if (currentScore >= 80) {
        alertType = "positive";
        message = `Excellent! Your child scored ${currentScore}% in ${subject}. Keep up the great work!`;
      }
    }

    if (alertType) {
      await sql`
        INSERT INTO alerts (student_id, parent_id, type, message)
        VALUES (${studentId}, ${parentId}, ${alertType}, ${message})
      `;
    }
  } catch (err) {
    console.error("Error generating alerts:", err);
  }
}



