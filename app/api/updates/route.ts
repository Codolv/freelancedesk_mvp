import { NextResponse } from "next/server";

export async function GET() {
	const updates = [
		{ id: 1, title: "Kickoff", body: "Project started.", date: "2025-10-01" },
		{ id: 2, title: "Milestone 1", body: "Wireframes delivered.", date: "2025-10-03" },
		{ id: 3, title: "Payment", body: "Invoice inv_001 created.", date: "2025-10-05" },
	];
	return NextResponse.json({ updates });
}
