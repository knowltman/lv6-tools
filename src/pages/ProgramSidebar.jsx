import ProgramDateSelect from "../components/ProgramPreview/ProgramDateSelect";
import ProgramField from "../components/ProgramPreview/ProgramField";
import DynamicList from "../components/Program/DynamicList";
import { Box, Button, useMediaQuery, Drawer } from "@mui/material";
import { programStore } from "../stores/program";
import { membersStore } from "../stores/members";
import {
  Print,
  KeyboardArrowRight,
  KeyboardArrowLeft,
} from "@mui/icons-material";
import { formStore } from "../stores/formValues";
import { getNextSunday } from "./Dashboard.logic";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export const ProgramSidebar = (props) => {
  const { handlePrint, handleSaveProgram, setIsMobile, isMobile } = props;
  const { members } = membersStore();
  const { formValues2, updateFormValue } = formStore();
  const {
    haveAnnouncements,
    setHaveAnnouncements,
    haveNewMembers,
    setHaveNewMembers,
    haveCallings,
    setHaveCallings,
    haveReleases,
    setHaveReleases,
    haveOtherWardBusiness,
    setHaveOtherWardBusiness,
    haveStakeBusiness,
    setHaveStakeBusiness,
    haveClosingAnnouncements,
    setHaveClosingAnnouncements,
  } = programStore((state) => state);
  const [isOpen, setIsOpen] = useState(false);

  const nextSunday = getNextSunday();
  const today = format(nextSunday, "yyyy-MM-dd");
  //const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebar = (
    <>
      <Box
        sx={{ "& .MuiTextField-root": { mb: 2 } }}
        noValidate
        autoComplete="off"
        position="relative"
        padding="2rem 1rem 1rem 1rem"
        marginBottom={isMobile ? "5rem" : "4rem"}
        style={{ overflowY: "auto" }}
      >
        <ProgramDateSelect />
        {/* <ProgramDateSelect
    programsList={programsList}
    handleProgramOpen={handleProgramOpen}
  />
  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
    <InputLabel id="program-style-label">Program Style</InputLabel>
    <Select
      labelId="program-style-label"
      value={isSimple}
      onChange={() => setIsSimple(!isSimple)}
      label="Program Style"
      size="small"
    >
      <MenuItem key={"simple"} value={true}>
        Simple
      </MenuItem>
      <MenuItem key={"classic"} value={false}>
        Classic
      </MenuItem>
    </Select>
  </FormControl> */}
        <ProgramField
          key={"presiding"}
          formValues={formValues2}
          setFormValues={updateFormValue}
          small
          options={members.filter(
            (member) =>
              member.calling === "Bishop" ||
              member.calling === "Bishopric First Counselor" ||
              member.calling === "Bishopric Second Counselor" ||
              member.calling === "Stake",
          )}
          fieldName={"presiding"}
          fieldLabel={"Presiding"}
          optionText={"first_name last_name"}
        />
        <ProgramField
          key={"conducting"}
          formValues={formValues2}
          setFormValues={updateFormValue}
          small
          options={members.filter(
            (member) =>
              member.calling === "Bishop" ||
              member.calling === "Bishopric First Counselor" ||
              member.calling === "Bishopric Second Counselor",
          )}
          fieldName={"conducting"}
          fieldLabel={"Conducting"}
          optionText={"first_name last_name"}
        />

        {/* <div
     className="section-title"
    style={{ marginTop: "1rem", marginBottom: "1rem" }}
  >
    Prayers
  </div>
 <ProgramField
    key={"invocation"}
    formValues={formValues}
    setFormValues={setFormValues}
    options={members}
    fieldName={"invocation"}
    fieldLabel={"Invocation"}
    optionText={"first_name last_name"}
  />
  <ProgramField
    key={"benediction"}
    formValues={formValues}
    setFormValues={setFormValues}
    options={members}
    fieldName={"benediction"}
    fieldLabel={"Benediction"}
    optionText={"first_name last_name"}
  /> */}
        {/* <div className="section-title" style={{ marginBottom: "1rem" }}>
          Music
        </div>
        <ProgramField
          key={"chorister"}
          formValues={formValues2}
          setFormValues={updateFormValue}
          small
          options={members.filter((member) => member.calling === "Chorister")}
          fieldName={"chorister"}
          fieldLabel={"Chorister"}
          optionText={"first_name last_name"}
        />
        <ProgramField
          key={"organist"}
          formValues={formValues2}
          small
          setFormValues={updateFormValue}
          options={members.filter((member) => member.calling === "Organist")}
          fieldName={"organist"}
          fieldLabel={"Organist"}
          optionText={"first_name last_name"}
        /> */}
        {/* <ProgramField
    key={"opening_hymn"}
    formValues={formValues}
    setFormValues={setFormValues}
    options={hymns}
    fieldName={"opening_hymn"}
    fieldLabel={"Opening Hymn"}
    optionText={"number name"}
  />
  <ProgramField
    key={"sacrament_hymn"}
    formValues={formValues}
    setFormValues={setFormValues}
    options={hymns}
    fieldName={"sacrament_hymn"}
    fieldLabel={"Sacrament Hymn"}
    optionText={"number name"}
  />
  <ProgramField
    key={"intermediate_hymn"}
    formValues={formValues}
    setFormValues={setFormValues}
    options={hymns}
    fieldName={"intermediate_hymn"}
    fieldLabel={"Intermediate Hymn"}
    optionText={"number name"}
  />
  {formValues?.intermediate_hymn.name === "Special Selection" ? (
    <TextField
      label="Song Selection"
      size="small"
      value={formValues.special_selection || ""} // Ensure special_selection is not undefined
      onChange={(e) =>
        setFormValues((prev) => ({
          ...prev,
          special_selection: e.target.value, // Update special selection field properly
        }))
      }
      fullWidth
    />
  ) : null}
  {formValues?.intermediate_hymn.name === "Ward Choir" ? (
    <TextField
      label="Song Selection"
      size="small"
      value={formValues.ward_choir || ""} // Ensure ward_choir is not undefined
      onChange={(e) =>
        setFormValues((prev) => ({
          ...prev,
          ward_choir: e.target.value, // Update ward_choir field properly
        }))
      }
      fullWidth
    />
  ) : null}
  <ProgramField
    key={"closing_hymn"}
    formValues={formValues}
    setFormValues={setFormValues}
    options={hymns}
    fieldName={"closing_hymn"}
    fieldLabel={"Closing Hymn"}
    optionText={"number name"}
  /> */}
        {/* <div className="section-title">Program</div>
  <DynamicAutoComplete
    fieldName={"speakers"}
    fieldLabel={"Speaker"}
    formValues={formValues}
    setFormValues={setFormValues}
    checkboxState={haveSpeakers}
    setCheckboxState={setHaveSpeakers}
    checkboxLabel={"Speakers"}
    members={members}
  /> */}
        <DynamicList
          fieldName={"announcements"}
          fieldLabel={"Announcement"}
          formValues={formValues2 || []}
          setFormValues={updateFormValue}
          checkboxState={haveAnnouncements}
          setCheckboxState={setHaveAnnouncements}
          checkboxLabel={"Announcements"}
        />
        <DynamicList
          fieldName={"new_members"}
          fieldLabel={"New Move-In"}
          formValues={formValues2}
          setFormValues={updateFormValue}
          checkboxState={haveNewMembers}
          setCheckboxState={setHaveNewMembers}
          checkboxLabel={"Move-ins"}
        />
        <DynamicList
          fieldName={"releases"}
          fieldLabel={"Release"}
          formValues={formValues2}
          setFormValues={updateFormValue}
          checkboxState={haveReleases}
          setCheckboxState={setHaveReleases}
          checkboxLabel={"Releases"}
        />
        <DynamicList
          fieldName={"callings"}
          fieldLabel={"Calling"}
          formValues={formValues2}
          setFormValues={updateFormValue}
          checkboxState={haveCallings}
          setCheckboxState={setHaveCallings}
          checkboxLabel={"Callings"}
        />
        <DynamicList
          fieldName={"other_ward_business"}
          fieldLabel={"Other"}
          formValues={formValues2}
          setFormValues={updateFormValue}
          checkboxState={haveOtherWardBusiness}
          setCheckboxState={setHaveOtherWardBusiness}
          checkboxLabel={"Other Ward Business"}
        />
        <DynamicList
          fieldName={"stake_business"}
          fieldLabel={"Stake Business"}
          formValues={formValues2}
          setFormValues={updateFormValue}
          checkboxState={haveStakeBusiness}
          setCheckboxState={setHaveStakeBusiness}
          checkboxLabel={"Stake Business"}
        />
        <DynamicList
          fieldName={"closing_announcements"}
          fieldLabel={"Closing Business"}
          formValues={formValues2 || []}
          setFormValues={updateFormValue}
          checkboxState={haveClosingAnnouncements}
          setCheckboxState={setHaveClosingAnnouncements}
          checkboxLabel={"Closing Business"}
        />
      </Box>
      <div className={isMobile ? "save-button-mobile" : "save-button"}>
        <Button
          variant="contained"
          fullWidth
          onClick={(e) => handleSaveProgram(e)}
        >
          {formValues2.date === today ? "Update" : "Save"}
        </Button>
        <Button
          variant="outlined"
          onClick={handlePrint}
          startIcon={<Print />}
          fullWidth
        >
          Print
        </Button>
      </div>
    </>
  );

  return (
    <div className={isMobile ? "scroll-box left-mobile" : "scroll-box left"}>
      {isMobile ? (
        <Drawer
          anchor="left"
          open={isOpen}
          onClose={() => setIsOpen(false)}
          disableEnforceFocus
          sx={{
            overflow: "visible", // Ensure Drawer itself allows overflow
            "& .MuiDrawer-paper": {
              overflow: "visible", // Allow content to overflow horizontally
              width: "300px", // Adjust as needed
            },
          }}
        >
          {sidebar}
          <Button
            style={{
              position: "absolute",
              right: "0",
              top: "50%",
              transform: "translateX(48px)",
              backgroundColor: "white",
              padding: "1rem 0 1rem 0",
            }}
            onClick={() => setIsOpen(!isOpen)}
            endIcon={<KeyboardArrowLeft size="large" />}
          ></Button>
        </Drawer>
      ) : (
        sidebar
      )}
      {isMobile && (
        <Button
          style={{
            position: "absolute",
            top: "50%",
            zIndex: 100,
            padding: "1rem 1rem",
            marginLeft: "-1rem",
            left: 0,
          }}
          variant="contained"
          onClick={() => setIsOpen(!isOpen)}
          endIcon={<KeyboardArrowRight sx={{ fontSize: "4rem" }} />}
        ></Button>
      )}
    </div>
  );
};
