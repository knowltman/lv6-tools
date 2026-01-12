import { format, getDay, addDays, parseISO, parse } from "date-fns";

export const calculateProgress = (
  isPrayersComplete,
  isSpeakersComplete,
  isMusicComplete,
  specialSundaysSpeakers,
  isFirstSunday
) => {
  const today = format(new Date(), "yyyy-MM-dd");

  if (specialSundaysSpeakers.some((date) => date.date === today)) {
    console.log("we have a special sunday!");
  }

  let progress = 0;

  if (isPrayersComplete === 1) progress += 10;
  if (isPrayersComplete === 2) progress += 20;

  if (specialSundaysSpeakers.some((date) => date.date === today)) {
    progress += 60;
  }

  if (isMusicComplete === 1) {
    progress += 5;
  } else if (isMusicComplete === 2) {
    progress += 15;
  } else if (isMusicComplete === 3) {
    progress += 20;
  }

  // Override speakers progress for the first Sunday
  if (isFirstSunday) {
    const nonSpeakerProgress = progress; // Save current progress without speakers
    progress = Math.min(nonSpeakerProgress + 60, 100);
  } else {
    if (isSpeakersComplete === 1) progress += 20;
    if (isSpeakersComplete === 2) progress += 60;
  }

  return progress;
};

export const getNextSunday = () => {
  const today = new Date();
  const todayIsSunday = getDay(today) === 0;

  const nextSunday = todayIsSunday ? today : addDays(today, 7 - getDay(today));

  return format(nextSunday, "MMMM dd, yyyy");
};

export const getSundayPrayers = (allPrayers, date) => {
  if (!Array.isArray(allPrayers)) return [];

  return allPrayers.filter((p) => p.date === date);
};

export const getFormattedPrayers = (sundayPrayers) => {
  const invocation = sundayPrayers.find(
    (prayer) => prayer.type === "invocation"
  ) || { first_name: "", last_name: "" };
  const benediction = sundayPrayers.find(
    (prayer) => prayer.type === "benediction"
  ) || { first_name: "", last_name: "" };
  return { invocation, benediction };
};

export const getNextSundaySpeakers = (allSpeakers) => {
  const nextSunday = getNextSunday();
  const dbFormattedSunday = format(nextSunday, "yyyy-MM-dd");

  const hasSpeakers = allSpeakers.filter(
    (speaker) =>
      format(parseISO(speaker.date), "yyyy-MM-dd") === dbFormattedSunday
  );

  return hasSpeakers;
};

export const getSundayMusic = (allMusic, date) => {
  const dbFormattedSunday = format(parseISO(date), "yyyy-MM-dd");
  const hasMusic = allMusic.filter(
    (p) => format(parseISO(p.date), "yyyy-MM-dd") === dbFormattedSunday
  );

  const openingHymn = hasMusic.find((music) => music.type === "opening") || {
    number: "",
    name: "",
  };
  const sacramentHymn = hasMusic.find(
    (music) => music.type === "sacrament"
  ) || { number: "", name: "" };

  const closingHymn = hasMusic.find((music) => music.type === "closing") || {
    number: "",
    name: "",
  };
  const intermediateHymn = hasMusic.find(
    (music) => music.type === "intermediate"
  ) || { number: "", name: "", performer: "" };

  const opening_hymn = {
    number: openingHymn.hymn_number || "",
    name: openingHymn.name || "",
  };
  const intermediate_hymn = {
    number: intermediateHymn.hymn_number || "",
    name: intermediateHymn.song_title || "",
    performer: intermediateHymn.performer || "",
  };
  const sacrament_hymn = {
    number: sacramentHymn.hymn_number || "",
    name: sacramentHymn.name || "",
  };
  const closing_hymn = {
    number: closingHymn.hymn_number || "",
    name: closingHymn.name || "",
  };
  return { opening_hymn, intermediate_hymn, sacrament_hymn, closing_hymn };
};

export const getNextSundayAdmin = (musicAdmin) => {
  const nextSunday = getNextSunday();
  const dbFormattedSunday = format(nextSunday, "yyyy-MM-dd");
  const hasMusicAdmin = musicAdmin.filter(
    (p) => format(parseISO(p.date), "yyyy-MM-dd") === dbFormattedSunday
  );
  return hasMusicAdmin;
};

export const getSundayAdmin = (musicAdmin, date, members) => {
  const hasMusicAdmin = musicAdmin.filter((p) => p.date === date);

  if (!hasMusicAdmin.length) {
    return { chorister: null, organist: null };
  }

  const adminRecord = hasMusicAdmin[0];
  const chorister =
    members.find((m) => m.id === adminRecord.chorister_id) || null;
  const organist =
    members.find((m) => m.id === adminRecord.organist_id) || null;

  return { chorister, organist };
};

export const getSpeakersCompletionStatus = (speakers) => {
  const hasSpeakers =
    (speakers?.speaker_1?.first_name ? 1 : 0) +
    (speakers?.speaker_2?.first_name ? 1 : 0);

  return hasSpeakers;
};

export const getPrayersCompletionStatus = (formValues) => {
  const nextSundayPrayers = {
    invocation: formValues.invocation,
    benediction: formValues.benediction,
  };

  const hasInvocation = nextSundayPrayers?.invocation?.first_name?.length > 0;
  const hasBenediction = nextSundayPrayers?.benediction?.first_name?.length > 0;

  return (hasInvocation ? 1 : 0) + (hasBenediction ? 1 : 0);
};

export const getMusicCompletionStatus = (formValues) => {
  const nextSundayMusic = {
    opening: formValues.opening_hymn,
    sacrament: formValues.sacrament_hymn,
    closing: formValues.closing_hymn,
  };

  const hasMusic =
    (nextSundayMusic.opening?.number ? 1 : 0) +
    (nextSundayMusic.sacrament?.number ? 1 : 0) +
    (nextSundayMusic.closing?.number ? 1 : 0);

  return hasMusic;
};

export const checkForSpecialSundays = (inputDate, searchArray) => {
  const match = searchArray.find((entry) => entry.date === inputDate);
  if (!match) return null;

  const excluded = [
    "fast sunday",
    "general conference",
    "ward conference",
    "stake conference",
  ];

  return excluded.includes(match.type?.toLowerCase())
    ? match.type
    : match.description;
};

export const formatWithDashes = (inputDate) => {
  return format(inputDate, "yyyy-MM-dd");
};

export const formatDateNice = (inputDate) => {
  return format(inputDate, "MMMM d, yyyy");
};
