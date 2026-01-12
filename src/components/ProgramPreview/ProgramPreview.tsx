import React from "react";
import InfoBlock from "./InfoBlock";
import BusinessItem from "./BusinessItem";
import SectionSeparator from "./SectionSeparator";
import { format, parseISO } from "date-fns";
import {
  checkForSpecialSundays,
  getNextSunday,
} from "../../pages/Dashboard.logic";
import {
  Backdrop,
  CircularProgress,
  circularProgressClasses,
} from "@mui/material";

const BasicStrings = {
  opening:
    "Good morning and thank you for joining us for the Lakeview 6th Ward Sacrament Meeting. If we have any visitors or those who may be joining us for the first time, we hope all will feel welcome today.",
  openingHymn: "We will begin our Sacrament meeting today by singing hymn",
  beginText: "We will begin our Sacrament meeting today by singing hymn",
  musicThanks: "We would like to thank",
  forLeading: "for leading our music today, and",
  accompanying: "for accompanying us on the organ",
  broadcast:
    "We would also like to thank <b>Don Rigby</b> for helping with the broadcast, and our wonderful Young Women ushers",
  invocation: "Following the singing, our invocation will be offered by",
  newMembers:
    "We've received membership records for the following individuals. If you're here, please stand as your name is read.",
  newMembersClose:
    "All those that can join us in extending a hand of fellowship, please do so with the uplifted hand.",
  releases:
    "The following individual(s) have been released from their callings",
  releasesClose:
    "Those who wish to express their appreciation may manifest it by the uplifted hand.",
  callings:
    "We've extended callings to the following individual(s) - if you're here please stand as your name is read.",
  callingsClose:
    "We propose that these individuals be sustained. Those in favor may manifest it by the uplifted hand <PAUSE>. Those opposed, if any, may manifest it <PAUSE>. We invite those who have been sustained today to meet after the block to be set apart.",
  sacramentIntro: "We will now prepare for the sacrament by singing hymn",
  afterWhich:
    "after which the holders of the Aaronic Priesthood will administer the sacrament.",
  thanksForReverence:
    "We thank you for your reverence during the sacrament, we'll excuse the Aaronic Priesthood holders to return to their families.",
  wonderfulProgram:
    "We have a wonderful program for today. We'll first hear from",
  regularClose: "Thanks to all of our speakers... our closing hymn will be",
  fastSundayClose:
    "Thank you for your testimonies. We will now conclude by singing hymn",
  benediction: "after which our benediction will be offered by",
  followedBy: "will be followed by",
  concludingSpeaker: "and our concluding speaker will be",
  gotoThatPoint: ". We'll go to that point...",
  fastSunday:
    "We now invite you to come forward to share a brief testimony of the Savior, and would like to close 25 after the hour.",
  intermediateHymn: "We will then sing hymn",
  intermediateHymnWardChoir: "The Ward Choir will then sing",
  intermediateSpecialSelection: "We will then have",
  followingTheIntermediate: "after which we will hear from",
};

const ProgramPreview = (props) => {
  const {
    formValues,
    haveNewMembers,
    haveReleases,
    haveCallings,
    haveOtherWardBusiness,
    haveStakeBusiness,
    haveSpeakers,
    haveAnnouncements,
    isLoading,
    specialSundaysSpeakers,
  } = props;

  const hasIntermediateHymn = `. ${BasicStrings.intermediateHymn} <b>#${formValues.intermediate_hymn.number} ${formValues.intermediate_hymn.name}</b>, ${BasicStrings.followingTheIntermediate}`;
  const hasIntermediateOnlyTwo = `. ${BasicStrings.intermediateHymn} <b>#${formValues.intermediate_hymn.number} ${formValues.intermediate_hymn.name}</b> ${BasicStrings.concludingSpeaker} `;

  const hasIntermediateHymnWardChoir = `. ${BasicStrings.intermediateHymnWardChoir} <b>${formValues.ward_choir}</b>, ${BasicStrings.followingTheIntermediate}`;
  const hasIntermediateOnlyTwoWardChoir = `. ${BasicStrings.intermediateHymnWardChoir} <b>${formValues.ward_choir}</b> ${BasicStrings.concludingSpeaker} `;

  const hasIntermediateHymnSpecial = `. ${BasicStrings.intermediateSpecialSelection} <b>${formValues.special_selection}</b>, ${BasicStrings.followingTheIntermediate}`;
  const hasIntermediateOnlyTwoSpecial = `. ${BasicStrings.intermediateSpecialSelection} <b>${formValues.special_selection}</b> ${BasicStrings.concludingSpeaker} `;

  const getIntermediate = (speakerCount) => {
    if (formValues.intermediate_hymn.name === "Ward Choir") {
      return speakerCount == 2
        ? hasIntermediateOnlyTwoWardChoir
        : hasIntermediateHymnWardChoir;
    } else if (formValues.intermediate_hymn.name === "Special Selection") {
      return speakerCount == 2
        ? hasIntermediateOnlyTwoSpecial
        : hasIntermediateHymnSpecial;
    } else {
      return speakerCount == 2 ? hasIntermediateOnlyTwo : hasIntermediateHymn;
    }
  };

  const noIntermediateOnlyTwo = ` ${BasicStrings.concludingSpeaker}`;
  const noIntermediateHymn = `${
    formValues.speaker_1.sex === "M" ? " he" : " she"
  } ${BasicStrings.followedBy}`;

  const nextSunday = getNextSunday();

  const programDate = formValues.conducting.first_name.length
    ? format(parseISO(formValues.date), "MMMM d, yyyy")
    : format(nextSunday, "MMMM d, yyyy");

  const isSpecialSunday = checkForSpecialSundays(
    programDate,
    specialSundaysSpeakers
  );

  const getProgram = () => {
    if (isSpecialSunday) {
      return `<p><b>${isSpecialSunday}</b></p>`;
    }
    if (!haveSpeakers) {
      // There are no speakers this must be a fast sunday
      return `<p class='error-text'>SHARE A BRIEF TESTIMONY</p><p>${BasicStrings.fastSunday}</p>`;
    }

    // If there are 3 speakers
    if (
      formValues.speaker_1.first_name &&
      formValues.speaker_2.first_name &&
      formValues.speaker_3.first_name
    ) {
      return `<p>${BasicStrings.wonderfulProgram}
     <b class=${formValues.speaker_1.first_name ? "" : "error-text"}>${
        formValues.speaker_1.first_name
          ? formValues.speaker_1.first_name
          : "Select a Speaker"
      } ${formValues.speaker_1.last_name}</b>${
        formValues.intermediate_hymn.number !== undefined
          ? getIntermediate(3)
          : noIntermediateHymn
      }
    <b class=${formValues.speaker_2?.first_name ? "" : "error-text"}>${
        formValues.speaker_2.first_name
          ? formValues.speaker_2.first_name
          : "Select a Speaker"
      } ${formValues.speaker_2.last_name}</b> ${
        BasicStrings.concludingSpeaker
      } <b class=${formValues.speaker_3.first_name ? "" : "error-text"}>${
        formValues.speaker_3.first_name
          ? formValues.speaker_3.first_name
          : "Select a speaker"
      } ${formValues.speaker_3.last_name}</b>${BasicStrings.gotoThatPoint}`;
      //There are only two speakers
    } else if (
      formValues.speaker_1.first_name &&
      formValues.speaker_2.first_name
    ) {
      return `<p>${BasicStrings.wonderfulProgram} <b class=${
        formValues.speaker_1.first_name ? "" : "error-text"
      }>${
        formValues.speaker_1.first_name
          ? formValues.speaker_1.first_name
          : "Select a Speaker"
      } ${formValues.speaker_1.last_name}</b>${
        formValues.intermediate_hymn.number !== undefined
          ? getIntermediate(2)
          : noIntermediateOnlyTwo
      }

  <b class=${formValues.speaker_2?.first_name ? "" : "error-text"}>${
        formValues.speaker_2.first_name
          ? formValues.speaker_2.first_name
          : "Select a Speaker"
      } ${formValues.speaker_2.last_name}</b> `;
    }
  };

  return (
    <>
      <div className="printable">
        <div className="main-header">
          <div className="ward-name">
            <img style={{ width: "30px" }} src="../lv6_Logo.svg" />
            Lakeview 6th Ward
          </div>
          <div>{programDate}</div>
        </div>
        <InfoBlock title="Welcome" value={BasicStrings.opening} />
        <InfoBlock
          title="Presiding"
          value={`<b>${formValues.presiding.first_name} ${formValues.presiding.last_name}</b>`}
        />
        {/* <InfoBlock
          title="Conducting"
          value={`<b class=${
            formValues.conducting.first_name ? "" : "error-text"
          }>${
            formValues.conducting.first_name
              ? formValues.conducting.first_name
              : "Select a conductor"
          } ${formValues.conducting.last_name}</b>`}
        /> */}
        {haveAnnouncements ? (
          <BusinessItem
            title="Announcements"
            value={formValues.announcements}
          />
        ) : null}
        <InfoBlock
          title="Opening"
          value={`${BasicStrings.beginText} <b class=${
            formValues.opening_hymn.name ? "" : "error-text"
          }>${
            formValues.opening_hymn.name
              ? "#" +
                formValues.opening_hymn.number +
                " " +
                formValues.opening_hymn.name
              : "Select a hymn"
          } 
        </b><p>${BasicStrings.musicThanks}
        <b class=${formValues.chorister.first_name ? "" : "error-text"}>${
            formValues.chorister.first_name
              ? formValues.chorister.first_name
              : "Select a Chorister"
          } ${formValues.chorister.last_name}</b> ${BasicStrings.forLeading}
        <b class=${formValues.organist.first_name ? "" : "error-text"}>${
            formValues.organist.first_name
              ? formValues.organist.first_name
              : "Select an Organist"
          } ${formValues.organist.last_name}</b>
        ${BasicStrings.accompanying}.</p><p>${BasicStrings.broadcast}.</p>
        <p>${BasicStrings.invocation} <b class=${
            formValues.invocation.first_name ? "" : "error-text"
          }>${
            formValues.invocation.first_name
              ? formValues.invocation.first_name
              : "Select an invocation"
          } ${formValues.invocation.last_name}</b></p>`}
        />
        {haveNewMembers ||
        haveReleases ||
        haveCallings ||
        haveOtherWardBusiness ||
        haveStakeBusiness ? (
          <SectionSeparator title="" />
        ) : null}
        {haveNewMembers ? (
          <BusinessItem
            title="New Members"
            intro={BasicStrings.newMembers}
            value={formValues.new_members}
            conclusion={BasicStrings.newMembersClose}
          />
        ) : null}
        {haveReleases ? (
          <BusinessItem
            title="Releases"
            intro={BasicStrings.releases}
            value={formValues.releases}
            conclusion={BasicStrings.releasesClose}
          />
        ) : null}
        {haveCallings ? (
          <BusinessItem
            title="Callings"
            intro={BasicStrings.callings}
            value={formValues.callings}
            conclusion={BasicStrings.callingsClose}
          />
        ) : null}
        {haveOtherWardBusiness ? (
          <BusinessItem title="Other" value={formValues.other_ward_business} />
        ) : null}
        {haveStakeBusiness ? (
          <BusinessItem title="Stake" value={formValues.stake_business} />
        ) : null}
        <SectionSeparator title="" />
        <InfoBlock
          title="Sacrament"
          value={`${BasicStrings.sacramentIntro} <b class=${
            formValues.sacrament_hymn.name ? "" : "error-text"
          }>${
            formValues.sacrament_hymn.name
              ? "#" +
                formValues.sacrament_hymn.number +
                " " +
                formValues.sacrament_hymn.name
              : "Select a hymn"
          } 
        </b><p>${BasicStrings.afterWhich}</p>`}
        />
        <SectionSeparator title="" />
        <InfoBlock
          title="Program"
          value={`${BasicStrings.thanksForReverence}${getProgram()}`}
        />
        <SectionSeparator title="" />
        <InfoBlock
          title="Closing"
          value={`${
            haveSpeakers
              ? BasicStrings.regularClose
              : BasicStrings.fastSundayClose
          } <b class=${formValues.closing_hymn.name ? "" : "error-text"}>${
            formValues.closing_hymn.name
              ? "#" +
                formValues.closing_hymn.number +
                " " +
                formValues.closing_hymn.name
              : "Select a hymn"
          } 
        </b>${BasicStrings.benediction}  <b class=${
            formValues.benediction.first_name ? "" : "error-text"
          }>${
            formValues.benediction.first_name
              ? formValues.benediction.first_name
              : "Select a benediction"
          } ${formValues.benediction.last_name}</b></p>`}
        />
      </div>
      <Backdrop
        sx={{ color: "grey.900", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress
          color="primary"
          sx={{
            color: "#faebd7 !important",
            [`& .${circularProgressClasses.circle}`]: {
              strokeLinecap: "round",
            },
          }}
        />
      </Backdrop>
    </>
  );
};
export default ProgramPreview;
