import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../../../config";
import { useStatuses } from "../../../contexts/StatusContext";

const LeadEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStatusNames } = useStatuses();

  const [lead, setLead] = useState({
    name: "",
    email: "",
    number: "",
    person_id: "",
    owner: "",
    status: "",
    source: "",
    priority: "",
    next_meeting: "",
    loan_type: "",
    est_budget: "",
    refrence: "",
    address: "",
    description: "",
    remark: "",
  });

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchLeadDetails();
    fetchEmployees();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/getLead/${id}`);
      if (response.data) {
        setLead({
          name: response.data.name || "",
          email: response.data.email || "",
          number: response.data.number || "",
          person_id: response.data.person_id || "",
          owner: response.data.owner || "",
          status: response.data.status || "",
          source: response.data.source || "",
          priority: response.data.priority || "",
          next_meeting: response.data.next_meeting ? response.data.next_meeting.split("T")[0] : "",
          loan_type: response.data.loan_type || "",
          est_budget: response.data.est_budget || "",
          refrence: response.data.refrence || "",
          address: response.data.address || "",
          description: response.data.description || "",
          remark: response.data.remark || "",
        });
      }
    } catch (error) {
      console.error("Error fetching lead details: ", error);
      toast.error("Failed to fetch lead details.");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees`);
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLead((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeChange = (e) => {
    const selectedEmp = employees.find((emp) => emp.emp_id === e.target.value);
    setLead((prev) => ({
      ...prev,
      person_id: selectedEmp?.emp_id || "",
      owner: selectedEmp?.ename || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.put(`${API_URL}/leads/${id}`, lead);
      toast.success("Lead updated successfully!");
      navigate("/leads");
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-6">Loading Lead details...</div>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg max-w-4xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Lead ({id})</h2>
        <button
          onClick={() => navigate("/leads")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={lead.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={lead.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="number"
              value={lead.number}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned To</label>
            <select
              value={lead.person_id}
              onChange={handleEmployeeChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="" disabled>Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.emp_id} value={emp.emp_id}>
                  {emp.emp_id} ─ {emp.ename}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={lead.status}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="" disabled>Select Status</option>
              {getStatusNames().map((statusName, index) => (
                <option key={index} value={statusName}>
                  {statusName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <input
              type="text"
              name="source"
              value={lead.source}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              name="priority"
              value={lead.priority}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Next Meeting Date</label>
            <input
              type="date"
              name="next_meeting"
              value={lead.next_meeting}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Loan Type</label>
            <input
              type="text"
              name="loan_type"
              value={lead.loan_type}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estimated Budget</label>
            <input
              type="text"
              name="est_budget"
              value={lead.est_budget}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reference</label>
            <input
              type="text"
              name="refrence"
              value={lead.refrence}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Remark</label>
            <input
              type="text"
              name="remark"
              value={lead.remark}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            value={lead.address}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows="2"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={lead.description}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows="3"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-800"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadEditScreen;
