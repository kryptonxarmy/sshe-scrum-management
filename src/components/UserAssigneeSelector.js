import React from "react";
import MultiSelect from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";

export default function UserAssigneeSelector({ projectId, selectedUserIds, onChange }) {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchUsers() {
      console.log("Fetching users for projectId:", projectId); // Debug log

      if (!projectId || projectId === "no-project") {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}?details=true`);
        const data = await res.json();
        console.log("API Response:", data); // Debug log

        if (data.project && data.project.members) {
          const filtered = data.project.members.map((m) => m.user).filter((u) => u && u.role !== "SUPERADMIN");
          console.log("Filtered users:", filtered); // Debug log
          setUsers(filtered);

          // Auto-select all project members if no users are currently selected
          if (filtered.length > 0 && (!selectedUserIds || selectedUserIds.length === 0)) {
            const memberIds = filtered.map((u) => u.id);
            console.log("Auto-selecting user IDs:", memberIds); // Debug log
            onChange(memberIds);
          }
        } else {
          console.log("No members found in project"); // Debug log
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching project users:", error); // Debug log
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [projectId, selectedUserIds, onChange]);

  const options = users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }));

  return (
    <div className="flex flex-col gap-1 w-full">
      <Label className="text-xs mb-1">Pilih Assignee untuk Event:</Label>
      {loading ? (
        <div className="w-full min-h-[40px] px-3 py-2 border rounded bg-gray-50 flex items-center">
          <span className="text-gray-500">Loading users...</span>
        </div>
      ) : (
        <MultiSelect options={options} value={selectedUserIds || []} onChange={onChange} placeholder={options.length === 0 ? "No users available" : "Pilih user..."} />
      )}
    </div>
  );
}
