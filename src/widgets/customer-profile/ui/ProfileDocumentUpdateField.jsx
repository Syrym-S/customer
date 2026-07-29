import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LegalDocumentViewer from "../../customer-factorings/ui/file-input/LegalDocumentViewer";

function formatFileSize(size) {
  if (!size && size !== 0) {
    return "";
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export function ProfileDocumentUpdateField({
  label,
  currentDocument,
  file,
  inputKey,
  error,
  disabled,
  onChange,
  onCancel,
}) {
  return (
    <Box
      sx={{
        p: 2,
        border: "1px dashed",
        borderColor: error ? "error.main" : "divider",
        borderRadius: 2,
        backgroundColor: error ? "rgba(211, 47, 47, 0.04)" : "background.paper",
      }}
    >
      <Typography fontWeight={600} mb={1}>
        {label}
      </Typography>

      {currentDocument && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mb: 1.5,
            p: 1.25,
            gap: 1.25,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            backgroundColor: "action.hover",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Текущий документ
          </Typography>

          <LegalDocumentViewer file={currentDocument} />
        </Box>
      )}

      {file && (
        <Box
          sx={{
            mb: 1.5,
            p: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            border: "1px solid",
            borderColor: "primary.main",
            borderRadius: 2,
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(25, 118, 210, 0.08)",
              flexShrink: 0,
            }}
          >
            <DescriptionOutlinedIcon color="primary" fontSize="large" />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              noWrap
              title={file.name}
              sx={{ fontWeight: 500 }}
            >
              {file.name}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Новый файл · {formatFileSize(file.size)}
            </Typography>
          </Box>

          <IconButton color="error" disabled={disabled} onClick={onCancel}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {!currentDocument && !file && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Документ пока не загружен
        </Typography>
      )}

      <Button
        component="label"
        variant="outlined"
        startIcon={<UploadFileOutlinedIcon />}
        disabled={disabled}
      >
        {currentDocument || file ? "Заменить документ" : "Загрузить документ"}

        <input
          key={inputKey}
          hidden
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0] || null;
            onChange(selectedFile);
          }}
        />
      </Button>

      {error && (
        <Typography sx={{ mt: 1, fontSize: 12, color: "error.main" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
