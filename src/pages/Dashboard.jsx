import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Avatar,
  Skeleton,
  useMediaQuery,
  Grid2,
} from "@mui/material";
import { format, getDate, parseISO } from "date-fns";
import CircularWithValueLabel from "../components/CircularProgressWithLabel";
import Check from "@mui/icons-material/Check";
import {
  calculateProgress,
  getPrayersCompletionStatus,
  getSpeakersCompletionStatus,
  getMusicCompletionStatus,
} from "./Dashboard.logic";
import { uiStore } from "../stores/uiStore";
import { membersStore } from "../stores/members";
import { dataStore } from "../stores/data";
import { programStore } from "../stores/program";
import { speakersStore } from "../stores/speakers";
import { prayersStore } from "../stores/prayers";
import { musicStore } from "../stores/music";
import { formStore } from "../stores/formValues";
import axios from "axios";
import { getImageName } from "../app.logic";

const Dashboard = (props) => {
  const { setIsLoading } = props;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { user } = membersStore((state) => state);
  const { date } = dataStore((state) => state);
  const specialSundays = programStore((state) => state.specialSundays);
  const { sundaySpeakers } = speakersStore();
  const { sundayPrayers } = prayersStore();
  const { sundayMusic } = musicStore();
  const { formValues2 } = formStore();

  const [speakerSuggestions, setSpeakerSuggestions] = useState({});
  const [youthSpeakerSuggestions, setYouthSpeakerSuggestions] = useState({});
  const [prayerSuggestions, setPrayerSuggestions] = useState({});

  // const nextSunday = getNextSunday();
  // const date = format(nextSunday, "yyyy-MM-dd");

  const isFirstSunday =
    getDate(parseISO(date)) <= 7 && parseISO(date).getDay() === 0;

  const [progressValue, setProgressValue] = useState(0);
  //const [nextSundaySpeakers, setNextSundaySpeakers] = useState([]);

  const isLoaded = user && user.first_name && user.last_name;

  const isPrayersComplete = getPrayersCompletionStatus(formValues2);
  const isSpeakersComplete = getSpeakersCompletionStatus(formValues2);
  const isMusicComplete = getMusicCompletionStatus(sundayMusic);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);

      const speakerSuggestionsResponse = await axios.get(
        `/speaker-suggestions`
      );

      const youthSpeakerSuggestionsResponse = await axios.get(
        `/youth-speaker-suggestions`
      );
      const prayerSuggestionsResponse = await axios.get(`/prayer-suggestions`);

      setSpeakerSuggestions(speakerSuggestionsResponse.data);
      setYouthSpeakerSuggestions(youthSpeakerSuggestionsResponse.data);
      setPrayerSuggestions(prayerSuggestionsResponse.data);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const newProgress = calculateProgress(
      isPrayersComplete,
      isSpeakersComplete,
      isMusicComplete,
      specialSundays,
      isFirstSunday
    );
    fetchSuggestions();
    setProgressValue(newProgress);

    // const upcomingSpeakers = getNextSundaySpeakers(sundaySpeakers);
    //setNextSundaySpeakers(upcomingSpeakers);
  }, [formValues2]);

  const handleSelectionChange = (speaker) => {
    membersStore
      .getState()
      .fetchMemberData(speaker.speaker_id)
      .then(() => {})
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    uiStore.getState().setSidebarOpen(true);
  };

  return (
    <div className="container">
      <div className="dashboard">
        <Card variant="outlined">
          {isMobile && <CardHeader title="Program Completion" />}
          <CardContent>
            <Grid2 container alignItems={"center"}>
              {!isMobile && (
                <Grid2 size={{ xs: 12, md: 8 }}>
                  <div className="user-block">
                    {isLoaded ? (
                      <Avatar sx={{ width: 100, height: 100 }}>
                        <img
                          className={"large-user-image"}
                          src={getImageName(user)}
                          alt={`${user.first_name} ${user.last_name}`}
                        />
                      </Avatar>
                    ) : (
                      <Skeleton
                        variant="circular"
                        width={128}
                        height={128}
                        animation="wave"
                      />
                    )}
                    <div className="user-block__user-info">
                      {isLoaded ? (
                        <>
                          <Typography variant="h1">
                            {`${user.first_name} ${user.last_name}`}
                          </Typography>
                          <Typography variant="h5">{user.calling}</Typography>
                        </>
                      ) : (
                        <>
                          <Skeleton variant="text" width={200} height={50} />
                          <Skeleton variant="text" width={150} height={30} />
                        </>
                      )}
                    </div>
                  </div>
                </Grid2>
              )}
              <Grid2
                size={{ xs: 12, md: 4 }}
                justifyContent={!isMobile && "flex-end"}
                paddingTop={isMobile && 0}
              >
                <Grid2 container spacing={2} alignItems={"center"}>
                  <Grid2 size={6}>
                    <Typography variant="p" sx={{ color: "text.secondary" }}>
                      {isPrayersComplete === 2 ? (
                        <div className="progress-item">
                          <Check
                            fontSize="small"
                            sx={{ color: "green", mr: 1 }}
                          />
                          <span className="complete">Prayers</span>
                        </div>
                      ) : (
                        <div>Need Prayer(s)</div>
                      )}
                    </Typography>
                    <Typography variant="p" sx={{ color: "text.secondary" }}>
                      {isSpeakersComplete ? (
                        <div className="progress-item">
                          <Check
                            fontSize="small"
                            sx={{ color: "green", mr: 1 }}
                          />
                          <span className="complete">Speakers</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            textDecoration:
                              formValues2.speaker_1?.first_name?.length > 1
                                ? ""
                                : "line-through",
                          }}
                        >
                          Need Speakers
                        </div>
                      )}
                    </Typography>
                    <Typography variant="p" sx={{ color: "text.secondary" }}>
                      {isMusicComplete ? (
                        <div className="progress-item">
                          <Check
                            fontSize="small"
                            sx={{ color: "green", mr: 1 }}
                          />
                          <span className="complete">Music</span>
                        </div>
                      ) : (
                        <div>Need Music</div>
                      )}
                    </Typography>
                  </Grid2>
                  <Grid2 size={6} justifyContent={"flex-end"} display="flex">
                    <CircularWithValueLabel value={progressValue} />
                  </Grid2>
                </Grid2>
              </Grid2>
            </Grid2>
          </CardContent>
        </Card>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 6, xl: 4 }}>
            <Card variant="outlined">
              <CardHeader title="Speaker Suggestions" />
              <CardContent>
                <Grid2 container spacing={1} columnSpacing={4}>
                  {Array.isArray(speakerSuggestions) &&
                    speakerSuggestions.map((speaker) => (
                      <Grid2
                        size={{ xs: 12, sm: 6, md: 6 }}
                        display="flex"
                        justifyContent={"space-between"}
                        key={speaker.speaker_id}
                      >
                        <span
                          className="speaker__name"
                          onClick={() => handleSelectionChange(speaker)}
                        >{`${speaker.first_name} ${speaker.last_name}`}</span>
                        <span className="speaker__date">
                          {format(speaker.newest_date, "M/dd/yy")}
                        </span>
                      </Grid2>
                    ))}
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6, xl: 4 }}>
            <Card variant="outlined">
              <CardHeader title="Youth Speaker Suggestions" />
              <CardContent>
                <Grid2 container spacing={1} columnSpacing={4}>
                  {Array.isArray(youthSpeakerSuggestions) &&
                    youthSpeakerSuggestions.map((speaker) => (
                      <Grid2
                        size={{ xs: 12, sm: 6, md: 6 }}
                        display="flex"
                        justifyContent={"space-between"}
                        key={speaker.speaker_id}
                      >
                        <span
                          className="speaker__name"
                          onClick={() => handleSelectionChange(speaker)}
                        >{`${speaker.first_name} ${speaker.last_name}`}</span>
                        <span className="speaker__date">
                          {format(speaker.newest_date, "M/dd/yy")}
                        </span>
                      </Grid2>
                    ))}
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2
            size={{ xs: 12, md: 6, xl: 4 }}
            style={{ marginBottom: "9rem" }}
          >
            <Card variant="outlined">
              <CardHeader title="Prayers" />
              <CardContent>
                <Grid2 container spacing={1}>
                  {Array.isArray(prayerSuggestions) &&
                    prayerSuggestions.map((speaker) => (
                      <Grid2
                        size={{ xs: 6, sm: 6, md: 6 }}
                        display="flex"
                        justifyContent={"space-between"}
                        key={speaker.speaker_id}
                      >
                        <span
                          className="speaker__name"
                          onClick={() => handleSelectionChange(speaker)}
                        >{`${speaker.first_name} ${speaker.last_name}`}</span>
                      </Grid2>
                    ))}
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </div>
    </div>
  );
};
export default Dashboard;
