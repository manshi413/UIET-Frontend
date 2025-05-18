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

const TeacherProfile = () => {
  const token = localStorage.getItem("authToken");
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [showDetails, setShowDetails] = useState(true);

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  const fetchTeacherDetails = useCallback(async () => {
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
      const response = await axios.get(`${baseApi}/teacher/fetch-single`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched teacher data:", response.data.teacher);
      setTeacher(response.data.teacher);
      setFormData(response.data.teacher);
    } catch (error) {
      console.error("Error fetching teacher details:", error);
      setAlert({
        open: true,
        message: "Failed to fetch teacher details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [token, setAlert, setLoading, setTeacher, setFormData]);

const updateTeacherDetails = async () => {
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
        } else if (key === "password") {
          if (formData.password && formData.password.trim() !== "") {
            data.append("password", [formData.password]);
          }
        } else {
          data.append(key, formData[key]);
        }
      }
      await axios.patch(`${baseApi}/teacher/update/${teacher._id}`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      // Call director API to sync director password with teacher password
      try {
        await axios.post(
          `${baseApi}/director/create-or-update-from-teacher`,
          { teacherId: teacher._id, isActive: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error syncing director password:", error);
      }

      // After successful update, show success alert, close editing and refresh teacher details
      setAlert({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
      setEditing(false);
      fetchTeacherDetails();

    } catch (error) {
      console.error("Error updating teacher profile:", error);
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
    fetchTeacherDetails();
  }, [fetchTeacherDetails]);

  const getImageUrl = (filename) => {
    if (!filename) return "";
    const url = `/images/uploaded/teacher/${filename}`;
    console.log("Constructed teacher image URL:", url);
    return url;
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
        Teacher Profile
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
            onClick={() => {
              setEditing(true);
              const mainContent = document.getElementById("main-content");
              if (mainContent) {
                mainContent.scrollTop = 0;
              } else {
                window.scrollTo(0, 0);
              }
            }}
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
          ) : teacher ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              {teacher?.teacher_image ? (
                <Avatar
                  src={getImageUrl(teacher.teacher_image)}
                  alt={teacher.name}
                  sx={{ width: 120, height: 120 }}
                />
              ) : (
                <Avatar sx={{ width: 120, height: 120 }}>
                  {teacher?.name ? teacher.name.charAt(0) : "T"}
                </Avatar>
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
                    label="Department"
                    name="department"
                    value={formData.department?.department_name || ""}
                    disabled
                    fullWidth
                  />
                  <TextField
                    label="Qualification"
                    name="qualification"
                    value={formData.qualification || ""}
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
                  />

                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={updateTeacherDetails}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setFormData(teacher);
                        setEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="h5">
                    <strong>Name:</strong> {teacher?.name}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Email:</strong> {teacher?.email}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Gender:</strong> {teacher?.gender}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Age:</strong> {teacher?.age}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Qualification:</strong> {teacher?.qualification}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Department:</strong> {teacher?.department?.department_name || ""}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Password:</strong> {"*****"}
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <Typography variant="h6" color="textSecondary" textAlign="center">
              No teacher data available.
            </Typography>
          )}
        </Paper>
      )}
    </>
  );
};

export default TeacherProfile;
