import { IconButton, Tooltip } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { formStore } from "../../stores/formValues";
import { useState } from "react";
import { checkForSpecialSundays } from "../../pages/Dashboard.logic";

const BasicStrings = {
  wonderfulProgram: "We have a wonderful program today, we will hear from",
  fastSundayIntro:
    "We thank you for your reverence during the sacrament, we'll excuse the Aaronic Priesthood holders to sit with their families.",
  fastSundayOutro:
    "We now invite you to come forward to share a brief testimony of the Savior, and would like to close at 5 to the hour. Please remember to state your name.",
};

const ProgramSection = ({
  programData,
  isLoading,
  selectedProgramDate,
  specialSundays,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const isSpecialSunday = checkForSpecialSundays(
    selectedProgramDate,
    specialSundays,
  );

  // Fast Sunday check
  if (
    (!isSpecialSunday && programData.speaker_1?.first_name?.length === 0) ||
    programData.speaker_1?.subject?.includes("Blessing") ||
    programData.speaker_1?.subject?.includes("blessing")
  ) {
    return (
      <div className="info-block">
        <div className="info-block__title">Program</div>
        <div className="info-block__value">
          <p>{BasicStrings.fastSundayIntro}</p>
          <p className="error-text">SHARE A BRIEF TESTIMONY</p>
          <p>{BasicStrings.fastSundayOutro}</p>
        </div>
      </div>
    );
  }

  if (isSpecialSunday && isSpecialSunday === "Fast Sunday") {
    return (
      <div className="info-block">
        <div className="info-block__title">Program</div>
        <div className="info-block__value">
          <p>{BasicStrings.fastSundayIntro}</p>
          <p className="error-text">SHARE A BRIEF TESTIMONY</p>
          <p>{BasicStrings.fastSundayOutro}</p>
        </div>
      </div>
    );
  }

  if (isSpecialSunday && isSpecialSunday !== "Ward Conference") {
    return (
      <div className="info-block">
        <div className="info-block__title">Program</div>
        <div className="info-block__value">
          <p>We'd like to thank all in attendance for your reverence.</p>
          <p>
            <b>{isSpecialSunday}</b>
          </p>
        </div>
      </div>
    );
  }

  const speakers = [];
  // Check for all possible speakers
  let consecutiveEmpty = 0;
  for (let i = 1; i <= 20; i++) {
    const speaker = programData[`speaker_${i}`];
    if (speaker?.first_name) {
      speakers.push(speaker);
      consecutiveEmpty = 0; // Reset counter when we find a speaker
    } else {
      consecutiveEmpty++;
      // Stop if we've seen 3 consecutive empty slots
      if (consecutiveEmpty >= 3) break;
    }
  }

  if (speakers.length === 0) {
    return (
      <div className="info-block">
        <div className="info-block__title">Program</div>
        <div className="info-block__value">
          <p>{BasicStrings.fastSundayIntro}</p>
          <p className="error-text">SHARE A BRIEF TESTIMONY</p>
          <p>{BasicStrings.fastSundayOutro}</p>
        </div>
      </div>
    );
  }

  const includeIntermediate = programData.intermediate_hymn?.name?.length > 0;

  // Use stored position or calculate default midpoint
  let hymnPosition = programData.intermediate_hymn_position;
  if (hymnPosition === null || hymnPosition === undefined || 
      (hymnPosition === 1 && speakers.length > 2)) {
    // Default midpoint logic if no position is saved, or if using old default for 3+ speakers
    hymnPosition = Math.ceil(speakers.length / 2);
  }

  // Clamp position to valid range (0 = before all, speakers.length = after all)
  hymnPosition = Math.max(0, Math.min(speakers.length, hymnPosition));

  const canMoveUp = hymnPosition > 0;
  const canMoveDown = hymnPosition < speakers.length;

  const moveHymnUp = () => {
    if (canMoveUp) {
      formStore
        .getState()
        .updateFormValue("intermediate_hymn_position", hymnPosition - 1);
    }
  };

  const moveHymnDown = () => {
    if (canMoveDown) {
      formStore
        .getState()
        .updateFormValue("intermediate_hymn_position", hymnPosition + 1);
    }
  };

  const getIntermediateHymn = () => {
    if (programData.intermediate_hymn.performer === "Ward Choir") {
      return `♫ ${programData.intermediate_hymn?.name} – by The Ward Choir`;
    } else if (programData.intermediate_hymn.performer === "Congregation") {
      return `♫ #${programData.intermediate_hymn?.number} ${programData.intermediate_hymn?.name}`;
    } else {
      return `♫ ${programData.intermediate_hymn?.name} — by ${programData.intermediate_hymn?.performer}`;
    }
  };

  return (
    <div className="info-block">
      <div className="info-block__title">Program</div>
      <div className="info-block__value">
        <p>
          We'd like to thank for your reverence during the administration of the
          sacrament.
        </p>
        <p>{BasicStrings.wonderfulProgram}</p>

        {speakers.map((speaker, index) => {
          const fullName = `${speaker.first_name} ${speaker.last_name}`;
          const nameOrBlessing = fullName.includes("Program Event")
            ? speaker.subject
            : fullName;

          return (
            <div key={index}>
              {/* Show intermediate hymn before this speaker if position matches */}
              {includeIntermediate && index === hymnPosition && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "4px",
                    backgroundColor:
                      hoveredIndex === index ? "#f5f5f5" : "transparent",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <b style={{ flex: 1, fontStyle: "italic" }}>
                    {getIntermediateHymn()}
                  </b>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.125rem",
                      opacity: hoveredIndex === index ? 1 : 0,
                    }}
                  >
                    <Tooltip title="Move hymn up">
                      <span>
                        <IconButton
                          size="small"
                          onClick={moveHymnUp}
                          disabled={!canMoveUp}
                          sx={{
                            padding: "2px",
                            minWidth: "20px",
                            minHeight: "20px",
                          }}
                        >
                          <ArrowUpward sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move hymn down">
                      <span>
                        <IconButton
                          size="small"
                          onClick={moveHymnDown}
                          disabled={!canMoveDown}
                          sx={{
                            padding: "2px",
                            minWidth: "20px",
                            minHeight: "20px",
                          }}
                        >
                          <ArrowDownward sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </div>
                </div>
              )}

              {/* Speaker name */}
              <div>
                <b>{nameOrBlessing}</b>
                <br />
              </div>
            </div>
          );
        })}

        {/* If hymn position is at the end (after all speakers) */}
        {includeIntermediate && hymnPosition === speakers.length && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
              backgroundColor:
                hoveredIndex === speakers.length ? "#f5f5f5" : "transparent",
            }}
            onMouseEnter={() => setHoveredIndex(speakers.length)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <b style={{ flex: 1, fontStyle: "italic" }}>
              {getIntermediateHymn()}
            </b>
            <div
              style={{
                display: "flex",
                gap: "0.125rem",
                opacity: hoveredIndex === speakers.length ? 1 : 0,
              }}
            >
              <Tooltip title="Move hymn up">
                <span>
                  <IconButton
                    size="small"
                    onClick={moveHymnUp}
                    disabled={!canMoveUp}
                    sx={{ padding: "2px", minWidth: "20px", minHeight: "20px" }}
                  >
                    <ArrowUpward sx={{ fontSize: "14px" }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move hymn down">
                <span>
                  <IconButton
                    size="small"
                    onClick={moveHymnDown}
                    disabled={!canMoveDown}
                    sx={{ padding: "2px", minWidth: "20px", minHeight: "20px" }}
                  >
                    <ArrowDownward sx={{ fontSize: "14px" }} />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramSection;
