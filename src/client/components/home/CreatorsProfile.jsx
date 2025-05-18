// import React from "react";
import { Box, Typography, Grid, Card, CardMedia, CardContent } from "@mui/material";


const creators = [
  { name: "Shivansh Gautam", img: "https://placehold.co/240x240", position: "Developer" },
  { name: "Manshi Yadav", img: "https://placehold.co/240x240", position: "Developer" },
  { name: "Rishabh Sharma", img: "https://placehold.co/240x240", position: "Developer" },
];

const CreatorsProfile = () => {
  return (
    <Box sx={{ textAlign: "center", p: 4, bgcolor: "grey.200", borderRadius:"50px", marginLeft:"40px",marginRight:"40px", marginBottom:"20px" , minHeight: "100vh" }}>
      
      
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: "grey.800" }}>
        Contributors
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {creators.map((creator, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: "16px", position: "relative", boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="240"
                image={creator.img}
                alt={creator.name}
                sx={{ filter: "brightness(0.8)" }}
              />
              <CardContent
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {creator.name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {creator.position}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CreatorsProfile;
