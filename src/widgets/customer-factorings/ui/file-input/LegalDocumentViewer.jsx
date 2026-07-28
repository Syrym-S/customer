/* eslint-disable react/prop-types */
import { Box, Typography } from "@mui/material";

const LegalDocumentViewer = ({ file }) => {
  if (!file) {
    return <Typography color="text.secondary">Документ не найден</Typography>;
  }

  const fileUrl = `data:${file.mime};base64,${file.content}`;

  if (file?.mime?.startsWith("image/")) {
    return (
      <Box
        sx={{
          width: "fit-content",
          maxHeight: "20vh",
          overflow: "auto",
          p: 2,
          bgcolor: "grey.100",
          borderRadius: 2,
        }}
      >
        <Box
          component="img"
          src={fileUrl}
          alt={file.name}
          sx={{
            maxHeight: "10vh",
            objectFit: "contain",
            borderRadius: 1,
            boxShadow: 2,
          }}
        />
      </Box>
    );
  }

  if (file.mime === "application/pdf") {
    return (
      <Box
        component="iframe"
        src={fileUrl}
        title={file.name}
        sx={{
          my: 1,
          p: 1,
          maxHeight: "20vh",
          border: 0,
          borderRadius: 1,
          boxShadow: 2,
        }}
      />
    );
  }

  return (
    <Typography color="text.secondary">
      Предпросмотр файла типа {file.mime} не поддерживается
    </Typography>
  );
};

export default LegalDocumentViewer;
