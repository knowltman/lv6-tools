import { useState } from "react";
import { IconButton, Box, Chip, useMediaQuery } from "@mui/material";
import {
  differenceInYears,
  differenceInMonths,
  parse,
  isValid,
  format,
  parseISO,
} from "date-fns";
import axios from "axios";
import SnackBar from "../SnackBar";
import Delete from "@mui/icons-material/Delete";
import { membersStore } from "../../stores/members";

const apiURL = import.meta.env.VITE_API_URL;

const MemberDetail = () => {
  const memberData = membersStore((state) => state.memberData);
  const fetchMemberData = membersStore((state) => state.fetchMemberData);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [newSpeakingDates, setNewSpeakingDates] = useState("");
  const [newPrayerDates, setNewPrayerDates] = useState("");
  const [savedStatus, setSavedStatus] = useState("");
  const [isProgramSaved, setIsProgramSaved] = useState(false);

  const handleChange = (value) => {
    setNewSpeakingDates(value);
  };

  const handlePrayerChange = (value) => {
    setNewPrayerDates(value);
  };

  const handleSpeakingSave = async () => {
    const newDates = newSpeakingDates.split(" ");

    const convertedDates = newDates.map((date) => {
      const yearFormat =
        date.split("/")[2].length === 2 ? "M/d/yy" : "M/d/yyyy";
      return format(parse(date, yearFormat, new Date()), "yyyy-MM-dd");
    });

    const speakerId = memberData?.id;

    try {
      const response = await axios.post(`${apiURL}/api/speaker`, {
        newDates: convertedDates,
        speakerId,
      });
      setNewSpeakingDates("");
      fetchMemberData(memberData?.id);
    } catch (e) {}
  };

  const handlePrayerSave = async () => {
    const newDates = newPrayerDates.split(" ");
    const speakerId = memberData?.id;

    try {
      const response = await axios.post(`${apiURL}/api/prayer`, {
        newDates,
        speakerId,
      });
      setNewPrayerDates("");
      fetchMemberData(memberData?.id);
    } catch (e) {}
  };

  const parseDate = (dateString) => {
    if (!dateString) {
      console.error("Invalid date string:", dateString);
      return null;
    }

    // Parse using the yyyy-MM-dd format first
    let parsedDate = parse(dateString, "yyyy-MM-dd", new Date());

    // If the first parse is not valid, try yy-MM-dd
    if (!isValid(parsedDate)) {
      parsedDate = parse(dateString, "yy-MM-dd", new Date());
    }

    if (!isValid(parsedDate)) {
      console.error("Invalid date format:", dateString);
      return null;
    }

    return parsedDate;
  };

  const calculateTimeDifference = (latestDate) => {
    if (!latestDate) {
      return {
        color: "gray",
        label: "No date available",
      };
    }

    const today = new Date();
    const latest = parseDate(latestDate);

    if (!latest) {
      return {
        color: "gray",
        label: "Invalid date",
      };
    }

    const years = differenceInYears(today, latest);
    const months = differenceInMonths(today, latest) % 12;

    if (years === 0 && months <= 1) {
      return {
        color: "red",
        label: "This Month",
      };
    } else if (years === 0 && months < 12) {
      return {
        color: "red",
        label: `${months} ${months > 1 ? "months" : "month"}`,
      };
    } else if (months >= 12) {
      return {
        color: "orange",
        label: `${years} ${years > 1 ? "years" : "year"} ${months} ${
          months > 1 ? "months" : "month"
        }`,
      };
    } else {
      return {
        color: "green",
        label: `${years} ${years > 1 ? "years" : "year"} ${months} ${
          months > 1 ? "months" : "month"
        }`,
      };
    }
  };

  const dateFormat = "yyyy-MM-dd";
  const shortDateFormat = "yy-MM-dd";

  const parseDatesArray = (datesString) => {
    return datesString
      .split(" ")
      .map((date) => {
        const trimmedDate = date.trim();
        let parsedDate;

        parsedDate = parse(trimmedDate, dateFormat, new Date());

        if (!isValid(parsedDate)) {
          parsedDate = parse(trimmedDate, shortDateFormat, new Date());
        }

        if (!isValid(parsedDate)) {
          const yearMatch = trimmedDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
          if (yearMatch) {
            const month = yearMatch[1];
            const day = yearMatch[2];
            const year = parseInt(yearMatch[3], 10);
            const fullYear = year < 50 ? year + 2000 : year + 1900;

            parsedDate = parse(
              `${month}/${day}/${fullYear}`,
              dateFormat,
              new Date()
            );
          }
        }

        if (!isValid(parsedDate)) {
          console.error("Invalid date:", trimmedDate);
          return null;
        }

        return format(parsedDate, dateFormat);
      })
      .filter((date) => date !== null)
      .sort((a, b) => new Date(b) - new Date(a));
  };

  const handlePrayerDelete = async (date) => {
    const speakerId = memberData?.id;

    try {
      const response = await axios.delete(`${apiURL}/api/prayer`, {
        params: {
          speakerId,
          date,
        },
      });
      setNewPrayerDates("");
      fetchMemberData(memberData?.id);
    } catch (e) {
      console.error("Error deleting prayer date", e);
    }
  };
  const memberName = `${memberData?.first_name ?? ""} ${
    memberData?.last_name ?? ""
  }`;

  //Speaker dates
  const speakerDates = memberData?.speaker_dates
    ? parseDatesArray(memberData?.speaker_dates)
    : [];

  const latestSpeakingDate = speakerDates.length ? speakerDates[0] : null;

  const lastSpoke = calculateTimeDifference(latestSpeakingDate).label;
  const barColor = calculateTimeDifference(latestSpeakingDate).color;

  //Prayer dates
  const prayerDates = memberData?.prayer_dates
    ? parseDatesArray(memberData?.prayer_dates)
    : [];

  const latestPrayerDate = prayerDates.length ? prayerDates[0] : null;

  const lastPrayed = calculateTimeDifference(latestPrayerDate).label;
  const prayBarColor = calculateTimeDifference(latestPrayerDate).color;

  const speakerInfo =
    latestSpeakingDate !== null ? (
      <>
        <Box
          style={{
            borderLeft: "5px solid",
            padding: "1rem 1rem 1rem 1.5rem",
            backgroundColor: "#efeeee",
            borderLeftColor: barColor,
            marginTop: "2rem",
          }}
        >
          <div>Last Spoke</div>
          <div className="last-spoke-date">{lastSpoke}</div>
        </Box>
        <>
          <h3>Dates Spoken:</h3>
          <ul>
            {speakerDates.map((date, index) => (
              <li key={index}>{format(parseISO(date), "MMM dd, yyyy")}</li>
            ))}
          </ul>
        </>
        {/* <div style={{ marginBottom: "1rem" }}>
          <h3>Add Speaking Dates:</h3>
          <div className="save-fields">
            <TextField
              value={newSpeakingDates}
              onChange={(e) => handleChange(e.target.value)}
              fullWidth
              size="small"
            />
            <Button onClick={() => handleSpeakingSave()}>Save</Button>
          </div>
        </div> */}
      </>
    ) : (
      <div style={{ marginBottom: "1rem" }}>
        {/* <h3>Add Speaking Dates:</h3>
        <div className="save-fields">
          <TextField
            value={newSpeakingDates}
            onChange={(e) => handleChange(e.target.value)}
            fullWidth
            size="small"
          />
          <Button onClick={() => handleSpeakingSave()}>Save</Button>
        </div> */}
      </div>
    );

  const prayerInfo = latestPrayerDate ? (
    <div style={{ marginTop: "2rem" }}>
      <Box
        style={{
          borderLeft: "5px solid",
          padding: "1rem 1rem 1rem 1.5rem",
          backgroundColor: "#efeeee",
          borderLeftColor: prayBarColor,
        }}
      >
        <div>Last Prayed</div>
        <div className="last-spoke-date">{lastPrayed}</div>
      </Box>
      <div style={{ marginBottom: "1rem" }}>
        <h3>Dates Prayed:</h3>
        <ul>
          {prayerDates.map((date, index) => (
            <li className="prayer-date" key={index}>
              {format(parseISO(date), "MMM dd, yyyy")}
              <IconButton
                className="delete-button"
                size="small"
                onClick={() => handlePrayerDelete(date)}
              >
                <Delete />
              </IconButton>
            </li>
          ))}
        </ul>
      </div>
      {/* <>
        <h3>Add Prayer Dates:</h3>
        <div className="save-fields">
          <TextField
            value={newPrayerDates}
            onChange={(e) => handlePrayerChange(e.target.value)}
            fullWidth
            size="small"
          />
          <Button onClick={() => handlePrayerSave()}>Save</Button>
        </div>
      </> */}
    </div>
  ) : (
    <>
      {/* <h3>Add Prayer Dates:</h3>
      <div className="save-fields">
        <TextField
          value={newPrayerDates}
          onChange={(e) => handlePrayerChange(e.target.value)}
          fullWidth
          size="small"
        />
        <Button onClick={() => handlePrayerSave()}>Save</Button>
      </div> */}
    </>
  );

  const InfoWrapper = () => (
    <>
      {speakerInfo}
      {prayerInfo}
    </>
  );

  return Object.keys(memberData).length > 0 ? (
    <>
      <div
        style={{
          width: isMobile ? 300 : 400,
          padding: "0 20",
          overflow: "auto",
          height: "calc(100vh - 59px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#ffffffcc",
            backdropFilter: "blur(3px)",
            top: 0,
            margin: "0 -20px 0 -20px",
            padding: "0 20px 0 20px",
            position: "sticky",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
            }}
          >
            {memberName}
          </h2>
          {memberData?.isYouth ? (
            <Chip
              style={{ marginLeft: "1rem" }}
              color="primary"
              label="Youth"
            ></Chip>
          ) : null}
        </div>
        {memberData?.can_ask ? (
          <InfoWrapper />
        ) : (
          <Box
            style={{
              borderLeft: "5px solid",
              padding: "1rem 1rem 1rem 1.5rem",
              backgroundColor: "#efeeee",
              borderLeftColor: "red",
            }}
          >
            <div>Last Spoke</div>
            <div className="last-spoke-date">Don't Ask</div>
          </Box>
        )}
      </div>
      <SnackBar
        open={isProgramSaved}
        setOpen={setIsProgramSaved}
        severity={"success"}
        message={savedStatus}
      />
    </>
  ) : (
    <div className="empty-detail">Make a selection</div>
  );
};
export default MemberDetail;
