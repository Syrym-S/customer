import { useAuthTranslation } from "../i18n/useAuthTranslation";
import { Box, Button, IconButton, Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

function formatFileSize(size) {
  if (!size && size !== 0) {
    return '';
  }

  const sizeInMb = size / 1024 / 1024;

  return `${sizeInMb.toFixed(2)} MB`;
}

function SelectedFilePreview({ file, onRemove }) {
  const { t } = useAuthTranslation();
  if (!file) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 1.25,
        p: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
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
          sx={{
            fontWeight: 500,
          }}
        >
          {file.name}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {formatFileSize(file.size)}
        </Typography>
      </Box>

      <IconButton
        color="error"
        aria-label={t("Удалить файл")}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove();
        }}
      >
        <DeleteOutlineRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export function DocumentUploadField({
  label,
  file,
  inputKey,
  error,
  inputProps,
  onRemove,
}) {
  const { t } = useAuthTranslation();
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        display: 'block',
        border: '1px dashed',
        borderColor: error ? 'error.main' : 'primary.main',
        borderRadius: 2,
        backgroundColor: error
          ? 'rgba(211, 47, 47, 0.04)'
          : 'rgba(25, 118, 210, 0.04)',
        transition: '0.2s ease',
        '&:hover': {
          backgroundColor: error
            ? 'rgba(211, 47, 47, 0.08)'
            : 'rgba(25, 118, 210, 0.08)',
        },
      }}
    >
      <Typography
        sx={{
          mb: 1,
          fontWeight: 500,
          color: 'text.secondary',
        }}
      >
        {t(label)}
      </Typography>

      {file ? (
        <SelectedFilePreview file={file} onRemove={onRemove} />
      ) : (
        <Button
          variant="outlined"
          component="label"
          startIcon={<DescriptionOutlinedIcon />}
        >
          {t("Выбрать файл")}
          <input
            key={inputKey}
            hidden
            accept=".pdf,.jpg,.jpeg,.png"
            type="file"
            {...inputProps}
          />
        </Button>
      )}

      {error && (
        <Typography
          sx={{
            mt: 1,
            fontSize: 12,
            color: 'error.main',
          }}
        >
          {t(error)}
        </Typography>
      )}
    </Box>
  );
}
