import { useState } from "react";
import { X } from "lucide-react";

const CreateTaskModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "story",
    priority: "medium",
    assignee: "",
    dueDate: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Task created:", formData);
    onClose();
    setFormData({
      title: "",
      description: "",
      type: "story",
      priority: "medium",
      assignee: "",
      dueDate: "",
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-slate-800">Create New Task</h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Form Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="story">Story</option>
                  <option value="spike">Spike</option>
                  <option value="sprint">Sprint</option>
                  <option value="qa">QA</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Form Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                <input
                  type="text"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex gap-4 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 bg-white text-gray-700 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 border-none bg-blue-600 text-white rounded-md cursor-pointer font-medium hover:bg-blue-700 transition-colors">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
