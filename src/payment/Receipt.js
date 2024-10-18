import React, { useEffect, useState } from "react";
import axios from "axios"; // Import Axios
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import signature from "../images/signature.png"; // Signature image

const Receipt = () => {
  const URL = "https://webmasters-backend-2.onrender.com";
  const [students, setStudents] = useState([]); // Store all student names
  const [selectedStudent, setSelectedStudent] = useState(null); // Selected student details
  const [receiptData, setReceiptData] = useState({
    studentName: "",
    email: "",
    paymentMethod: "",
    transactionId: "",
    courseDescription: "",
    fees: "",
    remainingFees: "",
    date: new Date().toLocaleDateString(),
  });
  const [error, setError] = useState(""); // Error state
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch student names on component mount
  // Fetch student names on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${URL}/students/students`);
        console.log(response.data)
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to fetch student names. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch student details based on student ID
  const handleStudentSelect = async (studentId) => {
    console.log("Selected Student ID:", studentId); // Log selected ID
    if (!studentId) return; // Prevent empty requests
  
    const apiUrl = `${URL}/students/student/${studentId}`;
    console.log("API Request URL:", apiUrl); // Log API URL
  
    try {
      const response = await axios.get(apiUrl);
      const data = response.data;
      console.log("Fetched Student Data:", data); // Log the fetched data
  
      setSelectedStudent(data);
      setReceiptData({
        studentName: data.name || "",
        email: data.email || "",
        fees: data.totalFees || "",
        remainingFees: data.remainingFees || "",
        date: new Date().toLocaleDateString(),
      });
    } catch (error) {
      console.error("Error fetching student details:", error);
      if (error.response) {
        console.error("Response Data:", error.response.data);
      } else {
        console.error("Error Message:", error.message);
      }
      alert("Failed to fetch student details. Please try again later.");
    }
  };
  
  
  // Handle input change for manual editing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReceiptData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Validate receipt data before downloading
  const validateReceiptData = () => {
    if (!receiptData.studentName || !receiptData.email) {
      setError("Student Name and Email are required fields.");
      return false;
    }
    setError(""); // Clear previous errors
    return true;
  };

  // Generate and download the PDF
  const downloadPDF = () => {
    if (!validateReceiptData()) return;

    const doc = new jsPDF();
    doc.setFontSize(32);
    doc.text("WebMasters Learning", 51, 9); // Adjust positioning as needed

    doc.setFontSize(22);
    doc.text("Payment Receipt", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${receiptData.date}`, 105, 30, { align: "center" });

    autoTable(doc, {
      startY: 40,
      head: [["Field", "Details"]],
      body: [
        ["Student Name", receiptData.studentName || "N/A"],
        ["Email", receiptData.email || "N/A"],
        ["Payment Method", receiptData.paymentMethod || "N/A"],
        ["Transaction ID", receiptData.transactionId || "N/A"],
        ["Course Description", receiptData.courseDescription || "N/A"],
        ["Fees", receiptData.fees || "N/A"],
        ["Remaining Fees", receiptData.remainingFees || "N/A"],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { halign: "start" },
    });

    const signatureImage = new Image();
    signatureImage.src = signature;

    signatureImage.onload = () => {
      doc.addImage(
        signatureImage,
        "PNG",
        140,
        doc.lastAutoTable.finalY + 18,
        45,
        20
      );
      doc.text("CEO Signature", 145, doc.lastAutoTable.finalY + 35);
      doc.save(`Receipt-${receiptData.studentName || "N/A"}.pdf`);
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">
          Payment Receipt
        </h1>

        {/* Error Message */}
        {error && <div className="text-red-500">{error}</div>}

        {/* Student Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="studentSelect">
            Select Student
          </label>
          <select
  value={selectedStudent?.id || ""}
  onChange={(e) => handleStudentSelect(e.target.value)} // Pass the student ID here
  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <option value="">Select a Student</option>
  {students.map((student) => (
    <option key={student._id} value={student._id}> {/* Set this to student.id */}
      {student.name} {/* This is the display name */}
    </option>
  ))}
</select>



        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <InputField
            label="Student Name"
            name="studentName"
            value={receiptData.studentName}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            value={receiptData.email}
            onChange={handleChange}
          />
          <InputField
            label="Payment Method"
            name="paymentMethod"
            value={receiptData.paymentMethod}
            onChange={handleChange}
          />
          <InputField
            label="Transaction ID"
            name="transactionId"
            value={receiptData.transactionId}
            onChange={handleChange}
          />
          <InputField
            label="Course Description"
            name="courseDescription"
            value={receiptData.courseDescription}
            onChange={handleChange}
          />
          <InputField
            label="Fees"
            name="fees"
            value={receiptData.fees}
            onChange={handleChange}
          />
          <InputField
            label="Remaining Fees"
            name="remainingFees"
            value={receiptData.remainingFees}
            onChange={handleChange}
          />
        </div>

        {/* Download Button */}
        <button
          onClick={downloadPDF}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Download Receipt
        </button>
      </div>
    </div>
  );
};

// Reusable InputField Component
const InputField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={label}
    />
  </div>
);

export default Receipt;
