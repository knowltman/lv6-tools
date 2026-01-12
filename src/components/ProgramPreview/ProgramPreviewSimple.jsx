import InfoBlock from "./InfoBlock";
import BusinessItem from "./BusinessItem";
import SectionSeparator from "./SectionSeparator";
import {
  checkForSpecialSundays,
  getNextSunday,
} from "../../pages/Dashboard.logic";
import { programStore } from "../../stores/program";
import { format, parseISO } from "date-fns";

const BasicStrings = {
  opening:
    "Good afternoon and thank you for joining us for the Lakeview 6th Ward Sacrament Meeting....",
  beginText: "We will begin our Sacrament meeting today by singing...",
  musicThanks: "We would like to thank",
  forLeading: "for leading our music today, and",
  accompanying: "for accompanying us on the organ",
  broadcast:
    "We would also like to thank our Young Women ushers ________________________ and _________________________, and our reverence examples ________________________ and _________________________ we'll excuse them to sit with their families",
  invocation: "Following the singing, our invocation will be offered by...",
  newMembers:
    "We've received membership records for the following Individuals. Please stand as your name is read.",
  newMembersClose:
    "All those that can join us in extending a hand of fellowship, please do so with the uplifted hand.",
  releases:
    "The following individual(s) have been released from their callings",
  releasesClose:
    "Those who wish to express their appreciation may manifest it by the uplifted hand.",
  callings:
    "We've extended callings to the following individual(s) - if you're here please stand as your name is read.",
  callingsClose:
    "We propose that these individuals be sustained. Those in favor may manifest it by the uplifted hand <PAUSE>. Those opposed, if any, may manifest it <PAUSE>. Thank you",
  sacramentIntro: "We will now prepare for the sacrament by singing...",
  afterWhich:
    "after which the holders of the Aaronic Priesthood will administer the sacrament.",
  thanksForReverence:
    "We thank you for your reverence during the sacrament, we'll excuse the Aaronic Priesthood holders to sit with their families.",
  wonderfulProgram: "", //"Our first speaker will be...",
  regularClose: "Thanks to all of our speakers... our closing hymn will be...",
  fastSundayClose:
    "Thank you for your testimonies. We will now conclude by singing hymn",
  benediction: "after which our benediction will be offered by...",
  followedBy: "will be followed by",
  concludingSpeaker: "", //"Our concluding speaker will be",
  gotoThatPoint: ". We'll go to that point...",
  fastSunday:
    "We now invite you to come forward to share a brief testimony of the Savior, and would like to close at 5 to the hour. Please remember to state your name.",
  intermediateHymn: "We will then sing hymn",
  intermediateHymnWardChoir: "The Ward Choir will then sing",
  intermediateSpecialSelection: "We will then have a special selection ",
  followingTheIntermediate: "after which we will hear from",
  babyBlessingClosing:
    "All those who have been invited to participate may come forward now.",
};

const ProgramPreviewSimple = (props) => {
  const { isLoading, programData } = props;
  const {
    haveNewMembers,
    setHaveNewMembers,
    haveReleases,
    setHaveReleases,
    haveCallings,
    setHaveCallings,
    setHaveOtherWardBusiness,
    haveStakeBusiness,
    setHaveStakeBusiness,
    haveOtherWardBusiness,
    haveSpeakers,
    haveAnnouncements,
    setHaveAnnouncements,
    specialSundays,
    selectedProgramDate,
  } = programStore();

  //const { programData } = programStore();
  const hasIntermediateHymn = `♫ <b>#${programData.intermediate_hymn?.number} ${programData.intermediate_hymn?.name}</b><br>`;
  const hasIntermediateHymnWardChoir = `♫ <b>${programData.intermediate_hymn?.name}</b> – by <i>The Ward Choir</i><br>`;
  const hasIntermediateHymnSpecial = `♫ <b><i>${programData.intermediate_hymn?.name}</i> — by ${programData.intermediate_hymn?.performer}</b><br>`;

  const getIntermediate = () => {
    if (programData.intermediate_hymn) {
      if (programData.intermediate_hymn.performer === "Ward Choir") {
        return hasIntermediateHymnWardChoir;
      } else if (programData.intermediate_hymn.performer === "Congregation") {
        return hasIntermediateHymn;
      } else {
        return hasIntermediateHymnSpecial;
      }
    }
  };

  const nextSunday = getNextSunday();

  //const programDate = nextSunday;

  const isSpecialSunday = checkForSpecialSundays(
    selectedProgramDate,
    specialSundays
  );

  //console.log(programData);

  const getProgram = () => {
    if (
      (!isSpecialSunday && programData.speaker_1?.first_name.length === 0) ||
      programData.speaker_1?.subject?.includes("Blessing") ||
      programData.speaker_1?.subject?.includes("blessing")
    ) {
      return `<p class='error-text'>SHARE A BRIEF TESTIMONY</p><p>${BasicStrings.fastSunday}</p>`;
    }

    if (isSpecialSunday && isSpecialSunday === "Fast Sunday") {
      return `<p class='error-text'>SHARE A BRIEF TESTIMONY</p><p>${BasicStrings.fastSunday}</p>`;
    }

    if (isSpecialSunday && isSpecialSunday !== "Ward Conference") {
      return `<p><b>${isSpecialSunday}</b></p>`;
    }

    const speakers = [];

    for (let i = 1; i <= 6; i++) {
      const speaker = programData[`speaker_${i}`];
      if (speaker?.first_name) speakers.push(speaker);
    }

    if (speakers.length === 0) return "";

    const speakerLines = [];
    const includeIntermediate = programData.intermediate_hymn?.name?.length > 0;

    // midpoint logic
    let midpoint = -1;
    if (includeIntermediate) {
      if (speakers.length === 2) {
        midpoint = 1; // between the two
      } else if (speakers.length === 3) {
        midpoint = 2; // after the first two
      } else {
        midpoint = Math.floor(speakers.length / 2);
      }
    }

    speakerLines.push(`<p>${BasicStrings.wonderfulProgram || ""}`);

    speakers.forEach((speaker, index) => {
      if (includeIntermediate && index === midpoint) {
        speakerLines.push(getIntermediate());
      }

      const fullName = `${speaker.first_name} ${speaker.last_name}`;
      const nameOrBlessing = fullName.includes("Program Event")
        ? speaker.subject
        : fullName;

      speakerLines.push(`<b>${nameOrBlessing}</b><br>`);
    });

    return speakerLines.join("");
  };

  return (
    <div className="printable">
      {/* {isLoading ? <div className="loading_div"></div> : null} */}
      <div className="main-header">
        <div className="ward-name">
          <img style={{ width: "30px" }} src="../lv6_Logo.svg" />
          Lakeview 6th Ward
        </div>
        <div>{format(parseISO(selectedProgramDate), "MMMM, d, yyyy")}</div>
      </div>
      <InfoBlock
        title="Welcome"
        isLoading={isLoading}
        value={`${BasicStrings.opening}`}
      />
      <InfoBlock
        title="Presiding"
        isLoading={isLoading}
        value={`<b>${programData.presiding.first_name} ${programData.presiding.last_name}</b>`}
      />
      {haveAnnouncements ? (
        <BusinessItem
          title="Announcements"
          value={programData.announcements}
          checkboxState={haveAnnouncements}
          setCheckboxState={setHaveAnnouncements}
          stateName="announcements"
        />
      ) : null}
      <InfoBlock
        title="Opening"
        isLoading={isLoading}
        value={
          //The organist and chorister thanks go here //
          `${BasicStrings.musicThanks}
        <b class=${programData.chorister?.first_name ? "" : "error-text"}>${
            programData.chorister?.first_name
              ? programData.chorister?.first_name
              : "Select a Chorister"
          } ${programData.chorister?.last_name}</b> ${BasicStrings.forLeading}
        <b class=${programData.organist?.first_name ? "" : "error-text"}>${
            programData.organist?.first_name
              ? programData.organist?.first_name
              : "Select an Organist"
          } ${programData.organist?.last_name}</b>
        ${BasicStrings.accompanying}. ${BasicStrings.broadcast}.</p>
        <p style='margin-top: .5rem'>${BasicStrings.beginText}</p><p><b class=${
            programData.opening_hymn.name ? "" : "error-text"
          }></p><p>${
            programData.opening_hymn.name
              ? "#" +
                programData.opening_hymn.number +
                " " +
                programData.opening_hymn.name
              : "Select a hymn"
          } 
        </b></p>`
        }
      />
      <InfoBlock
        title="Invocation"
        isLoading={isLoading}
        value={`${BasicStrings.invocation}<p><b class=${
          programData.invocation?.first_name ? "" : "error-text"
        }>${
          programData.invocation?.first_name
            ? programData.invocation?.first_name +
              " " +
              programData.invocation?.last_name
            : "_________________________________"
        }</b></p>`}
      />
      {programData.speaker_1?.subject?.includes("Blessing") ||
      programData.speaker_1?.subject?.includes("blessing") ? (
        <SectionSeparator title="" />
      ) : null}
      {programData.speaker_1?.subject?.includes("Blessing") ||
      programData.speaker_1?.subject?.includes("blessing") ? (
        <InfoBlock
          title="Baby Blessing"
          isLoading={isLoading}
          value={`<p><b>${programData.speaker_1?.subject}</b></p><p>${BasicStrings.babyBlessingClosing}`}
        />
      ) : null}
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
          stateName="new_members"
          intro={BasicStrings.newMembers}
          value={programData.new_members}
          checkboxState={haveNewMembers}
          setCheckboxState={setHaveNewMembers}
          conclusion={BasicStrings.newMembersClose}
        />
      ) : null}
      {haveReleases ? (
        <BusinessItem
          title="Releases"
          stateName="releases"
          intro={BasicStrings.releases}
          value={programData.releases}
          conclusion={BasicStrings.releasesClose}
          checkboxState={haveReleases}
          setCheckboxState={setHaveReleases}
        />
      ) : null}
      {haveCallings ? (
        <BusinessItem
          title="Callings"
          stateName="callings"
          intro={BasicStrings.callings}
          value={programData.callings}
          conclusion={BasicStrings.callingsClose}
          checkboxState={haveCallings}
          setCheckboxState={setHaveCallings}
        />
      ) : null}
      {haveOtherWardBusiness ? (
        <BusinessItem
          title="Other"
          stateName="other_ward_business"
          checkboxState={haveOtherWardBusiness}
          setCheckboxState={setHaveOtherWardBusiness}
          value={programData.other_ward_business}
        />
      ) : null}
      {haveStakeBusiness ? (
        <BusinessItem
          title="Stake"
          stateName="stake_business"
          checkboxState={haveStakeBusiness}
          setCheckboxState={setHaveStakeBusiness}
          value={programData.stake_business}
        />
      ) : null}
      <SectionSeparator title="" />
      <InfoBlock
        title="Sacrament"
        isLoading={isLoading}
        value={`${BasicStrings.sacramentIntro} <p><b class=${
          programData.sacrament_hymn.name ? "" : "error-text"
        }>${
          programData.sacrament_hymn.name
            ? "#" +
              programData.sacrament_hymn.number +
              " " +
              programData.sacrament_hymn.name
            : "Select a hymn"
        } 
        </b><p>${BasicStrings.afterWhich}</p>`}
      />
      <SectionSeparator title="" />
      <InfoBlock
        title="Program"
        isLoading={isLoading}
        value={`${BasicStrings.thanksForReverence}${getProgram()}`}
      />
      <SectionSeparator title="" />
      <InfoBlock
        title="Closing"
        isLoading={isLoading}
        value={`${
          haveSpeakers || isSpecialSunday
            ? BasicStrings.regularClose
            : BasicStrings.fastSundayClose
        } <p><b class=${programData.closing_hymn.name ? "" : "error-text"}>${
          programData.closing_hymn.name
            ? "#" +
              programData.closing_hymn.number +
              " " +
              programData.closing_hymn.name
            : "Select a hymn"
        } 
        </b><p>${BasicStrings.benediction} <p><b class=${
          programData.benediction?.first_name ? "" : "error-text"
        }>${
          programData.benediction?.first_name
            ? programData.benediction?.first_name +
              " " +
              programData.benediction?.last_name
            : "___________________________________"
        }</b>`}
      />
    </div>
  );
};
export default ProgramPreviewSimple;

{
  /* <p>${BasicStrings.musicThanks}
        <b class=${programData.chorister.first_name ? "" : "error-text"}>${
          programData.chorister.first_name
            ? programData.chorister.first_name
            : "Select a Chorister"
        } ${programData.chorister.last_name}</b> ${BasicStrings.forLeading}
        <b class=${programData.organist.first_name ? "" : "error-text"}>${
          programData.organist.first_name
            ? programData.organist.first_name
            : "Select an Organist"
        } ${programData.organist.last_name}</b>
        ${BasicStrings.accompanying}.</p> */
}
