import React, { useState } from "react";
import axios from "../../api/axiosInstance";

export default function CommentItem({ taskId, comment, onCommentsUpdate }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.text);

  const saveEdit = async () => {
    const res = await axios.put(
      `/api/kanban/tasks/${taskId}/comments/${comment._id}`,
      { text }
    );
    onCommentsUpdate(taskId, res.data.data);
    setEditing(false);
  };

  const deleteComment = async () => {
    const res = await axios.delete(
      `/kanban/tasks/${taskId}/comments/${comment._id}`
    );
    onCommentsUpdate(taskId, res.data.data);
  };

  return (
    <div className="p-2 rounded bg-[#1c1c1e] text-sm">
      {editing ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-[#151517] border border-white/10 rounded p-1 text-white"
          />
          <div className="flex gap-2 mt-1 text-xs">
            <button onClick={saveEdit} className="text-blue-400">Save</button>
            <button onClick={() => setEditing(false)} className="text-gray-400">Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="text-gray-200">{comment.text}</div>
          {/* <div className="flex gap-2 text-xs mt-2 text-gray-400">
            <button onClick={() => setEditing(true)} className=" bg-gray-400 text-black p-1 px-2 cursor-pointer rounded">Edit</button>
            <button onClick={deleteComment} className=" bg-red-400 text-white p-1 cursor-pointer  rounded">Delete</button>
          </div> */}
        </>
      )}
    </div>
  );
}
