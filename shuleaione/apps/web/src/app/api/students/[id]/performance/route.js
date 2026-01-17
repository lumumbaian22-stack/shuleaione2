import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get student performance overview
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term");

    // Get all marks for the student
    let marksQuery = `SELECT * FROM marks WHERE student_id = $1`;
    const values = [parseInt(id)];

    if (term) {
      marksQuery += ` AND term = $2`;
      values.push(term);
    }

    marksQuery += ` ORDER BY subject, date_entered DESC`;

    const marks = await sql(marksQuery, values);

    // Calculate average score
    const totalScore = marks.reduce((sum, mark) => sum + mark.score, 0);
    const averageScore =
      marks.length > 0 ? (totalScore / marks.length).toFixed(1) : 0;

    // Group by subject to get latest score per subject
    const subjectPerformance = {};
    marks.forEach((mark) => {
      if (!subjectPerformance[mark.subject]) {
        subjectPerformance[mark.subject] = {
          subject: mark.subject,
          latestScore: mark.score,
          term: mark.term,
          dateEntered: mark.date_entered,
        };
      }
    });

    return Response.json({
      performance: {
        studentId: parseInt(id),
        averageScore: parseFloat(averageScore),
        totalSubjects: Object.keys(subjectPerformance).length,
        subjectPerformance: Object.values(subjectPerformance),
        allMarks: marks,
      },
    });
  } catch (err) {
    console.error("GET /api/students/[id]/performance error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



