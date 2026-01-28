import { Box, Typography, Button, Tooltip } from "@mui/material";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import BulletinPreview from "../components/BulletinPreview";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TitleIcon from "@mui/icons-material/Title";
import PrintIcon from "@mui/icons-material/Print";
import { useEffect } from "react";

const Bulletin = () => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "<p>Enter announcements here...</p>",
  });

  const announcementText = editor ? editor.getHTML() : "";

  useEffect(() => {
    // Inject print CSS to hide navbar and toolbar globally
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        .navbar-print-hide {
          display: none !important;
        }
        .editor-toolbar-print-hide {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        pt: "4rem",
        minHeight: "100vh",
        backgroundColor: "#fff",
        width: "100vw",
        "@media print": {
          pt: 0,
          minHeight: "auto",
          "@page": {
            size: "A4 landscape",
            margin: "0.5in",
          },
          "& > div:first-of-type": {
            flex: "0 0 50%", // Keep editor column at 50% width
          },
          "& > div:last-of-type": {
            flex: "0 0 50%", // Keep preview column at 50% width
            maxHeight: "none",
            overflow: "visible",
          },
          "*": {
            "-webkit-print-color-adjust": "exact !important",
            "color-adjust": "exact !important",
          },
        },
      }}
    >
      {/* Left Column - Announcements Editor */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
          Announcements
        </Typography>

        {/* Toolbar */}
        <Box
          className="editor-toolbar-print-hide"
          sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}
        >
          <Tooltip title="Bold">
            <Button
              size="small"
              variant={editor?.isActive("bold") ? "contained" : "outlined"}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <FormatBoldIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Italic">
            <Button
              size="small"
              variant={editor?.isActive("italic") ? "contained" : "outlined"}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <FormatItalicIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Underline">
            <Button
              size="small"
              variant={editor?.isActive("underline") ? "contained" : "outlined"}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              <FormatUnderlinedIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Bullet List">
            <Button
              size="small"
              variant={
                editor?.isActive("bulletList") ? "contained" : "outlined"
              }
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <FormatListBulletedIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Numbered List">
            <Button
              size="small"
              variant={
                editor?.isActive("orderedList") ? "contained" : "outlined"
              }
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <FormatListNumberedIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Heading">
            <Button
              size="small"
              variant={editor?.isActive("heading") ? "contained" : "outlined"}
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              <TitleIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>

        {/* Editor */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            backgroundColor: "#fff",
            "& .ProseMirror": {
              minHeight: "400px",
              outline: "none",
              "& h2": {
                fontSize: "1.5rem",
                fontWeight: 600,
                margin: "1rem 0 0.5rem",
              },
              "& p": { margin: "0.5rem 0" },
              "& ul": { paddingLeft: "1.5rem" },
              "& ol": { paddingLeft: "1.5rem" },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {/* Right Column - Bulletin Preview */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 2,
            "@media print": { display: "none" },
          }}
        >
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ backgroundColor: "#1976d2" }}
          >
            Print Bulletin
          </Button>
        </Box>
        <BulletinPreview announcementText={announcementText} />
      </Box>
    </Box>
  );
};

export default Bulletin;
