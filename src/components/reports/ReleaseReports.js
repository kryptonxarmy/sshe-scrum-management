// Temporary placeholder to prevent runtime error
import { useState, useEffect } from "react";

const ReleaseReports = ({ userId }) => {
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch released projects
		const fetchReleasedProjects = async () => {
			try {
				const res = await fetch(`/api/projects/released?userId=${userId}`);
				const data = await res.json();
				setProjects(data.projects || []);
			} catch (err) {
				setProjects([]);
			} finally {
				setLoading(false);
			}
		};
		fetchReleasedProjects();
	}, [userId]);

	if (loading) return <div className="p-4">Loading release reports...</div>;

	if (!projects.length)
		return <div className="p-4 text-slate-500">Belum ada project yang direlease.</div>;

	return (
		<div className="p-4">
			<h2 className="text-lg font-semibold mb-4">Release Report</h2>
			<div className="space-y-3">
				{projects.map((project) => (
					<div
						key={project.id}
						className="border rounded-lg p-3 bg-orange-50 flex flex-col gap-1"
					>
						<div className="font-medium text-orange-700">{project.name}</div>
						<div className="text-sm text-slate-700">
							Owner: {project.owner?.name || "-"}
						</div>
						<div className="text-sm text-slate-700">
							Scrum Master: {project.scrumMaster?.name || "-"}
						</div>
						<div className="text-xs text-slate-500">
							Timeline: {project.startDate?.slice(0, 10)} - {project.endDate?.slice(0, 10)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};


export default ReleaseReports;
