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
import { baseApi } from "../../environment";
import SnackbarAlert from "../../basic utility components/snackbar/SnackbarAlert";

const Dashboard = () => {
  const token = localStorage.getItem("authToken");

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    else if (hour < 18) return "Afternoon";
    else return "Evening";
  };

  const [director, setDirector] = useState(null);
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

  const fetchDirectorDetails = useCallback(async () => {
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
      const response = await axios.get(`${baseApi}/director/fetch-single`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched teacher data:", response.data.teacher);
      setDirector(response.data.teacher);
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
  }, [token, setAlert, setLoading, setDirector, setFormData]);

  const updateDirectorDetails = async () => {
    try {
      setLoading(true);
      console.log("Updating director with ID:", director?._id);
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
      // Update director collection
      const directorResponse = await axios.patch(`${baseApi}/director/update/${director._id}`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      console.log("Director update response:", directorResponse.data);
      // Update teacher collection
      const teacherResponse = await axios.patch(`${baseApi}/teacher/update/${director._id}`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      console.log("Teacher update response:", teacherResponse.data);
    } catch (error) {
      console.error("Error updating director profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      setAlert({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectorDetails();
  }, [fetchDirectorDetails]);

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

      {/* Welcome message snippet inserted at top */}
      <Box
        sx={{
          backgroundColor: "#e3eaf3",
          borderRadius: 3,
          p: 3,
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            {`Good ${getTimeOfDay()} 🏢, ${director?.name ? ` ${director.name}` : "Loading..."}`} <span role="img" aria-label="waving hand">👋</span>
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome to your personalized teacher Dashboard.
          </Typography>
        </Box>
        <Box>
          <img
            src="/src/assets/welcome.png"
            alt="Welcome"
            style={{ width: 150, height: "auto", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          />
        </Box>
      </Box>

      <Typography
        variant="h3"
        sx={{ textAlign: "center", fontWeight: 700, color: "#1976d2", mb: 4 }}
      >
        Director Profile
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
          ) : director ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
              }}
            >
              {director?.teacher_image ? (
                <Avatar
                  src={getImageUrl(director.teacher_image)}
                  alt={director.name}
                  sx={{ width: 120, height: 120 }}
                />
              ) : (
                <Avatar sx={{ width: 120, height: 120 }}>
                  {director?.name ? director.name.charAt(0) : "D"}
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
                      onClick={updateDirectorDetails}
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
                    <strong>Name:</strong> {director?.name}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Email:</strong> {director?.email}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Gender:</strong> {director?.gender}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Age:</strong> {director?.age}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Qualification:</strong> {director?.qualification}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Department:</strong> {director?.department?.department_name || ""}
                  </Typography>
                  <Typography variant="h6">
                    <strong>Password:</strong> {"*****"}
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <Typography variant="h6" color="textSecondary" textAlign="center">
              No director data available.
            </Typography>
          )}
        </Paper>
      )}
    </>
  );
};

export default Dashboard;
