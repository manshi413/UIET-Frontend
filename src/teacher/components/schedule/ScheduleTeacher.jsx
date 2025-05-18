import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseApi } from "../../../environment.js";


export default function ScheduleTeacher() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchSchedule();
    }
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const response = await axios.get(`${baseApi}/semester/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSemesters(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedSemester(response.data.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${baseApi}/schedule/fetch-with-semester/${selectedSemester}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedEvents = response.data.data.map((event) => {
        const subjectName = event.subject?.subject_name || "Unknown Subject";
        const teacherName = event.teacher?.name || "Unknown Teacher";
        const day = event.day; // 0 (Sunday) to 6 (Saturday)

        if (day === undefined || day < 1 || day > 6) return null; // Only Monday-Saturday

        return {
          id: event._id,
          title: `${subjectName} - ${teacherName}`,
          daysOfWeek: [day], // FullCalendar uses 0 (Sunday) - 6 (Saturday)
          startTime: event.startTime,
          endTime: event.endTime,
        };
      }).filter(event => event !== null);

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };


  return (
    <div style={{ height: "100vh", padding: "20px" }}>
      <TextField
        select
        fullWidth
        label="Semester"
        variant="outlined"
        value={selectedSemester}
        onChange={(e) => setSelectedSemester(e.target.value)}
      >
        <MenuItem value="">Select Semester</MenuItem>
        {semesters.map((x) => (
          <MenuItem key={x._id} value={x._id}>
            {x.semester_text} ({x.semester_num})
          </MenuItem>
        ))}
      </TextField>

      

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        editable={false}
        selectable={false}
        height="80vh"
      />
    </div>
  );
}
