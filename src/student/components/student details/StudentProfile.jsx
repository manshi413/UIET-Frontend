import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  Button,
  TextField,
} from "@mui/material";
import axios from "axios";
import { baseApi } from "../../../environment";
import SnackbarAlert from "../../../basic utility components/snackbar/SnackbarAlert";

const StudentProfile = () => {
  const token = localStorage.getItem("authToken");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [showDetails, setShowDetails] = useState(false);

  // Helper function to convert semester_text or id to year string
  // Removed unused getYearString function as it is not used anymore

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const fetchStudentDetails = useCallback(async () => {
    if (!token) {
      setAlert({
        open: true,
        message: "Authorization token missing",
        severity: "error",
      });
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${baseApi}/student/fetch-single`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(response.data.student);
      setFormData(response.data.student);
    } catch (error) {
      console.error("Error fetching student details:", error);
      setAlert({
        open: true,
        message: "Failed to fetch student details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [token, setAlert, setLoading, setStudent, setFormData]);


  const updateStudentDetails = async () => {
    try {
      setLoading(true);
      const data = new FormData();
      for (const key in formData) {
        if (key === "department") {
          if (formData.department) {
            if (typeof formData.department === "object" && formData.department._id) {
              data.append("department", formData.department._id.toString());
            } else if (typeof formData.department === "string") {
              data.append("department", formData.department);
            }
          }
        } else if (key === "student_class") {
          if (formData.student_class) {
            console.log("student_class value before append:", formData.student_class);
            if (typeof formData.student_class === "object") {
              if (formData.student_class._id) {
                data.append("student_class", formData.student_class._id.toString());
              } else {
                console.error("student_class object missing _id:", formData.student_class);
                // Optionally skip appending or stringify
                // data.append("student_class", JSON.stringify(formData.student_class));
              }
            } else if (typeof formData.student_class === "string") {
              data.append("student_class", formData.student_class);
            }
          }
        } else {
          data.append(key, formData[key]);
        }
      }
      await axios.patch(`${baseApi}/student/update/${student._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setAlert({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
      setEditing(false);
      fetchStudentDetails();
    } catch (error) {
      console.error("Error updating student profile:", error);
      setAlert({
        open: true,
        message: "Failed to update profile",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDetails) {
      fetchStudentDetails();
    }
  }, [showDetails, fetchStudentDetails]);

  const getImageUrl = (filename) => {
    if (!filename) return "";
    return `${baseApi.replace('/api', '')}/student_images/${filename}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <SnackbarAlert {...alert} onClose={handleAlertClose} />

      <Typography
        variant="h3"
        sx={{ textAlign: "center", fontWeight: 700, color: "#1976d2", mb: 4 }}
      >
        Student Profile
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 4, gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Profile" : "View Profile"}
        </Button>

        {showDetails && !editing && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {showDetails && (
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "#f9fafb",
            maxWidth: 600,
            mx: "auto",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : student ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              {student?.student_image && (
                <Avatar
                  src={getImageUrl(student.student_image)}
                  alt={student.name}
                  sx={{ width: 120, height: 120 }}
                />
              )}

              {editing ? (
                <>
                  <TextField
                    label="Name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Gender"
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Age"
                    name="age"
                    value={formData.age || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Contact"
                    name="student_contact"
                    value={formData.student_contact || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Guardian"
                    name="guardian"
                    value={formData.guardian || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Guardian Phone"
                    name="guardian_phone"
                    value={formData.guardian_phone || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    fullWidth
                    helperText="Enter new password to change it"
                  />
                  <TextField
                    label="Confirm Password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password || ""}
                    onChange={handleChange}
                    fullWidth
                  />

                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={updateStudentDetails}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                  <>
                    <Typography variant="h5">
                      <strong>Name:</strong> {student?.name}
                    </Typography>
                    <Typography variant="h6">
                      <strong>Email:</strong> {student?.email}
                    </Typography>
                    <Typography variant="h6">
                      <strong>Gender:</strong> {student?.gender}
                    </Typography>
                    <Typography variant="h6">
                      <strong>Age:</strong> {student?.age}
                    </Typography>
                    <Typography variant="h6">
                      <strong>Contact:</strong> {student?.student_contact}
                    </Typography>
                    <Typography variant="h6">
                      <strong>Guardian:</strong> {student?.guardian}
                    </Typography>
                    <Typography variant="h6">
                      <strong>Guardian Phone:</strong> {student?.guardian_phone}
                    </Typography>
                    <Typography variant="h6">
                      <strong>Password:</strong> ****
                    </Typography>
{(() => {
  const idToYearMap = {
    "6808a9d279c6bb24421c5524": "2nd Year",
    "6808a9d379c6bb24421c5527": "3rd Year",
    "6808a9d379c6bb24421c552a": "4th Year",
  };

  if (student?.student_class) {
    if (typeof student.student_class === "string") {
      return (
        <Typography variant="h6">
          <strong>Year:</strong> {idToYearMap[student.student_class] || "Unknown Year"}
        </Typography>
      );
    } else if (typeof student.student_class === "object") {
      if (student.student_class._id && idToYearMap[student.student_class._id]) {
        return (
          <Typography variant="h6">
            <strong>Year:</strong> {idToYearMap[student.student_class._id]}
          </Typography>
        );
      } else if (student.student_class.semester_text) {
        return (
          <Typography variant="h6">
            <strong>Year:</strong> {student.student_class.semester_text} Year
          </Typography>
        );
      }
    }
  }
  return (
    <Typography variant="h6">
      <strong>Year:</strong> Unknown Year
    </Typography>
  );
})()}
                  </>
              )}
            </Box>
          ) : (
            <Typography variant="h6" color="textSecondary" textAlign="center">
              No student data available.
            </Typography>
          )}
        </Paper>
      )}
    </>
  );
};

export default StudentProfile;
