import { Box, Button, DialogActions } from '@mui/material';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';

// Ниже 430px четыре кнопки в одну строку уже не влезают: подпись
// «Сохранить как черновик» ломается переносом и тянет по высоте весь ряд.
// Там кнопка показывает короткую подпись, а кегль и отступы поджимаются.
const NARROW_ACTIONS_QUERY = '@media (max-width: 429.95px)';

const actionButtonSx = {
   fontSize: {
      xs: 12,
      sm: 14,
   },
   px: {
      xs: 1,
      sm: 2,
   },
   whiteSpace: 'nowrap',

   [NARROW_ACTIONS_QUERY]: {
      fontSize: 11,
      px: 0.75,
      minWidth: 0,
   },
};

export function CreateLeadActions({
   isFirstStep,
   isLastStep,
   hasCurrentStepErrors,
   isSubmitting,
   isSavingDraft = false,
   onClose,
   onBack,
   onNext,
   onSubmit,
   onSaveDraft,
}) {
   const { t } = useTranslation();

   const isAnyActionPending = isSubmitting || isSavingDraft;

   return (
      <DialogActions
         sx={{
            px: 3,
            pb: 3,
            pt: 2,
            justifyContent: 'space-between',
            gap: 1,

            [NARROW_ACTIONS_QUERY]: {
               px: 2,
               gap: 0.75,
            },
         }}
      >
         <Button
            type='button'
            onClick={onClose}
            disabled={isAnyActionPending}
            sx={actionButtonSx}
         >
            {t("common.actions.cancel")}
         </Button>

         <Box
            sx={{
               display: 'flex',
               gap: 1,

               [NARROW_ACTIONS_QUERY]: {
                  gap: 0.75,
               },
            }}
         >
            {onSaveDraft && (
               <Button
                  type='button'
                  onClick={onSaveDraft}
                  disabled={isAnyActionPending}
                  sx={actionButtonSx}
               >
                  {isSavingDraft ? (
                     t("common.actions.saving")
                  ) : (
                     <>
                        <Box
                           component='span'
                           sx={{
                              [NARROW_ACTIONS_QUERY]: {
                                 display: 'none',
                              },
                           }}
                        >
                           {t("createLead.saveDraft")}
                        </Box>

                        <Box
                           component='span'
                           sx={{
                              display: 'none',

                              [NARROW_ACTIONS_QUERY]: {
                                 display: 'inline',
                              },
                           }}
                        >
                           {t("createLead.saveDraftShort")}
                        </Box>
                     </>
                  )}
               </Button>
            )}

            {!isFirstStep && (
               <Button
                  type='button'
                  onClick={onBack}
                  disabled={isAnyActionPending}
                  sx={actionButtonSx}
               >
                  {t("common.actions.back")}
               </Button>
            )}

            {isLastStep ? (
               <Button
                  type='button'
                  variant='contained'
                  disabled={isAnyActionPending || hasCurrentStepErrors}
                  onClick={onSubmit}
                  sx={actionButtonSx}
               >
                  {isSubmitting ? t("common.actions.creatingProcess") : t("createLead.submit")}
               </Button>
            ) : (
               <Button
                  type='button'
                  variant='contained'
                  disabled={hasCurrentStepErrors || isAnyActionPending}
                  onClick={onNext}
                  sx={actionButtonSx}
               >
                  {t("common.actions.next")}
               </Button>
            )}
         </Box>
      </DialogActions>
   );
}

CreateLeadActions.propTypes = {
   isFirstStep: PropTypes.bool.isRequired,
   isLastStep: PropTypes.bool.isRequired,
   hasCurrentStepErrors: PropTypes.bool.isRequired,
   isSubmitting: PropTypes.bool.isRequired,
   isSavingDraft: PropTypes.bool,
   onClose: PropTypes.func.isRequired,
   onBack: PropTypes.func.isRequired,
   onNext: PropTypes.func.isRequired,
   onSubmit: PropTypes.func.isRequired,
   onSaveDraft: PropTypes.func,
};
