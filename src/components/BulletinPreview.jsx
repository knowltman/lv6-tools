import React from "react";
import { Box, Typography } from "@mui/material";
import { programStore } from "../stores/program";
import { settingsStore } from "../stores/settings";
import { formStore } from "../stores/formValues";
import { format, parseISO } from "date-fns";

const BulletinPreview = ({ announcementText }) => {
  const { programData, selectedProgramDate } = programStore();
  const { meetingTime } = settingsStore();
  const { formValues2 } = formStore();

  // Safely access formValues2
  if (!formValues2) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>Loading bulletin...</Typography>
      </Box>
    );
  }

  // Get presiding and conducting info
  const presiding =
    formValues2.presiding?.first_name && formValues2.presiding?.last_name
      ? `${formValues2.presiding.first_name} ${formValues2.presiding.last_name}`
      : "";
  const conducting =
    formValues2.conducting?.first_name && formValues2.conducting?.last_name
      ? `${formValues2.conducting.first_name} ${formValues2.conducting.last_name}`
      : "";
  const organist =
    formValues2.organist?.first_name && formValues2.organist?.last_name
      ? `${formValues2.organist.first_name} ${formValues2.organist.last_name}`
      : formValues2.organist?.name || "";
  const chorister =
    formValues2.chorister?.first_name && formValues2.chorister?.last_name
      ? `${formValues2.chorister.first_name} ${formValues2.chorister.last_name}`
      : formValues2.chorister?.name || "";

  // Get hymns
  const openingHymn = formValues2.opening_hymn;
  const sacramentHymn = formValues2.sacrament_hymn;
  const closingHymn = formValues2.closing_hymn;
  const intermediateHymn = formValues2.intermediate_hymn;

  // Get prayers
  const invocation = formValues2.invocation
    ? formValues2.invocation.first_name && formValues2.invocation.last_name
      ? `${formValues2.invocation.first_name} ${formValues2.invocation.last_name}`
      : formValues2.invocation.name || "By Invitation"
    : "By Invitation";
  const benediction = formValues2.benediction
    ? formValues2.benediction.first_name && formValues2.benediction.last_name
      ? `${formValues2.benediction.first_name} ${formValues2.benediction.last_name}`
      : formValues2.benediction.name || "By Invitation"
    : "By Invitation";

  // Get musical number
  const musicalNumber = formValues2.special_musical_number?.name || "";
  const musicalPerformer = formValues2.special_musical_number?.performer || "";

  // Get speakers
  const speakers = [];
  for (let i = 1; i <= 20; i++) {
    const speaker = formValues2[`speaker_${i}`];
    if (speaker) {
      const speakerName =
        typeof speaker === "string"
          ? speaker
          : speaker.name ||
            (speaker.first_name && speaker.last_name
              ? `${speaker.first_name} ${speaker.last_name}`
              : "");
      if (speakerName) {
        speakers.push(speakerName);
      }
    }
  }

  // Get intermediate hymn position - use formValues2 as the source of truth
  const hymnPosition =
    formValues2.intermediate_hymn_position !== undefined &&
    !(formValues2.intermediate_hymn_position === 1 && speakers.length > 2)
      ? Number(formValues2.intermediate_hymn_position)
      : Math.ceil(speakers.length / 2);

  // Format date
  const formattedDate = selectedProgramDate
    ? format(parseISO(selectedProgramDate), "MMMM d, yyyy")
    : "";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        p: 3,
        backgroundColor: "white",
        fontFamily: "Times New Roman, serif",
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 1, fontFamily: "inherit" }}
        >
          Sacrament Meeting
        </Typography>
        <Typography variant="h6" sx={{ fontFamily: "inherit" }}>
          {formattedDate}
        </Typography>
      </Box>

      {/* Meeting Info */}
      <Box sx={{ mb: 3, fontSize: "14px" }}>
        <Box sx={{ display: "flex", mb: 0.5 }}>
          <Box sx={{ width: "100px" }}>Presiding</Box>
          <Box sx={{ flex: 1, borderBottom: "1px dotted #000" }}>
            {presiding}
          </Box>
        </Box>
        <Box sx={{ display: "flex", mb: 0.5 }}>
          <Box sx={{ width: "100px" }}>Conducting</Box>
          <Box sx={{ flex: 1, borderBottom: "1px dotted #000" }}>
            {conducting}
          </Box>
        </Box>
        <Box sx={{ display: "flex", mb: 0.5 }}>
          <Box sx={{ width: "100px" }}>Organist</Box>
          <Box sx={{ flex: 1, borderBottom: "1px dotted #000" }}>
            {organist}
          </Box>
        </Box>
        <Box sx={{ display: "flex", mb: 0.5 }}>
          <Box sx={{ width: "100px" }}>Chorister</Box>
          <Box sx={{ flex: 1, borderBottom: "1px dotted #000" }}>
            {chorister}
          </Box>
        </Box>
      </Box>

      {/* Opening Hymn */}
      {openingHymn && (
        <Box sx={{ mb: 2, fontSize: "14px" }}>
          <Box>
            Opening Hymn:{" "}
            <Box component="span" sx={{ borderBottom: "1px dotted #000" }}>
              #{openingHymn.number} {openingHymn.name}
            </Box>
          </Box>
        </Box>
      )}

      {/* Invocation */}
      <Box sx={{ mb: 3, fontSize: "14px" }}>
        <Box>
          Invocation:{" "}
          <Box component="span" sx={{ borderBottom: "1px dotted #000" }}>
            {invocation}
          </Box>
        </Box>
      </Box>

      {/* Ward Business */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", fontFamily: "inherit" }}
        >
          Ward Business
        </Typography>
      </Box>

      {/* Musical Number */}
      {musicalNumber && (
        <Box sx={{ mb: 3, fontSize: "14px", textAlign: "center" }}>
          <Box>
            Musical Number:{" "}
            <Box component="span" sx={{ borderBottom: "1px dotted #000" }}>
              {musicalNumber}
            </Box>
          </Box>
          {musicalPerformer && (
            <Box sx={{ fontStyle: "italic" }}>{musicalPerformer}</Box>
          )}
        </Box>
      )}

      {/* Sacrament Hymn */}
      {sacramentHymn && (
        <Box sx={{ mb: 3, fontSize: "14px", textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              mb: 1,
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          >
            Sacrament
          </Typography>
          <Box>
            Hymn:{" "}
            <Box component="span" sx={{ borderBottom: "1px dotted #000" }}>
              #{sacramentHymn.number} {sacramentHymn.name}
            </Box>
          </Box>
        </Box>
      )}

      {/* Speakers with Intermediate Hymn positioned */}
      {speakers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {speakers.map((speaker, index) => (
            <React.Fragment key={index}>
              <Box sx={{ fontSize: "13px", mb: 1 }}>
                {index + 1}. {speaker}
              </Box>
              {index + 1 === hymnPosition &&
                intermediateHymn &&
                intermediateHymn.number && (
                  <Box
                    sx={{
                      fontSize: "13px",
                      fontStyle: "italic",
                      ml: 2,
                      mb: 1,
                      borderBottom: "1px dotted #000",
                      pb: 1,
                    }}
                  >
                    Intermediate: #{intermediateHymn.number}{" "}
                    {intermediateHymn.name}
                  </Box>
                )}
            </React.Fragment>
          ))}
        </Box>
      )}

      {/* Bearing of Testimonies (Fast Sunday) */}
      {speakers.length === 0 && (
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontStyle: "italic",
              fontFamily: "inherit",
            }}
          >
            Bearing of Testimonies
          </Typography>
        </Box>
      )}

      {/* Closing Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            mb: 2,
            fontSize: "14px",
            fontFamily: "inherit",
            textAlign: "center",
          }}
        >
          Closing
        </Typography>
        {closingHymn && (
          <Box sx={{ fontSize: "14px", mb: 2, textAlign: "center" }}>
            <Box>
              Hymn:{" "}
              <Box component="span" sx={{ borderBottom: "1px dotted #000" }}>
                #{closingHymn.number} {closingHymn.name}
              </Box>
            </Box>
          </Box>
        )}
        <Box sx={{ fontSize: "14px", textAlign: "center" }}>
          <Box>
            Benediction:{" "}
            <Box component="span" sx={{ borderBottom: "1px dotted #000" }}>
              {benediction}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BulletinPreview;
