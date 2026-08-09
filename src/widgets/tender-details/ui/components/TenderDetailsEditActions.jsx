import { Box, Button } from "@mui/material";

export function TenderDetailsEditActions({
   isEditing,
   onStartEdit,
   onCancelEdit,
}) {
   return (
      <Box
         sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mb: 2,
         }}
      >
         {isEditing ? (
            <Button onClick={onCancelEdit}>Отмена</Button>
         ) : (
            <Button variant="outlined" onClick={onStartEdit}>
               Изменить
            </Button>
         )}
      </Box>
   );
}

