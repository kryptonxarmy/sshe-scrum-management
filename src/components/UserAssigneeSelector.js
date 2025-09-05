import React from "react";
import MultiSelect from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";

export default function UserAssigneeSelector({ selectedUserIds, onChange }) {
  const [users, setUsers] = React.useState([]);
  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        // Filter out SUPERADMIN
        const filtered = Array.isArray(data.users)
          ? data.users.filter((u) => u && u.role !== "SUPERADMIN")
          : [];
        setUsers(filtered);
        if (filtered.length > 0 && (!selectedUserIds || selectedUserIds.length === 0)) {
          onChange(filtered.map((u) => u.id));
        }
      } catch {
        setUsers([]);
      }
    }
    fetchUsers();
  }, []);

  const options = users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }));

  return (
    <div className="flex flex-col gap-1 w-full">
      <Label className="text-xs mb-1">Pilih Assignee untuk Event:</Label>
      <MultiSelect options={options} value={selectedUserIds} onChange={onChange} placeholder="Pilih user..." />
    </div>
  );
}
