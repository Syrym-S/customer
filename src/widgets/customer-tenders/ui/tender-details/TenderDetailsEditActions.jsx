import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PropTypes from "prop-types";

import { isCancelledTender, isClosedTender } from "../../model/tender.helpers";
import { tenderPropType } from "../../model/tenders.prop-types";

export function TenderDetailsEditActions({
   tender,
   isEditing,
   onStartEdit,
   onCancelEdit,
}) {
   const { t } = useTranslation();

   const isEditDisabled = isClosedTender(tender) || isCancelledTender(tender);
   const editTooltipTitle = isEditDisabled
      ? t("tenders.details.editBlocked")
      : t("common.actions.edit");

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
            <Button onClick={onCancelEdit}>{t("common.actions.cancel")}</Button>
         ) : (
            <Tooltip title={editTooltipTitle}>
               <span>
                  <IconButton
                     color="primary"
                     aria-label={t("common.actions.edit")}
                     onClick={onStartEdit}
                     disabled={isEditDisabled}
                  >
                     <EditOutlinedIcon fontSize="small" />
                  </IconButton>
               </span>
            </Tooltip>
         )}
      </Box>
   );
}

TenderDetailsEditActions.propTypes = {
   tender: tenderPropType,
   isEditing: PropTypes.bool.isRequired,
   onStartEdit: PropTypes.func.isRequired,
   onCancelEdit: PropTypes.func.isRequired,
};
