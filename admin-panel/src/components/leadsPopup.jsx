import React from 'react';

const LeadsPopup = ({ isOpen, onClose, title, leads = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[95%] max-w-4xl max-h-[90%] overflow-y-auto relative">
        {/* Close (X) Button */}
        <button
          className="absolute top-4 right-6 text-2xl font-bold text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          ×
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-semibold mb-6 text-center">{title}</h2>

        {/* Leads Table */}
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-100">
    <tr>
      {title === "Total Calls" ? (
        <>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Call ID</th>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Number</th>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Remark</th>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">At</th>
        </>
      ) : (
        <>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Lead ID</th>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Phone</th>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Assigned To</th>
        </>
      )}
    </tr>
  </thead>

  <tbody className="bg-white divide-y divide-gray-100">
    {leads.map((lead, index) => (
      <tr key={index} className="hover:bg-gray-50 transition">
        {title === "Total Calls" ? (
          <>
            <td className="px-4 py-2 text-sm text-gray-800">{lead.call_id}</td>
            <td className="px-4 py-2 text-sm text-gray-800">{lead.name}</td>
            <td className="px-4 py-2 text-sm text-gray-800">{lead.number}</td>
            <td className="px-4 py-2 text-sm text-gray-800">{lead.remark}</td>
            <td className="px-4 py-2 text-sm text-gray-800">
                {new Date(lead.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                })}
            </td>
          </>
        ) : (
          <>
            <td className="px-4 py-2 text-sm text-gray-800">{lead.lead_id}</td>
            <td className="px-4 py-2 text-sm text-gray-800">{lead.name}</td>
            <td className="px-4 py-2 text-sm text-gray-800">{lead.number}</td>
            <td className="px-4 py-2 text-sm text-gray-800">{lead.owner}</td>
          </>
        )}
      </tr>
    ))}
  </tbody>
</table>

          </div>
        ) : (
          <p className="text-gray-600 text-center">No leads to display.</p>
        )}
      </div>
    </div>
  );
};

export default LeadsPopup;
